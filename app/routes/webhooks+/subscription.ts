import { ActionFunctionArgs, json } from "@remix-run/node";
import crypto from "crypto";
import { LemonSqueezy } from "@lemonsqueezy/lemonsqueezy.js";
import { prisma } from "~/utils/db.server";
import { env } from "$/env.mjs";
const ls = new LemonSqueezy(env.LEMON_KEY);

//ON LEMONSQUEEZY SUBSCRIBE TO subscription_created AND subscription_updated EVENTS

async function processEvent(event: any) {
  let processingError = "";

  const customData = event.body["meta"]["custom_data"] || null;

  if (!customData || !customData["user_id"]) {
    processingError = "No user ID, can't process";
  } else {
    const obj = event.body["data"];

    if (event.eventName.startsWith("subscription_payment_")) {
      // Save subscription invoices; obj is a "Subscription invoice"
      /* Not implemented */
    } else if (event.eventName.startsWith("subscription_")) {
      // Save subscriptions; obj is a "Subscription"

      const data = obj["attributes"];

      // We assume the Plan table is up to date
      const plan = await prisma.plan.findUnique({
        where: {
          variantId: data["variant_id"],
        },
      });
      const user = await prisma.user.findUnique({
        where: { id: customData["user_id"] },
      });
      if (!plan) {
        processingError =
          "Plan not found in DB. Could not process webhook event.";
      } else if (!user) {
        processingError =
          "User not found in DB. Could not process webhook event.";
      } else {
        // Update the subscription

        const lemonSqueezyId = parseInt(obj["id"]);

        // Get subscription's Price object
        // We save the Price value to the subscription so we can display it in the UI
        let priceData = await ls.getPrice({
          id: data["first_subscription_item"]["price_id"],
        });

        const updateData = {
          orderId: data["order_id"],
          name: data["user_name"],
          email: data["user_email"],
          status: data["status"],
          renewsAt: data["renews_at"],
          endsAt: data["ends_at"],
          trialEndsAt: data["trial_ends_at"],
          planId: plan["id"],
          userId: customData["user_id"],
          price: priceData["data"]["attributes"]["unit_price"],
          subscriptionItemId: data["first_subscription_item"]["id"],
          // Save this for usage-based billing reporting; no need to if you use quantity-based billing
          isUsageBased: data["first_subscription_item"]["is_usage_based"],
        };

        const createData: typeof updateData & {
          lemonSqueezyId: any;
          price: any;
        } = updateData as any;
        createData.lemonSqueezyId = lemonSqueezyId;
        createData.price = plan.price;

        try {
          // Create/update subscription
          await prisma.subscription.upsert({
            where: {
              lemonSqueezyId: lemonSqueezyId,
            },
            update: updateData,
            create: createData,
          });
        } catch (error: any) {
          processingError = error;
          console.log(error);
        }
      }
    } else if (event.eventName.startsWith("order_")) {
      // Save orders; obj is a "Order"
      /* Not implemented */
    } else if (event.eventName.startsWith("license_")) {
      // Save license keys; obj is a "License key"
      /* Not implemented */
    }

    try {
      // Mark event as processed
      await prisma.webhook_event.update({
        where: {
          id: event.id,
        },
        data: {
          processed: true,
          processingError,
        },
      });
    } catch (error) {
      console.log(error);
    }
  }
}

export async function action({ request, context }: ActionFunctionArgs) {
  const rawBody = await request.text();
  const secret = env.LEMON_SIGN_SECRET;
  const hmac = crypto.createHmac("sha256", secret);
  const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
  const signature = Buffer.from(
    request.headers.get("X-Signature") || "",
    "utf8"
  );
  if (!crypto.timingSafeEqual(digest, signature)) {
    throw new Error("invalid sig");
  }
  const data = JSON.parse(rawBody);
  const event = await prisma.webhook_event.create({
    data: { eventName: data["meta"]["event_name"], body: data },
  });
  processEvent(event);
  //TO DO ALERT AND RETRY WHEN THERE IS A proccessingError
  return json({ success: true });
}
