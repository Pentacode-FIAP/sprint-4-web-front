import { useCallback, useEffect, useState } from 'react';
import { useColecao } from './useColecao';
import { gerarExercicios } from '../lib/gemini';
import { embaralhar } from '../lib/math';

/** Exercícios (formato da Sprint 3) de um resumo. A ordem é sorteada a cada geração. */
export function useExerciciosDoResumo(resumo) {
  const { itens, adicionar } = useColecao('exercicios');
  const exercicio = itens.find((e) => e.resumoId === resumo.id);
  const [embaralhados, setEmbaralhados] = useState([]);
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    setEmbaralhados(exercicio ? embaralhar(exercicio.itens) : []);
  }, [exercicio]);

  const gerar = useCallback(async () => {
    setGerando(true);
    setErro(null);
    try {
      const novos = await gerarExercicios(resumo.conteudo);
      adicionar({ resumoId: resumo.id, itens: novos, criadoEm: new Date().toISOString() });
    } catch {
      setErro('Erro ao gerar, tente novamente.');
    } finally {
      setGerando(false);
    }
  }, [resumo.id, resumo.conteudo, adicionar]);

  return {
    temExercicios: Boolean(exercicio),
    itens: embaralhados,
    gerando,
    erro,
    limparErro: () => setErro(null),
    gerar,
  };
}
