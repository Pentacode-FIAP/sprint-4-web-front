import { useCallback, useMemo, useState } from 'react';
import { useColecao } from './useColecao';
import { ErroSemChave, MENSAGEM_SEM_CHAVE, gerarExercicios, gerarResumo, gerarResumoTexto } from '../lib/gemini';

function mensagemDeErro(err) {
  return err instanceof ErroSemChave ? MENSAGEM_SEM_CHAVE : 'Não foi possível gerar. Tente novamente.';
}

/**
 * Resumos do aluno: lista (mais recentes primeiro), geração por IA a partir de
 * fotos e persistência. `gerando` e `erro` descrevem só a última geração.
 */
export function useResumos() {
  const { itens, adicionar, atualizar, remover } = useColecao('resumos');
  const { itens: fotos } = useColecao('fotos');
  const { itens: materias } = useColecao('materias');
  const { itens: exercicios, adicionar: adicionarExercicio, remover: removerExercicio } = useColecao('exercicios');
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
      } catch (err) {
        setErro(mensagemDeErro(err));
        return null;
      } finally {
        setGerando(false);
      }
    },
    [fotos, materias],
  );

  /** Resumo a partir de texto colado. Devolve o texto gerado, ou null (com `erro`) se falhar. */
  const gerarDeTexto = useCallback(
    async (texto, materiaNome) => {
      setGerando(true);
      setErro(null);
      try {
        return await gerarResumoTexto(texto, materiaNome?.trim() || 'Estudos');
      } catch (err) {
        setErro(mensagemDeErro(err));
        return null;
      } finally {
        setGerando(false);
      }
    },
    [],
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

  /** A geração mais recente de questões de um resumo (maior id), ou undefined. */
  const exercicioDe = useCallback(
    (resumoId) => exercicios.filter((e) => e.resumoId === resumoId).at(-1),
    [exercicios],
  );

  /**
   * Gera uma nova rodada de questões e a guarda. As anteriores continuam no
   * histórico. Devolve o exercício salvo, ou null (com `erro`) se falhar.
   */
  const gerarQuestoes = useCallback(
    async (resumo, opcoes) => {
      setGerando(true);
      setErro(null);
      try {
        const itens = await gerarExercicios(resumo.conteudo, opcoes);
        // Se a gravação falhar, o Provider já mostrou o aviso de armazenamento.
        return adicionarExercicio({ resumoId: resumo.id, itens, criadoEm: new Date().toISOString() });
      } catch (err) {
        setErro(mensagemDeErro(err));
        return null;
      } finally {
        setGerando(false);
      }
    },
    [adicionarExercicio],
  );

  /** Remove o resumo e os exercícios gerados a partir dele. */
  const removerResumo = useCallback(
    (id) => {
      exercicios.filter((e) => e.resumoId === id).forEach((e) => removerExercicio(e.id));
      return remover(id);
    },
    [exercicios, removerExercicio, remover],
  );

  return { resumos, gerando, erro, limparErro: () => setErro(null), gerarDeFotos, gerarDeTexto, salvarResumo, removerResumo, exercicioDe, gerarQuestoes };
}
