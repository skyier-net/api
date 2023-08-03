import type { WebhookEvent } from "@clerk/clerk-sdk-node";

const handler = (req: { body: { evt: WebhookEvent } }) => {
  const evt = req.body.evt as WebhookEvent;
  console.log(evt.data);
};
