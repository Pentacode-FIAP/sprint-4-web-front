import { PilulaDificuldade } from './PilulaDificuldade';

/** Rótulo de cada alternativa. */
export const LETRAS = ['A', 'B', 'C', 'D'];

const ESTADO_ALTERNATIVA = {
  certa: 'border-ok bg-ok-soft',
  errada: 'border-danger bg-danger-soft',
};

/**
 * Uma questão de múltipla escolha. `revelado` mostra o gabarito e a
 * justificativa; antes disso a alternativa marcada só fica destacada.
 */
export function QuestaoCard({ item, numero, total, escolha, revelado, onEscolher }) {
  const alternativas = item.alternativas ?? [];

  return (
    <article className="animate-rise-in">
      <header className="mb-3 flex items-center justify-between gap-2.5">
        <span className="font-mono text-xs text-text-muted tabular-nums">
          {numero} de {total}
        </span>
        <PilulaDificuldade nivel={item.dificuldade} />
      </header>

      <p className="m-0 mb-4 text-[15px] leading-normal font-medium [overflow-wrap:anywhere]">{item.pergunta}</p>

      <div className="flex flex-col gap-2" role="radiogroup" aria-label={`Alternativas da questão ${numero}`}>
        {alternativas.map((texto, i) => {
          const estado = !revelado ? undefined : i === item.correta ? 'certa' : i === escolha ? 'errada' : undefined;
          const marcada = escolha === i;
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={marcada}
              disabled={revelado}
              onClick={() => onEscolher(i)}
              className={`flex min-h-11 w-full cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 text-left text-sm leading-normal transition-colors disabled:cursor-default ${
                ESTADO_ALTERNATIVA[estado] ??
                (marcada ? 'border-accent bg-accent-soft' : 'border-border bg-surface hover:bg-surface-2')
              } ${revelado && !estado ? 'opacity-60' : ''}`}
            >
              <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-surface-2 font-mono text-[11px] font-semibold text-text-2">
                {LETRAS[i]}
              </span>
              <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">{texto}</span>
            </button>
          );
        })}
      </div>

      {revelado && item.correta !== undefined && (
        <p
          className={`mt-3.5 mb-0 animate-rise-in rounded-sm px-[13px] py-[11px] text-[13.5px] leading-[1.6] ${
            escolha === item.correta ? 'bg-ok-soft text-text' : 'bg-surface-2 text-text-2'
          }`}
        >
          <strong>{escolha === item.correta ? 'Certa. ' : `A correta era a ${LETRAS[item.correta]}. `}</strong>
          {item.resposta}
        </p>
      )}
    </article>
  );
}
