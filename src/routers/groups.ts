import { z } from "zod";
import { adminProcedure, protectedProcedure, t } from "../trpc";
import { GroupVisibility, Role } from "@prisma/client";
import nodemailer from "nodemailer";
import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { WEB_APP_URL } from "../config";
import { TRPCError } from "@trpc/server";
const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false,
  auth: {
    user: "no-reply@skyier.net",
    pass: process.env.MAIL_PASSWORD,
  },
});

export const groupsRouter = t.router({
  createGroup: adminProcedure
    .input(
      z.object({
        title: z.string().min(7).max(50),
        isPublicForViewing: z.boolean(),
        groupVisibility: z.enum(["PRIVATE", "UNLISTED", "PUBLIC", "CREATOR"]),
        description: z.string().min(20).max(250),
      })
    )
    .mutation(async (opts) => {
      const group = await prisma.group.create({
        data: {
          title: opts.input.title,
          isPublicForViewing: opts.input.isPublicForViewing,
          creator: {
            connect: {
              id: opts.ctx.user?.id,
            },
          },
          groupVisibility: opts.input.groupVisibility as GroupVisibility,
          description: opts.input.description,
        },
        include: {
          creator: true,
        },
      });
      const relation = prisma.userToGroupRelation.create({
        data: {
          userId: opts.ctx.user!.id,
          groupId: group.id,
          role: "CREATOR" as Role,
        },
      });
      return {
        groupId: group.id,
      };
    }),
  inviteMember: adminProcedure
    .input(
      z
        .object({
          mail: z.string(),
          groupId: z.string(),
          role: z.enum(["ADMIN", "MEMBER", "VIEWER"]),
        })
        .partial({
          mail: true,
        })
    )
    .mutation(async (opts) => {
      const invitation = await prisma.groupInvitation.create({
        data: {
          mail: opts.input.mail,
          key: Math.floor(Math.random() * 1000000).toString(),
          role: opts.input.role as Role,
          group: {
            connect: {
              id: opts.input.groupId,
            },
          },
          inviter: {
            connect: {
              id: opts.ctx.user?.id,
            },
          },
        },
        include: {
          inviter: true,
          group: true,
        },
      });
      transporter.sendMail(
        {
          from: "no-reply@skyier.net",
          to: opts.input.mail,
          subject: `${invitation.group?.title} group invited You to JOIN!`,
          html: `
          <h2>The group <i>${invitation.group?.title}</i> invited You to JOIN!<br></h2>
          <p><strong>${opts.ctx.user?.firstName} ${opts.ctx.user?.lastName}</strong> who is <i>${opts.ctx.role}</i> in the <strong>${invitation.group?.title}</strong> group invited You to JOIN!</p><br>
          <p>There description states so: <i>${invitation.group?.description}</i></p>
          <p>To join the group <strong><a href="${WEB_APP_URL}/groups/${invitation.key}/join">CLICK HERE</a></strong> or open the link below:</p><br>
          <p>${WEB_APP_URL}/groups/${invitation.key}/join</p>
          <br>
          <p>You can also enter the code <strong>${invitation.key}</strong> in the code field of your <i>mobile app</i></p>
          `,
        },
        (error, info) => {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        }
      );
      return {};
    }),
  joinGroup: protectedProcedure
    .input(
      z.object({
        key: z.string(),
      })
    )
    .mutation(async (opts) => {
      const invitation = await prisma.groupInvitation.delete({
        where: {
          key: opts.input.key,
        },
        include: {
          group: true,
        },
      });
      if (!invitation) throw new TRPCError({ code: "NOT_FOUND" });
      if (opts.ctx.user.email != invitation.mail)
        throw new TRPCError({ code: "UNAUTHORIZED" });
      const user = await prisma.user.findUniqueOrThrow({
        where: {
          email: invitation.mail,
        },
      });
      const relation = await prisma.userToGroupRelation.create({
        data: {
          groupId: invitation.group.id,
          userId: opts.ctx.user!.id,
          role: invitation.role,
        },
      });
    }),
  banMember: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        groupId: z.string(),
      })
    )
    .mutation(async (opts) => {
      const userToGroupRelation = await prisma.userToGroupRelation.update({
        where: {
          userId_groupId: {
            userId: opts.input.userId,
            groupId: opts.input.groupId,
          },
        },
        data: {
          isBanned: true,
        },
      });
    }),
  muteMember: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        groupId: z.string(),
        hoursForMute: z.number(),
      })
    )
    .mutation(async (opts) => {
      const userToGroupRelation = await prisma.userToGroupRelation.update({
        where: {
          userId_groupId: {
            userId: opts.input.userId,
            groupId: opts.input.groupId,
          },
        },
        data: {
          mutedUntil:
            new Date().getTime() / 1000 + 60 * 60 * opts.input.hoursForMute,
        },
      });
    }),
  kickMember: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        groupId: z.string(),
      })
    )
    .mutation(async (opts) => {
      const userToGroupRelation = await prisma.userToGroupRelation.delete({
        where: {
          userId_groupId: {
            userId: opts.input.userId,
            groupId: opts.input.groupId,
          },
        },
      });
    }),
});
