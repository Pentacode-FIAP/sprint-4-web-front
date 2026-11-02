import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast } from '../../components/Toast';
import { useCamera } from '../../hooks/useCamera';
import { useColecao } from '../../hooks/useColecao';
import { ErroSemChave, MENSAGEM_SEM_CHAVE, runOcr } from '../../lib/gemini';
import { BarraStatus } from './BarraStatus';
import { OcrPanel } from './OcrPanel';

const TEXTOS_CHIP = {
  ia: 'IA · Modo Noite detectado',
  estudo: 'IA Auto · Texto detectado',
  noite: 'Modo Noite ativo',
  foto: 'Modo Foto',
  video: 'Gravando vídeo',
};

const CTRL_BOTOES = [
  { id: 'hdr', label: '⊙', nome: 'HDR' },
  { id: 'flash', label: '⚡', nome: 'Flash' },
  { id: 'grid', label: '◎', nome: 'Grade' },
  { id: 'filter', label: '◈', nome: 'Filtro' },
  { id: 'settings', label: '⚙', nome: 'Configurações' },
];

// Classes que variam com o tema do modo: verde no Estudo, azul nos demais.
const TEMAS = {
  estudo: {
    fallback: 'bg-[linear-gradient(160deg,#080c09_0%,#090d0a_50%,#070b08_100%)]',
    chip: 'border-[rgba(51,199,120,0.5)] bg-[rgba(8,14,10,0.85)]',
    chipDot: 'bg-[rgba(51,199,120,0.8)] shadow-[0_0_8px_rgba(51,199,120,0.5)]',
    chipLabel: 'text-cam-verde',
    canto: 'border-cam-verde',
    zoomBar: 'bg-[#070b08]',
    tabDot: 'bg-cam-verde',
    obturador:
      'border-[rgba(51,199,120,0.25)] bg-[linear-gradient(145deg,#4fd891,#2bab6b)] shadow-[0_0_0_5px_rgba(51,199,120,0.12),0_0_20px_rgba(51,199,120,0.35)]',
  },
  ia: {
    fallback: 'bg-[linear-gradient(160deg,#0a0815_0%,#0d0a18_50%,#09070f_100%)]',
    chip: 'border-[rgba(79,140,255,0.55)] bg-[rgba(8,8,20,0.82)]',
    chipDot: 'bg-[rgba(107,171,255,0.7)] shadow-[0_0_8px_rgba(107,171,255,0.5)]',
    chipLabel: 'text-cam-azul-2',
    canto: 'border-cam-foco',
    zoomBar: 'bg-[#09070f]',
    tabDot: 'bg-cam-azul',
    obturador:
      'border-[rgba(107,171,255,0.25)] bg-[linear-gradient(145deg,#7fb8ff,#4f8cff)] shadow-[0_0_0_5px_rgba(79,140,255,0.12),0_0_20px_rgba(107,171,255,0.3)]',
  },
};

const MODOS_TABS = [
  { id: 'estudo', label: 'Estudo', cor: 'text-cam-verde/70', corAtiva: 'text-cam-verde' },
  { id: 'ia', label: 'IA', cor: 'text-cam-azul/70', corAtiva: 'text-cam-azul', dot: true },
  { id: 'noite', label: 'Noite' },
  { id: 'foto', label: 'Foto' },
  { id: 'video', label: 'Vídeo' },
];

const ZOOMS = ['0.6', '1', '2'];

const BASE_TAB =
  'relative flex flex-none cursor-pointer items-center gap-[5px] border-0 bg-transparent px-3.5 py-2.5 text-[12px] leading-none whitespace-nowrap transition-[color,font-weight] duration-150';

function classeTab(tab, ativo) {
  const cor = tab?.cor ?? 'text-white/38';
  return `${BASE_TAB} ${ativo ? `font-semibold ${tab?.corAtiva ?? cor}` : `font-normal ${cor}`}`;
}

const BTN_ACAO =
  'flex h-[34px] flex-1 cursor-pointer items-center justify-center rounded-[8px] border border-white/10 bg-white/6 p-0 text-center text-[13px] font-medium text-white/80 transition-[background,border-color,color] duration-[180ms] hover:enabled:border-cam-verde hover:enabled:bg-cam-verde/15 hover:enabled:text-cam-verde disabled:cursor-not-allowed disabled:opacity-40';

