const RAIO = 54;
const CIRCUNFERENCIA = 2 * Math.PI * RAIO;

/** `rotulo`: texto completo para leitor de tela, ex.: "78% de acerto em 142 questões". */
export function Donut({ pct, rotulo, cor = 'var(--color-accent)', tamanho = 132 }) {
  const seguro = Math.max(0, Math.min(100, Number.isFinite(pct) ? pct : 0));
  const preenchido = (seguro / 100) * CIRCUNFERENCIA;

  return (
    <svg viewBox="0 0 128 128" width={tamanho} height={tamanho} role="img" aria-label={rotulo} className="flex-none">
      <circle cx="64" cy="64" r={RAIO} fill="none" stroke="var(--color-surface-3)" strokeWidth="11" />
      <circle
        cx="64"
        cy="64"
        r={RAIO}
        fill="none"
        stroke={cor}
        strokeWidth="11"
        strokeLinecap="round"
        strokeDasharray={`${preenchido} ${CIRCUNFERENCIA}`}
        transform="rotate(-90 64 64)"
        className="transition-[stroke-dasharray] duration-500 ease-out"
      />
      <text
        x="64"
        y="64"
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-text font-mono text-[28px] font-bold"
      >
        {Math.round(seguro)}%
      </text>
    </svg>
  );
}
