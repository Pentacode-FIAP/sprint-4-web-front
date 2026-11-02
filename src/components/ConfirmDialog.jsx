import { useEffect, useId, useRef } from 'react';

/**
 * Diálogo de confirmação sobre `<dialog>` nativo. Esc e clique no fundo cancelam.
 * O foco inicial vai para "Cancelar", a opção segura.
 */
export function ConfirmDialog({ pedido, onResponder }) {
  const ref = useRef(null);
  const cancelarRef = useRef(null);
  const tituloId = useId();
  const descricaoId = useId();

  useEffect(() => {
    const dialogo = ref.current;
    // O dialog já foi removido do DOM quando o cleanup roda, então close() não
    // devolveria o foco sozinho: guardamos a origem e restauramos à mão.
    const origem = document.activeElement;
    if (!dialogo.open) dialogo.showModal();
    cancelarRef.current?.focus();
    return () => {
      dialogo.close();
      if (origem instanceof HTMLElement && origem.isConnected) origem.focus();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      role="alertdialog"
      aria-labelledby={tituloId}
      aria-describedby={descricaoId}
      onCancel={(e) => {
        // `cancel` borbulha pela árvore do React: ignora o de um dialog aninhado.
        if (e.target !== e.currentTarget) return;
        e.preventDefault();
        onResponder(false);
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onResponder(false);
      }}
      className="m-auto w-[calc(100%-3rem)] max-w-xs rounded-lg bg-surface p-5 text-text shadow-4 backdrop:animate-fade-in backdrop:bg-fora/45 open:animate-pop-in"
    >
      <h2 id={tituloId} className="!mb-1.5 !text-base font-semibold">{pedido.titulo}</h2>
      <p id={descricaoId} className="mb-[18px] text-[13.5px] leading-[1.55] text-text-muted">{pedido.descricao}</p>
      <div className="flex gap-2">
        <button
          ref={cancelarRef}
          type="button"
          onClick={() => onResponder(false)}
          className="!min-h-11 flex-1 !rounded-md !border-border !bg-surface font-medium text-text hover:!bg-surface-2"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => onResponder(true)}
          className={`!min-h-11 flex-1 !rounded-md !border-transparent font-semibold !text-white ${
            pedido.destrutivo ? '!bg-danger hover:!bg-red-700' : '!bg-accent hover:!bg-accent-hover'
          }`}
        >
          {pedido.rotuloConfirmar}
        </button>
      </div>
    </dialog>
  );
}
