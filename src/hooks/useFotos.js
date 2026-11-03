import { useCallback } from 'react';
import { useColecao } from './useColecao';

/**
 * Fotos da galeria. Excluir uma foto também tira o id dela da lista de fotos dos
 * resumos que a usaram; o texto do resumo continua como está.
 */
export function useFotos() {
  const { itens: fotos, adicionar, atualizar, remover } = useColecao('fotos');
  const { itens: resumos, substituir: substituirResumos } = useColecao('resumos');

  const excluirFoto = useCallback(
    (id) => {
      if (!remover(id)) return false;
      if (resumos.some((r) => r.fotoIds?.includes(id))) {
        substituirResumos(
          resumos.map((r) => (r.fotoIds?.includes(id) ? { ...r, fotoIds: r.fotoIds.filter((f) => f !== id) } : r)),
        );
      }
      return true;
    },
    [remover, resumos, substituirResumos],
  );

  return { fotos, adicionar, atualizar, excluirFoto };
}
