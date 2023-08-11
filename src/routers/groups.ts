import { z } from "zod";
import { adminProcedure, protectedProcedure, t } from "../trpc";
import { GroupVisibility, Role } from "@prisma/client";
import nodemailer from "nodemailer";
import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { RolesScaler, WEB_APP_URL } from "../config";
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
  createGroup: protectedProcedure
    .input(
      z.object({
        title: z.string().min(7).max(50),
        defaultRole: z.enum(["ADMIN", "MEMBER", "VIEWER"]).or(z.null()),
        groupVisibility: z.enum(["PRIVATE", "UNLISTED", "PUBLIC"]),
        description: z.string().min(20).max(250),
      })
    )
    .mutation(async (opts) => {
      const group = await prisma.group.create({
        data: {
          title: opts.input.title,
          defaultRole: (opts.input.defaultRole ?? "VIEWER") as Role,
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
      const relation = await prisma.userToGroupRelation.create({
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
  editGroup: adminProcedure
    .input(
      z.object({
        description: z.string().min(20).max(250),
        defaultRole: z.enum(["ADMIN", "MEMBER", "VIEWER"]).or(z.null()),
        title: z.string().min(7).max(50),
        groupVisibility: z.enum(["PRIVATE", "UNLISTED", "PUBLIC"]),
      })
    )
    .mutation(async (opts) => {
      const group = await prisma.group.update({
        where: {
          id: opts.ctx.group?.id,
        },
        data: {
          description: opts.input.description,
          defaultRole: (opts.input.defaultRole ?? "VIEWER") as Role,
          title: opts.input.title,
          groupVisibility: opts.input.groupVisibility as GroupVisibility,
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
              id: opts.ctx.group?.id,
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
          <p><strong>${opts.ctx.user?.firstName} ${opts.ctx.user?.lastName}</strong> who is <i>${opts.ctx.userGroupRelation?.role}</i> in the <strong>${invitation.group?.title}</strong> group invited You to JOIN!</p><br>
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
      if (opts.ctx.userGroupRelation?.isBanned ?? true)
        throw new TRPCError({ code: "UNAUTHORIZED" });
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
      return {};
    }),
  banMember: adminProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .mutation(async (opts) => {
      const userToGroupRelation = await prisma.userToGroupRelation.update({
        where: {
          userId_groupId: {
            userId: opts.input.userId,
            groupId: opts.ctx.group!.id,
          },
          OR:
            opts.ctx.userGroupRelation?.role === "ADMIN"
              ? [{ role: "USER" }, { role: "VIEWER" }]
              : [{ role: "USER" }, { role: "VIEWER" }, { role: "ADMIN" }],
        },
        data: {
          isBanned: true,
        },
      });
      if (!userToGroupRelation) throw new TRPCError({ code: "UNAUTHORIZED" });
      return {};
    }),
  // TODO: add unban
  muteMember: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        hoursForMute: z.number(),
      })
    )
    .mutation(async (opts) => {
      const userToGroupRelation = await prisma.userToGroupRelation.update({
        where: {
          userId_groupId: {
            userId: opts.input.userId,
            groupId: opts.ctx.group!.id,
          },
          OR:
            opts.ctx.userGroupRelation?.role === "ADMIN"
              ? [{ role: "USER" }, { role: "VIEWER" }]
              : [{ role: "USER" }, { role: "VIEWER" }, { role: "ADMIN" }],
        },
        data: {
          mutedUntil: Math.floor(
            new Date().getTime() + 60 * 60 * opts.input.hoursForMute
          ),
        },
      });
      return {
        mutedUntil: new Date(Number(userToGroupRelation.mutedUntil)),
      };
    }),
  // TODO: unban member
  kickMember: adminProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .mutation(async (opts) => {
      const userToGroupRelation = await prisma.userToGroupRelation.delete({
        where: {
          userId_groupId: {
            userId: opts.input.userId,
            groupId: opts.ctx.group!.id,
          },
          OR:
            opts.ctx.userGroupRelation?.role === "ADMIN"
              ? [{ role: "USER" }, { role: "VIEWER" }]
              : [{ role: "USER" }, { role: "VIEWER" }, { role: "ADMIN" }],
        },
      });
      return {};
    }),
});
