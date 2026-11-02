import { ArrowRight } from 'lucide-react';
import { QuestaoCard } from '../../components/QuestaoCard';
import { Sheet } from '../../components/Sheet';
import { BTN_PRIMARIO } from '../../components/estilosBotao';
import { useSerieExercicios } from '../../hooks/useSerieExercicios';
import { AjudaQuestao } from './AjudaQuestao';
import { ResultadoSerie } from './ResultadoSerie';

/** `questoes`: lista de `{ item, origem, origemId, itemIndex, materiaId }`, já não vazia. */
export function SerieExercicios({ titulo, questoes, onFechar, onRefazer, onConcluir }) {
  const serie = useSerieExercicios(questoes, 'exercicio', onConcluir);
  const { atual, indice, total, escolha, revelado, concluida } = serie;

  return (
    <Sheet
      titulo={titulo}
      onFechar={onFechar}
      footer={
        concluida ? (
          <button type="button" className={`${BTN_PRIMARIO} w-full`} onClick={onFechar}>
            Concluir
          </button>
        ) : (
          <button type="button" className={`${BTN_PRIMARIO} w-full`} onClick={serie.avancar} disabled={!revelado}>
            {indice + 1 >= total ? 'Ver resultado' : 'Próxima'}
            <ArrowRight size={17} strokeWidth={2} />
          </button>
        )
      }
    >
      {concluida ? (
        <ResultadoSerie tentativas={serie.respondidas} placar={serie.placar} onRefazer={onRefazer} />
      ) : (
        <>
          {/* A key remonta o card a cada questão, reiniciando a animação de entrada. */}
          <QuestaoCard
            key={indice}
            item={atual.item}
            numero={indice + 1}
            total={total}
            escolha={escolha}
            revelado={revelado}
            onEscolher={serie.responder}
          />
          <AjudaQuestao
            key={`ajuda-${indice}`}
            item={atual.item}
            escolha={escolha}
            revelado={revelado}
            origem={atual.origem}
            origemId={atual.origemId}
          />
        </>
      )}
    </Sheet>
  );
}
