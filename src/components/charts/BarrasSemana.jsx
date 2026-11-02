const INICIAIS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export function BarrasSemana({ dados, meta }) {
  // A meta entra no máximo para a linha pontilhada nunca sair do gráfico; o 1
  // evita divisão por zero num período sem nenhuma questão.
  const maximo = Math.max(meta, ...dados.map((d) => d.total), 1);
  const rotulo = `Questões por dia. ${dados.map((d) => `${d.dia}: ${d.total}`).join('. ')}.`;

  return (
    <div role="img" aria-label={rotulo}>
      <div className="relative h-28">
        <div
          className="pointer-events-none absolute inset-x-0 border-t-2 border-dashed border-text-faint"
          style={{ bottom: `${(meta / maximo) * 100}%` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 grid grid-cols-7 gap-2">
          {dados.map((d) => (
            <div key={d.dia} className="flex h-full items-end justify-center">
              <div
                className={`w-full max-w-7 rounded-t-xs transition-[height] duration-500 ease-out ${
                  d.total >= meta ? 'bg-ok' : 'bg-accent'
                }`}
                style={{ height: `${(d.total / maximo) * 100}%`, minHeight: d.total > 0 ? 3 : 0 }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-1.5 grid grid-cols-7 gap-2 text-center text-[11px] font-semibold text-text-muted" aria-hidden="true">
        {dados.map((d) => {
          const [ano, mes, dia] = d.dia.split('-').map(Number);
          return <span key={d.dia}>{INICIAIS[new Date(ano, mes - 1, dia).getDay()]}</span>;
        })}
      </div>
    </div>
  );
}
