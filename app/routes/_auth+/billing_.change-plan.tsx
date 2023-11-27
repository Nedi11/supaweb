import { LoaderFunctionArgs } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { superjson, useSuperLoaderData, redirect } from "~/utils/superjson";
import Plans from "~/components/billing/plan";
import { prisma } from "~/utils/db.server";
import { getServerSideSession } from "~/utils/auth.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { session } = await getServerSideSession(request);
  const subscription = await prisma.subscription.findFirst({
    where: { userId: session?.user.id },
  });
  if (!subscription) return redirect("/billing");
  const plans = await prisma.plan.findMany({
    where: { NOT: [{ status: "draft" }, { status: "pending" }] },
  });

  return superjson({ subscription, plans });
}
export default function ChangePlan() {
  const { subscription, plans } = useSuperLoaderData<typeof loader>();

  return (
    <div className="container mx-auto max-w-3xl">
      <Link to="/billing/" className="text-gray-500 text-sm mb-6">
        &larr; Back to billing
      </Link>

      <h1 className="text-xl font-bold mb-3 text-center">Change plan</h1>

      {subscription.status == "on_trial" && (
        <div className="my-8 p-4 text-sm text-amber-800 rounded-md border border-amber-200 bg-amber-50">
          You are currently on a free trial. You will not be charged when
          changing plans during a trial.
        </div>
      )}

      <Plans plans={plans} subscription={subscription} />
    </div>
  );
}
