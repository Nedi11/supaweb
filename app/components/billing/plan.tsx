import { plan, subscription } from "@prisma/client";
import { useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import type { MouseEvent } from "react";
import { useNavigate } from "@remix-run/react";
import { useSupabase } from "~/root";
import toast from "react-hot-toast";
import { trpc } from "~/utils/api";

function createMarkup(html: string | null) {
  return { __html: html ?? "" };
}

function formatPrice(price: number) {
  return price / 100;
}

function formatInterval(interval: string, intervalCount: number) {
  return intervalCount > 1 ? `${intervalCount} ${interval}s` : interval;
}

function IntervalSwitcher({
  intervalValue,
  changeInterval,
}: {
  intervalValue: string;
  changeInterval: (interval: "year" | "month") => void;
}) {
  return (
    <div className="mt-6 flex justify-center items-center gap-4 text-sm text-gray-500">
      <div data-plan-toggle="month">Monthly</div>
      <div>
        <label className="toggle relative inline-block">
          <input
            type="checkbox"
            checked={intervalValue == "year"}
            onChange={(e) =>
              changeInterval(e.target.checked ? "year" : "month")
            }
          />
          <span className="slider absolute rounded-full bg-gray-300 shadow-md"></span>
        </label>
      </div>
      <div data-plan-toggle="year">Yearly</div>
    </div>
  );
}
const freeFeats: { name: string }[] = [{ name: "4 new leads every week" }];
const nFreeFeats: { name: string }[] = [{ name: "No contact info" }];

const proFeats: { name: string }[] = [
  { name: "Get last week's list instantly upon signup" },
  { name: "100 companies every week" },
  { name: "Always up to date leads" },
  {
    name: "Contact information (more extensive contact information in the future)",
  },
];

const subscriptionHaterFeats: { name: string }[] = [
  { name: "Get our entire lead database (xxx comps)" },
  { name: "Each lead has contact information" },
];
function Plan({
  plan,
  subscription,
  intervalValue,
  best,
  feats,
  nFeats,
}: {
  plan: plan;
  subscription?: subscription;
  intervalValue: string;
  best: boolean;
  feats: { name: string }[];
  nFeats: { name: string }[];
}) {
  const navigate = useNavigate();
  return (
    <div
      className={`border flex flex-col p-5  ${
        best && " border-4"
      } lg:min-w-[360px] w-full relative shadow rounded-md`}
    >
      <div className="">
        <h1 className="text-xl font-semibold">{plan.variantName}</h1>
        <div dangerouslySetInnerHTML={createMarkup(plan.description)}></div>
        <div className="my-4">
          <span className="text-4xl">${formatPrice(plan.price)}</span>
          &nbsp;
          <span className="text-gray-500">
            /{formatInterval(plan.interval, plan.intervalCount)}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <PlanButton
          plan={plan}
          subscription={subscription}
          free={plan.variantName?.toLowerCase() == "free"}
        />
      </div>
      <div className="flex flex-col mt-8">
        <ul className="flex flex-col gap-3 text-black/50">
          {feats.map((feat, index) => {
            return (
              <li key={index} className=" inline-flex gap-2 items-center">
                <Check className=" shrink-0" />
                {feat.name}
              </li>
            );
          })}
          {nFeats.map((feat, index) => {
            return (
              <li key={index} className=" inline-flex gap-2 items-center">
                <X />
                {feat.name}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default function Plans({
  plans,
  subscription,
}: {
  plans: plan[];
  subscription?: subscription;
}) {
  const [intervalValue, setIntervalValue] = useState("month");
  const { session } = useSupabase();
  return (
    <>
      {/* <IntervalSwitcher
        intervalValue={intervalValue}
        changeInterval={setIntervalValue}
      /> */}

      <div className="mt-5 grid gap-6 sm:grid-cols-2">
        {plans.map((plan) => (
          <Plan
            plan={plan}
            subscription={subscription}
            intervalValue={intervalValue}
            key={plan.variantId}
            best={plan.variantName?.toLowerCase() == "growth1"}
            feats={[]}
            nFeats={[]}
          />
        ))}
        {plans.length == 0 && (
          <div className="text-red-500">
            No plans found, makes sure you have synced your lemonsqueezy plans
          </div>
        )}
      </div>

      <p className="mt-8 text-gray-400 text-sm text-center">
        Payments are processed securely by Lemon Squeezy.
      </p>
    </>
  );
}

export function PlanButton({
  plan,
  subscription,
  free,
}: {
  plan: plan;
  subscription?: subscription;
  free: boolean;
}) {
  const [isMutating, setIsMutating] = useState(false);

  const { session } = useSupabase();
  const navigate = useNavigate();
  const createCheckout = trpc.lemon.createCheckout.useMutation();
  const updatePlan = trpc.lemon.updatePlan.useMutation();
  return (
    <>
      {!subscription || subscription.status == "expired" ? (
        <>
          {free && session ? (
            <span className="px-3.5 items-center py-2 flex justify-center gap-3 w-full transition-all">
              <span className="leading-[28px] inline-block">
                Your current plan
              </span>
            </span>
          ) : (
            <button
              onClick={(e) => {
                e.preventDefault();
                session
                  ? createCheckout.mutate(
                      { variantId: plan.variantId },
                      {
                        onSuccess: (res) => {
                          LemonSqueezy.Url.Open(res.url);
                        },
                        onError: (err) => {
                          toast.error(err.message);
                        },
                      }
                    )
                  : navigate("/signin");
              }}
              className={`bg-blue-700 hover:bg-blue-800 px-3.5 items-center py-2 flex justify-center gap-3 w-full transition-all rounded-sm text-white`}
              disabled={createCheckout.isLoading}
            >
              <Loader2
                className={
                  "animate-spin inline-block relative top-[-1px] mr-2 transition-all " +
                  (!createCheckout.isLoading ? "w-0" : "")
                }
              />
              <span className="leading-[28px] inline-block">Subscribe</span>
            </button>
          )}
        </>
      ) : (
        <>
          {subscription?.planId == plan.id ? (
            <span className="px-3.5 items-center py-2 flex justify-center gap-3 w-full transition-all">
              <span className="leading-[28px] inline-block">
                Your current plan
              </span>
            </span>
          ) : (
            <button
              onClick={(e) => {
                e.preventDefault();
                updatePlan.mutate(
                  {
                    subscriptionId: subscription.lemonSqueezyId,
                    data: {
                      action: "change",
                      variantId: plan.variantId,
                      productId: plan.productId,
                    },
                  },
                  {
                    onSuccess: () => {
                      toast.success("Your subscription plan has changed!");
                    },
                    onError: (err) => {
                      toast.error(err.message);
                    },
                  }
                );
              }}
              className="bg-blue-700 hover:bg-blue-800 px-3.5 items-center py-2 flex justify-center gap-3 w-full transition-all rounded-sm text-white"
              disabled={updatePlan.isLoading}
            >
              <Loader2
                className={
                  "animate-spin inline-block relative top-[-1px] mr-2 transition-all " +
                  (!updatePlan.isLoading ? "w-0" : "")
                }
              />
              <span className={"leading-[28px] inline-block"}>
                Change to this plan
              </span>
            </button>
          )}
        </>
      )}
    </>
  );
}
