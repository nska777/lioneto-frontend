import AuthClient from "./AuthClient";

export default function AuthPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-[980px] px-4">
        <div className="flex justify-center pt-[50px] pb-24">
          <div className="w-full max-w-[620px] text-center">
            <h1 className="text-[34px] tracking-[-0.03em]">Личный кабинет</h1>

            <div className="mt-6">
              <AuthClient />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
