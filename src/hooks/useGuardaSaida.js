import { useEffect, useRef } from 'react';

const MARCA = 'joviGuardaSaida';
// Quantos guardas estão montados. O StrictMode desmonta e remonta na hora: sem
// contar, a limpeza do primeiro montaria uma volta no histórico que o segundo desfaria.
let ativos = 0;

function entradaDeGuarda() {
  window.history.pushState({ ...window.history.state, [MARCA]: true }, '');
}

/**
 * Enquanto `ativo`, impede que "voltar" do navegador ou fechar a aba descartem
 * algo em silêncio. O BrowserRouter não tem `useBlocker`, então:
 *
 * - `beforeunload` pede a confirmação nativa ao recarregar ou fechar a aba;
 * - uma entrada extra no histórico absorve o "voltar": o `popstate` repõe a entrada
 *   e chama `aoTentarSair`, que decide (com confirmação) se a tela fecha;
 * - ao desmontar, a entrada extra é desfeita com `history.back()`, então a saída
 *   confirmada não deixa nada preso no histórico.
 */
export function useGuardaSaida(ativo, aoTentarSair) {
  const aoTentarSairRef = useRef(aoTentarSair);
  useEffect(() => {
    aoTentarSairRef.current = aoTentarSair;
  });

  useEffect(() => {
    if (!ativo) return undefined;
    ativos += 1;
    if (!window.history.state?.[MARCA]) entradaDeGuarda();

    function aoVoltar() {
      // O navegador consumiu a entrada de guarda: repõe antes de perguntar.
      if (!window.history.state?.[MARCA]) entradaDeGuarda();
      aoTentarSairRef.current();
    }
    function antesDeFechar(e) {
      e.preventDefault();
      e.returnValue = '';
    }
    window.addEventListener('popstate', aoVoltar);
    window.addEventListener('beforeunload', antesDeFechar);

    return () => {
      window.removeEventListener('popstate', aoVoltar);
      window.removeEventListener('beforeunload', antesDeFechar);
      ativos -= 1;
      setTimeout(() => {
        if (ativos === 0 && window.history.state?.[MARCA]) window.history.back();
      }, 0);
    };
  }, [ativo]);
}
