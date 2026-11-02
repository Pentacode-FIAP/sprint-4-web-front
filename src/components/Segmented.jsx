/**
 * Controle segmentado com polegar deslizante, posicionado por `--i` (índice
 * ativo) e `--n` (total): a animação é só uma transição de `transform`.
 * `tabs` alterna seções da tela; `radio` escolhe um valor de formulário.
 */
export function Segmented({ itens, valor, onChange, rotulo, modo = 'tabs' }) {
  const indice = Math.max(0, itens.findIndex((item) => item.id === valor));
  const ehTabs = modo === 'tabs';

  return (
    <div
      role={ehTabs ? 'tablist' : 'radiogroup'}
      aria-label={rotulo}
      style={{ '--i': String(indice), '--n': String(itens.length) }}
      className="relative mb-[18px] grid auto-cols-fr grid-flow-col gap-0.5 rounded-md border border-border bg-surface-2 p-[3px] before:absolute before:top-[3px] before:bottom-[3px] before:left-[3px] before:w-[calc((100%-6px)/var(--n,2))] before:translate-x-[calc(var(--i,0)*100%)] before:rounded-[10px] before:bg-surface before:shadow-2 before:transition-transform before:duration-300 before:ease-out before:content-['']"
    >
      {itens.map((item) => {
        const ativo = item.id === valor;
        return (
          <button
            key={item.id}
            type="button"
            role={ehTabs ? 'tab' : 'radio'}
            aria-selected={ehTabs ? ativo : undefined}
            aria-checked={ehTabs ? undefined : ativo}
            onClick={() => onChange(item.id)}
            className={`relative z-10 !min-h-11 !rounded-[10px] !border-0 !bg-transparent !px-2.5 !py-2 text-[13px] font-semibold transition-colors active:!scale-100 ${
              ativo ? 'text-text' : 'text-text-muted hover:text-text-2'
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
