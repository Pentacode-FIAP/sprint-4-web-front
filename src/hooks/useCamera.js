import { useCallback, useEffect, useRef, useState } from 'react';
import { MAX_DIM_FOTO, QUALIDADE_FOTO } from '../lib/images';

function mensagemDeErro(err) {
  switch (err?.name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return 'A permissão da câmera foi negada. Libere o acesso nas configurações do navegador para usar a câmera.';
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return 'Nenhuma câmera foi encontrada neste dispositivo.';
    case 'NotReadableError':
    case 'AbortError':
      return 'Não foi possível acessar a câmera. Ela pode estar em uso por outro aplicativo.';
    default:
      return 'Não foi possível iniciar a câmera.';
  }
}

/**
 * Dono do stream de vídeo: abre a câmera, troca entre frontal e traseira,
 * captura quadros e solta as faixas ao desmontar (ou ao trocar de câmera).
 * `erro` é uma mensagem em português quando a câmera não está disponível.
 */
export function useCamera() {
  const videoRef = useRef(null);
  const [facing, setFacing] = useState('environment');
  const [pronta, setPronta] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let cancelado = false;
    let stream = null;
    const video = videoRef.current;

    setPronta(false);
    setErro(null);

    async function iniciar() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setErro('Este navegador não permite acessar a câmera.');
        return;
      }
      try {
        const obtido = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing },
          audio: false,
        });
        // A promessa pode resolver depois do unmount (ou de outra troca):
        // nesse caso as faixas nunca foram entregues a ninguém e precisam parar aqui.
        if (cancelado) {
          obtido.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = obtido;
        if (video) video.srcObject = obtido;
        setPronta(true);
      } catch (err) {
        if (cancelado) return;
        console.warn('Câmera indisponível:', err);
        setErro(mensagemDeErro(err));
      }
    }

    iniciar();

    return () => {
      cancelado = true;
      stream?.getTracks().forEach((t) => t.stop());
      if (video) video.srcObject = null;
    };
  }, [facing]);

  const alternarCamera = useCallback(() => {
    setFacing((f) => (f === 'environment' ? 'user' : 'environment'));
  }, []);

  /** Devolve um data URL JPEG do quadro atual, ou null se não houver imagem. */
  const capturar = useCallback(({ maxDim = MAX_DIM_FOTO, quality = QUALIDADE_FOTO } = {}) => {
    const video = videoRef.current;
    if (!video || !video.srcObject || video.readyState < 2 || !video.videoWidth) return null;

    const escala = Math.min(1, maxDim / Math.max(video.videoWidth, video.videoHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(video.videoWidth * escala);
    canvas.height = Math.round(video.videoHeight * escala);
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', quality);
  }, []);

  return { videoRef, pronta, erro, facing, alternarCamera, capturar };
}
