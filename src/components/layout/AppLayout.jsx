import { Outlet } from 'react-router-dom';
import { NavLateral } from './NavLateral';
import { NavInferior } from './NavInferior';

export function AppLayout() {
  return (
    <div className="flex h-dvh bg-bg font-sans text-text">
      <NavLateral />
      <main className="relative flex min-w-0 flex-1 flex-col">
        <div className="mx-auto flex min-h-0 w-full flex-1 flex-col lg:max-w-3xl">
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 pb-6">
            <Outlet />
          </div>
        </div>
        <NavInferior />
      </main>
    </div>
  );
}
