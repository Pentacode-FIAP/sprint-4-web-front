import { useCallback, useState } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog';

/**
 * Substitui o confirm nativo do navegador, que não é estilizável e bloqueia a thread.
 * Devolve o elemento a renderizar e uma função que resolve `true`/`false`.
 */
export function useConfirmacao() {
  const [pedido, setPedido] = useState(null);

  const confirmar = useCallback(
    ({ titulo, descricao, rotuloConfirmar = 'Confirmar', destrutivo = false }) =>
      new Promise((resolver) => {
        setPedido({ titulo, descricao, rotuloConfirmar, destrutivo, resolver });
      }),
    [],
  );

  const responder = useCallback(
    (ok) => {
      pedido?.resolver(ok);
      setPedido(null);
    },
    [pedido],
  );

  const dialogoConfirmacao = pedido ? <ConfirmDialog pedido={pedido} onResponder={responder} /> : null;

  return { confirmar, dialogoConfirmacao };
}
