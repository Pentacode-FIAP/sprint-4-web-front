import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModosCamera } from '../../hooks/useModosCamera';
import { BarraStatus } from './BarraStatus';

// Modos customizados ativos trocam o brilho do ícone por este, mais discreto.
const SOMBRA_CUSTOM = 'shadow-[0_0_12px_rgba(107,171,255,0.08)]';

const ICONE_MODO = 'flex size-16 items-center justify-center rounded-full border';
const LABEL_MODO = 'text-center text-[11px] leading-[1.25] font-normal';
const BADGE =
  "absolute top-[-2px] right-1.5 z-[2] flex size-[22px] cursor-pointer items-center justify-center rounded-full p-0 font-semibold after:absolute after:-inset-[11px] after:content-['']";

const ABAS_INFERIORES = ['estudo', 'ia', 'noite', 'mais'];
const LABEL_ABA = {
  estudo: 'Estudo',
  ia: 'IA',
  noite: 'Noite',
  mais: 'Mais',
};

export function ConfigScreen() {
  const navigate = useNavigate();
  const onVoltar = () => navigate('/');
  const [abaAtiva, setAbaAtiva] = useState('mais');
  const { ativos, inativos, editando, alternarModo, alternarEdicao, dialogoConfirmacao } = useModosCamera();

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-cam-fundo font-camera">
      <BarraStatus className="z-20 flex-none bg-black/40" />

      <header className="flex h-[52px] flex-none items-center justify-between border-b border-white/6 bg-[rgba(13,13,20,0.95)] px-5">
        <h1 className="text-[17px] font-semibold tracking-[-0.01em] text-white/90">Modos</h1>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center border-0 bg-transparent px-1 text-[15px] font-medium text-cam-azul"
            onClick={alternarEdicao}
          >
            {editando ? 'Concluído' : 'Editar'}
          </button>
          <button
            type="button"
            className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center border-0 bg-transparent px-1 text-[15px] leading-none font-medium text-white/55"
            onClick={onVoltar}
          >
            Voltar
          </button>
        </div>
      </header>

      <section className="flex-1 overflow-y-auto bg-cam-fundo px-5 pt-6 pb-4 [&::-webkit-scrollbar]:w-0">
        <div className="grid grid-cols-3 gap-x-4 gap-y-6">
          {ativos.map((item) => (
            <article key={item.nome} className="relative flex flex-col items-center gap-2">
              <button
                type="button"
                className={`${BADGE} border-0 bg-[rgba(220,60,60,0.85)] text-[11px] text-white`}
                aria-label={`Remover ${item.nome}`}
                onClick={() => alternarModo(item.nome)}
              >
                ✕
              </button>
              <div
                className={`${ICONE_MODO} ${item.fundo} ${item.custom ? SOMBRA_CUSTOM : (item.sombra ?? '')}`}
              >
                {item.icone}
              </div>
              <p className={`${LABEL_MODO} ${item.corLabel ?? 'text-white/65'}`}>{item.nome}</p>
            </article>
          ))}

          <div className="col-span-full mt-1 border-t border-white/7 pt-2 pb-1 text-[13px] font-semibold tracking-[0.02em] text-white/45">
            Outros Modos
          </div>

          {inativos.map((item) => (
            <article key={item.nome} className="relative flex flex-col items-center gap-2">
              <button
                type="button"
                className={`${BADGE} border border-[rgba(79,140,255,0.4)] bg-[rgba(79,140,255,0.18)] text-[16px] leading-none text-cam-azul-2`}
                aria-label={`Adicionar ${item.nome}`}
                onClick={() => alternarModo(item.nome)}
              >
                +
              </button>
              <div className={`${ICONE_MODO} ${item.fundo} ${item.sombra ?? ''}`}>{item.icone}</div>
              <p className={`${LABEL_MODO} text-white/65`}>{item.nome}</p>
            </article>
          ))}
        </div>
      </section>

      <nav className="flex h-[52px] flex-none items-center justify-around border-t border-white/6 bg-black/60 px-3">
        {ABAS_INFERIORES.map((aba) => (
          <button
            key={aba}
            type="button"
            className={`flex min-h-11 cursor-pointer items-center gap-[5px] border-0 bg-transparent px-4 py-2.5 text-[12px] whitespace-nowrap ${
              abaAtiva === aba ? 'font-semibold text-white' : 'font-normal text-white/38'
            }`}
            onClick={() => setAbaAtiva(aba)}
          >
            {LABEL_ABA[aba]}
            {aba === 'mais' && <span className="inline-block size-1 rounded-full bg-white" />}
          </button>
        ))}
      </nav>
      {dialogoConfirmacao}
    </div>
  );
}
