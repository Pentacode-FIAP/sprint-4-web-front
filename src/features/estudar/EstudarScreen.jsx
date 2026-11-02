import { useCallback, useState } from 'react';
import { BookOpen, ClipboardList, FileText, ListChecks, Play, Plus, RotateCcw } from 'lucide-react';
import { useColecao } from '../../hooks/useColecao';
import { useResumos } from '../../hooks/useResumos';
import { useFilaRevisao } from '../../hooks/useFilaRevisao';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Segmented } from '../../components/Segmented';
import { EmptyState } from '../../components/EmptyState';
import { ExercicioLista } from '../../components/ExercicioLista';
import { PreviaQuestoes } from '../../components/PreviaQuestoes';
import { Sheet } from '../../components/Sheet';
import { Toast } from '../../components/Toast';
import { BTN_PRIMARIO, BTN_PRIMARIO_ICONE, BTN_SECUNDARIO, CARTAO, PILULA } from '../../components/estilosBotao';
import { MateriasScreen } from '../materias/MateriasScreen';
import { AnotacoesSecao } from '../anotacoes/AnotacoesSecao';
import { SerieExercicios } from '../exercicios/SerieExercicios';
import { itensLegados, questoesDoExercicio } from '../exercicios/questoes';
import { NovoSimuladoSheet } from '../simulado/NovoSimuladoSheet';
import { SimuladoRun } from '../simulado/SimuladoRun';
import { SimuladoResultado } from '../simulado/SimuladoResultado';
import { NovoResumoSheet } from './NovoResumoSheet';
import { ResumoDetalhe } from './ResumoDetalhe';

const ABAS = [
  { id: 'resumos', label: 'Resumos' },
  { id: 'exercicios', label: 'Exercícios' },
  { id: 'anotacoes', label: 'Anotações' },
];

const SUBTITULO = {
  resumos: 'Seu material organizado para estudar',
  exercicios: 'Questões de múltipla escolha para treinar',
  anotacoes: 'Suas ideias, com ou sem resumo',
};

