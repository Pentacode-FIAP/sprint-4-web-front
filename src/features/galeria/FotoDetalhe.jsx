import { useEffect, useState } from 'react';
import { Check, Copy, ScanText } from 'lucide-react';
import { ErroSemChave, MENSAGEM_SEM_CHAVE, runOcr } from '../../lib/gemini';
import { Sheet } from '../../components/Sheet';
import { Toast } from '../../components/Toast';
import { Skeleton } from '../../components/Skeleton';
import { NovoResumoSheet } from '../estudar/NovoResumoSheet';
import { BTN_PRIMARIO, BTN_SECUNDARIO } from '../../components/estilosBotao';

export function FotoDetalhe({ foto, onFechar, onSalvarOcr }) {
  const [texto, setTexto] = useState(foto.ocrText ?? '');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [copiado, setCopiado] = useState(false);
  const [criandoResumo, setCriandoResumo] = useState(false);

  useEffect(() => {
    if (!copiado) return;
    const timer = setTimeout(() => setCopiado(false), 2000);
    return () => clearTimeout(timer);
  }, [copiado]);

  async function rodarOcr() {
    setCarregando(true);
    setErro(null);
    try {
      const resultado = await runOcr(foto.dataUrl);
      setTexto(resultado);
      onSalvarOcr(foto.id, resultado);
    } catch (err) {
      setErro(err instanceof ErroSemChave ? MENSAGEM_SEM_CHAVE : 'Erro ao gerar, tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  async function copiarTexto() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
    } catch {
      setErro('Não foi possível copiar o texto.');
    }
  }

  return (
    <>
      <Sheet titulo="Foto" onFechar={onFechar}>
        <img className="mb-4 block w-full rounded-md bg-surface-2" src={foto.dataUrl} alt="" />

        {!texto && !carregando && (
          <button type="button" onClick={rodarOcr} className={`${BTN_PRIMARIO} w-full`}>
            <ScanText size={17} strokeWidth={2} />
            Ler texto da imagem
          </button>
        )}

        {carregando && (
          <div
            className="flex flex-col gap-[9px] rounded-md border border-border bg-surface p-3.5"
            role="status"
            aria-busy="true"
            aria-live="polite"
          >
            <span className="sr-only">Lendo o texto da imagem</span>
            <Skeleton largura="100%" altura={10} />
            <Skeleton largura="92%" altura={10} />
            <Skeleton largura="64%" altura={10} />
          </div>
        )}

        {texto && (
          <div className="flex flex-col gap-3">
            <p className="m-0 rounded-md bg-surface-2 p-3.5 text-sm leading-[1.6] whitespace-pre-wrap [overflow-wrap:anywhere]">
              {texto}
            </p>
            <button type="button" onClick={copiarTexto} className={`${BTN_SECUNDARIO} w-full`}>
              {copiado ? <Check size={17} strokeWidth={2.4} /> : <Copy size={17} strokeWidth={2} />}
              {copiado ? 'Copiado' : 'Copiar texto'}
            </button>
          </div>
        )}

        <button type="button" onClick={() => setCriandoResumo(true)} className={`${BTN_PRIMARIO} mt-4 w-full`}>
          Transformar em resumo
        </button>

        {erro && <Toast message={erro} onClose={() => setErro(null)} />}
      </Sheet>
    {criandoResumo && <NovoResumoSheet fotoInicialId={foto.id} onFechar={() => setCriandoResumo(false)} />}
    </>
  );
}
