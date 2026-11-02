import { useRef, useState } from 'react';
import { Camera, Upload } from 'lucide-react';
import { useColecao } from '../../hooks/useColecao';
import { dataLocal } from '../../lib/date';
import { fileToDataUrl } from '../../lib/images';
import { FotoDetalhe } from './FotoDetalhe';
import { Header } from '../../components/Header';
import { Toast } from '../../components/Toast';

function agruparPorData(fotos) {
  const hoje = dataLocal(new Date());
  const ontem = dataLocal(new Date(Date.now() - 86400000));
  const grupos = new Map();
  for (const f of fotos) {
    const dia = dataLocal(new Date(f.dataUpload));
    const lista = grupos.get(dia) ?? [];
    lista.push(f);
    grupos.set(dia, lista);
  }
  const ordenado = [...grupos.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  return ordenado.map(([dia, itens]) => ({
    rotulo: dia === hoje ? 'Hoje' : dia === ontem ? 'Ontem' : dia,
    itens,
  }));
}

export function Galeria() {
  const { itens: fotos, adicionar, atualizar } = useColecao('fotos');

  const [selecionada, setSelecionada] = useState(null);
  const [toast, setToast] = useState(null);
  const inputUploadRef = useRef(null);
  const inputCameraRef = useRef(null);

  async function aoSelecionarArquivos(e) {
    const arquivos = e.target.files;
    if (!arquivos) return;
    for (const arquivo of Array.from(arquivos)) {
      try {
        const dataUrl = await fileToDataUrl(arquivo);
        if (!adicionar({ dataUrl, dataUpload: new Date().toISOString() })) break;
      } catch {
        setToast({ tipo: 'erro', mensagem: 'Erro ao processar foto — arquivo inválido.' });
        break;
      }
    }
    e.target.value = '';
  }

  const grupos = agruparPorData([...fotos].sort((a, b) => b.dataUpload.localeCompare(a.dataUpload)));

  return (
    <div>
      <Header
        title="Galeria"
        subtitle="Todas as fotos que você já enviou"
        actions={
          <div className="acoes-icone">
            <button onClick={() => inputCameraRef.current?.click()} aria-label="Abrir câmera">
              <Camera size={18} strokeWidth={2} />
            </button>
            <button onClick={() => inputUploadRef.current?.click()} aria-label="Enviar foto">
              <Upload size={18} strokeWidth={2} />
            </button>
          </div>
        }
      />

      <input ref={inputCameraRef} type="file" accept="image/*" capture="environment" hidden onChange={aoSelecionarArquivos} />
      <input ref={inputUploadRef} type="file" accept="image/*" multiple hidden onChange={aoSelecionarArquivos} />

      {grupos.map((grupo) => (
        <div key={grupo.rotulo}>
          <h3 className="secao-titulo">{grupo.rotulo}</h3>
          <div className="galeria-grid">
            {grupo.itens.map((foto) => (
              <button key={foto.id} className="galeria-item" onClick={() => setSelecionada(foto)}>
                <img src={foto.dataUrl} alt="" />
              </button>
            ))}
          </div>
        </div>
      ))}
      {fotos.length === 0 && <p className="vazio">Nenhuma foto ainda</p>}

      {selecionada && (
        <FotoDetalhe
          foto={selecionada}
          onSalvarOcr={(id, texto) => atualizar(id, { ocrText: texto })}
          onFechar={() => setSelecionada(null)}
        />
      )}

      {toast && (
        <Toast message={toast.mensagem} tipo={toast.tipo} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
