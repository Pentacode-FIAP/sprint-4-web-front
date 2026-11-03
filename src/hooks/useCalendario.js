import { useCallback, useMemo, useRef, useState } from 'react';
import { useColecao } from './useColecao';
import { dataLocal } from '../lib/date';
import { datasPreparacao, priorizarResumos } from '../lib/preparacao';
import { diaLocal, diffDias } from '../lib/progresso';

const pad = (n) => String(n).padStart(2, '0');

/**
 * Estado e dados do calendário. `mes` é `{ ano, mes }` com `mes` de 0 a 11;
 * `dias` traz as células da grade (null = espaço antes do dia 1) e
 * `eventosDoDia(iso)` lê os eventos de um dia `AAAA-MM-DD` do mês exibido.
 */
export function useCalendario() {
  const { itens: eventos, adicionar, atualizar, remover } = useColecao('eventos');
  const { itens: materias } = useColecao('materias');
  const { itens: resumos } = useColecao('resumos');
  const { itens: exercicios } = useColecao('exercicios');
  const { itens: tentativas } = useColecao('tentativas');
  const eventosRef = useRef(eventos);
  eventosRef.current = eventos;
  const [referencia, setReferencia] = useState(() => {
    const agora = new Date();
    return { ano: agora.getFullYear(), mes: agora.getMonth() };
  });

  const { ano, mes } = referencia;

  const irParaMesAnterior = useCallback(
    () => setReferencia(({ ano: a, mes: m }) => (m === 0 ? { ano: a - 1, mes: 11 } : { ano: a, mes: m - 1 })),
    [],
  );
  const irParaProximoMes = useCallback(
    () => setReferencia(({ ano: a, mes: m }) => (m === 11 ? { ano: a + 1, mes: 0 } : { ano: a, mes: m + 1 })),
    [],
  );

  const dias = useMemo(() => {
    const deslocamento = new Date(ano, mes, 1).getDay();
    const total = new Date(ano, mes + 1, 0).getDate();
    const celulas = Array.from({ length: deslocamento }, () => null);
    for (let d = 1; d <= total; d++) celulas.push(new Date(ano, mes, d));
    return celulas;
  }, [ano, mes]);

  const eventosDoMes = useMemo(() => {
    const prefixo = `${ano}-${pad(mes + 1)}-`;
    return eventos.filter((e) => typeof e.data === 'string' && e.data.startsWith(prefixo));
  }, [eventos, ano, mes]);

  const porDia = useMemo(() => {
    const mapa = new Map();
    for (const e of eventosDoMes) mapa.set(e.data, [...(mapa.get(e.data) ?? []), e]);
    return mapa;
  }, [eventosDoMes]);

  const eventosDoDia = useCallback((iso) => porDia.get(iso) ?? [], [porDia]);

  const hoje = dataLocal(new Date());
  const proximos = useMemo(
    () => eventos.filter((e) => e.data >= hoje).sort((a, b) => a.data.localeCompare(b.data)),
    [eventos, hoje],
  );

  const materiaNome = useCallback((id) => materias.find((m) => m.id === id)?.nome, [materias]);

  // Devolve true se gravou; false deixa o formulário aberto com o erro.
  // Mudar matéria, tipo ou conteúdo da prova invalida o progresso do plano.
  const salvarEvento = useCallback(
    (dados, id) => {
      if (id === undefined) return adicionar(dados) !== null;
      const anterior = eventosRef.current.find((e) => e.id === id);
      const chave = (e) => [...(e?.resumoIds ?? [])].sort().join(',');
      const mudou =
        anterior?.materiaId !== dados.materiaId || anterior?.tipo !== dados.tipo || chave(anterior) !== chave(dados);
      return atualizar(id, mudou ? { ...dados, revisadosIds: [], treinoConcluido: false, simuladoId: undefined } : dados);
    },
    [adicionar, atualizar],
  );

  /**
   * Plano de preparação de uma prova. `selecionados` (ids de resumo) é a
   * escolha ainda não salva, enquanto o aluno edita o conteúdo da prova.
   */
  const planoDaProva = useCallback(
    (evento, selecionados = null) => {
      const hojeIso = diaLocal(new Date());
      const disponiveis = resumos.filter((r) => evento.materiaId === undefined || r.materiaId === evento.materiaId);
      const ids = selecionados ?? evento.resumoIds ?? disponiveis.map((r) => r.id);
      const escolhidos = disponiveis.filter((r) => ids.includes(r.id));
      const revisados = evento.revisadosIds ?? [];
      const revisaoFeita = escolhidos.length > 0 && escolhidos.every((r) => revisados.includes(r.id));
      return {
        hoje: hojeIso,
        disponiveis,
        ids,
        escolhidos,
        ordenados: priorizarResumos(escolhidos, exercicios, tentativas),
        configurado: Boolean(evento.resumoIds?.length),
        revisados,
        revisaoFeita,
        treinoConcluido: Boolean(evento.treinoConcluido),
        simuladoFeito: evento.simuladoId !== undefined,
        concluidas: Number(revisaoFeita) + Number(Boolean(evento.treinoConcluido)) + Number(evento.simuladoId !== undefined),
        faltam: diffDias(hojeIso, evento.data),
        datas: datasPreparacao(evento.data, hojeIso),
      };
    },
    [resumos, exercicios, tentativas],
  );

  /** `mudancas` é um objeto, ou uma função do evento atual (para alternar listas sem ler dado velho). */
  const atualizarProgressoPlano = useCallback(
    (eventoId, mudancas) => {
      const atual = eventosRef.current.find((e) => e.id === eventoId);
      if (!atual) return false;
      return atualizar(eventoId, typeof mudancas === 'function' ? mudancas(atual) : mudancas);
    },
    [atualizar],
  );

  const removerEvento = useCallback((id) => remover(id), [remover]);

  return {
    mes: { ano, mes },
    dias,
    hoje,
    proximos,
    materiaNome,
    irParaMesAnterior,
    irParaProximoMes,
    eventosDoDia,
    eventos,
    salvarEvento,
    removerEvento,
    planoDaProva,
    atualizarProgressoPlano,
  };
}
