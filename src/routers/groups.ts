import { z } from "zod";
import { adminProcedure, protectedProcedure, t } from "../trpc";
import { GroupVisibility, Role } from "@prisma/client";
import nodemailer from "nodemailer";
import "dotenv/config";

import { PrismaClient } from "@prisma/client";
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
        })
        .partial({
          mail: true,
        })
    )
    .mutation(async (opts) => {
      const invitation = await prisma.groupInvitation.create({
        data: {
          mail: opts.input.mail,
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
          <p>To join the group <strong><a href="http://localhost:3000/groups/${invitation.group?.id}/join">CLICK HERE</a></strong> or open the link below:</p><br>
          <p>http://localhost:3000/groups/${invitation.group?.id}/join</p>
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
    }),
});
