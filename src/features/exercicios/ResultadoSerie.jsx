import { RotateCcw } from 'lucide-react';
import { Donut } from '../../components/charts/Donut';
import { PilulaDificuldade } from '../../components/PilulaDificuldade';
import { BTN_SECUNDARIO } from '../../components/estilosBotao';
import { porDificuldade } from '../../lib/progresso';
import { NIVEIS_DIFICULDADE } from '../../lib/dificuldade';

export function ResultadoSerie({ tentativas, placar, onRefazer }) {
  const { acertos, total, pct } = placar;
  const niveis = porDificuldade(tentativas);

  return (
    <div className="flex animate-rise-in flex-col items-center gap-3 py-2">
      <Donut pct={pct} rotulo={`${pct}% de acerto em ${total} ${total === 1 ? 'questão' : 'questões'}`} />
      <p className="m-0 text-sm text-text-2">
        <strong className="font-mono text-lg text-text">{acertos}</strong> de {total}
      </p>

      <ul className="m-0 flex w-full list-none flex-col gap-2 p-0">
        {NIVEIS_DIFICULDADE.filter((n) => niveis[n].total > 0).map((n) => (
          <li key={n} className="flex items-center justify-between rounded-md border border-border bg-surface px-3.5 py-2.5">
            <PilulaDificuldade nivel={n} />
            <span className="font-mono text-xs text-text-muted tabular-nums">
              {niveis[n].acertos}/{niveis[n].total}
            </span>
          </li>
        ))}
      </ul>

      {onRefazer && (
        <button type="button" className={`${BTN_SECUNDARIO} w-full`} onClick={onRefazer}>
          <RotateCcw size={16} strokeWidth={2} />
          Gerar novas questões
        </button>
      )}
    </div>
  );
}
