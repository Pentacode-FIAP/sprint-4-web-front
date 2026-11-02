import { useEffect } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export function Toast({ message, tipo = 'erro', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const sucesso = tipo === 'sucesso';
  return (
    // `status` + aria-live anunciam sem roubar o foco de onde o usuário está.
    <div
      role="status"
      aria-live="polite"
      className="fixed right-4 bottom-20 left-4 z-50 mx-auto flex max-w-md animate-toast-in items-center gap-[9px] rounded-md bg-text px-3.5 py-3 text-[13px] leading-[1.45] text-white shadow-3 md:bottom-6"
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
