import { useCallback, useState } from 'react';
import { BookOpen, Check, ClipboardList, ListChecks } from 'lucide-react';
import { useCalendario } from '../../hooks/useCalendario';
import { useTreinoProva } from '../../hooks/useTreinoProva';
import { Sheet } from '../../components/Sheet';
import { ResumoSelecao } from '../../components/ResumoSelecao';
import { BTN_PRIMARIO, BTN_SECUNDARIO, BTN_TEXTO, CARTAO } from '../../components/estilosBotao';
import { ResumoDetalhe } from '../estudar/ResumoDetalhe';
import { NovoResumoSheet } from '../estudar/NovoResumoSheet';
import { SerieExercicios } from '../exercicios/SerieExercicios';
import { NovoSimuladoSheet } from '../simulado/NovoSimuladoSheet';
import { SimuladoRun } from '../simulado/SimuladoRun';
import { SimuladoResultado } from '../simulado/SimuladoResultado';

const META = 'block text-xs text-text-muted';
const AJUDA = 'm-0 text-[13px] leading-normal text-text-muted';
const TOPO_ETAPA = 'mb-2.5 flex items-center gap-2 text-sm [&>svg]:flex-none [&>svg]:text-accent';

function rotuloDia(dia, hoje) {
  return dia === hoje ? 'Hoje' : dia.split('-').reverse().slice(0, 2).join('/');
}

