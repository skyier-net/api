import type { WebhookEvent, UserJSON } from "@clerk/clerk-sdk-node";
import { Webhook } from "svix";
import bodyParser from "body-parser";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import express from "express";
const clerkRouter = express.Router();

const secret = "whsec_jm25hp7VmgpItc6owrivu8j0n+PaZh9q";

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
    switch (msg.type) {
      case "user.created":
        console.log("User created");
        const user = await prisma.user.create({
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
        console.log(user);
    }

    res.json({});
  }
);

export default clerkRouter;
