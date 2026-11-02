import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Donut } from '../../components/charts/Donut';
import { PilulaDificuldade } from '../../components/PilulaDificuldade';
import { QuestaoCard } from '../../components/QuestaoCard';
import { Sheet } from '../../components/Sheet';
import { BTN_PRIMARIO, BTN_SECUNDARIO } from '../../components/estilosBotao';
import { useColecao } from '../../hooks/useColecao';
import { useFilaRevisao } from '../../hooks/useFilaRevisao';
import { notaDoSimulado, porDificuldade } from '../../lib/progresso';
import { NIVEIS_DIFICULDADE } from '../../lib/dificuldade';
import { AjudaQuestao } from '../exercicios/AjudaQuestao';
import { SerieExercicios } from '../exercicios/SerieExercicios';

export function SimuladoResultado({ simuladoId, onFechar }) {
  const { itens: simulados } = useColecao('simulados');
  const { itens: tentativas } = useColecao('tentativas');
  const fila = useFilaRevisao({ origem: 'simulado', origemId: simuladoId });
  const [revisando, setRevisando] = useState(false);

  const simulado = simulados.find((s) => s.id === simuladoId);
  if (!simulado) return null;

  // Só o lote da prova: responder erros depois grava tentativas novas sob o
  // mesmo simulado e elas não podem mexer na nota.
  const { nota, acertos, total, daProva } = notaDoSimulado(simulado, tentativas);
  const niveis = porDificuldade(daProva);
  const escolhaDe = (i) => daProva.find((t) => t.itemIndex === i)?.escolha;

  return (
    <>
      <Sheet
        titulo="Resultado"
        onFechar={onFechar}
        footer={
          <button type="button" className={`${BTN_PRIMARIO} w-full`} onClick={onFechar}>
            Fechar
          </button>
        }
      >
        <div className="flex animate-rise-in flex-col items-center gap-1 pt-2 pb-1">
          {/* O anel usa a MESMA nota do número ao lado: em branco conta como erro. */}
          <Donut pct={nota * 10} rotulo={`Nota ${nota.toFixed(1)}, ${acertos} de ${total} questões`} />
          <p className="mt-1 mb-0 flex flex-col items-center gap-0.5">
            <strong className="font-mono text-4xl leading-none">{nota.toFixed(1)}</strong>
            <span className="text-[13px] text-text-muted">{acertos} de {total}</span>
          </p>

          <ul className="m-0 mt-3.5 flex w-full list-none flex-col gap-2 p-0">
            {NIVEIS_DIFICULDADE.filter((n) => niveis[n].total > 0).map((n) => (
              <li key={n} className="flex items-center justify-between rounded-md border border-border bg-surface px-3.5 py-2.5">
                <PilulaDificuldade nivel={n} />
                <span className="font-mono text-xs text-text-muted tabular-nums">
                  {niveis[n].acertos}/{niveis[n].total}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Revisar exige a prova fechada: sem `finalizadoEm` não há corte que separe a prova das respostas de revisão. */}
        {simulado.finalizadoEm !== undefined && fila.length > 0 && (
          <button type="button" className={`${BTN_SECUNDARIO} mt-4 w-full`} onClick={() => setRevisando(true)}>
            <RotateCcw size={16} strokeWidth={2} />
            Revisar {fila.length} {fila.length === 1 ? 'erro' : 'erros'} deste simulado
          </button>
        )}

        <h3 className="mt-6 mb-2.5 text-[11px] font-semibold tracking-[0.09em] text-text-muted uppercase">Revisão</h3>
        {simulado.itens.map((item, i) => (
          <div key={i} className="mb-6">
            <QuestaoCard
              item={item}
              numero={i + 1}
              total={total}
              escolha={escolhaDe(i)}
              revelado
              onEscolher={() => {}}
            />
            <AjudaQuestao item={item} escolha={escolhaDe(i)} revelado origem="simulado" origemId={simuladoId} />
          </div>
        ))}
      </Sheet>

      {/* Sem checar `fila.length` aqui: acertar tira a questão da fila e a série não pode se desmontar no meio. */}
      {revisando && (
        <SerieExercicios titulo="Revisar erros" questoes={fila} onFechar={() => setRevisando(false)} />
      )}
    </>
  );
}
