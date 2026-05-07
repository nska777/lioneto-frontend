import { notFound } from "next/navigation";

import { getDealerCollectionPageData } from "@/app/lib/dealer/shop";
import DealerCollectionClient from "./DealerCollectionClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DealerCollectionPage({
  params,
}: {
  params: Promise<{ collection: string }>;
}) {
  const { collection } = await params;

  const data = await getDealerCollectionPageData(collection);

  if (!data.collection) {
    notFound();
  }

  return (
    <DealerCollectionClient
      initialCollection={data.collection}
      initialCollections={data.collections}
      initialProducts={data.products}
    />
  );
}
