import { useEffect, useId, useRef } from 'react';
import { BTN_DESTRUTIVO, BTN_PRIMARIO, BTN_SECUNDARIO } from './estilosBotao';

/**
 * Diálogo de confirmação sobre `<dialog>` nativo. Esc e clique no fundo cancelam.
 * O foco inicial vai para "Cancelar", a opção segura.
 */
export function ConfirmDialog({ pedido, onResponder }) {
  const ref = useRef(null);
  const cancelarRef = useRef(null);
  const tituloId = useId();
  const descricaoId = useId();
  // Só cancela pelo fundo se o gesto também começou nele (arrastar uma seleção para fora não conta).
  const comecouNoFundo = useRef(false);

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
      onPointerDown={(e) => {
        comecouNoFundo.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        const doFundo = comecouNoFundo.current;
        comecouNoFundo.current = false;
        if (doFundo && e.target === e.currentTarget) onResponder(false);
      }}
      className="m-auto w-[calc(100%-3rem)] max-w-xs rounded-lg bg-surface p-5 text-text shadow-4 backdrop:animate-fade-in backdrop:bg-fora/45 open:animate-pop-in"
    >
      <h2 id={tituloId} className="mb-1.5 text-base font-semibold">{pedido.titulo}</h2>
      <p id={descricaoId} className="mb-[18px] text-[13.5px] leading-[1.55] text-text-muted">{pedido.descricao}</p>
      <div className="flex gap-2">
        <button
          ref={cancelarRef}
          type="button"
          onClick={() => onResponder(false)}
          className={`${BTN_SECUNDARIO} flex-1`}
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => onResponder(true)}
          className={`${pedido.destrutivo ? BTN_DESTRUTIVO : BTN_PRIMARIO} flex-1`}
        >
          {pedido.rotuloConfirmar}
        </button>
      </div>
    </dialog>
  );
}
