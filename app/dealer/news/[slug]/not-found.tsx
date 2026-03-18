import Link from "next/link";

export default function NewsNotFound() {
  return (
    <main className="mx-auto w-full max-w-[920px] px-4 py-6 md:px-6 md:py-8">
      <div className="rounded-[28px] border border-black/10 bg-white p-8 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.3)]">
        <p className="text-[12px] uppercase tracking-[0.22em] text-black/40">
          Dealer Portal
        </p>

        <h1 className="mt-3 text-[30px] font-semibold tracking-[-0.03em] text-black">
          Новость не найдена
        </h1>

        <p className="mt-3 max-w-[640px] text-[15px] leading-7 text-black/60">
          Возможно, новость была удалена, еще не опубликована или ссылка
          изменилась.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/dealer/news"
            className="inline-flex h-11 items-center justify-center rounded-full border border-black/10 px-5 text-[14px] font-medium text-black transition hover:bg-black hover:text-white"
          >
            Все новости
          </Link>

          <Link
            href="/dealer/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-full border border-black/10 px-5 text-[14px] font-medium text-black/70 transition hover:text-black"
          >
            Назад в кабинет
          </Link>
        </div>
      </div>
    </main>
  );
}
