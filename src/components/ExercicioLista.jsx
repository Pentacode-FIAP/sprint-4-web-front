import { ChevronDown } from 'lucide-react';
import { PilulaDificuldade } from './PilulaDificuldade';

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
            <PilulaDificuldade nivel={item.dificuldade} />
          </div>
          <details className="group mt-2.5">
            <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1.5 py-1.5 text-[12.5px] font-semibold text-accent [&::-webkit-details-marker]:hidden">
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
