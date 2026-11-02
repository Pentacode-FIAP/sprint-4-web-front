import { Link } from 'react-router-dom';

export function NaoEncontrada() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg p-6 text-center font-sans text-text">
      <h1 className="text-2xl font-bold">Página não encontrada</h1>
      <p className="text-text-muted">O endereço que você abriu não existe.</p>
      <Link to="/" className="rounded-md bg-accent px-4 py-2.5 font-semibold text-accent-contrast hover:bg-accent-hover">
        Voltar para a Câmera
      </Link>
    </main>
  );
}
