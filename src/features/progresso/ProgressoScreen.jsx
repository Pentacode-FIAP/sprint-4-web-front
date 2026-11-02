import { useState } from 'react';
import { Flame, Settings2, Sparkles, TrendingUp } from 'lucide-react';
import { ScreenHeader } from '../../components/ScreenHeader';
import { EmptyState } from '../../components/EmptyState';
import { Donut } from '../../components/charts/Donut';
import { BarrasSemana } from '../../components/charts/BarrasSemana';
import { BarraProgresso } from '../../components/charts/BarraProgresso';
import { Toast } from '../../components/Toast';
import { BTN_ICONE_SUTIL, BTN_SECUNDARIO, CARTAO } from '../../components/estilosBotao';
import { NIVEIS_DIFICULDADE, ROTULO_DIFICULDADE } from '../../lib/dificuldade';
import { useColecao } from '../../hooks/useColecao';
import { useConfirmacao } from '../../hooks/useConfirmacao';
import { useDadosDemo } from '../../hooks/useDadosDemo';
import { useProgresso } from '../../hooks/useProgresso';
import { notaDoSimulado } from '../../lib/progresso';
import { SimuladoResultado } from '../simulado/SimuladoResultado';
import { MetaSheet } from './MetaSheet';

const TITULO = 'mb-3 text-[13px] font-semibold tracking-wide text-text-2 uppercase';

