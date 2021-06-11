import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "stream";
import Stripe from "stripe";
import { stripe } from "../../services/stripe";
import { saveSubscription } from "./_lib/manageSubscription";

async function buffer(readable: Readable) {
  const chunks = [];

  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  return Buffer.concat(chunks);
}

export const config = {
  api: {
    bodyParser: false,
  },
};

const relevantEvents = new Set([
  "checkout.session.completed",
  "customer.subscriptions.created",
  "customer.subscriptions.updated",
  "customer.subscriptions.deleted",
]);

export default async function (req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const buf = await buffer(req);
    const secret = req.headers["stripe-signature"];

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        buf,
        secret,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    const type = event.type;

    if (relevantEvents.has(type)) {
      try {
        switch (type) {
          case 'customer.subscriptions.created': 
          case 'customer.subscriptions.updated': 
          case 'customer.subscriptions.deleted':  
            break;
            default {

            }
1
          case "checkout.session.completed":
            const checkoutSession = event.data
              .object as Stripe.Checkout.Session;

            await saveSubscription(
              checkoutSession.subscription.toString(),
              checkoutSession.customer.toString()
            );

            break;
          default:
            throw new Error("Unhandle event");
        }
      } catch (error) {
        return res.json({ error: "Webhook handler failed." });
      }
    }

    return res.json({ recived: true });
  } else {
    res.setHeader("Allow", "POST"), res.status(404).end("Method not allowed");
  }
}
