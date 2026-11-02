import { Outlet } from 'react-router-dom';
import { NavLateral } from './NavLateral';
import { Moldura } from './Moldura';

export function CameraLayout() {
  return (
    <div className="flex h-dvh bg-bg font-sans text-text">
      <NavLateral />
      <main className="flex min-w-0 flex-1 items-center justify-center">
        <Moldura>
          <Outlet />
        </Moldura>
      </main>
    </div>
  );
}
