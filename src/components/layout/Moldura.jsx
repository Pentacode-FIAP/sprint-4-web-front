// Moldura de celular: só aparece a partir de `md`. Abaixo disso, tela cheia sem moldura.
export function Moldura({ children }) {
  return (
    <div className="relative h-full w-full overflow-hidden md:h-[min(844px,92dvh)] md:w-[390px] md:flex-none md:rounded-[38px] md:border-[10px] md:border-fora md:shadow-4">
      {children}
    </div>
  );
}
