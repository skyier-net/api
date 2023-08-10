import type { WebhookEvent, UserJSON } from "@clerk/clerk-sdk-node";
import { Webhook } from "svix";
import bodyParser from "body-parser";
import "dotenv/config";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import express from "express";
const clerkRouter = express.Router();

const secret = process.env.CLERK_WEBHOOKS_SECRET!;

clerkRouter.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    const payload = req.body;
    const headers = req.headers;

    const wh = new Webhook(secret);
    let msg: any;
    try {
      msg = wh.verify(payload, headers as any);
    } catch (err) {
      res.status(400).json({});
    }

    const data: UserJSON = msg.data;
    let user: any;
    try {
      switch (msg.type) {
        case "user.created":
          user = await prisma.user.create({
            data: {
              id: data.id,
              firstName: data.first_name,
              lastName: data.last_name,
              email: data.email_addresses.find(
                (mail) => mail.id === data.primary_email_address_id
              )!.email_address,
              profilePictureUrl: data.profile_image_url,
              createdAt: data.created_at,
            },
          });
          console.log("User created with ID: " + data.id);
        case "user.updated":
          user = await prisma.user.update({
            where: { id: data.id },
            data: {
              id: data.id,
              firstName: data.first_name,
              lastName: data.last_name,
              email: data.email_addresses.find(
                (mail) => mail.id === data.primary_email_address_id
              )!.email_address,
              profilePictureUrl: data.profile_image_url,
              createdAt: data.created_at,
            },
          });
          console.log("User with ID: " + data.id + " updated his ACC!");
        case "user.deleted":
          user = await prisma.user.delete({
            where: { id: data.id },
          });
          console.log("User with ID: " + data.id + " deleted his ACC!");
      }

      res.json({});
    } catch (error: any) {
      console.error(error);
      res.status(500).json(error);
    }
  }
);

export default clerkRouter;