export function CameraScreen({ onAbrirConfig }) {
  const navigate = useNavigate();
  const { adicionar: adicionarFoto } = useColecao('fotos');
  const { videoRef, erro, alternarCamera, capturar } = useCamera();

  const [modo, setModo] = useState('ia');
  const [zoom, setZoom] = useState('1');
  const [ctrlAtivos, setCtrlAtivos] = useState(new Set(['grid']));
  const [fotosTiradas, setFotosTiradas] = useState(0);
  const [flashKey, setFlashKey] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [toast, setToast] = useState(null);
  const [ocr, setOcr] = useState(null);
  const ocrReqRef = useRef(0);
  const flipTimerRef = useRef(null);

  useEffect(() => () => clearTimeout(flipTimerRef.current), []);

  function alternarCtrl(id) {
    if (id === 'settings') {
      onAbrirConfig();
      return;
    }
    setCtrlAtivos((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  function tirarFoto() {
    setFlashKey((k) => k + 1);
    setFotosTiradas((n) => n + 1);

    if (modo !== 'estudo') return;

    const dataUrl = capturar();
    if (!dataUrl) {
      setToast({ tipo: 'erro', mensagem: 'Câmera indisponível' });
      return;
    }

    if (adicionarFoto({ dataUrl, dataUpload: new Date().toISOString() })) {
      setToast({ tipo: 'sucesso', mensagem: 'Foto salva na galeria' });
    } else {
      setToast({ tipo: 'erro', mensagem: 'Erro ao salvar foto, tente novamente.' });
    }
  }

  function fecharOcr() {
    ocrReqRef.current += 1;
    setOcr(null);
  }

  function trocarModo(novo) {
    if (novo !== modo) fecharOcr();
    setModo(novo);
  }

  async function copiarTexto() {
    const req = ocrReqRef.current + 1;
    ocrReqRef.current = req;
    setOcr({ estado: 'lendo' });

    // Captura em resolução maior só para o OCR; esse quadro não é salvo.
    const dataUrl = capturar({ maxDim: 1920, quality: 0.92 });
    if (!dataUrl) {
      setOcr(null);
      setToast({ tipo: 'erro', mensagem: 'Câmera indisponível' });
      return;
    }

    try {
      const texto = await runOcr(dataUrl);
      if (ocrReqRef.current !== req) return;
      if (!texto.trim()) {
        setOcr({ estado: 'erro', mensagem: 'Nenhum texto encontrado na imagem.' });
      } else {
        setOcr({ estado: 'pronto', texto: texto.trim() });
      }
    } catch (err) {
      if (ocrReqRef.current !== req) return;
      setOcr({
        estado: 'erro',
        mensagem: err instanceof ErroSemChave ? MENSAGEM_SEM_CHAVE : 'Não consegui ler o texto. Tente de novo.',
      });
    }
  }

  function virarCamera() {
    setFlipping(true);
    clearTimeout(flipTimerRef.current);
    flipTimerRef.current = setTimeout(() => setFlipping(false), 300);
    alternarCamera();
  }

  function abrirGaleriaFake() {
    if (fotosTiradas === 0) {
      window.alert('Você ainda não tirou nenhuma foto.');
      return;
    }
    window.alert(
      `Galeria · ${fotosTiradas} ${fotosTiradas === 1 ? 'foto disponível' : 'fotos disponíveis'}.`,
    );
  }

  // Sem câmera, o acesso aos estudos vai para o início; no Estudo, para onde as fotos são salvas.
  function abrirEstudos() {
    navigate(modo === 'estudo' && !erro ? '/galeria' : '/estudar');
  }

  const tema = TEMAS[modo === 'estudo' ? 'estudo' : 'ia'];

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-cam-fundo font-camera">
      <BarraStatus className="z-20 flex-none bg-black/40" />

      <nav className="z-10 flex h-12 flex-none items-center justify-around bg-black/35">
        {CTRL_BOTOES.map((btn) => (
          <button
            key={btn.id}
            type="button"
            aria-label={btn.nome}
            aria-pressed={btn.id === 'settings' ? undefined : ctrlAtivos.has(btn.id)}
            className={`cursor-pointer border-0 bg-transparent px-3 py-2.5 text-[17px] text-white transition-opacity duration-[180ms] ease-[ease] ${
              ctrlAtivos.has(btn.id) ? 'opacity-100' : 'opacity-60'
            }`}
            onClick={() => alternarCtrl(btn.id)}
          >
            {btn.label}
          </button>
        ))}
      </nav>

      <section className="relative flex-1 overflow-hidden">
        <video
          ref={videoRef}
          className={`absolute inset-0 z-[1] size-full bg-black object-cover ${erro ? 'hidden' : ''}`}
          autoPlay
          muted
          playsInline
        />
        <div className={`absolute inset-0 z-0 ${tema.fallback}`} />

        <div
          className={`absolute top-[18px] left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-[20px] border py-[7px] pr-4 pl-3 whitespace-nowrap ${tema.chip}`}
        >
          <span className={`size-2.5 rounded-full ${tema.chipDot}`} />
          <span className={`text-[11px] font-medium tracking-[0.01em] ${tema.chipLabel}`}>
            {TEXTOS_CHIP[modo]}
          </span>
        </div>

        {ctrlAtivos.has('grid') && (
          <div className="absolute inset-0 z-[5]">
            <div className="absolute top-0 bottom-0 left-[33.33%] w-px bg-white/8" />
            <div className="absolute top-0 bottom-0 left-[66.66%] w-px bg-white/8" />
            <div className="absolute top-[33.33%] right-0 left-0 h-px bg-white/8" />
            <div className="absolute top-[66.66%] right-0 left-0 h-px bg-white/8" />
          </div>
        )}

        <div className="absolute top-1/2 left-1/2 z-[5] size-[84px] -translate-x-1/2 -translate-y-1/2">
          <span className={`absolute top-0 left-0 size-5 border-t-2 border-l-2 ${tema.canto}`} />
          <span className={`absolute top-0 right-0 size-5 border-t-2 border-r-2 ${tema.canto}`} />
          <span className={`absolute bottom-0 left-0 size-5 border-b-2 border-l-2 ${tema.canto}`} />
          <span className={`absolute right-0 bottom-0 size-5 border-r-2 border-b-2 ${tema.canto}`} />
        </div>

        {modo === 'estudo' && (
          <div className="absolute top-[48%] right-0 left-0 z-[5] h-0.5 animate-cam-scan bg-[linear-gradient(90deg,transparent_0%,rgba(51,199,120,0)_10%,rgba(51,199,120,0.4)_40%,rgba(51,199,120,0.4)_60%,rgba(51,199,120,0)_90%,transparent_100%)]" />
        )}

        <div className="absolute right-4 bottom-4 z-[6] rounded-[12px] bg-black/50 px-2.5 py-[5px] text-[11px] font-medium tracking-[0.02em] text-white/70">
          {fotosTiradas} {fotosTiradas === 1 ? 'foto' : 'fotos'}
        </div>

        {erro && (
          <div
            role="alert"
            className="absolute top-1/2 right-4 left-4 z-[7] flex -translate-y-1/2 flex-col items-center gap-1.5 rounded-[12px] border border-white/12 bg-black/70 px-4 py-[18px] text-center"
          >
            <span className="text-[13px] font-semibold text-white/90">Câmera indisponível</span>
            <span className="text-[12px] leading-[1.5] text-white/70">{erro}</span>
          </div>
        )}

        {ocr && <OcrPanel estado={ocr} onFechar={fecharOcr} />}

        <div
          key={flashKey}
          className={`pointer-events-none absolute inset-0 z-50 bg-white opacity-0 ${
            flashKey > 0 ? 'animate-cam-flash' : ''
          }`}
        />
      </section>

      <div className={`relative z-10 flex flex-none items-center justify-center gap-[34px] py-2.5 before:absolute before:left-1/2 before:h-8 before:w-[114px] before:-translate-x-1/2 before:rounded-2xl before:bg-black/45 ${tema.zoomBar}`}>
        {ZOOMS.map((z) => (
          <button
            key={z}
            type="button"
            className={`relative z-[1] cursor-pointer border-0 bg-transparent p-0 text-[11px] transition-[color,font-weight] duration-150 ${
              zoom === z ? 'font-medium text-white' : 'font-normal text-white/38'
            }`}
            onClick={() => setZoom(z)}
          >
            {z === '1' ? '1×' : z === '2' ? '2×' : '0.6x'}
          </button>
        ))}
      </div>

      <nav className="flex h-12 flex-none items-center gap-1 overflow-x-auto border-t border-white/5 bg-black/55 px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {MODOS_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={classeTab(tab, modo === tab.id)}
            onClick={() => trocarModo(tab.id)}
          >
            {tab.label}
            {tab.dot && <span className={`inline-block size-1 rounded-full ${tema.tabDot}`} />}
          </button>
        ))}
        <button type="button" className={classeTab(null, false)} onClick={onAbrirConfig}>
          Modos
        </button>
      </nav>

      <section className="flex flex-none gap-4 bg-black/55 px-8 py-2.5">
        {modo === 'estudo' && (
          <button
            type="button"
            className={BTN_ACAO}
            onClick={copiarTexto}
            disabled={ocr?.estado === 'lendo'}
          >
            {ocr?.estado === 'lendo' ? 'Lendo...' : 'Copiar texto'}
          </button>
        )}
        <button type="button" className={BTN_ACAO} onClick={abrirEstudos}>
          Abrir app de estudos
        </button>
      </section>

      <footer className="flex h-[118px] flex-none items-center justify-around bg-black/65 px-6 pb-4">
        <button
          type="button"
          aria-label="Galeria de fotos"
          className="flex size-[52px] cursor-pointer items-center justify-center rounded-[10px] border border-white/10 bg-[#1a1429] p-0 text-[20px]"
          onClick={abrirGaleriaFake}
        >
          📷
        </button>
        <button
          type="button"
          aria-label="Tirar foto"
          className={`relative size-[66px] cursor-pointer rounded-full border-[3px] p-0 transition-transform duration-100 after:absolute after:inset-[5px] after:rounded-full after:bg-white/12 active:scale-[0.94] ${tema.obturador}`}
          onClick={tirarFoto}
        />
        <button
          type="button"
          aria-label="Alternar câmera"
          className={`flex size-11 cursor-pointer items-center justify-center rounded-full border-0 bg-white/8 p-0 text-[18px] text-white/70 transition-transform duration-300 ${
            flipping ? 'rotate-180' : ''
          }`}
          onClick={virarCamera}
        >
          ⟳
        </button>
      </footer>

      {toast && (
        <Toast message={toast.mensagem} tipo={toast.tipo} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
