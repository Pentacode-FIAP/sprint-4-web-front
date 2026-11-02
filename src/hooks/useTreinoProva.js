import { useCallback, useRef, useState } from 'react';
import { useResumos } from './useResumos';
import { questoesDoExercicio } from '../features/exercicios/questoes';

const QUESTOES_POR_RESUMO = 5;

/**
 * Monta o treino de uma prova: até cinco questões de cada resumo, na ordem dada.
 * Resumo sem questões respondíveis gera uma rodada nova com a IA. Devolve a
 * lista pronta para a `SerieExercicios`, ou null (com `erro`) se não deu.
 */
export function useTreinoProva() {
  const { exercicioDe, gerarQuestoes, erro: erroGeracao, limparErro } = useResumos();
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState(null);
  const ocupadoRef = useRef(false);

  const montarTreino = useCallback(
    async (resumos) => {
      if (ocupadoRef.current || resumos.length === 0) return null;
      ocupadoRef.current = true;
      setOcupado(true);
      setAviso(null);
      limparErro();
      try {
        const questoes = [];
        for (const resumo of resumos) {
          let exercicio = exercicioDe(resumo.id);
          if (questoesDoExercicio(exercicio, resumo.materiaId).length === 0) {
            exercicio = await gerarQuestoes(resumo, { qtd: QUESTOES_POR_RESUMO, nivel: 'misto' });
            if (!exercicio) return null;
          }
          questoes.push(...questoesDoExercicio(exercicio, resumo.materiaId).slice(0, QUESTOES_POR_RESUMO));
        }
        if (questoes.length === 0) {
          setAviso('Não há questões disponíveis. Gere questões em um resumo.');
          return null;
        }
        return questoes;
      } finally {
        ocupadoRef.current = false;
        setOcupado(false);
      }
    },
    [exercicioDe, gerarQuestoes, limparErro],
  );

  return { montarTreino, ocupado, erro: aviso ?? erroGeracao };
}
