import { useCallback, useRef, useState } from 'react';
import { ErroSemChave, MENSAGEM_SEM_CHAVE, runOcr } from '../lib/gemini';

/**
 * Leitura de texto (OCR) de uma imagem. `ocr` é `null` ou `{ estado, texto?, mensagem? }`
 * com `estado` 'lendo', 'pronto' ou 'erro'. `ler` devolve o texto, ou `null` se falhou
 * ou se `cancelar` (ou outra leitura) tomou o lugar dela.
 *
 * Com `exigirTexto`, o texto vem sem espaços nas pontas e resultado vazio conta como erro.
 */
export function useOcr({ mensagemErro, exigirTexto = false }) {
  const [ocr, setOcr] = useState(null);
  const pedidoRef = useRef(0);

  const ler = useCallback(
    async (dataUrl) => {
      const pedido = pedidoRef.current + 1;
      pedidoRef.current = pedido;
      setOcr({ estado: 'lendo' });
      try {
        const bruto = await runOcr(dataUrl);
        if (pedidoRef.current !== pedido) return null;
        const texto = exigirTexto ? bruto.trim() : bruto;
        if (exigirTexto && !texto) {
          setOcr({ estado: 'erro', mensagem: 'Nenhum texto encontrado na imagem.' });
          return null;
        }
        setOcr({ estado: 'pronto', texto });
        return texto;
      } catch (err) {
        if (pedidoRef.current !== pedido) return null;
        setOcr({ estado: 'erro', mensagem: err instanceof ErroSemChave ? MENSAGEM_SEM_CHAVE : mensagemErro });
        return null;
      }
    },
    [mensagemErro, exigirTexto],
  );

  /** Descarta a leitura em andamento (se houver) e limpa o estado. */
  const cancelar = useCallback(() => {
    pedidoRef.current += 1;
    setOcr(null);
  }, []);

  return { ocr, ler, cancelar };
}
