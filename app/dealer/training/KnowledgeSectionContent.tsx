type KnowledgeSectionContentProps = {
  canManageNotes?: boolean;
};

export default function KnowledgeSectionContent({
  canManageNotes = false,
}: KnowledgeSectionContentProps) {
  return (
    <div className="space-y-4">
      {canManageNotes ? (
        <div className="flex justify-end">
          <button
            type="button"
            className="inline-flex rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.10em] text-black/65 transition hover:bg-black/[0.03]"
          >
            Создать заметку
          </button>
        </div>
      ) : null}

      <div className="rounded-[18px] border border-[#CFE0F4] bg-[#F7FBFF] p-4">
        <div className="text-sm font-semibold text-black">
          Здесь будет лента базы знаний
        </div>
        <div className="mt-1 text-xs text-black/55">
          Новости, заметки, мини-статьи и вложения будут отображаться прямо
          внутри этого блока.
        </div>
      </div>

      <div className="rounded-[20px] border border-black/10 bg-white p-4 shadow-[0_10px_24px_rgba(50,40,18,0.03)]">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="inline-flex rounded-full border border-[#CFE0F4] bg-[#F2F8FF] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#3A648F]">
              Новость
            </div>

            <h3 className="mt-3 text-[18px] font-semibold text-black">
              Заголовок записи базы знаний
            </h3>

            <p className="mt-2 text-sm leading-6 text-black/60">
              Здесь будет краткое описание записи: заметка, мини-статья, новость
              или материал с вложениями.
            </p>
          </div>

          <div className="shrink-0 text-xs text-black/35">26.03.2026</div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-black/45">
          <span>👁 124</span>
          <span>❤ 18</span>
          <span>💬 6</span>
          <span className="rounded-full border border-black/10 px-2.5 py-1">
            PDF
          </span>
        </div>

        <div className="mt-4">
          <button
            type="button"
            className="inline-flex rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.10em] text-black/65 transition hover:bg-black/[0.03]"
          >
            Читать далее
          </button>
        </div>
      </div>

      <div className="rounded-[20px] border border-black/10 bg-white p-4 shadow-[0_10px_24px_rgba(50,40,18,0.03)]">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="inline-flex rounded-full border border-[#E6D5AA] bg-[#FFF7E3] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8A6732]">
              Заметка
            </div>

            <h3 className="mt-3 text-[18px] font-semibold text-black">
              Важная заметка для дилеров
            </h3>

            <p className="mt-2 text-sm leading-6 text-black/60">
              Здесь будет отображаться заметка от администратора или
              руководителя с пояснениями и файлами.
            </p>
          </div>

          <div className="shrink-0 text-xs text-black/35">26.03.2026</div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-black/45">
          <span>👁 58</span>
          <span>❤ 7</span>
          <span>💬 2</span>
          <span className="rounded-full border border-black/10 px-2.5 py-1">
            DOCX
          </span>
        </div>

        <div className="mt-4">
          <button
            type="button"
            className="inline-flex rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.10em] text-black/65 transition hover:bg-black/[0.03]"
          >
            Читать далее
          </button>
        </div>
      </div>
    </div>
  );
}
