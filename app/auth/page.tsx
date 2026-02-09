import AuthClient from "./AuthClient";

export default function AuthPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-[980px] px-4">
        <div className="flex justify-center pt-[50px] pb-24">
          <div className="w-full max-w-[520px] text-center">
            <h1 className="text-[34px] tracking-[-0.03em]">Вход</h1>
            <p className="mt-2 text-[14px] text-black/60">
              Войдите, чтобы видеть заказы и статус доставки.
            </p>

            {/* ✅ SECURE в середину */}
            <div className="mt-4 flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-[12px] tracking-[0.22em] uppercase">
                SECURE LOGIN
              </div>
            </div>

            <div className="mt-6">
              <AuthClient />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
