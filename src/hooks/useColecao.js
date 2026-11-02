import { useCallback, useContext } from 'react';
import { ColecoesContext } from '../context/ColecoesContext';
import { adicionarItem, atualizarItem, removerItem } from '../lib/colecoes';

export function useColecao(nome) {
  const ctx = useContext(ColecoesContext);
  if (!ctx) throw new Error('useColecao precisa estar dentro de ColecoesProvider');
  const { colecoes, aplicar } = ctx;

  const adicionar = useCallback((dados) => {
    const r = aplicar(nome, (itens) => {
      const { itens: novos, item } = adicionarItem(itens, dados);
      return { itens: novos, resultado: item };
    });
    return r.ok ? r.resultado : null;
  }, [aplicar, nome]);

  const atualizar = useCallback(
    (id, mudancas) => aplicar(nome, (itens) => ({ itens: atualizarItem(itens, id, mudancas) })).ok,
    [aplicar, nome],
  );

  const remover = useCallback(
    (id) => aplicar(nome, (itens) => ({ itens: removerItem(itens, id) })).ok,
    [aplicar, nome],
  );

  const substituir = useCallback(
    (novosItens) => aplicar(nome, () => ({ itens: novosItens })).ok,
    [aplicar, nome],
  );

  return { itens: colecoes[nome] ?? [], adicionar, atualizar, remover, substituir };
}