export function ProgressoScreen() {
  const { itens: tentativas } = useColecao('tentativas');
  const { itens: materias } = useColecao('materias');
  const p = useProgresso();
  const [editandoMeta, setEditandoMeta] = useState(false);
  const [resultadoId, setResultadoId] = useState(null);
  const demo = useDadosDemo();
  const { confirmar, dialogoConfirmacao } = useConfirmacao();

  async function preencherComDadosDeExemplo() {
    if (demo.carregando) return;
    const ok = await confirmar({
      titulo: 'Carregar dados de exemplo',
      descricao: 'Isso substitui tudo o que você tem agora (matérias, fotos, resumos, questões, lembretes e progresso) por dados de demonstração. Essa ação não pode ser desfeita.',
      rotuloConfirmar: 'Substituir meus dados',
      destrutivo: true,
    });
    if (ok) await demo.carregarDemo();
  }

  const nomeMateria = (id) => materias.find((m) => m.id === id)?.nome ?? 'Sem matéria';
  const corMateria = (id) => materias.find((m) => m.id === id)?.cor ?? 'var(--color-accent)';

  const historico = p.simulados.length > 0 && (
    <section className={CARTAO}>
      <h2 className={TITULO}>Últimos simulados</h2>
      <ul className="m-0 flex list-none flex-col p-0">
        {p.simulados.map((s) => (
          <li key={s.id} className="border-b border-border last:border-b-0">
            <button
              type="button"
              onClick={() => setResultadoId(s.id)}
              className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 py-2 text-left text-sm"
            >
              <span className="min-w-0 [overflow-wrap:anywhere]">{nomeMateria(s.materiaId)}</span>
              <span className="flex-none font-mono text-xs text-text-muted tabular-nums">
                {notaDoSimulado(s, tentativas).nota.toFixed(1)} · {new Date(s.iniciadoEm).toLocaleDateString('pt-BR')}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );

  return (
    <>
      <ScreenHeader
        title="Progresso"
        subtitle="Sua ofensiva, suas metas e seu desempenho"
        actions={
          <button
            type="button"
            onClick={() => setEditandoMeta(true)}
            aria-label="Ajustar meta diária"
            title="Meta diária"
            className={BTN_ICONE_SUTIL}
          >
            <Settings2 size={18} strokeWidth={2} />
          </button>
        }
      />

      {tentativas.length === 0 ? (
        <>
          <EmptyState
            Icone={TrendingUp}
            titulo="Seu progresso aparece aqui"
            descricao="Responda seu primeiro exercício e esta tela ganha ofensiva, gráficos e insights sobre onde você está indo bem."
            acao={{
              rotulo: demo.carregando ? 'Preenchendo…' : 'Preencher com dados de exemplo',
              onClick: preencherComDadosDeExemplo,
            }}
          />
          {historico && <div className="pb-6">{historico}</div>}
        </>
      ) : (
        <div className="grid animate-rise-in gap-3 pb-6 lg:grid-cols-2 xl:grid-cols-3">
          <section className={`${CARTAO} flex flex-col items-center gap-2 text-center`}>
            <div className="flex items-center gap-1.5 text-accent">
              <Flame size={22} strokeWidth={2.2} aria-hidden="true" />
              <strong className="font-mono text-3xl leading-none">{p.ofensiva}</strong>
              <span className="text-sm font-semibold">
                {p.ofensiva === 1 ? 'dia seguido' : 'dias seguidos'}
              </span>
            </div>
            <Donut
              pct={(p.feitasHoje / p.meta) * 100}
              tamanho={92}
              rotulo={`${p.feitasHoje} de ${p.meta} questões da meta de hoje`}
            />
            <span className="font-mono text-xs text-text-muted">
              {p.feitasHoje}/{p.meta} hoje
            </span>
          </section>

          <section className={CARTAO}>
            <h2 className={TITULO}>Últimos 7 dias</h2>
            <BarrasSemana dados={p.serie} meta={p.meta} />
          </section>

          <section className={`${CARTAO} flex flex-col items-center gap-2 lg:col-span-2 xl:col-span-1 xl:row-span-2`}>
            <h2 className={`${TITULO} mb-0 self-start`}>Acerto geral</h2>
            <Donut
              pct={p.acerto.pct}
              rotulo={`${p.acerto.pct}% de acerto em ${p.acerto.total} questões`}
            />
            <span className="font-mono text-xs text-text-muted">
              {p.acerto.total} questões respondidas
            </span>
            <div className="mt-2 flex w-full flex-col gap-3 text-left">
              {NIVEIS_DIFICULDADE.filter((n) => p.dificuldades[n].total > 0).map((n) => (
                <BarraProgresso
                  key={n}
                  rotulo={ROTULO_DIFICULDADE[n]}
                  pct={p.dificuldades[n].pct}
                  detalhe={`${p.dificuldades[n].acertos}/${p.dificuldades[n].total}`}
                  cor={`var(--color-${n})`}
                />
              ))}
            </div>
          </section>

          <section className={CARTAO}>
            <h2 className={TITULO}>Por matéria</h2>
            <div className="flex flex-col gap-3">
              {p.materias.map((g) => (
                <BarraProgresso
                  key={g.materiaId ?? 'sem'}
                  rotulo={nomeMateria(g.materiaId)}
                  pct={g.pct}
                  detalhe={`${g.total} ${g.total === 1 ? 'questão' : 'questões'}`}
                  cor={corMateria(g.materiaId)}
                />
              ))}
            </div>
          </section>

          {p.insights.length > 0 && (
            <section className={CARTAO}>
              <h2 className={TITULO}>Insights</h2>
              <ul className="m-0 flex list-none flex-col gap-2 p-0 text-sm leading-normal">
                {p.insights.map((i) => (
                  <li key={i.id} className="rounded-sm bg-accent-soft px-3 py-2">
                    {i.texto}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {historico}

          <button
            type="button"
            onClick={preencherComDadosDeExemplo}
            disabled={demo.carregando}
            className={`${BTN_SECUNDARIO} lg:col-span-2 xl:col-span-3`}
          >
            <Sparkles size={17} strokeWidth={2} aria-hidden="true" />
            {demo.carregando ? 'Preenchendo…' : 'Recarregar dados de exemplo'}
          </button>
        </div>
      )}

      {editandoMeta && (
        <MetaSheet metaAtual={p.meta} onSalvar={p.definirMeta} onFechar={() => setEditandoMeta(false)} />
      )}
      {demo.erro && <Toast message={demo.erro} onClose={demo.limparErro} />}
      {dialogoConfirmacao}
      {resultadoId !== null && (
        <SimuladoResultado simuladoId={resultadoId} onFechar={() => setResultadoId(null)} />
      )}
    </>
  );
}
