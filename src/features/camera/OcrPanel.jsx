import { useRef, useState } from 'react';
import { Copy } from 'lucide-react';

export function OcrPanel({ estado, onFechar }) {
  const [rotuloCopiar, setRotuloCopiar] = useState('Copiar');
  const textoRef = useRef(null);

  function selecionarTexto() {
    const no = textoRef.current;
    if (!no) return;
    const range = document.createRange();
    range.selectNodeContents(no);
    const selecao = window.getSelection();
    selecao?.removeAllRanges();
    selecao?.addRange(range);
  }

  async function copiar() {
    if (estado.estado !== 'pronto') return;
    try {
      await navigator.clipboard.writeText(estado.texto);
      setRotuloCopiar('Copiado');
      setTimeout(() => setRotuloCopiar('Copiar'), 2000);
    } catch {
      selecionarTexto();
      setRotuloCopiar('Selecione e copie');
    }
  }

  return (
    <div className="absolute top-1/2 right-4 left-4 z-[5] flex max-h-[70%] -translate-y-1/2 flex-col gap-2.5 rounded-[12px] border border-cam-verde/35 bg-[rgba(7,11,8,0.94)] p-3.5 backdrop-blur-[6px]">
      <span className="flex-none text-[11px] font-semibold tracking-[0.08em] text-cam-verde uppercase">Texto detectado</span>

      {estado.estado === 'lendo' && (
        <div className="flex flex-col items-center gap-2.5 py-[18px]">
          <span className="size-5 animate-cam-girar rounded-full border-2 border-cam-verde/25 border-t-cam-verde" />
          <span className="text-center text-[13px] text-white/70">Lendo texto...</span>
        </div>
      )}

      {estado.estado === 'erro' && (
        <div className="flex flex-col items-center gap-2.5 py-[18px]">
          <span className="text-center text-[13px] text-white/70">{estado.mensagem}</span>
        </div>
      )}

      {estado.estado === 'pronto' && (
        <p ref={textoRef} className="overflow-y-auto text-[13px] leading-[1.5] whitespace-pre-wrap text-white/90">
          {estado.texto}
        </p>
      )}

      <div className="flex flex-none gap-2.5">
        {estado.estado === 'pronto' && (
          <button className="flex h-8 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[8px] border border-white/12 bg-white/6 text-[12px] font-medium text-white/85 transition-[background,border-color,color] duration-[180ms] hover:border-cam-verde hover:bg-cam-verde/15 hover:text-cam-verde" onClick={copiar}>
            <Copy size={14} strokeWidth={2} /> {rotuloCopiar}
          </button>
        )}
        <button className="flex h-8 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[8px] border border-white/12 bg-white/6 text-[12px] font-medium text-white/85 transition-[background,border-color,color] duration-[180ms] hover:border-cam-verde hover:bg-cam-verde/15 hover:text-cam-verde" onClick={onFechar}>
          Fechar
        </button>
      </div>
    </div>
  );
}