export function EstudarScreen() {
  const { resumos, exercicioDe } = useResumos();
  const { itens: materias } = useColecao('materias');

  const [visao, setVisao] = useState('resumos');
  const [gerenciandoMaterias, setGerenciandoMaterias] = useState(false);
  const [criando, setCriando] = useState(false);
  const [abertoId, setAbertoId] = useState(null);
  const [resumoId, setResumoId] = useState(undefined);
  const [novaNota, setNovaNota] = useState(false);
  const [respondendo, setRespondendo] = useState(false);
  const [revisando, setRevisando] = useState(false);
  const [revisandoGrupo, setRevisandoGrupo] = useState(false);
  const [configurandoSimulado, setConfigurandoSimulado] = useState(false);
  const [simuladoAtivo, setSimuladoAtivo] = useState(null);
  const [avisoSimulado, setAvisoSimulado] = useState(null);
  const [resultadoId, setResultadoId] = useState(null);
  const fecharAviso = useCallback(() => setAvisoSimulado(null), []);
  const concluirSimulado = useCallback((id) => {
    setSimuladoAtivo(null);
    setResultadoId(id);
  }, []);
  const sairDoSimulado = useCallback(() => setSimuladoAtivo(null), []);

  const aberto = resumos.find((r) => r.id === abertoId);
  const ativo = resumoId ?? resumos[0]?.id;
  const resumoAtivo = resumos.find((r) => r.id === ativo);
  const exercicioAtivo = exercicioDe(ativo);
  const questoes = questoesDoExercicio(exercicioAtivo, resumoAtivo?.materiaId);
  const legados = itensLegados(exercicioAtivo);
  const fila = useFilaRevisao();
  const filaDoResumo = useFilaRevisao(
    exercicioAtivo ? { origem: 'exercicio', origemId: exercicioAtivo.id } : undefined,
  );

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
              <div className="mb-3 grid gap-2 sm:grid-cols-2">
                <button type="button" onClick={() => setConfigurandoSimulado(true)} className={`${BTN_SECUNDARIO} w-full`}>
                  <ClipboardList size={17} strokeWidth={2} />
                  Novo simulado
                </button>
                {fila.length > 0 && (
                  <button type="button" onClick={() => setRevisando(true)} className={`${BTN_SECUNDARIO} w-full`}>
                    <RotateCcw size={17} strokeWidth={2} />
                    Revisar {fila.length} {fila.length === 1 ? 'erro' : 'erros'}
                  </button>
                )}
              </div>

              <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-2">
                {resumos.map((r) => {
                  const qtd = exercicioDe(r.id)?.itens.length ?? 0;
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
                        {qtd === 0 ? 'sem questões' : `${qtd} ${qtd === 1 ? 'questão' : 'questões'}`}
                      </span>
                    </button>
                  );
                })}
              </div>

              {exercicioAtivo ? (
                <div className="flex flex-col gap-2.5">
                  {questoes.length > 0 && (
                    <>
                      <PreviaQuestoes itens={questoes.map((q) => q.item)} />
                      <button type="button" className={`${BTN_PRIMARIO} w-full`} onClick={() => setRespondendo(true)}>
                        <Play size={17} strokeWidth={2} />
                        Responder {questoes.length} {questoes.length === 1 ? 'questão' : 'questões'}
                      </button>
                      {/* Escondido quando a fila global é exatamente esta: dois botões
                          com a mesma contagem lado a lado parecem coisas diferentes. */}
                      {filaDoResumo.length > 0 && filaDoResumo.length !== fila.length && (
                        <button type="button" className={`${BTN_SECUNDARIO} w-full`} onClick={() => setRevisandoGrupo(true)}>
                          <RotateCcw size={16} strokeWidth={2} />
                          Revisar {filaDoResumo.length} {filaDoResumo.length === 1 ? 'erro' : 'erros'} deste resumo
                        </button>
                      )}
                    </>
                  )}
                  {legados.length > 0 && (
                    <>
                      <p className="m-0 text-[13px] leading-normal text-text-muted">
                        Questões antigas, sem alternativas. Elas não entram nas suas estatísticas.
                      </p>
                      <ExercicioLista itens={legados} />
                    </>
                  )}
                </div>
              ) : (
                <EmptyState
                  Icone={ListChecks}
                  titulo="Nada gerado ainda"
                  descricao="Esse resumo ainda não tem questões. Abra ele para escolher quantidade e nível."
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
      {/* Sem checar a contagem da fila aqui: acertar tira a questão da fila, e a série
          não pode se desmontar no meio. O botão que abre já só aparece com fila. */}
      {revisando && (
        <SerieExercicios titulo="Revisar erros" questoes={fila} onFechar={() => setRevisando(false)} />
      )}
      {respondendo && questoes.length > 0 && (
        <SerieExercicios
          titulo={resumoAtivo?.titulo ?? 'Questões'}
          questoes={questoes}
          onFechar={() => setRespondendo(false)}
        />
      )}
      {revisandoGrupo && (
        <SerieExercicios titulo="Revisar erros" questoes={filaDoResumo} onFechar={() => setRevisandoGrupo(false)} />
      )}

      {configurandoSimulado && (
        <NovoSimuladoSheet
          materiaInicial={resumoAtivo?.materiaId}
          onFechar={() => setConfigurandoSimulado(false)}
          onIniciar={(simulado, aviso) => {
            setConfigurandoSimulado(false);
            setSimuladoAtivo(simulado);
            // O aviso precisa sobreviver ao fechamento da configuração, por isso mora aqui.
            if (aviso) setAvisoSimulado(aviso);
          }}
        />
      )}
      {avisoSimulado && <Toast message={avisoSimulado} onClose={fecharAviso} />}
      {simuladoAtivo && (
        <SimuladoRun simulado={simuladoAtivo} onFinalizar={concluirSimulado} onFechar={sairDoSimulado} />
      )}
      {resultadoId !== null && (
        <SimuladoResultado simuladoId={resultadoId} onFechar={() => setResultadoId(null)} />
      )}
    </>
  );
}
