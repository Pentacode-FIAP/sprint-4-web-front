import { BTN_PRIMARIO } from './estilosBotao';

export function EmptyState({ Icone, titulo, descricao, acao }) {
  return (
    <div className="flex animate-rise-in flex-col items-center gap-1 rounded-lg border border-dashed border-border-strong bg-surface px-5 py-[34px] text-center">
      <span
        className="mb-2 flex h-[46px] w-[46px] items-center justify-center rounded-full bg-surface-2 text-text-faint"
        aria-hidden="true"
      >
        <Icone size={22} strokeWidth={1.75} />
      </span>
      <strong className="text-[14.5px] font-semibold">{titulo}</strong>
      <p className="m-0 max-w-[30ch] text-[13px] leading-normal text-text-muted">{descricao}</p>
      {acao && (
        <button
          type="button"
          onClick={acao.onClick}
          className={`${BTN_PRIMARIO} mt-3.5`}
        >
          {acao.rotulo}
        </button>
      )}
    </div>
  );
}
