import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { BTN_ICONE_SUTIL } from './estilosBotao';

/**
 * Painel modal sobre `<dialog>` nativo: aberto enquanto estiver montado.
 * `showModal()` cuida de foco, Esc, inércia do fundo e devolução do foco ao
 * elemento de origem. Abaixo de `md` fica preso à base; a partir de `md`, centralizado.
 * Pode ser aninhado: cada `<dialog>` modal entra por cima na camada superior.
 */
export function Sheet({ titulo, onFechar, children, footer }) {
  const ref = useRef(null);
  const tituloId = useId();
  // Só fecha pelo fundo se o gesto também começou nele: arrastar uma seleção de
  // texto para fora do painel termina com um clique no <dialog>, sem ser um toque no fundo.
  const comecouNoFundo = useRef(false);

  useEffect(() => {
    const dialogo = ref.current;
    // O dialog já foi removido do DOM quando o cleanup roda, então close() não
    // devolveria o foco sozinho: guardamos a origem e restauramos à mão.
    const origem = document.activeElement;
    if (!dialogo.open) dialogo.showModal();
    return () => {
      dialogo.close();
      if (origem instanceof HTMLElement && origem.isConnected) origem.focus();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={tituloId}
      onCancel={(e) => {
        // Esc: quem decide fechar é o dono do estado (desmontar fecha o dialog).
        // `cancel` borbulha pela árvore do React: ignora o de um dialog aninhado.
        if (e.target !== e.currentTarget) return;
        e.preventDefault();
        onFechar();
      }}
      onPointerDown={(e) => {
        comecouNoFundo.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        const doFundo = comecouNoFundo.current;
        comecouNoFundo.current = false;
        if (doFundo && e.target === e.currentTarget) onFechar();
      }}
      className="m-0 mt-auto w-full max-w-none flex-col overflow-hidden rounded-t-xl bg-bg p-0 text-text shadow-4 backdrop:animate-fade-in backdrop:bg-fora/45 open:flex open:max-h-[94dvh] open:animate-sheet-in md:m-auto md:max-h-[85dvh] md:max-w-lg md:rounded-xl"
    >
      <span className="mx-auto mt-2.5 h-1 w-9.5 flex-none rounded-full bg-border-strong md:hidden" aria-hidden="true" />
      <div className="flex flex-none items-center justify-between gap-3 px-4 pt-3 pb-3.5">
        <h2 id={tituloId} className="text-lg font-semibold">{titulo}</h2>
        <button
          type="button"
          onClick={onFechar}
          aria-label="Fechar"
          className={BTN_ICONE_SUTIL}
        >
          <X size={18} strokeWidth={2} />
        </button>
      </div>
      <div className="overflow-y-auto overscroll-contain px-4 pb-5">{children}</div>
      {footer && (
        <div className="flex-none rounded-b-xl border-t border-border bg-surface px-4 pt-3 pb-[calc(0.875rem+env(safe-area-inset-bottom))]">
          {footer}
        </div>
      )}
    </dialog>
  );
}
