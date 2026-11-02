import { NavLink } from 'react-router-dom';
import { ITENS_NAV } from './NavLateral';

// Só abaixo de `md`: os 5 destinos de topo.
export function NavInferior() {
  return (
    <nav
      aria-label="Navegação principal"
      className="flex flex-none border-t border-border bg-surface px-1 pt-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))] md:hidden"
    >
      {ITENS_NAV.map(({ rota, label, Icon }) => (
        <NavLink
          key={rota}
          to={rota}
          className={({ isActive }) =>
            `flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-md py-1.5 text-[10px] font-medium ${
              isActive ? 'text-accent' : 'text-text-muted'
            }`
          }
        >
          <Icon size={20} aria-hidden="true" />
          <span className="truncate">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
