import { useState, useEffect } from "react";
import Plans from "./plan";
import { Prisma, plan, subscription } from "@prisma/client";
import { Link } from "@remix-run/react";
import {
  CancelLink,
  PauseLink,
  ResumeButton,
  UnpauseButton,
  UpdateBillingLink,
} from "./manage";

type subWithPlan = Prisma.subscriptionGetPayload<{ include: { plan: true } }>;
// Main component
export const SubscriptionComponent = ({
  sub,
  plans,
}: {
  sub: subWithPlan | null;
  plans: plan[];
}) => {
  // Make sure Lemon.js is loaded
  useEffect(() => {
    window.createLemonSqueezy();
  }, []);
  const subscription = sub;
  // Create a data object that can be passed around the child components

  if (subscription) {
    switch (subscription.status) {
      case "active":
        return <ActiveSubscription subscription={subscription} />;
      // TODO
      case "on_trial":
        return <TrialSubscription subscription={subscription} />;
      case "past_due":
        return <PastDueSubscription subscription={subscription} />;
      case "cancelled":
        return <CancelledSubscription subscription={subscription} />;
      case "paused":
        return <PausedSubscription subscription={subscription} />;
      case "unpaid":
        return <UnpaidSubscription subscription={subscription} />;
      case "expired":
        return (
          <ExpiredSubscription subscription={subscription} plans={plans} />
        );
    }
  } else {
    return (
      <>
        <p>Please sign up to a paid plan.</p>
        <Plans plans={plans} />
      </>
    );
  }
};

const ActiveSubscription = ({
  subscription,
}: {
  subscription: subWithPlan;
}) => {
  return (
    <>
      <p className="mb-2">
        You are currently on the{" "}
        <b>
          {subscription.plan.variantName} {subscription.plan.interval}ly
        </b>
        plan, paying ${subscription.price / 100}/{subscription.plan.interval}.
      </p>

      <p className="mb-2">
        Your next renewal will be on {formatDate(subscription.renewsAt)}.
      </p>
      <hr className="my-8" />

      <p className="mb-4">
        <Link
          to="/billing/change-plan"
          className="inline-block px-6 py-2 rounded-full bg-amber-200 text-amber-800 font-bold"
        >
          Change plan &rarr;
        </Link>
      </p>

      <p>
        <UpdateBillingLink subscription={subscription} />
      </p>

      <p>
        <PauseLink subscription={subscription} />
      </p>

      <p>
        <CancelLink subscription={subscription} />
      </p>
    </>
  );
};

function formatDate(date: Date | null) {
  if (!date) return "";
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

const CancelledSubscription = ({
  subscription,
}: {
  subscription: subWithPlan;
}) => {
  return (
    <>
      <p className="mb-2">
        You are currently on the{" "}
        <b>
          {subscription.plan.variantName} {subscription.plan.interval}ly
        </b>
        plan, paying ${subscription.price}/{subscription.plan.interval}.
      </p>

      <p className="mb-8">
        Your subscription has been cancelled and{" "}
        <b>will end on {formatDate(subscription.endsAt)}</b>. After this date
        you will no longer have access to the app.
      </p>

      <p>
        <ResumeButton subscription={subscription} />
      </p>
    </>
  );
};

const PausedSubscription = ({
  subscription,
}: {
  subscription: subWithPlan;
}) => {
  return (
    <>
      <p className="mb-2">
        You are currently on the{" "}
        <b>
          {subscription.plan.variantName} {subscription.plan.interval}ly
        </b>{" "}
        plan, paying ${subscription.price}/{subscription.plan.interval}.
      </p>

      {subscription.resumesAt ? (
        <p className="mb-8">
          Your subscription payments are currently paused. Your subscription
          will automatically resume on {formatDate(subscription.resumesAt)}.
        </p>
      ) : (
        <p className="mb-8">Your subscription payments are currently paused.</p>
      )}

      <p>
        <UnpauseButton subscription={subscription} />
      </p>
    </>
  );
};

const UnpaidSubscription = ({
  subscription,
}: {
  subscription: subscription;
}) => {
  /*
  Unpaid subscriptions have had four failed recovery payments.
  If you have dunning enabled in your store settings, customers will be sent emails trying to reactivate their subscription.
  If you don't have dunning enabled the subscription will remain "unpaid".
  */
  return (
    <>
      <p className="mb-2">
        We haven&apos;t been able to make a successful payment and your
        subscription is currently marked as unpaid.
      </p>

      <p className="mb-6">
        Please update your billing information to regain access.
      </p>

      <p>
        <UpdateBillingLink subscription={subscription} />
      </p>

      <hr className="my-8" />

      <p>
        <CancelLink subscription={subscription} />
      </p>
    </>
  );
};

const ExpiredSubscription = ({
  subscription,
  plans,
}: {
  subscription: subscription;
  plans: plan[];
}) => {
  return (
    <>
      <p className="mb-2">
        Your subscription expired
        {/* on {formatDate(subscription.endsAt)} */}.
      </p>

      <p className="mb-2">Please create a new subscription to regain access.</p>

      <hr className="my-8" />

      <Plans subscription={subscription} plans={plans} />
    </>
  );
};

const PastDueSubscription = ({
  subscription,
}: {
  subscription: subWithPlan;
}) => {
  return (
    <>
      <div className="my-8 p-4 text-sm text-red-800 rounded-md border border-red-200 bg-red-50">
        Your latest payment failed. We will re-try this payment up to four
        times, after which your subscription will be cancelled.
        <br />
        If you need to update your billing details, you can do so below.
      </div>

      <p className="mb-2">
        You are currently on the{" "}
        <b>
          {subscription.plan.variantName} {subscription.plan.interval}ly
        </b>{" "}
        plan, paying ${subscription.price}/{subscription.plan.interval}.
      </p>

      <p className="mb-2">
        We will attempt a payment on {formatDate(subscription.renewsAt)}.
      </p>

      <hr className="my-8" />

      <p>
        <UpdateBillingLink subscription={subscription} />
      </p>

      <p>
        <CancelLink subscription={subscription} />
      </p>
    </>
  );
};

const TrialSubscription = ({ subscription }: { subscription: subWithPlan }) => {
  return (
    <>
      <p className="mb-2">
        You are currently on a free trial of the{" "}
        <b>
          {subscription.plan.variantName} {subscription.plan.interval}ly
        </b>{" "}
        plan, paying ${subscription.price}/{subscription.plan.interval}.
      </p>

      <p className="mb-6">
        Your trial ends on {formatDate(subscription.trialEndsAt)}. You can
        cancel your subscription before this date and you won&apos;t be charged.
      </p>

      <hr className="my-8" />

      <p className="mb-4">
        <Link
          to="/billing/change-plan"
          className="inline-block px-6 py-2 rounded-full bg-amber-200 text-amber-800 font-bold"
        >
          Change plan &rarr;
        </Link>
      </p>

      <p>
        <UpdateBillingLink subscription={subscription} />
      </p>

      <p>
        <CancelLink subscription={subscription} />
      </p>
    </>
  );
};
