import { env } from "$/env.mjs";
import { LemonSqueezy } from "@lemonsqueezy/lemonsqueezy.js";
import { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireAdmin } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
const ls = new LemonSqueezy(env.LEMON_KEY);

async function getPlans() {
  const params = {};

  let hasNextPage = true;
  let page = 1;

  let variants: any[] = [];
  let products: any[] = [];

  while (hasNextPage) {
    const resp = await ls.getVariants({
      include: ["product"],
      perPage: 50,
      page: page ?? undefined,
    });
    resp.data;
    variants = variants.concat(resp.data);
    products = products.concat(resp.included);

    if ((resp as any)["meta"]["page"]["lastPage"] > page) {
      page += 1;
    } else {
      hasNextPage = false;
    }
  }
  // Nest products inside variants
  const prods: any = {};
  for (let i = 0; i < products.length; i++) {
    prods[products[i]["id"]] = products[i]["attributes"];
  }
  for (let i = 0; i < variants.length; i++) {
    variants[i]["product"] = prods[variants[i]["attributes"]["product_id"]];
  }
  console.log(variants);
  return variants as any[];
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  await requireAdmin(request);
  const variants = await getPlans();

  let variantId, variant, product, productId;

  for (let i = 0; i < variants.length; i++) {
    variant = variants[i];

    if (!variant["attributes"]["is_subscription"]) {
      console.log("Not a subscription");
      continue;
    }

    if (String(variant["product"]["store_id"]) !== process.env.LEMON_STORE_ID) {
      console.log(
        `Store ID ${variant["product"]["store_id"]} does not match (${process.env.LEMONSQUEEZY_STORE_ID})`
      );
      continue;
    }

    variantId = parseInt(variant["id"]);
    product = variant["product"];
    productId = parseInt(variant["attributes"]["product_id"]);

    // Get variant's Price objects
    let prices = await ls.getPrices({ variantId: variantId, perPage: 100 });
    // The first object is the latest/current price
    let variant_price = prices["data"][0]["attributes"]["unit_price"];

    variant = variant["attributes"];

    const updateData = {
      productId: productId,
      name: product["name"],
      variantName: variant["name"],
      status: variant["status"],
      sort: variant["sort"],
      description: variant["description"],
      price: variant_price, // display price in the app matches current Price object in LS
      interval: variant["interval"],
      intervalCount: variant["interval_count"],
    };
    console.log(updateData);
    const createData: typeof updateData & { variantId: number } =
      updateData as any;
    createData["variantId"] = variantId;

    try {
      await prisma.plan.upsert({
        where: {
          variantId: variantId,
        },
        update: updateData,
        create: createData,
      });
    } catch (error) {
      console.log(variant);
      console.log(error);
      return json({ success: false });
    }
  }
  return json({ success: true });
}
