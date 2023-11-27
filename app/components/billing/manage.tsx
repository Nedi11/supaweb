import { plan, subscription } from "@prisma/client";
import { useActionData, useFetcher } from "@remix-run/react";
import { Loader2 } from "lucide-react";
import { MouseEvent, MouseEventHandler, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Plans from "./plan";
import { trpc } from "~/utils/api";

export function UpdateBillingLink({
  subscription,
}: {
  subscription: subscription;
}) {
  const updateBilling = trpc.lemon.updateBillingUrl.useMutation();

  return (
    <button
      className="inline-block px-6 py-2 rounded-full bg-amber-200 text-amber-800 font-bold"
      onClick={() => {
        updateBilling.mutate(
          { subscriptionId: subscription.lemonSqueezyId },
          {
            onSuccess: (res) => {
              LemonSqueezy.Url.Open(res.subscription.update_billing_url);
            },
            onError: (err) => {
              toast.error(err.message);
            },
          }
        );
      }}
    >
      <Loader2
        className={
          "animate-spin inline-block relative top-[-1px] mr-2 transition-all " +
          (!updateBilling.isLoading ? "w-0" : "")
        }
      />
      Update your payment method
    </button>
  );
}

export function CancelLink({ subscription }: { subscription: subscription }) {
  const updatePlan = trpc.lemon.updatePlan.useMutation();

  return (
    <button
      className="mb-2 text-sm text-gray-500"
      onClick={() => {
        updatePlan.mutate(
          {
            subscriptionId: subscription.lemonSqueezyId,
            data: { action: "cancel" },
          },
          {
            onSuccess: () => {
              toast.success("Your subscription has been canceled!");
            },
            onError: () => {
              toast.error(
                "There was an error, please try again or contact support"
              );
            },
          }
        );
      }}
    >
      Cancel
      <Loader2
        size={16}
        className={
          "animate-spin inline-block relative top-[-1px] ml-2 transition-all " +
          (updatePlan.isLoading ? " w-8" : "w-0")
        }
      />
    </button>
  );
}

export function ResumeButton({ subscription }: { subscription: subscription }) {
  const updatePlan = trpc.lemon.updatePlan.useMutation();
  return (
    <button
      onClick={() => {
        updatePlan.mutate({
          subscriptionId: subscription.lemonSqueezyId,
          data: { action: "resume" },
        });
      }}
      className="inline-block px-6 py-2 rounded-full bg-amber-200 text-amber-800 font-bold"
    >
      <Loader2
        className={
          "animate-spin inline-block relative top-[-1px] mr-2 transition-all " +
          (updatePlan.isLoading ? "" : "w-0")
        }
      />
      Resume your subscription
    </button>
  );
}

export function UnpauseButton({
  subscription,
}: {
  subscription: subscription;
}) {
  const updatePlan = trpc.lemon.updatePlan.useMutation();
  return (
    <button
      onClick={() => {
        updatePlan.mutate(
          {
            subscriptionId: subscription.lemonSqueezyId,
            data: { action: "unpause" },
          },
          {
            onSuccess: () => {
              toast.success("Your subscription is now active again!");
            },
            onError: () => {
              toast.error(
                "There was an error, please try again or contact support"
              );
            },
          }
        );
      }}
      className="inline-block px-6 py-2 rounded-full bg-amber-200 text-amber-800 font-bold"
    >
      <Loader2
        className={
          "animate-spin inline-block relative top-[-1px] mr-2 transition-all " +
          (updatePlan.isLoading ? "" : "w-0")
        }
      />
      Unpause your subscription
    </button>
  );
}

export function PauseLink({ subscription }: { subscription: subscription }) {
  const updatePlan = trpc.lemon.updatePlan.useMutation();
  return (
    <button
      className="mb-2 text-sm text-gray-500"
      onClick={() => {
        updatePlan.mutate(
          {
            subscriptionId: subscription.lemonSqueezyId,
            data: { action: "pause" },
          },
          {
            onSuccess: () => {
              toast.success("Your subscription has been paused.");
            },
            onError: () => {
              toast.error(
                "There was an error, please try again or contact support"
              );
            },
          }
        );
      }}
    >
      Pause payments
      <Loader2
        size={16}
        className={
          "animate-spin inline-block relative top-[-1px] ml-2  transition-all " +
          (updatePlan.isLoading ? "w-8" : "w-0")
        }
      />
    </button>
  );
}
