import { Link } from 'react-router-dom';
import { Camera } from 'lucide-react';

/**
 * Cabeçalho de tela. Abaixo de `md` não há navegação lateral nem atalho para a
 * câmera, então mostra um botão para `/`; a partir de `md` a nav lateral cobre isso.
 */
export function ScreenHeader({ title, subtitle, actions, subtitleBelow = false }) {
  const subtitulo = <p className="m-0 text-sm text-text-muted">{subtitle}</p>;
  return (
    <header className="sticky top-0 z-10 -mx-4 flex flex-wrap items-start justify-between gap-x-3 gap-y-1 bg-bg/85 px-4 pt-5 pb-3.5 backdrop-blur-lg">
      <div className="min-w-0 flex-1">
        <h1 className="mb-0.5 text-[22px] leading-tight font-bold">{title}</h1>
        {!subtitleBelow && subtitulo}
      </div>
      <div className="flex flex-none items-center gap-1.5">
        {actions}
        <Link
          to="/"
          aria-label="Abrir câmera"
          className="flex h-11 w-11 items-center justify-center rounded-md text-text-muted hover:bg-accent-soft hover:text-accent md:hidden"
        >
          <Camera size={20} strokeWidth={2} aria-hidden="true" />
        </Link>
      </div>
      {subtitleBelow && <div className="basis-full">{subtitulo}</div>}
    </header>
  );
}
