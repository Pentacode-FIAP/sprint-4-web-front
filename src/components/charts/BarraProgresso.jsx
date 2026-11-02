/** `detalhe`: linha secundária, ex.: "42 questões". */
export function BarraProgresso({ rotulo, pct, detalhe, cor = 'var(--color-accent)' }) {
  const seguro = Math.max(0, Math.min(100, pct));

  return (
    <div role="img" aria-label={`${rotulo}: ${Math.round(seguro)}% de acerto em ${detalhe}`}>
      <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[13px]">
        <span className="min-w-0 truncate font-semibold">{rotulo}</span>
        <span className="flex-none font-mono text-xs text-text-muted">
          {Math.round(seguro)}% · {detalhe}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-3">
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${seguro}%`, background: cor }}
        />
      </div>
    </div>
  );
}
