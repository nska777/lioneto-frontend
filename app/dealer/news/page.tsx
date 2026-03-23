import DealerNewsList from "./DealerNewsList";
import DealerNewsProfileBlock from "./DealerNewsProfileBlock";
import { getDealerNews } from "@/app/lib/dealer/news";

export default async function DealerNewsPage() {
  const items = await getDealerNews();

  return (
    <main className="mx-auto w-full max-w-[1120px] px-4 py-3 md:px-6 md:py-4">
      <div className="space-y-6">
        <section>
          <h1 className="text-[34px] leading-[1.06] font-semibold tracking-[-0.02em] text-black">
            Добро пожаловать 👋
          </h1>
          <p className="mt-2 text-[14px] text-black/60">
            Вы авторизованы в дилерском портале Lioneto.
          </p>
        </section>

        <DealerNewsProfileBlock />

        <DealerNewsList items={items} />
      </div>
    </main>
  );
}
