import { Outlet, useLocation } from 'react-router-dom';
import { NavLateral } from './NavLateral';
import { NavInferior } from './NavInferior';

export function AppLayout() {
  const { pathname } = useLocation();
  // `screen` / `screen-chat` vêm do CSS da Sprint 3, que sai na Task 6.
  const classeTela = pathname.startsWith('/chat') ? 'screen screen-chat' : 'screen';
  return (
    <div className="flex h-dvh bg-bg font-sans text-text">
      <NavLateral />
      <main className="relative flex min-w-0 flex-1 flex-col">
        <div className="mx-auto flex min-h-0 w-full flex-1 flex-col lg:max-w-3xl">
          <div className={classeTela}>
            <Outlet />
          </div>
        </div>
        <NavInferior />
      </main>
    </div>
  );
}
