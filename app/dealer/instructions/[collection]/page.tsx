import { notFound } from "next/navigation";

import {
  getCollectionTitle,
  getDealerInstructionCollections,
  getDealerInstructionsByCollection,
} from "@/app/lib/dealer/price-lists";

import InstructionsModulesClient from "./InstructionsModulesClient";

type Params = {
  collection: string;
};

export default async function Page({ params }: { params: Promise<Params> }) {
  const { collection } = await params;

  const [collections, items] = await Promise.all([
    getDealerInstructionCollections(),
    getDealerInstructionsByCollection(collection),
  ]);

  const currentCollection = collections.find(
    (item) => item.slug === collection.toLowerCase(),
  );

  if (!currentCollection && items.length === 0) {
    notFound();
  }

  return (
    <InstructionsModulesClient
      collectionSlug={collection.toLowerCase()}
      collectionTitle={
        currentCollection?.title ||
        items[0]?.collectionTitle ||
        getCollectionTitle(collection)
      }
      items={items}
    />
  );
}
