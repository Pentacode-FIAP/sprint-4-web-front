import { useEffect, useState } from 'react';
import { Check, Copy, ScanText, Trash2 } from 'lucide-react';
import { useConfirmacao } from '../../hooks/useConfirmacao';
import { useOcr } from '../../hooks/useOcr';
import { Sheet } from '../../components/Sheet';
import { Toast } from '../../components/Toast';
import { Skeleton } from '../../components/Skeleton';
import { NovoResumoSheet } from '../estudar/NovoResumoSheet';
import { BTN_PRIMARIO, BTN_SECUNDARIO } from '../../components/estilosBotao';

export function FotoDetalhe({ foto, onFechar, onSalvarOcr, onExcluir }) {
  const { confirmar, dialogoConfirmacao } = useConfirmacao();
  const [texto, setTexto] = useState(foto.ocrText ?? '');
  const [erroCopia, setErroCopia] = useState(null);
  const { ocr, ler, cancelar } = useOcr({ mensagemErro: 'Erro ao gerar, tente novamente.' });
  const carregando = ocr?.estado === 'lendo';
  const erro = erroCopia ?? (ocr?.estado === 'erro' ? ocr.mensagem : null);
  const [copiado, setCopiado] = useState(false);
  const [criandoResumo, setCriandoResumo] = useState(false);

  useEffect(() => {
    if (!copiado) return;
    const timer = setTimeout(() => setCopiado(false), 2000);
    return () => clearTimeout(timer);
  }, [copiado]);

  async function rodarOcr() {
    setErroCopia(null);
    const resultado = await ler(foto.dataUrl);
    if (resultado === null) return;
    setTexto(resultado);
    onSalvarOcr(foto.id, resultado);
  }

  function fecharErro() {
    setErroCopia(null);
    if (ocr?.estado === 'erro') cancelar();
  }

  async function copiarTexto() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
    } catch {
      setErroCopia('Não foi possível copiar o texto.');
    }
  }

  async function excluir() {
    const ok = await confirmar({
      titulo: 'Excluir foto',
      descricao: 'A foto sai da Galeria e libera espaço. Resumos que a usaram continuam com o texto, sem a foto. Essa ação não pode ser desfeita.',
      rotuloConfirmar: 'Excluir',
      destrutivo: true,
    });
    if (ok && onExcluir(foto.id)) onFechar();
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
        <button type="button" onClick={excluir} className={`${BTN_SECUNDARIO} mt-2 w-full text-danger`}>
          <Trash2 size={17} strokeWidth={2} />
          Excluir foto
        </button>

        {erro && <Toast message={erro} onClose={fecharErro} />}
      </Sheet>
      {criandoResumo && <NovoResumoSheet fotoInicialId={foto.id} onFechar={() => setCriandoResumo(false)} />}
      {dialogoConfirmacao}
    </>
  );
}
