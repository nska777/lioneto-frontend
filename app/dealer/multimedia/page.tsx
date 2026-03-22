import MultimediaClient from "./MultimediaClient";
import { getDealerPhotoCollections } from "@/app/lib/dealer/multimedia";

export default async function Page() {
  const collections = await getDealerPhotoCollections();

  return <MultimediaClient collections={collections} />;
}
