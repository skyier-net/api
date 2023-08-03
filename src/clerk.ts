import type { WebhookEvent, UserJSON } from "@clerk/clerk-sdk-node";
import { Webhook } from "svix";
import bodyParser from "body-parser";

import express from "express";
const clerkRouter = express.Router();

const secret = "whsec_jm25hp7VmgpItc6owrivu8j0n+PaZh9q";

clerkRouter.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  (req, res) => {
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
    console.log("MSG: " + data.primary_email_address_id);

    res.json({});
  }
);

export default clerkRouter;
