import { ChevronDown } from 'lucide-react';

const ROTULO_DIFICULDADE = { facil: 'Fácil', medio: 'Médio', dificil: 'Difícil' };
const COR_DIFICULDADE = {
  facil: 'border-facil/25 bg-facil/7 text-facil',
  medio: 'border-medio/25 bg-medio/7 text-medio',
  dificil: 'border-dificil/25 bg-dificil/7 text-dificil',
};

export function ExercicioLista({ itens }) {
  return (
    <ol className="m-0 flex list-none flex-col gap-2.5 p-0">
      {itens.map((item, i) => (
        <li key={i} className="rounded-md border border-border bg-surface p-3.5 shadow-1">
          <div className="flex items-start gap-2.5">
            <span className="mt-px flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full bg-surface-2 font-mono text-[11px] font-semibold text-text-muted">
              {i + 1}
            </span>
            <span className="flex-1 text-sm leading-normal">{item.pergunta}</span>
            <span
              className={`inline-flex flex-none items-center gap-[5px] rounded-full border px-[9px] py-[3px] text-[11px] font-semibold whitespace-nowrap before:size-[5px] before:rounded-full before:bg-current before:content-[''] ${COR_DIFICULDADE[item.dificuldade] ?? ''}`}
            >
              {ROTULO_DIFICULDADE[item.dificuldade]}
            </span>
          </div>
          <details className="group mt-2.5">
            <summary className="inline-flex min-h-8 cursor-pointer list-none items-center gap-1.5 py-1.5 text-[12.5px] font-semibold text-accent [&::-webkit-details-marker]:hidden">
              Ver resposta
              <ChevronDown size={14} strokeWidth={2.5} className="transition-transform group-open:rotate-180" />
            </summary>
            <p className="mx-0 mt-0.5 mb-0 animate-rise-in rounded-sm bg-surface-2 px-[13px] py-[11px] text-[13.5px] leading-[1.6] text-text-2">
              {item.resposta}
            </p>
          </details>
        </li>
      ))}
    </ol>
  );
}
