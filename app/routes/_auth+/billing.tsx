import { LoaderFunctionArgs } from "@remix-run/node";
import { SubscriptionComponent } from "~/components/billing/subscription";
import { getServerSideSession, requireAuth } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { superjson, useSuperLoaderData } from "~/utils/superjson";
export async function loader({ request, context }: LoaderFunctionArgs) {
  await requireAuth(request);
  const { session } = await getServerSideSession(request);
  const plans = await prisma.plan.findMany({
    where: { NOT: [{ status: "draft" }, { status: "pending" }] },
  });
  if (session) {
    const sub = await prisma.subscription.findFirst({
      where: { userId: session?.user.id },
      include: {
        plan: true,
      },
      orderBy: {
        lemonSqueezyId: "desc",
      },
    });
    return superjson({ subscription: sub, plans });
  }

  return superjson({ subscription: null, plans });
}
export default function Billing() {
  const { subscription, plans } = useSuperLoaderData<typeof loader>();
  return (
    <div className="container mx-auto max-w-5xl">
      <h1 className="text-xl font-bold mb-3">Billing</h1>
      <SubscriptionComponent sub={subscription} plans={plans} />
    </div>
  );
}
