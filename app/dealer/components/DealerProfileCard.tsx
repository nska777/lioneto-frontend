type DealerMe = {
  dealerId: number | null;
  title: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  region: string;
  managerName: string;
  mustChangePassword: boolean;
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.12em] text-black/40">
        {label}
      </div>
      <div className="mt-1 text-[15px] font-semibold text-black">
        {value || "—"}
      </div>
    </div>
  );
}

export default function DealerProfileCard({ dealer }: { dealer: DealerMe }) {
  return (
    <div className="rounded-[18px] border border-black/10 bg-white shadow-[0_14px_40px_-26px_rgba(0,0,0,0.35)]">
      <div className="grid gap-4 p-6 sm:grid-cols-2">
        <Field label="Компания" value={dealer.title} />
        <Field label="Контактное лицо" value={dealer.managerName} />
        <Field label="Email" value={dealer.email} />
        <Field label="Рабочий телефон" value={dealer.phone} />
        <Field label="Город" value={dealer.city} />
        <Field label="Полный адрес" value={dealer.address} />
      </div>

      {dealer.mustChangePassword ? (
        <div className="border-t border-black/10 px-6 py-4">
          <div className="rounded-xl border border-amber-300/40 bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
            Для этого аккаунта включена обязательная смена пароля.
          </div>
        </div>
      ) : null}
    </div>
  );
}
