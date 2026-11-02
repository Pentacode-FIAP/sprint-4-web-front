import { ChevronDown } from 'lucide-react';
import { LETRAS } from './QuestaoCard';
import { PilulaDificuldade } from './PilulaDificuldade';

/**
 * Lista das questões de um exercício, recolhidas. Abrir uma mostra as
 * alternativas, nunca qual delas é a certa. Para responder de verdade é a
 * `SerieExercicios`.
 *
 * Só `pergunta`, `dificuldade` e `alternativas` são lidos de propósito: espiar
 * as questões antes de responder não pode entregar o gabarito (`correta` e
 * `resposta` ficam de fora). Não passe a ler esses campos aqui.
 */
export function PreviaQuestoes({ itens }) {
  return (
    <>
      <h3 className="mt-6 mb-2.5 text-[11px] font-semibold tracking-[0.09em] text-text-muted uppercase">Questões</h3>
      <ol className="m-0 mb-4 flex list-none flex-col gap-2 p-0">
        {itens.map(({ pergunta, dificuldade, alternativas }, i) => (
          <li key={i}>
            <details className="group rounded-md border border-border bg-surface shadow-1">
              <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 px-3 py-2.5 text-sm [&::-webkit-details-marker]:hidden">
                <span className="flex-none font-mono text-xs text-text-muted tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                <span className="min-w-0 flex-1 leading-snug font-medium [overflow-wrap:anywhere]">{pergunta}</span>
                <span className="flex flex-none items-center gap-2">
                  <PilulaDificuldade nivel={dificuldade} />
                  <ChevronDown size={15} strokeWidth={2.5} aria-hidden="true" className="text-text-muted transition-transform group-open:rotate-180" />
                </span>
              </summary>
              <ul className="m-0 flex list-none flex-col gap-1.5 border-t border-border p-3">
                {(alternativas ?? []).map((texto, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm leading-normal">
                    <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-surface-2 font-mono text-[11px] font-semibold text-text-2">
                      {LETRAS[j]}
                    </span>
                    <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">{texto}</span>
                  </li>
                ))}
              </ul>
            </details>
          </li>
        ))}
      </ol>
    </>
  );
}
