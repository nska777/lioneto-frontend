import Image from "next/image";
import Link from "next/link";

import { getDealerCollections } from "@/app/lib/dealer/shop";

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export const metadata = {
  title: "Заказать товар — Dealer Portal",
  robots: { index: false, follow: false },
};

export default async function DealerOrderPage() {
  const dealerCollections = await getDealerCollections();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {dealerCollections.map((collection) => {
          const collectionImage = collection.coverImage?.trim() || "";

          return (
            <Link
              key={collection.id}
              href={`/dealer/order/${collection.slug}`}
              className={cn(
                "group overflow-hidden rounded-[20px] border border-black/10 bg-white",
                "shadow-[0_12px_30px_-24px_rgba(0,0,0,0.18)] transition-all duration-200",
                "hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-[0_16px_36px_-22px_rgba(0,0,0,0.2)]",
              )}
            >
              <div className="relative h-[150px] w-full overflow-hidden bg-[#f1f1ed]">
                {collectionImage ? (
                  <Image
                    src={collectionImage}
                    alt={collection.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    sizes="(max-width: 1280px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center px-4 text-center text-[13px] text-black/35">
                    {collection.title}
                  </div>
                )}
              </div>

              <div className="p-4">
                <h2 className="truncate text-[18px] font-semibold tracking-[0.04em] text-black">
                  {collection.title}
                </h2>

                <p className="mt-1 text-[12px] font-medium uppercase tracking-[0.16em] text-black/45">
                  Коллекция
                </p>
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
