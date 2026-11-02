import { Sparkles } from 'lucide-react';
import { useNovoSimulado, NIVEIS, QTDS, TEMPOS } from '../../hooks/useNovoSimulado';
import { ResumoSelecao } from '../../components/ResumoSelecao';
import { MateriaSelect } from '../../components/MateriaSelect';
import { Segmented } from '../../components/Segmented';
import { Sheet } from '../../components/Sheet';
import { SkeletonCard } from '../../components/Skeleton';
import { BTN_PRIMARIO, CAMPO_ROTULO } from '../../components/estilosBotao';

/** `onIniciar(simulado, aviso)`: `aviso` diz que saiu com menos questões do que o pedido. */
export function NovoSimuladoSheet({ onFechar, onIniciar, materiaInicial, resumoIdsIniciais }) {
  const s = useNovoSimulado({ materiaInicial, resumoIdsIniciais, onIniciar });

  return (
    <Sheet
      titulo="Novo simulado"
      onFechar={onFechar}
      footer={
        <button
          type="button"
          className={`${BTN_PRIMARIO} w-full`}
          onClick={s.comecar}
          disabled={s.gerando || s.semChave || s.materiaId === undefined || s.fontes.length === 0}
        >
          <Sparkles size={17} strokeWidth={2} />
          Começar simulado
        </button>
      }
    >
      {s.gerando ? (
        <SkeletonCard linhas={4} rotulo="Montando o simulado com IA" />
      ) : (
        <>
          <MateriaSelect value={s.materiaId} onChange={s.escolherMateria} permitirVazio={false} />

          {s.resumos.length > 0 && (
            <ResumoSelecao
              resumos={s.resumos}
              selecionados={s.ids}
              onChange={s.definirResumos}
              legenda="Resumos de fonte"
            />
          )}

          <span className={CAMPO_ROTULO}>Questões</span>
          <Segmented itens={QTDS} valor={s.qtd} onChange={s.setQtd} rotulo="Número de questões" modo="radio" />
          <span className={CAMPO_ROTULO}>Nível</span>
          <Segmented itens={NIVEIS} valor={s.nivel} onChange={s.setNivel} rotulo="Nível das questões" modo="radio" />
          <span className={CAMPO_ROTULO}>Tempo</span>
          <Segmented itens={TEMPOS} valor={s.tempo} onChange={s.setTempo} rotulo="Tempo limite" modo="radio" />

          <p className="m-0 text-[13px] leading-normal text-text-muted">
            {s.semResumo
              ? 'Essa matéria ainda não tem resumo. Crie um resumo antes de montar o simulado.'
              : `${s.fontes.length} ${s.fontes.length === 1 ? 'resumo servirá' : 'resumos servirão'} de fonte.`}
          </p>
        </>
      )}

      {s.erro && (
        <p role="alert" className="mt-3 mb-0 text-[13px] leading-normal text-danger">
          {s.erro}
        </p>
      )}
    </Sheet>
  );
}
