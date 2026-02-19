export const dynamic = "force-static";

export default function CheckoutSuccessPage() {
  return (
    <main className="mx-auto w-full max-w-[900px] px-4 py-16">
      <div className="rounded-3xl border border-black/10 bg-white p-8">
        <div className="text-[12px] tracking-[0.28em] text-black/45">
          LIONETO
        </div>

        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.02em]">
          Заказ отправлен
        </h1>

        <p className="mt-3 text-sm text-black/60">
          Спасибо! Менеджер получил заявку в Telegram и свяжется с вами.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="/catalog"
            className="inline-flex items-center justify-center rounded-full bg-black px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            В каталог
          </a>

          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-black/80 hover:border-black/20"
          >
            На главную
          </a>
        </div>
      </div>
    </main>
  );
}
