import { useCallback, useMemo, useState } from 'react';
import { useColecao } from './useColecao';
import { dataLocal } from '../lib/date';

const pad = (n) => String(n).padStart(2, '0');

/**
 * Estado e dados do calendário. `mes` é `{ ano, mes }` com `mes` de 0 a 11;
 * `dias` traz as células da grade (null = espaço antes do dia 1) e
 * `eventosDoDia(iso)` lê os eventos de um dia `AAAA-MM-DD` do mês exibido.
 */
export function useCalendario() {
  const { itens: eventos, adicionar, atualizar, remover } = useColecao('eventos');
  const { itens: materias } = useColecao('materias');
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
  const salvarEvento = useCallback(
    (dados, id) => (id !== undefined ? atualizar(id, dados) : adicionar(dados) !== null),
    [adicionar, atualizar],
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
    eventosDoMes,
    eventosDoDia,
    salvarEvento,
    removerEvento,
  };
}
