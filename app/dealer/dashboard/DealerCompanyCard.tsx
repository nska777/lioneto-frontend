type DealerCompanyCardProps = {
  dealer: {
    title?: string;
    managerName?: string;
    email?: string;
    phone?: string;
    city?: string;
    address?: string;
  };
};

export default function DealerCompanyCard({ dealer }: DealerCompanyCardProps) {
  return (
    <section className="rounded-[28px] border border-black/10 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h1 className="text-[34px] font-semibold tracking-[-0.03em] text-black">
          Главная
        </h1>
        <p className="mt-2 text-[15px] text-black/60">
          Карточка компании и последние новости дилерского кабинета.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-black/45">
              Компания
            </div>
            <div className="mt-1 text-[24px] font-medium text-black">
              {dealer.title || "—"}
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-black/45">
              Email
            </div>
            <div className="mt-1 text-[18px] font-medium text-black">
              {dealer.email || "—"}
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-black/45">
              Город
            </div>
            <div className="mt-1 text-[18px] font-medium text-black">
              {dealer.city || "—"}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-black/45">
              Контактное лицо
            </div>
            <div className="mt-1 text-[18px] font-medium text-black">
              {dealer.managerName || "—"}
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-black/45">
              Рабочий телефон
            </div>
            <div className="mt-1 text-[18px] font-medium text-black">
              {dealer.phone || "—"}
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-black/45">
              Полный адрес
            </div>
            <div className="mt-1 whitespace-pre-line text-[18px] font-medium text-black">
              {dealer.address || "—"}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
