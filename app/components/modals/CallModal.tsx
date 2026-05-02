"use client";

import { useMemo, useState, type SyntheticEvent } from "react";
import { createPortal } from "react-dom";
import { Download, X } from "lucide-react";
import Modal from "./Modal";
import { useRegionLang } from "@/app/context/region-lang";
import { getDict, tF } from "@/i18n";
import { REGION_DATA } from "@/app/lib/headerData";

function cn(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

function onlyDigits(s: string) {
  return s.replace(/\D/g, "");
}

function formatPhone(digits: string, regionKey: "ru" | "uz") {
  const max = regionKey === "uz" ? 9 : 10;
  const d = digits.slice(0, max);

  if (regionKey === "uz") {
    const a = d.slice(0, 2);
    const b = d.slice(2, 5);
    const c = d.slice(5, 7);
    const e = d.slice(7, 9);
    return [a, b, c, e].filter(Boolean).join(" ");
  }

  const a = d.slice(0, 3);
  const b = d.slice(3, 6);
  const c = d.slice(6, 8);
  const e = d.slice(8, 10);
  return [a, b, c, e].filter(Boolean).join(" ");
}

function isValidPhone(digits: string, regionKey: "ru" | "uz") {
  const d = onlyDigits(digits);
  if (regionKey === "uz") return d.length === 9;
  return d.length === 10;
}

function PrivacyPolicyWindow({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open || typeof document === "undefined") return null;

  const stopAll = (e: SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/55 px-4 py-6"
      onClick={stopAll}
      onMouseDown={stopAll}
      onPointerDown={stopAll}
      onTouchStart={stopAll}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-[920px] flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-5 border-b border-black/10 px-5 py-5 sm:px-7">
          <div>
            <p className="text-[12px] uppercase tracking-[0.22em] text-black/45">
              LIONETO
            </p>

            <h2 className="mt-2 text-[20px] font-semibold leading-tight text-black sm:text-[24px]">
              Политика обработки персональных данных
            </h2>

            <p className="mt-2 text-[13px] leading-6 text-black/55">
              Согласие на обработку персональных данных и использование файлов
              cookie.
            </p>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="shrink-0 cursor-pointer rounded-full p-2 text-black/45 transition hover:bg-black/5 hover:text-black"
            aria-label="Закрыть"
          >
            <X size={22} />
          </button>
        </div>

        <div
          className="overflow-y-auto px-5 py-6 text-[14px] leading-7 text-black/70 sm:px-7"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div className="mb-6 rounded-[22px] bg-black/[0.03] px-5 py-4">
            <h3 className="text-[18px] font-semibold leading-tight text-black">
              Политика обработки персональных данных и использования Cookies
            </h3>

            <p className="mt-2 text-[13px] leading-6 text-black/55">
              Настоящий документ определяет порядок обработки персональных
              данных Пользователей сайта, а также условия использования файлов
              cookie.
            </p>
          </div>

          <section className="space-y-4">
            <h3 className="text-[17px] font-semibold text-black">
              1. Согласие на обработку персональных данных
            </h3>

            <p>
              Настоящим Пользователь дает согласие ООО «Комфорт плюс» на
              обработку всех указанных им персональных данных, включая, но не
              ограничиваясь следующими сведениями:
            </p>

            <ul className="list-disc space-y-2 pl-6">
              <li>фамилия, имя и отчество;</li>
              <li>номер телефона;</li>
              <li>гражданство;</li>
              <li>пол;</li>
              <li>возраст;</li>
              <li>дата и место рождения;</li>
              <li>
                серия и номер основного документа, удостоверяющего личность,
                сведения о дате выдачи указанного документа и выдавшем его
                органе;
              </li>
              <li>адрес регистрации по месту жительства;</li>
              <li>адрес фактического проживания;</li>
              <li>идентификационный номер налогоплательщика;</li>
              <li>страховой номер индивидуального лицевого счета;</li>
              <li>адрес электронной почты;</li>
              <li>адрес доставки и местоположение;</li>
              <li>информация об избранных контактах;</li>
              <li>
                любая другая информация, передаваемая посредством cookies сайта;
              </li>
              <li>
                иные данные, полученные в результате их обработки любыми
                способами, включая воспроизведение, электронное копирование,
                обезличивание, блокирование и уничтожение.
              </li>
            </ul>
          </section>

          <section className="mt-8 space-y-4">
            <h3 className="text-[17px] font-semibold text-black">
              2. Цели обработки персональных данных
            </h3>

            <p>
              Обработка персональных данных может осуществляться Обществом, а
              также третьими лицами, действующими по поручению Общества, в
              следующих целях:
            </p>

            <ul className="list-disc space-y-2 pl-6">
              <li>обеспечение информационной поддержки Пользователя;</li>
              <li>оказание услуг, связанных с деятельностью Общества;</li>
              <li>
                создание и сопровождение информационных систем персональных
                данных Общества;
              </li>
              <li>
                направление Пользователю рекламных материалов, информации,
                уведомлений и запросов, в том числе посредством сети Интернет и
                телефонной связи;
              </li>
              <li>
                обеспечение интересов Общества и Пользователя, а также в иных
                целях, прямо или косвенно связанных с обслуживанием и
                предложением продуктов Общества.
              </li>
            </ul>
          </section>

          <section className="mt-8 space-y-4">
            <h3 className="text-[17px] font-semibold text-black">
              3. Оператор персональных данных
            </h3>

            <div className="rounded-[22px] bg-black/[0.03] p-4 text-black/70">
              <p className="font-semibold text-black">ООО «Комфорт плюс»</p>
              <p>ИНН 9721264165 / КПП 772101001 / ОГРН 1267700104352</p>
              <p>
                109443, г. Москва, вн. тер. г. муниципальный округ Кузьминки,
                пр-кт Волгоградский, д. 135 к. 3, помещ. 7М
              </p>
            </div>

            <p>
              Указанное согласие предоставляется сроком на 5 лет. В случае
              отзыва согласия обработка персональных данных должна быть
              прекращена Обществом и/или третьими лицами, а персональные данные
              подлежат уничтожению в установленном порядке.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h3 className="text-[17px] font-semibold text-black">
              4. Правила использования персональных данных
            </h3>

            <p>
              Собираемые персональные данные позволяют направлять Пользователям
              уведомления о новых продуктах, специальных предложениях и
              различных событиях. Они также помогают Обществу совершенствовать
              услуги, контент и коммуникации.
            </p>

            <p>
              В случае нежелания получать рассылку Пользователь может в любое
              время отказаться от нее путем направления письменного уведомления
              на электронный адрес{" "}
              <a
                href="mailto:info@lioneto.uz"
                className="cursor-pointer font-medium text-black underline underline-offset-4"
              >
                info@lioneto.uz
              </a>
              .
            </p>

            <p>
              Общество может использовать персональные данные Пользователя для
              отправки важных уведомлений, содержащих информацию об изменениях
              положений, условий и политик, а также уведомлений, связанных с
              размещенными заказами и совершенными покупками.
            </p>

            <p>
              Общество также может использовать персональную информацию для
              внутренних целей, включая аудит, анализ данных, исследования,
              улучшение продуктов и услуг, а также взаимодействие с
              потребителями.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h3 className="text-[17px] font-semibold text-black">
              5. Согласие на использование Cookies
            </h3>

            <p>
              Сайт использует файлы cookies для корректной работы, сохранения
              пользовательских настроек, отображения актуальных товаров, цен,
              акций и улучшения пользовательского опыта.
            </p>

            <p>
              Cookies — это небольшие файлы, которые браузер сохраняет на
              устройстве Пользователя. Они позволяют сайту узнавать Пользователя
              при повторном посещении и учитывать ранее выбранные настройки.
            </p>

            <p>
              Пользователь может отказаться от персонализации, запретив
              сохранение cookies в настройках своего браузера. В таком случае
              отдельные функции сайта могут работать ограниченно.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h3 className="text-[17px] font-semibold text-black">
              6. Политика использования Cookies
            </h3>

            <p>
              Пользователь сайта подтверждает, что согласен на использование
              файлов cookie и ознакомлен с настоящей политикой.
            </p>

            <p>
              Файлы cookie не несут угрозы безопасности данным Пользователя.
              Помимо сохранения персональных настроек и предпочтений они
              используются для:
            </p>

            <ul className="list-disc space-y-2 pl-6">
              <li>совершенствования продуктов и услуг;</li>
              <li>
                предоставления более точной информации по запросу посетителя;
              </li>
              <li>
                корректной работы компонентов сайта, веб-страниц и навигации;
              </li>
              <li>подбора персональных предложений;</li>
              <li>сбора статистических данных сайта.</li>
            </ul>

            <p>Срок хранения cookie-файлов зависит от их типа:</p>

            <ul className="list-disc space-y-2 pl-6">
              <li>сеансовые — удаляются при закрытии браузера;</li>
              <li>
                постоянные — сохраняются продолжительное время для повторного
                использования сайта;
              </li>
              <li>
                статистические — содержат информацию о действиях посетителя на
                сайте;
              </li>
              <li>обязательные — необходимы для корректной работы сайта.</li>
            </ul>

            <p>
              Настоящая политика предусматривает обязательства Общества по
              неразглашению и обеспечению защиты конфиденциальности данных
              посетителей сайта.
            </p>

            <p>
              ООО «Комфорт плюс» оставляет за собой право вносить изменения в
              настоящую Политику путем размещения обновленной редакции на сайте{" "}
              <a
                href="https://lioneto.com/"
                target="_blank"
                rel="noreferrer"
                className="cursor-pointer font-medium text-black underline underline-offset-4"
              >
                https://lioneto.com/
              </a>
              .
            </p>
          </section>

          <div className="mt-8 flex flex-col gap-3 border-t border-black/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[12px] leading-5 text-black/45">
              Полная версия документа доступна для скачивания в формате Word.
            </p>

            <a
              href="/docs/privacy-policy.docx"
              download="privacy-policy.docx"
              onClick={(e) => {
                e.stopPropagation();
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
              }}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-black px-5 py-3 text-[13px] font-medium text-white transition hover:opacity-90"
            >
              <Download size={16} />
              Скачать документ
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function CallModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: {
    lastName: string;
    firstName: string;
    phone: string;
    region: string;
    pageUrl: string;
    question: string;
  }) => void;
}) {
  const { region, setRegion, lang } = useRegionLang();

  const dict = useMemo(() => getDict(lang as any), [lang]);
  const tt = (key: string, fallback: string) => tF(dict as any, key, fallback);

  const [phoneDigits, setPhoneDigits] = useState("");
  const [pending, setPending] = useState(false);

  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState<
    "accepted" | "declined" | null
  >(null);

  if (!open) return null;

  const regionKey = (region === "ru" ? "ru" : "uz") as "ru" | "uz";
  const phonePrefix = REGION_DATA[regionKey].phonePrefix;

  const regionLabel =
    regionKey === "uz"
      ? tt("region.uz", "Узбекистан")
      : tt("region.ru", "Россия");

  const placeholder = regionKey === "uz" ? "90 123 45 67" : "999 123 45 67";

  const phoneView = formatPhone(phoneDigits, regionKey);
  const phoneOk = isValidPhone(phoneDigits, regionKey);

  const canSubmit = privacyConsent === "accepted";
  const submitDisabled = pending || !phoneOk || !canSubmit;

  const handleCloseCallModal = () => {
    if (pending) return;

    if (privacyOpen) {
      return;
    }

    setPrivacyOpen(false);
    onClose();
  };

  return (
    <>
      <Modal
        open={open}
        onClose={handleCloseCallModal}
        title={tt("header.ui.callMe", "ЗАКАЗАТЬ ЗВОНОК")}
        widthClass="max-w-[720px]"
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="text-[12px] tracking-[0.18em] text-black/50">
            {tt("header.pickRegion", "Выберите регион").toUpperCase()}
          </div>

          <div className="inline-flex rounded-full border border-black/10 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setRegion("uz")}
              className={cn(
                "h-8 px-4 rounded-full text-[12px] tracking-[0.12em] transition cursor-pointer",
                regionKey === "uz"
                  ? "bg-black text-white"
                  : "text-black/70 hover:text-black hover:bg-black/5",
              )}
            >
              {tt("header.regionUz", "Узбекистан")}
            </button>

            <button
              type="button"
              onClick={() => setRegion("ru")}
              className={cn(
                "h-8 px-4 rounded-full text-[12px] tracking-[0.12em] transition cursor-pointer",
                regionKey === "ru"
                  ? "bg-black text-white"
                  : "text-black/70 hover:text-black hover:bg-black/5",
              )}
            >
              {tt("header.regionRu", "Россия")}
            </button>
          </div>
        </div>

        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();

            if (pending || !phoneOk || !canSubmit) return;

            const form = new FormData(e.currentTarget);
            const lastName = String(form.get("lastName") ?? "").trim();
            const firstName = String(form.get("firstName") ?? "").trim();
            const question = String(form.get("question") ?? "").trim();

            const phone = `${phonePrefix} ${phoneDigits}`.trim();

            const payload = {
              lastName,
              firstName,
              phone,
              region: regionLabel,
              pageUrl:
                typeof window !== "undefined" ? window.location.href : "",
              question,
            };

            try {
              setPending(true);

              const res = await fetch("/api/call-request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });

              if (!res.ok) {
                const text = await res.text();
                console.error("CALL REQUEST FAILED:", text);
                return;
              }

              onSubmit?.(payload);

              setPrivacyOpen(false);
              setPrivacyConsent(null);
              onClose();
            } catch (err) {
              console.error("CALL REQUEST ERROR:", err);
            } finally {
              setPending(false);
            }
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <div className="mb-2 text-[11px] tracking-[0.22em] text-black/45">
                {tt("form.lastName", "ФАМИЛИЯ")}
              </div>
              <input
                required
                name="lastName"
                className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-[14px] outline-none focus:border-black/20 focus:shadow-[0_0_0_6px_rgba(0,0,0,0.04)] transition"
                placeholder={tt("form.lastNamePh", "Иванов")}
              />
            </div>

            <div>
              <div className="mb-2 text-[11px] tracking-[0.22em] text-black/45">
                {tt("form.firstName", "ИМЯ")}
              </div>
              <input
                required
                name="firstName"
                className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-[14px] outline-none focus:border-black/20 focus:shadow-[0_0_0_6px_rgba(0,0,0,0.04)] transition"
                placeholder={tt("form.firstNamePh", "Иван")}
              />
            </div>
          </div>

          <div>
            <div className="mb-2 text-[11px] tracking-[0.22em] text-black/45">
              {tt("form.phone", "ТЕЛЕФОН")}
            </div>

            <div className="flex h-12 overflow-hidden rounded-2xl border border-black/10 bg-white focus-within:border-black/20 focus-within:shadow-[0_0_0_6px_rgba(0,0,0,0.04)] transition">
              <div className="inline-flex items-center px-4 text-[13px] tracking-[0.14em] text-black/60">
                {phonePrefix}
              </div>

              <input
                required
                type="tel"
                inputMode="numeric"
                value={phoneView}
                onChange={(e) => {
                  const digits = onlyDigits(e.target.value);
                  const limit = regionKey === "uz" ? 9 : 10;
                  setPhoneDigits(digits.slice(0, limit));
                }}
                className="h-full w-full px-3 text-[14px] outline-none"
                placeholder={placeholder}
              />
            </div>

            <div className="mt-2 text-[12px] text-black/45">
              {tt("form.region", "Регион")}:{" "}
              <span className="text-black/70">{regionLabel}</span>
            </div>
          </div>

          <div>
            <textarea
              name="question"
              rows={3}
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-[14px] outline-none resize-none transition focus:border-black/20 focus:shadow-[0_0_0_6px_rgba(0,0,0,0.04)]"
              placeholder="Кратко опишите ваш вопрос"
            />
          </div>

          <div className="rounded-[20px] border border-black/10 bg-black/[0.02] px-4 py-4">
            <p className="text-[12px] leading-5 text-black/55">
              Перед отправкой формы выберите согласие на обработку персональных
              данных. Подробные условия доступны в{" "}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setPrivacyOpen(true);
                }}
                className="cursor-pointer font-medium text-black underline underline-offset-4 transition hover:text-black/60"
              >
                пользовательском соглашении
              </button>
              .
            </p>

            <div className="mt-3 space-y-2">
              <label
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-2xl bg-white px-3 py-3 text-[12px] leading-5 text-black/70 ring-1 transition",
                  privacyConsent === "accepted"
                    ? "ring-black bg-white"
                    : "ring-black/10 hover:ring-black/20",
                )}
              >
                <input
                  type="radio"
                  name="privacyConsent"
                  checked={privacyConsent === "accepted"}
                  onChange={() => setPrivacyConsent("accepted")}
                  className="mt-1 h-4 w-4 accent-black"
                />

                <span>
                  Я даю согласие на обработку персональных данных и принимаю
                  условия пользовательского соглашения.
                </span>
              </label>

              <label
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-2xl bg-white px-3 py-3 text-[12px] leading-5 text-black/70 ring-1 transition",
                  privacyConsent === "declined"
                    ? "ring-red-300 bg-red-50"
                    : "ring-black/10 hover:ring-black/20",
                )}
              >
                <input
                  type="radio"
                  name="privacyConsent"
                  checked={privacyConsent === "declined"}
                  onChange={() => setPrivacyConsent("declined")}
                  className="mt-1 h-4 w-4 accent-black"
                />

                <span>
                  Я отказываюсь от обработки персональных данных и понимаю, что
                  отправка формы будет недоступна.
                </span>
              </label>
            </div>

            {privacyConsent === "declined" && (
              <p className="mt-3 rounded-2xl bg-red-50 px-3 py-2 text-[12px] leading-5 text-red-700 ring-1 ring-red-100">
                Без согласия на обработку персональных данных мы не сможем
                принять заявку через форму.
              </p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitDisabled}
              className={cn(
                "w-full rounded-2xl py-3 text-[13px] tracking-[0.18em] text-white transition",
                submitDisabled
                  ? "cursor-not-allowed bg-black/35"
                  : "cursor-pointer bg-black hover:opacity-90",
              )}
            >
              {pending
                ? tt("form.sending", "ОТПРАВКА...")
                : tt("form.send", "ОТПРАВИТЬ")}
            </button>
          </div>
        </form>
      </Modal>

      <PrivacyPolicyWindow
        open={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
      />
    </>
  );
}
