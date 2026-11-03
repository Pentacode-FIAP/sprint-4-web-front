import { useEffect, useRef } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export function Toast({ message, tipo = 'erro', onClose }) {
  const ref = useRef(null);

  // `popover="manual"` + showPopover() leva o aviso à camada superior do
  // navegador, acima de qualquer <dialog> modal aberto (Sheet, confirmação).
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof el.showPopover !== 'function') return;
    // Navegador sem suporte (ou já aberto): o aviso aparece como um bloco fixo comum.
    try {
      if (!el.matches(':popover-open')) el.showPopover();
    } catch {
      /* sem a camada superior, z-50 e position: fixed bastam */
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const sucesso = tipo === 'sucesso';
  return (
    // `status` + aria-live anunciam sem roubar o foco de onde o usuário está.
    // Os utilitários `top-auto`, `m-0`, `border-0` e `overflow-visible` desfazem
    // o estilo padrão de [popover] (inset: 0, margin: auto, borda, overflow: auto).
    <div
      ref={ref}
      popover="manual"
      role="status"
      aria-live="polite"
      className="fixed top-auto right-4 bottom-20 left-4 z-50 m-0 mx-auto flex w-[calc(100%-2rem)] max-w-md animate-toast-in items-center gap-[9px] overflow-visible rounded-md border-0 bg-text px-3.5 py-3 text-[13px] leading-[1.45] text-white shadow-3 md:bottom-6"
    >
      {sucesso ? (
        <CheckCircle2 size={17} strokeWidth={2} className="flex-none text-emerald-300" />
      ) : (
        <AlertCircle size={17} strokeWidth={2} className="flex-none text-red-300" />
      )}
      <span>{message}</span>
    </div>
  );
}
