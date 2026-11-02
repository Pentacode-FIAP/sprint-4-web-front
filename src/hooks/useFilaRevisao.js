import { useMemo } from 'react';
import { useColecao } from './useColecao';
import { montarFilaRevisao } from '../features/exercicios/filaRevisao';

/** Questões erradas agora, derivadas das coleções. Com `escopo`, só de um grupo. */
export function useFilaRevisao(escopo) {
  const { itens: tentativas } = useColecao('tentativas');
  const { itens: exercicios } = useColecao('exercicios');
  const { itens: simulados } = useColecao('simulados');
  const origem = escopo?.origem;
  const origemId = escopo?.origemId;

  return useMemo(
    () =>
      montarFilaRevisao(
        { tentativas, exercicios, simulados },
        origem === undefined ? undefined : { origem, origemId },
      ),
    [tentativas, exercicios, simulados, origem, origemId],
  );
}
