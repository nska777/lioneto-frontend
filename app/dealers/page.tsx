import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Стать дилером Lioneto — дилерское сотрудничество",
  description:
    "Станьте дилером Lioneto. Выгодные дилерские цены, премиальная мебель, поддержка партнеров и актуальные коллекции.",
};

const DEALER_REGISTER_LINK = "https://lioneto.com/cooperation?interest=dealer";
const SUBSCRIBE_LINK = "https://lioneto.com/cooperation?interest=dealer";

export default function DealersPage() {
  return (
    <main className="min-h-screen bg-[#f6f1eb] text-[#2b211c]">
      <section className="relative overflow-hidden bg-[#211814]">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#c89b6d] blur-3xl" />
          <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[#8b5e3c] blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-5 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex rounded-full border border-[#d6b48f]/40 bg-white/10 px-4 py-2 text-sm font-medium text-[#e7c9aa] backdrop-blur">
              Дилерское сотрудничество Lioneto
            </p>

            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Станьте дилером мебельного бренда Lioneto
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#e7d8ca]">
              Мы производим широкий ассортимент мебели — от практичных решений
              для ежедневного спроса до премиальных коллекций. Предлагаем
              выгодные дилерские цены и удобные условия для долгосрочного
              сотрудничества.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                href={DEALER_REGISTER_LINK}
                className="inline-flex items-center justify-center rounded-2xl bg-[#c89b6d] px-7 py-4 text-base font-semibold text-[#211814] shadow-lg transition hover:bg-[#d8ad80]"
              >
                Зарегистрироваться как дилер
              </Link>

              <Link
                href={SUBSCRIBE_LINK}
                className="inline-flex items-center justify-center rounded-2xl border border-white/25 bg-white/10 px-7 py-4 text-base font-semibold text-white backdrop-blur transition hover:bg-white/15"
              >
                Подписаться на обновления
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-7 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f0e3d5] text-xl">
              %
            </div>
            <h2 className="text-xl font-semibold">Выгодные дилерские цены</h2>
            <p className="mt-3 text-sm leading-6 text-[#6a5d54]">
              Специальные условия для дилеров, салонов, дизайнеров и партнеров,
              заинтересованных в продаже мебели Lioneto.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-7 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f0e3d5] text-xl">
              ★
            </div>
            <h2 className="text-xl font-semibold">Актуальные коллекции</h2>
            <p className="mt-3 text-sm leading-6 text-[#6a5d54]">
              В ассортименте представлены мебельные решения для спальни,
              гостиной, прихожей и других зон интерьера.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-7 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f0e3d5] text-xl">
              ✓
            </div>
            <h2 className="text-xl font-semibold">Поддержка партнеров</h2>
            <p className="mt-3 text-sm leading-6 text-[#6a5d54]">
              Помогаем с ассортиментом, материалами, новинками, акциями и
              информацией по продукции.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 rounded-[32px] bg-white p-6 shadow-sm md:grid-cols-[1.1fr_0.9fr] md:p-10">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#9a6c45]">
              Для кого
            </p>

            <h2 className="text-3xl font-semibold tracking-tight">
              Приглашаем к сотрудничеству
            </h2>

            <p className="mt-4 max-w-2xl text-base leading-7 text-[#6a5d54]">
              Мы открыты к работе с мебельными салонами, дилерами, дизайнерами,
              строительными компаниями и партнерами, которые хотят предлагать
              клиентам качественную мебель с понятными условиями поставки.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#f8f4ef] px-5 py-4 text-sm font-medium">
                Мебельные салоны
              </div>
              <div className="rounded-2xl bg-[#f8f4ef] px-5 py-4 text-sm font-medium">
                Дилеры и представители
              </div>
              <div className="rounded-2xl bg-[#f8f4ef] px-5 py-4 text-sm font-medium">
                Дизайнеры интерьера
              </div>
              <div className="rounded-2xl bg-[#f8f4ef] px-5 py-4 text-sm font-medium">
                B2B-партнеры
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-[#2b211c] p-7 text-white">
            <h3 className="text-2xl font-semibold">Оставьте заявку</h3>

            <p className="mt-3 text-sm leading-6 text-[#e7d8ca]">
              Зарегистрируйтесь как дилер, и мы свяжемся с вами для обсуждения
              условий сотрудничества.
            </p>

            <div className="mt-7 space-y-3">
              <Link
                href={DEALER_REGISTER_LINK}
                className="flex w-full items-center justify-center rounded-2xl bg-[#c89b6d] px-5 py-4 text-center text-base font-semibold text-[#211814] transition hover:bg-[#d8ad80]"
              >
                Стать дилером
              </Link>

              <Link
                href={SUBSCRIBE_LINK}
                className="flex w-full items-center justify-center rounded-2xl border border-white/20 px-5 py-4 text-center text-base font-semibold text-white transition hover:bg-white/10"
              >
                Подписаться на новости
              </Link>
            </div>

            <div className="mt-8 rounded-2xl bg-white/10 p-5">
              <p className="text-sm font-semibold text-[#e7c9aa]">
                Контакты для связи
              </p>

              <div className="mt-3 space-y-2 text-sm leading-6 text-white">
                <p>
                  Телефон / Telegram:{" "}
                  <a
                    href="tel:+998917980104"
                    className="font-semibold text-[#e7c9aa] hover:underline"
                  >
                    +998 91 798 01 04
                  </a>
                </p>

                <p>
                  Telegram:{" "}
                  <a
                    href="https://t.me/nska777"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#e7c9aa] hover:underline"
                  >
                    @nska777
                  </a>
                </p>

                <p>
                  Контактное лицо:{" "}
                  <span className="font-semibold text-[#e7c9aa]">Роман</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-[32px] bg-[#eadccf] p-7 text-center sm:p-10">
          <h2 className="text-3xl font-semibold tracking-tight">
            Хотите получать новости, акции и специальные предложения?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#6a5d54]">
            Подпишитесь на обновления Lioneto, чтобы первыми узнавать о новых
            коллекциях, поступлениях и условиях для партнеров.
          </p>

          <div className="mt-7">
            <Link
              href={SUBSCRIBE_LINK}
              className="inline-flex items-center justify-center rounded-2xl bg-[#2b211c] px-7 py-4 text-base font-semibold text-white transition hover:bg-[#3a2b24]"
            >
              Подписаться
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