export function PlanoProva({ eventoId, onFechar }) {
  const { eventos, planoDaProva, atualizarProgressoPlano } = useCalendario();
  const { montarTreino, ocupado, erro: erroTreino } = useTreinoProva();
  const [selecionados, setSelecionados] = useState(null);
  const [editando, setEditando] = useState(false);
  const [abertoId, setAbertoId] = useState(null);
  const [criando, setCriando] = useState(false);
  const [serie, setSerie] = useState(null);
  const [novoSimulado, setNovoSimulado] = useState(false);
  const [simulado, setSimulado] = useState(null);
  const [resultadoId, setResultadoId] = useState(null);
  const [erro, setErro] = useState('');

  const evento = eventos.find((e) => e.id === eventoId);

  const concluirTreino = useCallback(
    () => atualizarProgressoPlano(eventoId, { treinoConcluido: true }),
    [atualizarProgressoPlano, eventoId],
  );
  const finalizarSimulado = useCallback(
    (id) => {
      atualizarProgressoPlano(eventoId, { simuladoId: id });
      setSimulado(null);
      setResultadoId(id);
    },
    [atualizarProgressoPlano, eventoId],
  );

  if (!evento) {
    return (
      <Sheet titulo="Preparação para a prova" onFechar={onFechar}>
        <p className={AJUDA}>Essa prova não existe mais.</p>
      </Sheet>
    );
  }

  const plano = planoDaProva(evento, selecionados);
  const { escolhidos, ordenados, revisados, concluidas, faltam, datas, hoje } = plano;
  const configurando = editando || !plano.configurado;
  const aberto = ordenados.find((r) => r.id === abertoId);
  const semMateria = evento.materiaId === undefined;

  function alternarRevisado(resumoId) {
    const ok = atualizarProgressoPlano(eventoId, (atual) => {
      const marcados = atual.revisadosIds ?? [];
      return { revisadosIds: marcados.includes(resumoId) ? marcados.filter((id) => id !== resumoId) : [...marcados, resumoId] };
    });
    if (!ok) setErro('Não foi possível marcar a revisão. Tente novamente.');
  }

  function salvarPlano() {
    setErro('');
    const ok = atualizarProgressoPlano(eventoId, {
      resumoIds: escolhidos.map((r) => r.id),
      revisadosIds: [],
      treinoConcluido: false,
      simuladoId: undefined,
    });
    if (ok) {
      setEditando(false);
      setSelecionados(null);
    } else {
      setErro('Não foi possível salvar o plano. Tente novamente.');
    }
  }

  async function praticar() {
    setErro('');
    const questoes = await montarTreino(ordenados);
    if (questoes) setSerie(questoes);
  }

  const mensagemErro = erro || erroTreino;

  return (
    <Sheet titulo="Me preparar para esta prova" onFechar={onFechar}>
      <section className="mb-3 grid gap-3 rounded-lg bg-accent-soft p-4.5">
        <span className="inline-flex items-center gap-[5px] self-start justify-self-start rounded-full border border-prova/25 bg-prova/7 px-[9px] py-[3px] text-[11px] font-semibold whitespace-nowrap text-prova">
          {faltam > 0 ? `Faltam ${faltam} ${faltam === 1 ? 'dia' : 'dias'}` : faltam === 0 ? 'É hoje!' : 'Prova encerrada'}
        </span>
        <h2 className="m-0 text-lg leading-snug font-semibold [overflow-wrap:anywhere]">{evento.titulo}</h2>
        <p className="m-0 text-sm leading-normal text-text-2">Do conteúdo da aula à confiança para a prova.</p>
        {!configurando && (
          <>
            <div
              role="progressbar"
              aria-label="Etapas concluídas"
              aria-valuemin={0}
              aria-valuemax={3}
              aria-valuenow={concluidas}
              className="h-2 overflow-hidden rounded-full bg-surface-3"
            >
              <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${(concluidas / 3) * 100}%` }} />
            </div>
            <span className={META}>{concluidas} de 3 etapas concluídas</span>
          </>
        )}
      </section>

      {configurando ? (
        <div className="flex flex-col gap-3">
          <ResumoSelecao resumos={plano.disponiveis} selecionados={plano.ids} onChange={setSelecionados} />
          <button type="button" className={BTN_SECUNDARIO} onClick={() => setCriando(true)}>
            Criar um resumo
          </button>
          <button type="button" className={`${BTN_PRIMARIO} w-full`} disabled={escolhidos.length === 0} onClick={salvarPlano}>
            Montar meu plano
          </button>
          {editando && (
            <button
              type="button"
              className={BTN_TEXTO}
              onClick={() => {
                setEditando(false);
                setSelecionados(null);
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      ) : (
        <>
          <button
            type="button"
            className={`${BTN_SECUNDARIO} w-full`}
            onClick={() => {
              setSelecionados(evento.resumoIds ?? []);
              setEditando(true);
            }}
          >
            Alterar conteúdo da prova
          </button>
          <p className={`${AJUDA} my-3`}>
            Comece pelos conteúdos com mais erros nos exercícios. Cada etapa pode ser aberta quando você quiser.
          </p>

          <div className="flex flex-col gap-3">
            <section className={CARTAO}>
              <div className={TOPO_ETAPA}>
                <BookOpen size={20} aria-hidden="true" />
                <strong className="flex-1">1. Revisar o material</strong>
                {plano.revisaoFeita && <Check size={18} aria-label="Etapa concluída" />}
              </div>
              <span className={META}>
                {rotuloDia(datas[0], hoje)} · {escolhidos.length} {escolhidos.length === 1 ? 'resumo' : 'resumos'}
              </span>
              {ordenados.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3">
                  <button type="button" className={`${BTN_TEXTO} min-w-0 justify-start px-0 text-left [overflow-wrap:anywhere]`} onClick={() => setAbertoId(r.id)}>
                    {r.titulo}
                  </button>
                  <label className="flex min-h-11 flex-none cursor-pointer items-center gap-2 text-xs text-text-muted">
                    <input
                      type="checkbox"
                      checked={revisados.includes(r.id)}
                      onChange={() => alternarRevisado(r.id)}
                      className="size-[18px] flex-none accent-accent"
                    />
                    Revisado
                  </label>
                </div>
              ))}
              {escolhidos.length === 0 && (
                <p className={`${AJUDA} mt-2`}>Os resumos deste plano não estão mais disponíveis. Altere o conteúdo da prova.</p>
              )}
            </section>

            <section className={`${CARTAO} flex flex-col gap-2`}>
              <div className={`${TOPO_ETAPA} mb-0`}>
                <ListChecks size={20} aria-hidden="true" />
                <strong className="flex-1">2. Praticar questões</strong>
                {plano.treinoConcluido && <Check size={18} aria-label="Etapa concluída" />}
              </div>
              <span className={META}>{rotuloDia(datas[1], hoje)} · Treino com dicas e explicações</span>
              <p className={AJUDA}>Errou? Peça ajuda ao tutor e entenda o raciocínio.</p>
              <button type="button" className={`${BTN_PRIMARIO} w-full`} disabled={ocupado || escolhidos.length === 0} onClick={praticar}>
                {ocupado ? 'Preparando treino…' : plano.treinoConcluido ? 'Praticar novamente' : 'Começar treino'}
              </button>
            </section>

            <section className={`${CARTAO} flex flex-col gap-2`}>
              <div className={`${TOPO_ETAPA} mb-0`}>
                <ClipboardList size={20} aria-hidden="true" />
                <strong className="flex-1">3. Testar seus conhecimentos</strong>
                {plano.simuladoFeito && <Check size={18} aria-label="Etapa concluída" />}
              </div>
              <span className={META}>{rotuloDia(datas[2], hoje)} · Simulado dos conteúdos escolhidos</span>
              <p className={AJUDA}>Responda sem dicas e confira o resultado ao finalizar.</p>
              <button
                type="button"
                className={`${BTN_PRIMARIO} w-full`}
                disabled={escolhidos.length === 0 || semMateria}
                onClick={() => setNovoSimulado(true)}
              >
                Fazer simulado
              </button>
              {semMateria && <p className={AJUDA}>Associe uma matéria à prova no calendário para fazer o simulado.</p>}
              {plano.simuladoFeito && (
                <button type="button" className={`${BTN_SECUNDARIO} w-full`} onClick={() => setResultadoId(evento.simuladoId)}>
                  Ver último resultado
                </button>
              )}
            </section>
          </div>

          {concluidas === 3 && (
            <div className="mt-3 rounded-md bg-ok-soft px-3.5 py-3 text-sm leading-normal">
              <strong>Preparação concluída!</strong>
              <p className="mt-1 mb-0">Você revisou, praticou e testou seus conhecimentos. Pode repetir qualquer etapa para reforçar.</p>
            </div>
          )}
        </>
      )}

      {mensagemErro && (
        <p role="alert" className="mt-3 mb-0 text-[13px] leading-normal text-danger">
          {mensagemErro}
        </p>
      )}

      {aberto && <ResumoDetalhe resumo={aberto} onFechar={() => setAbertoId(null)} />}
      {criando && <NovoResumoSheet materiaInicial={evento.materiaId} onFechar={() => setCriando(false)} />}
      {serie && (
        <SerieExercicios titulo="Treino para a prova" questoes={serie} onFechar={() => setSerie(null)} onConcluir={concluirTreino} />
      )}
      {novoSimulado && (
        <NovoSimuladoSheet
          materiaInicial={evento.materiaId}
          resumoIdsIniciais={escolhidos.map((r) => r.id)}
          onFechar={() => setNovoSimulado(false)}
          onIniciar={(s, aviso) => {
            setNovoSimulado(false);
            setSimulado(s);
            if (aviso) setErro(aviso);
          }}
        />
      )}
      {simulado && <SimuladoRun simulado={simulado} onFechar={() => setSimulado(null)} onFinalizar={finalizarSimulado} />}
      {resultadoId !== null && <SimuladoResultado simuladoId={resultadoId} onFechar={() => setResultadoId(null)} />}
    </Sheet>
  );
}
