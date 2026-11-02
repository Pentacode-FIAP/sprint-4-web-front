import { useCallback, useMemo } from 'react';
import { useColecao } from './useColecao';
import { useConfig } from './useConfig';
import { META_PADRAO } from '../lib/colecoes';
import {
  diaLocal,
  errosParaRevisar,
  insights as calcularInsights,
  porDificuldade,
  porMateria,
  serieSemanal,
  streak,
  taxaAcerto,
} from '../lib/progresso';

/** Tudo que a tela de Progresso exibe, derivado de `tentativas` e da meta. */
export function useProgresso() {
  const { itens: tentativas } = useColecao('tentativas');
  const { itens: listaMaterias } = useColecao('materias');
  const { itens: todosSimulados } = useColecao('simulados');
  const { config, atualizarConfig } = useConfig();

  const meta = config.metaDiaria > 0 ? config.metaDiaria : META_PADRAO;

  const derivados = useMemo(() => {
    const hoje = diaLocal(new Date());
    return {
      feitasHoje: tentativas.filter((t) => t.dia === hoje).length,
      ofensiva: streak(tentativas, meta, hoje),
      serie: serieSemanal(tentativas, 7, hoje),
      acerto: taxaAcerto(tentativas),
      materias: porMateria(tentativas),
      dificuldades: porDificuldade(tentativas),
      insights: calcularInsights(tentativas, listaMaterias, hoje),
      errosRecentes: errosParaRevisar(tentativas, 30, hoje),
    };
  }, [tentativas, listaMaterias, meta]);

  // Só simulados finalizados, do mais recente para o mais antigo.
  const simulados = useMemo(
    () =>
      todosSimulados
        .filter((s) => s.finalizadoEm !== undefined)
        .sort((a, b) => b.iniciadoEm.localeCompare(a.iniciadoEm))
        .slice(0, 5),
    [todosSimulados],
  );

  const definirMeta = useCallback((valor) => atualizarConfig({ metaDiaria: valor }), [atualizarConfig]);

  return { ...derivados, meta, simulados, definirMeta };
}
