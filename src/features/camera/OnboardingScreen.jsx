import { useEffect, useState } from 'react';
import { useConfirmacao } from '../../hooks/useConfirmacao';
import { BarraStatus } from './BarraStatus';

const SLIDES = [
  {
    titulo: (
      <>
        Bem-vindo ao
        <br />
        JOVI Cam
      </>
    ),
    desc: (
      <>
        Sua câmera agora é inteligente.
        <br />
        Deixa ela fazer o trabalho por você.
      </>
    ),
  },
  {
    titulo: 'Modo IA Auto',
    desc: (
      <>
        A câmera detecta automaticamente o
        <br />
        ambiente e ajusta o modo ideal —{' '}
        <br />
        balada, paisagem, comida e muito.
      </>
    ),
  },
  {
    titulo: 'Modo Estudo',
    desc: (
      <>
        Fotografe anotações ou a lousa e a IA{' '}
        <br />
        organiza tudo direto no seu app de notas.
      </>
    ),
  },
  {
    titulo: 'Navegue pelos modos',
    desc: (
      <>
        Arraste a barra de modos ou toque{' '}
        <br />
        diretamente para trocar. IA Auto é <br />
        sempre o ponto de partida.
      </>
    ),
  },
];

export function OnboardingScreen({ onConcluir }) {
  const [slideAtual, setSlideAtual] = useState(0);
  const { confirmar, dialogoConfirmacao } = useConfirmacao();
  const ultimo = slideAtual === SLIDES.length - 1;

  function proximo() {
    if (ultimo) {
      onConcluir();
      return;
    }
    setSlideAtual((s) => s + 1);
  }

  function anterior() {
    setSlideAtual((s) => Math.max(0, s - 1));
  }

  async function pular() {
    const ok = await confirmar({
      titulo: 'Pular o tutorial?',
      descricao: 'Você vai direto para o app e pode rever o tutorial depois.',
      rotuloConfirmar: 'Pular',
    });
    if (ok) onConcluir();
  }

  const confirmacaoAberta = dialogoConfirmacao !== null;

  useEffect(() => {
    function aoTeclar(e) {
      // Com o diálogo de "Pular" aberto, as setas não podem avançar o tutorial por trás dele.
      if (confirmacaoAberta) return;
      if (e.key === 'ArrowRight') proximo();
      if (e.key === 'ArrowLeft' && slideAtual > 0) anterior();
    }
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideAtual, ultimo, confirmacaoAberta]);

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-cam-onboarding font-camera">
      <BarraStatus className="z-10" />

      <section className="absolute inset-0 overflow-hidden bg-[radial-gradient(ellipse_120%_80%_at_50%_30%,#0d0a1e_0%,#05030d_70%)] before:absolute before:inset-0 before:bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] before:bg-size-[130px_281px]">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.012)_2px,rgba(255,255,255,0.012)_4px)]" />
      </section>

      <section className="absolute inset-0 flex items-center justify-center px-8">
        <article className="flex w-[326px] flex-col items-center rounded-3xl border border-white/9 bg-[#141424] px-6 pt-6 pb-7 shadow-[0_0_0_1px_rgba(107,171,255,0.05),0_24px_60px_rgba(0,0,0,0.6),inset_0_2px_8px_rgba(107,171,255,0.06)]">
          <div className="mb-7 flex items-center gap-1.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`h-1.5 cursor-pointer border-0 p-0 transition-[width,background] duration-200 ${
                  i === slideAtual ? 'w-[18px] rounded-[3px] bg-white' : 'w-1.5 rounded-full bg-white/22'
                }`}
                aria-label={`Slide ${i + 1}`}
                aria-current={i === slideAtual ? 'step' : undefined}
                onClick={() => setSlideAtual(i)}
              />
            ))}
          </div>

          <div className="mb-6 flex size-16 items-center justify-center rounded-full border border-[rgba(107,171,255,0.25)] bg-[linear-gradient(145deg,#1b2c52,#0f1b3a)] shadow-[0_0_24px_rgba(107,171,255,0.15),inset_0_0_8px_rgba(107,171,255,0.1)]">
            <span className="text-[26px] leading-none text-cam-azul-2">✦</span>
          </div>

          <div className="flex min-h-[120px] w-full flex-col items-center">
            <div className="flex w-full animate-cam-slide flex-col items-center">
              <h1 className="mb-3.5 text-center text-[22px] leading-[1.25] font-bold tracking-[-0.01em] text-white">
                {SLIDES[slideAtual].titulo}
              </h1>
              <p className="mb-7 text-center text-[13px] leading-[1.55] font-normal text-white/45">
                {SLIDES[slideAtual].desc}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="mb-3.5 inline-flex h-[46px] w-[222px] cursor-pointer items-center justify-center rounded-[23px] border border-white/18 bg-white/8 p-0 text-[14px] font-semibold tracking-[0.01em] text-white backdrop-blur-[4px] transition-colors duration-150 hover:bg-white/14"
            onClick={proximo}
          >
            {ultimo ? 'Entendi' : 'Próximo'}
          </button>
          <div className="flex items-center justify-center gap-[18px]">
            <button
              type="button"
              className="cursor-pointer border-0 bg-transparent p-0 text-[12px] font-medium tracking-[0.01em] text-white/55 transition-colors duration-150 hover:enabled:text-white disabled:cursor-not-allowed disabled:text-white/15"
              onClick={anterior}
              disabled={slideAtual === 0}
            >
              Anterior
            </button>
            <button
              type="button"
              className="cursor-pointer border-0 bg-transparent p-0 text-[12px] font-normal tracking-[0.01em] text-white/28 transition-colors duration-150 hover:text-white/60"
              onClick={pular}
            >
              Pular tutorial
            </button>
          </div>
        </article>
      </section>
      {dialogoConfirmacao}
    </div>
  );
}
