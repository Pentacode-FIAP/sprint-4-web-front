import { ROTULO_DIFICULDADE } from '../lib/dificuldade';

const COR_DIFICULDADE = {
  facil: 'border-facil/25 bg-facil/7 text-facil',
  medio: 'border-medio/25 bg-medio/7 text-medio',
  dificil: 'border-dificil/25 bg-dificil/7 text-dificil',
};

export function PilulaDificuldade({ nivel }) {
  return (
    <span
      className={`inline-flex flex-none items-center gap-[5px] rounded-full border px-[9px] py-[3px] text-[11px] font-semibold whitespace-nowrap before:size-[5px] before:rounded-full before:bg-current before:content-[''] ${COR_DIFICULDADE[nivel] ?? ''}`}
    >
      {ROTULO_DIFICULDADE[nivel]}
    </span>
  );
}
