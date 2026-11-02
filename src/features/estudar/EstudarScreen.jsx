import { useState } from 'react';
import { BookOpen, FileText, ListChecks, Plus } from 'lucide-react';
import { useColecao } from '../../hooks/useColecao';
import { useResumos } from '../../hooks/useResumos';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Segmented } from '../../components/Segmented';
import { EmptyState } from '../../components/EmptyState';
import { ExercicioLista } from '../../components/ExercicioLista';
import { Sheet } from '../../components/Sheet';
import { BTN_PRIMARIO_ICONE, BTN_SECUNDARIO, CARTAO, PILULA } from '../../components/estilosBotao';
import { MateriasScreen } from '../materias/MateriasScreen';
import { AnotacoesSecao } from '../anotacoes/AnotacoesSecao';
import { NovoResumoSheet } from './NovoResumoSheet';
import { ResumoDetalhe } from './ResumoDetalhe';

const ABAS = [
  { id: 'resumos', label: 'Resumos' },
  { id: 'exercicios', label: 'Exercícios' },
  { id: 'anotacoes', label: 'Anotações' },
];

const SUBTITULO = {
  resumos: 'Seu material organizado para estudar',
  exercicios: 'Pratique com base no que você estudou',
  anotacoes: 'Suas ideias, com ou sem resumo',
};

export function EstudarScreen() {
  const { resumos } = useResumos();
  const { itens: exercicios } = useColecao('exercicios');
  const { itens: materias } = useColecao('materias');

  const [visao, setVisao] = useState('resumos');
  const [gerenciandoMaterias, setGerenciandoMaterias] = useState(false);
  const [criando, setCriando] = useState(false);
  const [abertoId, setAbertoId] = useState(null);
  const [resumoId, setResumoId] = useState(undefined);
  const [novaNota, setNovaNota] = useState(false);

  const aberto = resumos.find((r) => r.id === abertoId);
  const ativo = resumoId ?? resumos[0]?.id;
  const exercicioAtivo = exercicios.find((e) => e.resumoId === ativo);

  function materiaNome(id) {
    return materias.find((m) => m.id === id)?.nome ?? 'Sem matéria';
  }

  return (
    <>
      <ScreenHeader
        title="Estudar"
        subtitleBelow
        subtitle={SUBTITULO[visao]}
        actions={
          <>
            <button type="button" className={BTN_SECUNDARIO} onClick={() => setGerenciandoMaterias(true)}>
              <BookOpen size={17} aria-hidden="true" />
              Matérias
            </button>
            {visao !== 'exercicios' && (
              <button
                type="button"
                className={BTN_PRIMARIO_ICONE}
                onClick={() => (visao === 'resumos' ? setCriando(true) : setNovaNota(true))}
                aria-label={visao === 'resumos' ? 'Criar novo resumo' : 'Criar nova nota'}
                title={visao === 'resumos' ? 'Novo resumo' : 'Nova nota'}
              >
                <Plus size={20} strokeWidth={2.2} />
              </button>
            )}
          </>
        }
      />

      <div>
        <Segmented itens={ABAS} valor={visao} onChange={setVisao} rotulo="Seção de estudo" />

        {visao === 'resumos' &&
          (resumos.length === 0 ? (
            <EmptyState
              Icone={FileText}
              titulo="Nenhum resumo ainda"
              descricao="Use as fotos da galeria para criar seu primeiro resumo."
              acao={{ rotulo: 'Criar primeiro resumo', onClick: () => setCriando(true) }}
            />
          ) : (
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              {resumos.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => setAbertoId(r.id)}
                    className={`${CARTAO} w-full cursor-pointer text-left hover:border-border-strong`}
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <span className="min-w-0 text-sm font-semibold [overflow-wrap:anywhere]">{r.titulo}</span>
                      <span className={`${PILULA} flex-none`}>{materiaNome(r.materiaId)}</span>
                    </div>
                    <span className="mt-2 block text-xs text-text-muted tabular-nums">
                      {r.fotoIds.length} {r.fotoIds.length === 1 ? 'foto' : 'fotos'} ·{' '}
                      {new Date(r.criadoEm).toLocaleDateString('pt-BR')}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ))}

        {visao === 'exercicios' &&
          (resumos.length === 0 ? (
            <EmptyState
              Icone={ListChecks}
              titulo="Sem exercícios"
              descricao="Os exercícios saem de um resumo. Crie um resumo primeiro e depois gere as questões."
              acao={{ rotulo: 'Ir para Resumos', onClick: () => setVisao('resumos') }}
            />
          ) : (
            <>
              <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-2">
                {resumos.map((r) => {
                  const qtd = exercicios.find((e) => e.resumoId === r.id)?.itens.length ?? 0;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      aria-pressed={ativo === r.id}
                      onClick={() => setResumoId(r.id)}
                      className="flex min-h-11 flex-none cursor-pointer flex-col items-start justify-center gap-0.5 rounded-md border border-border bg-surface px-3 py-1.5 text-[13px] font-medium shadow-1 aria-pressed:border-accent aria-pressed:bg-accent-soft"
                    >
                      {r.titulo}
                      <span className="text-[11px] font-normal text-text-muted">
                        {qtd === 0 ? 'sem exercícios' : `${qtd} exercícios`}
                      </span>
                    </button>
                  );
                })}
              </div>

              {exercicioAtivo ? (
                <ExercicioLista itens={exercicioAtivo.itens} />
              ) : (
                <EmptyState
                  Icone={ListChecks}
                  titulo="Nada gerado ainda"
                  descricao="Esse resumo ainda não tem exercícios. Abra ele para gerar."
                  acao={{ rotulo: 'Abrir resumo', onClick: () => setAbertoId(ativo) }}
                />
              )}
            </>
          ))}

        {visao === 'anotacoes' && <AnotacoesSecao novoAberto={novaNota} onFecharNovo={() => setNovaNota(false)} />}
      </div>

      {gerenciandoMaterias && (
        <Sheet titulo="Matérias" onFechar={() => setGerenciandoMaterias(false)}>
          <MateriasScreen />
        </Sheet>
      )}
      {criando && <NovoResumoSheet onFechar={() => setCriando(false)} />}
      {aberto && <ResumoDetalhe resumo={aberto} onFechar={() => setAbertoId(null)} />}
    </>
  );
}
