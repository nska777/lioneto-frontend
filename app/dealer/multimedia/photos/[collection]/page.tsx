import { notFound } from "next/navigation";

import PhotoCollectionClient from "./PhotoCollectionClient";
import {
  DEALER_MULTIMEDIA_COLLECTIONS,
  getDealerCollectionTitle,
  getDealerPhotosByCollection,
  type DealerMultimediaCollectionSlug,
} from "@/app/lib/dealer/multimedia";

type Props = {
  params: Promise<{
    collection: string;
  }>;
};

export default async function Page({ params }: Props) {
  const { collection } = await params;

  const valid = DEALER_MULTIMEDIA_COLLECTIONS.some(
    (item) => item.slug === collection,
  );

  if (!valid) {
    notFound();
  }

  const collectionSlug = collection as DealerMultimediaCollectionSlug;
  const photos = await getDealerPhotosByCollection(collectionSlug);
  const collectionTitle = getDealerCollectionTitle(collectionSlug);

  return (
    <PhotoCollectionClient
      collectionSlug={collectionSlug}
      collectionTitle={collectionTitle}
      photos={photos}
    />
  );
}
