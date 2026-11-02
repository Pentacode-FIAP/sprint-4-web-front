import { useCallback, useMemo, useState } from 'react';
import { useColecao } from './useColecao';
import { diaLocal, taxaAcerto } from '../lib/progresso';

/**
 * Uma série em andamento: um conjunto FIXO de questões, respondidas uma a uma.
 * `questoes` pode mudar no meio da sessão (responder certo tira a questão da
 * fila de revisão, e a fila é derivada das tentativas), então a lista é
 * fotografada na montagem. Não "simplifique" isso lendo `questoes` direto:
 * `indice` passaria a apontar para a questão errada.
 *
 * `origem` é a origem padrão das questões que não trazem a sua. `aoConcluir`
 * roda uma vez, ao passar da última questão.
 *
 * Se a tentativa não puder ser gravada, o Provider mostra o aviso e a série
 * segue: a correção é offline e não depende da gravação.
 */
export function useSerieExercicios(questoes, origem = 'exercicio', aoConcluir) {
  const { adicionar } = useColecao('tentativas');
  const [snapshot] = useState(() => questoes);
  const [indice, setIndice] = useState(0);
  const [escolha, setEscolha] = useState(undefined);
  const [respondidas, setRespondidas] = useState([]);
  const [terminou, setTerminou] = useState(false);

  const atual = snapshot[indice];
  const revelado = escolha !== undefined;

  const responder = useCallback(
    (alternativa) => {
      if (revelado || !atual) return;
      const agora = new Date();
      const tentativa = {
        origem: atual.origem ?? origem,
        origemId: atual.origemId,
        itemIndex: atual.itemIndex,
        // Snapshot histórico: se o resumo mudar de matéria, o passado não muda.
        materiaId: atual.materiaId,
        dificuldade: atual.item.dificuldade,
        escolha: alternativa,
        acertou: alternativa === atual.item.correta,
        // Calculado na hora da resposta: uma série longa pode atravessar a meia-noite.
        dia: diaLocal(agora),
        respondidoEm: agora.toISOString(),
      };
      setEscolha(alternativa);
      setRespondidas((lista) => [...lista, tentativa]);
      adicionar(tentativa);
    },
    [atual, revelado, adicionar, origem],
  );

  const avancar = useCallback(() => {
    if (!revelado) return;
    if (indice + 1 >= snapshot.length) {
      setTerminou(true);
      aoConcluir?.();
      return;
    }
    setIndice((n) => n + 1);
    setEscolha(undefined);
  }, [revelado, indice, snapshot.length, aoConcluir]);

  const placar = useMemo(() => taxaAcerto(respondidas), [respondidas]);

  return {
    atual,
    indice,
    total: snapshot.length,
    escolha,
    revelado,
    responder,
    avancar,
    placar,
    respondidas,
    concluida: terminou,
  };
}
