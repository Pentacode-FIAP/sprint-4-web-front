import { useCallback, useMemo, useState } from 'react';
import { useColecao } from './useColecao';
import { gerarResumo } from '../lib/gemini';

/**
 * Resumos do aluno: lista (mais recentes primeiro), geração por IA a partir de
 * fotos e persistência. `gerando` e `erro` descrevem só a última geração.
 */
export function useResumos() {
  const { itens, adicionar, atualizar, remover } = useColecao('resumos');
  const { itens: fotos } = useColecao('fotos');
  const { itens: materias } = useColecao('materias');
  const { itens: exercicios, remover: removerExercicio } = useColecao('exercicios');
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState(null);

  const resumos = useMemo(
    () => [...itens].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)),
    [itens],
  );

  /** Devolve o texto gerado, ou null (com `erro` preenchido) se a IA falhar. */
  const gerarDeFotos = useCallback(
    async (fotoIds, materiaId) => {
      setGerando(true);
      setErro(null);
      try {
        const dataUrls = fotos.filter((f) => fotoIds.includes(f.id)).map((f) => f.dataUrl);
        const materiaNome = materias.find((m) => m.id === materiaId)?.nome ?? 'Estudos';
        return await gerarResumo(dataUrls, materiaNome);
      } catch {
        setErro('Não foi possível gerar. Tente novamente.');
        return null;
      } finally {
        setGerando(false);
      }
    },
    [fotos, materias],
  );

  /** Cria (sem `id`) ou atualiza (com `id`). Devolve true se salvou. */
  const salvarResumo = useCallback(
    ({ id, titulo, materiaId, conteudo, fotoIds = [] }) => {
      setErro(null);
      const dados = { titulo: titulo.trim(), materiaId, conteudo: conteudo.trim() };
      const ok =
        id !== undefined
          ? atualizar(id, dados)
          : adicionar({ ...dados, fotoIds, criadoEm: new Date().toISOString() }) !== null;
      if (!ok) setErro('Não foi possível salvar o resumo. Tente novamente.');
      return ok;
    },
    [adicionar, atualizar],
  );

  /** Remove o resumo e os exercícios gerados a partir dele. */
  const removerResumo = useCallback(
    (id) => {
      exercicios.filter((e) => e.resumoId === id).forEach((e) => removerExercicio(e.id));
      return remover(id);
    },
    [exercicios, removerExercicio, remover],
  );

  return { resumos, gerando, erro, limparErro: () => setErro(null), gerarDeFotos, salvarResumo, removerResumo };
}
