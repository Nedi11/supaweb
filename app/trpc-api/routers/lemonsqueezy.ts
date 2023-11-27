import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  // , protectedProcedure
} from "../trpc";
import { env } from "$/env.mjs";
import { LemonSqueezy } from "@lemonsqueezy/lemonsqueezy.js";
import { TRPCError } from "@trpc/server";
import { getDomainUrl } from "~/utils/misc";
const ls = new LemonSqueezy(env.LEMON_KEY);
export const lemonRouter = createTRPCRouter({
  createCheckout: protectedProcedure
    .input(z.object({ variantId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const attributes = {
        checkout_options: {
          embed: true, // Use the checkout overlay
          media: false,
          button_color: "#fde68a",
        },
        checkout_data: {
          email: ctx.session.user.email, // Displays in the checkout form
          custom: {
            user_id: ctx.session.user.id, // Sent in the background; visible in webhooks and API calls
          },
        },
        product_options: {
          enabled_variants: [input.variantId], // Only show the selected variant in the checkout
          redirect_url: `${getDomainUrl(ctx.request)}/billing/`,
          receipt_link_url: `${getDomainUrl(ctx.request)}/billing/`,
          receipt_button_text: "Go to your account",
          receipt_thank_you_note: "Thank you for subscribing!",
        },
      };

      try {
        const checkout = await ls.createCheckout({
          storeId: Number(env.LEMON_STORE_ID),
          variantId: input.variantId,
          attributes,
        });

        return {
          url: checkout["data"]["attributes"]["url"],
        };
      } catch (e: any) {
        throw new TRPCError({
          message: e.message,
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    }),
  updatePlan: protectedProcedure
    .input(
      z.object({
        subscriptionId: z.number(),
        data: z.discriminatedUnion("action", [
          z.object({
            action: z.literal("change"),
            variantId: z.number(),
            productId: z.number(),
          }),
          z.object({
            action: z.literal("resume"),
          }),
          z.object({ action: z.literal("cancel") }),
          z.object({ action: z.literal("pause") }),
          z.object({ action: z.literal("unpause") }),
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      let subscription;
      if (input.data.action == "change") {
        // Update plan

        try {
          subscription = await ls.updateSubscription({
            id: input.subscriptionId,
            productId: input.data.productId,
            variantId: input.data.variantId,
          });
        } catch (e: any) {
          throw new TRPCError({
            message: e.message,
            code: "INTERNAL_SERVER_ERROR",
          });
        }
      } else if (input.data.action == "resume") {
        // Resume
        try {
          subscription = await ls.resumeSubscription({
            id: input.subscriptionId,
          });
        } catch (e: any) {
          throw new TRPCError({
            message: e.message,
            code: "INTERNAL_SERVER_ERROR",
          });
        }
      } else if (input.data.action == "cancel") {
        // Cancel
        try {
          subscription = await ls.cancelSubscription({
            id: input.subscriptionId,
          });
        } catch (e: any) {
          throw new TRPCError({
            message: e.message,
            code: "INTERNAL_SERVER_ERROR",
          });
        }
      } else if (input.data.action == "pause") {
        // Pause

        try {
          subscription = await ls.pauseSubscription({
            id: input.subscriptionId,
          });
        } catch (e: any) {
          throw new TRPCError({
            message: e.message,
            code: "INTERNAL_SERVER_ERROR",
          });
        }
      } else if (input.data.action == "unpause") {
        // Unpause

        try {
          subscription = await ls.unpauseSubscription({
            id: input.subscriptionId,
          });
        } catch (e: any) {
          throw new TRPCError({
            message: e.message,
            code: "INTERNAL_SERVER_ERROR",
          });
        }
      }
      //todo return data to update the ui while the db is updated from webhooks
      return { success: true };
    }),
  updateBillingUrl: protectedProcedure
    .input(z.object({ subscriptionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const subscription = await ls.getSubscription({
          id: input.subscriptionId,
        });
        return {
          subscription: {
            update_billing_url:
              subscription["data"]["attributes"]["urls"][
                "update_payment_method"
              ],
          },
        };
      } catch (e: any) {
        throw new TRPCError({
          message: e.message,
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    }),
});
