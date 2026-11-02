import { Link, NavLink, useLocation } from 'react-router-dom';
import { BookOpen, Calendar, Camera, Images, Sparkles, TrendingUp } from 'lucide-react';

// Mesma ordem do BottomNav do Pitch.
export const ITENS_NAV = [
  { rota: '/progresso', label: 'Progresso', Icon: TrendingUp },
  { rota: '/estudar', label: 'Estudar', Icon: BookOpen },
  { rota: '/chat', label: 'Chat IA', Icon: Sparkles },
  { rota: '/galeria', label: 'Galeria', Icon: Images },
  { rota: '/calendario', label: 'Calendário', Icon: Calendar },
];

// `/` só casa com a raiz (end); a Câmera também ocupa `/camera/*`, como a tela de modos.
const CAMERA = { rota: '/', label: 'Câmera', Icon: Camera, ativaEm: (p) => p === '/' || p.startsWith('/camera/') };

function classeItem({ isActive }) {
  return [
    'flex items-center justify-center gap-3 rounded-md p-3 text-sm font-medium transition-colors lg:justify-start lg:px-4',
    isActive
      ? 'bg-accent-soft-2 text-accent'
      : 'text-text-2 hover:bg-surface-2',
  ].join(' ');
}

// Só a partir de `md`: ícones em `md`, ícones + rótulos a partir de `lg`.
export function NavLateral() {
  const { pathname } = useLocation();
  const itens = [CAMERA, ...ITENS_NAV];
  return (
    <nav
      aria-label="Navegação principal"
      className="hidden w-[72px] flex-none flex-col gap-1 border-r border-border bg-surface p-3 md:flex lg:w-60"
    >
      {itens.map(({ rota, label, Icon, ativaEm }) => {
        const conteudo = (
          <>
            <Icon size={20} aria-hidden="true" />
            <span className="hidden lg:inline">{label}</span>
          </>
        );
        // O NavLink não sabe que `/camera/modos` pertence à Câmera: ela marca o estado à mão.
        if (ativaEm) {
          const ativo = ativaEm(pathname);
          return (
            <Link
              key={rota}
              to={rota}
              aria-label={label}
              title={label}
              aria-current={ativo ? 'page' : undefined}
              className={classeItem({ isActive: ativo })}
            >
              {conteudo}
            </Link>
          );
        }
        return (
          <NavLink key={rota} to={rota} aria-label={label} title={label} className={classeItem}>
            {conteudo}
          </NavLink>
        );
      })}
    </nav>
  );
}
