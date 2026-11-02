export function Skeleton({ largura = '100%', altura = 12, raio }) {
  return (
    <span
      aria-hidden="true"
      className="block animate-shimmer rounded-sm bg-[linear-gradient(90deg,var(--color-surface-2)_25%,var(--color-surface-3)_37%,var(--color-surface-2)_63%)] bg-[length:400%_100%]"
      style={{ width: largura, height: altura, borderRadius: raio }}
    />
  );
}

/**
 * Placeholder de um card durante geração por IA. `aria-busy` + texto oculto
 * fazem o leitor de tela anunciar o carregamento; as barras são decorativas.
 */
export function SkeletonCard({ linhas = 3, rotulo }) {
  return (
    <div
      className="flex flex-col gap-[9px] rounded-md border border-border bg-surface p-3.5"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">{rotulo}</span>
      <Skeleton largura="45%" altura={14} />
      {Array.from({ length: linhas }, (_, i) => (
        <Skeleton key={i} largura={i === linhas - 1 ? '70%' : '100%'} altura={10} />
      ))}
    </div>
  );
}
