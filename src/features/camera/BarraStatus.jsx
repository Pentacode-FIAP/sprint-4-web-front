// Barra de status decorativa do "celular" das telas da câmera.
export function BarraStatus({ className = '' }) {
  return (
    <header
      aria-hidden="true"
      className={`relative flex h-[50px] items-start justify-between px-6 pt-3.5 ${className}`}
    >
      <span className="text-[15px] font-medium text-white">9:41</span>
      <div className="flex items-center gap-[5px] text-[11px] text-white/85">
        <span>▲▲▲</span>
        <span>WiFi</span>
        <span>🔋</span>
      </div>
    </header>
  );
}
