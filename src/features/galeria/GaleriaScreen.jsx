import { useRef, useState } from 'react';
import { Camera, ImagePlus, Upload } from 'lucide-react';
import { useFotos } from '../../hooks/useFotos';
import { dataLocal } from '../../lib/date';
import { fileToDataUrl } from '../../lib/images';
import { FotoDetalhe } from './FotoDetalhe';
import { ScreenHeader } from '../../components/ScreenHeader';
import { EmptyState } from '../../components/EmptyState';
import { Toast } from '../../components/Toast';
import { BTN_PRIMARIO_ICONE, BTN_SECUNDARIO_ICONE } from '../../components/estilosBotao';

function agruparPorData(fotos) {
  const hoje = dataLocal(new Date());
  const ontem = dataLocal(new Date(Date.now() - 86400000));
  const grupos = new Map();
  for (const f of fotos) {
    const dia = dataLocal(new Date(f.dataUpload));
    grupos.set(dia, [...(grupos.get(dia) ?? []), f]);
  }
  return [...grupos.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([dia, itens]) => ({
      rotulo: dia === hoje ? 'Hoje' : dia === ontem ? 'Ontem' : dia.split('-').reverse().join('/'),
      itens,
    }));
}

export function GaleriaScreen() {
  const { fotos, adicionar, atualizar, excluirFoto } = useFotos();
  const [selecionadaId, setSelecionadaId] = useState(null);
  const [toast, setToast] = useState(null);
  const inputUploadRef = useRef(null);
  const inputCameraRef = useRef(null);

  async function aoSelecionarArquivos(e) {
    const entrada = e.target;
    const arquivos = Array.from(entrada.files ?? []);
    for (const arquivo of arquivos) {
      try {
        const dataUrl = await fileToDataUrl(arquivo);
        // null = armazenamento cheio; o aviso já foi mostrado e o resto também falharia.
        if (adicionar({ dataUrl, dataUpload: new Date().toISOString() }) === null) break;
      } catch {
        setToast('Erro ao processar foto: arquivo inválido.');
        break;
      }
    }
    entrada.value = '';
  }

  const grupos = agruparPorData([...fotos].sort((a, b) => b.dataUpload.localeCompare(a.dataUpload)));
  const selecionada = fotos.find((f) => f.id === selecionadaId);

  return (
    <>
      <ScreenHeader
        title="Galeria"
        subtitle="Todas as fotos que você já enviou"
        actions={
          <>
            <button
              type="button"
              onClick={() => inputCameraRef.current?.click()}
              aria-label="Abrir câmera"
              title="Tirar foto"
              className={BTN_SECUNDARIO_ICONE}
            >
              <Camera size={19} strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => inputUploadRef.current?.click()}
              aria-label="Enviar foto"
              title="Enviar da galeria"
              className={BTN_PRIMARIO_ICONE}
            >
              <Upload size={19} strokeWidth={2} />
            </button>
          </>
        }
      />

      <input ref={inputCameraRef} type="file" accept="image/*" capture="environment" hidden onChange={aoSelecionarArquivos} />
      <input ref={inputUploadRef} type="file" accept="image/*" multiple hidden onChange={aoSelecionarArquivos} />

      <div className="pb-6">
        {fotos.length === 0 ? (
          <EmptyState
            Icone={ImagePlus}
            titulo="Nenhuma foto ainda"
            descricao="Fotografe o quadro ou o caderno. Depois é só transformar em resumo na aba Estudar."
            acao={{ rotulo: 'Enviar foto', onClick: () => inputUploadRef.current?.click() }}
          />
        ) : (
          grupos.map((grupo) => (
            <section key={grupo.rotulo}>
              <h3 className="mt-6 mb-2.5 text-[11px] font-semibold tracking-[0.09em] text-text-muted uppercase">
                {grupo.rotulo}
              </h3>
              <div className="grid grid-cols-3 gap-1.5 md:grid-cols-4 lg:grid-cols-5">
                {grupo.itens.map((foto) => (
                  <button
                    key={foto.id}
                    type="button"
                    onClick={() => setSelecionadaId(foto.id)}
                    aria-label={`Abrir foto de ${grupo.rotulo}`}
                    className="group relative aspect-square min-h-11 cursor-pointer overflow-hidden rounded-sm border border-border bg-surface-2 p-0"
                  >
                    <img
                      src={foto.dataUrl}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="block h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </button>
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {selecionada && (
        <FotoDetalhe
          foto={selecionada}
          onSalvarOcr={(id, texto) => atualizar(id, { ocrText: texto })}
          onExcluir={excluirFoto}
          onFechar={() => setSelecionadaId(null)}
        />
      )}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
}
