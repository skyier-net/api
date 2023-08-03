import { z } from "zod";
import { protectedProcedure, t } from "../trpc";
import { GroupVisibility, Role } from "@prisma/client";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const groupsRouter = t.router({
  createGroup: protectedProcedure
    .input(
      z.object({
        title: z.string().min(7).max(50),
        isPublicForViewing: z.boolean(),
        groupVisibility: z.enum(["PRIVATE", "UNLISTED", "PUBLIC", "CREATOR"]),
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
});
