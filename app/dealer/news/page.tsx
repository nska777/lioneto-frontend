import Link from "next/link";

import DealerNewsList from "./DealerNewsList";
import { getDealerNews } from "@/app/lib/dealer/news";

export default async function DealerNewsPage() {
  const items = await getDealerNews();

  return (
    <main className="mx-auto w-full max-w-[1120px] px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[12px] uppercase tracking-[0.22em] text-black/40">
            Dealer Portal
          </p>
          <h1 className="mt-2 text-[34px] font-semibold tracking-[-0.03em] text-black">
            Новости и акции
          </h1>
          <p className="mt-2 max-w-[720px] text-[15px] leading-6 text-black/55">
            Все актуальные обновления, материалы и объявления для дилеров
            Lioneto.
          </p>
        </div>

        <Link
          href="/dealer/dashboard"
          className="inline-flex h-11 items-center justify-center rounded-full border border-black/10 px-5 text-[14px] font-medium text-black transition hover:bg-black hover:text-white"
        >
          Назад в кабинет
        </Link>
      </div>

      <DealerNewsList items={items} />
    </main>
  );
}
