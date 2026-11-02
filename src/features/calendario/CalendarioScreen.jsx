import { useState } from 'react';
import { CalendarPlus, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { useCalendario } from '../../hooks/useCalendario';
import { useConfirmacao } from '../../hooks/useConfirmacao';
import { dataLocal } from '../../lib/date';
import { EventoForm } from './EventoForm';
import { PlanoProva } from './PlanoProva';
import { ScreenHeader } from '../../components/ScreenHeader';
import { EmptyState } from '../../components/EmptyState';
import { BTN_ICONE_SUTIL, BTN_PRIMARIO, BTN_PRIMARIO_ICONE } from '../../components/estilosBotao';

const DIAS_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const ROTULO_TIPO = { prova: 'Prova', atividade: 'Atividade', revisao: 'Revisão' };

// Classes completas (não montadas por template) para o Tailwind enxergá-las.
const PILL_TIPO = {
  prova: 'border-prova/25 bg-prova/7 text-prova',
  atividade: 'border-atividade/25 bg-atividade/7 text-atividade',
  revisao: 'border-revisao/25 bg-revisao/7 text-revisao',
};
const PONTO_TIPO = { prova: 'bg-prova', atividade: 'bg-atividade', revisao: 'bg-revisao' };

export function CalendarioScreen() {
  const {
    mes, dias, hoje, proximos, materiaNome,
    irParaMesAnterior, irParaProximoMes,
    eventosDoDia, salvarEvento, removerEvento,
  } = useCalendario();
  const [selecionado, setSelecionado] = useState(() => dataLocal(new Date()));
  const [formAberto, setFormAberto] = useState(false);
  const [eventoEditando, setEventoEditando] = useState(undefined);
  const [planoId, setPlanoId] = useState(null);
  const { confirmar, dialogoConfirmacao } = useConfirmacao();

  function novoLembrete() {
    setEventoEditando(undefined);
    setFormAberto(true);
  }

  function editarEvento(evento) {
    setEventoEditando(evento);
    setFormAberto(true);
  }

  async function excluirEvento(evento) {
    const ok = await confirmar({
      titulo: 'Excluir lembrete',
      descricao: `“${evento.titulo}” será removido do calendário. Essa ação não pode ser desfeita.`,
      rotuloConfirmar: 'Excluir',
      destrutivo: true,
    });
    if (ok) removerEvento(evento.id);
  }

  return (
    <>
      <ScreenHeader
        title="Calendário"
        subtitle="Provas, entregas e revisões"
        actions={
          <button
            type="button"
            onClick={novoLembrete}
            aria-label="Criar novo lembrete"
            title="Novo lembrete"
            className={BTN_PRIMARIO_ICONE}
          >
            <CalendarPlus size={20} strokeWidth={2} />
          </button>
        }
      />

      <div className="pb-6">
        <div className="rounded-lg border border-border bg-surface px-2.5 py-3 shadow-1">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={irParaMesAnterior}
              aria-label="Mês anterior"
              className={BTN_ICONE_SUTIL}
            >
              <ChevronLeft size={19} strokeWidth={2.2} />
            </button>
            <span className="text-[15px] font-semibold" aria-live="polite">
              {MESES[mes.mes]} {mes.ano}
            </span>
            <button
              type="button"
              onClick={irParaProximoMes}
              aria-label="Próximo mês"
              className={BTN_ICONE_SUTIL}
            >
              <ChevronRight size={19} strokeWidth={2.2} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5" aria-hidden="true">
            {DIAS_SEMANA.map((d, i) => (
              <div key={i} className="pb-1.5 text-center text-[10px] font-semibold tracking-wider text-text-muted">
                {d}
              </div>
            ))}
          </div>

          {/* A key troca a cada mês, então a grade refaz a animação de entrada. */}
          <div key={`${mes.ano}-${mes.mes}`} className="grid animate-fade-in grid-cols-7 gap-0.5">
            {dias.map((data, i) => {
              if (!data) return <div key={i} />;
              const iso = dataLocal(data);
              const doDia = eventosDoDia(iso);
              const ativo = iso === selecionado;
              const ehHoje = iso === hoje;
              const estado = ativo
                ? 'bg-accent font-semibold text-accent-contrast shadow-accent'
                : `bg-transparent hover:bg-surface-2 ${ehHoje ? 'font-bold text-accent shadow-[inset_0_0_0_1.5px_var(--color-accent-soft-2)]' : 'font-medium text-text-2'}`;
              return (
                <button
                  key={i}
                  type="button"
                  aria-pressed={ativo}
                  aria-label={`${data.getDate()} de ${MESES[mes.mes]}${doDia.length ? `, ${doDia.length} lembrete${doDia.length === 1 ? '' : 's'}` : ''}`}
                  onClick={() => setSelecionado(iso)}
                  className={`relative h-11 min-w-0 rounded-sm border-0 p-0 text-[13px] tabular-nums md:h-12 ${estado}`}
                >
                  {data.getDate()}
                  {doDia.length > 0 && (
                    <span className="absolute bottom-[5px] left-1/2 flex -translate-x-1/2 gap-0.5" aria-hidden="true">
                      {doDia.slice(0, 3).map((ev) => (
                        <span
                          key={ev.id}
                          className={`h-1 w-1 rounded-full ${ativo ? 'bg-accent-contrast' : (PONTO_TIPO[ev.tipo] ?? 'bg-text-faint')}`}
                        />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <h3 className="mt-6 mb-2.5 text-[11px] font-semibold tracking-[0.09em] text-text-muted uppercase">Próximos</h3>
        {proximos.length === 0 ? (
          <EmptyState
            Icone={CalendarPlus}
            titulo="Agenda livre"
            descricao="Nenhuma prova, entrega ou revisão marcada daqui pra frente."
            acao={{ rotulo: 'Criar lembrete', onClick: novoLembrete }}
          />
        ) : (
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
            {proximos.map((ev) => (
              <li
                key={ev.id}
                className="flex animate-rise-in flex-wrap items-center gap-3 rounded-md border border-border bg-surface p-3.5 shadow-1"
              >
                <div className="flex h-[46px] w-[46px] flex-none flex-col items-center justify-center rounded-sm bg-surface-2 text-base leading-none font-semibold tabular-nums">
                  {ev.data.slice(8, 10)}
                  <span className="mt-[3px] text-[9px] font-medium tracking-wider text-text-muted">
                    {MESES[Number(ev.data.slice(5, 7)) - 1].slice(0, 3).toUpperCase()}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
                  <span className="text-[15px] leading-snug font-semibold [overflow-wrap:anywhere]">{ev.titulo}</span>
                  <span className="text-xs text-text-muted">{materiaNome(ev.materiaId) ?? 'Sem matéria'}</span>
                  <span
                    className={`mt-1 inline-flex items-center gap-[5px] self-start rounded-full border px-[9px] py-[3px] text-[11px] font-semibold whitespace-nowrap ${PILL_TIPO[ev.tipo] ?? 'border-border bg-surface-2 text-text-muted'}`}
                  >
                    <span className="h-[5px] w-[5px] rounded-full bg-current" aria-hidden="true" />
                    {ROTULO_TIPO[ev.tipo] ?? ev.tipo}
                  </span>
                </div>
                <div className="flex flex-none">
                  <button
                    type="button"
                    onClick={() => editarEvento(ev)}
                    aria-label={`Editar ${ev.titulo}`}
                    className={BTN_ICONE_SUTIL}
                  >
                    <Pencil size={16} strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    onClick={() => excluirEvento(ev)}
                    aria-label={`Excluir ${ev.titulo}`}
                    className={`${BTN_ICONE_SUTIL} hover:bg-danger-soft hover:text-danger`}
                  >
                    <Trash2 size={16} strokeWidth={2} />
                  </button>
                </div>
                {ev.tipo === 'prova' && (
                  <button type="button" className={`${BTN_PRIMARIO} w-full`} onClick={() => setPlanoId(ev.id)}>
                    Me preparar para esta prova
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {formAberto && (
        <EventoForm
          dataInicial={selecionado}
          evento={eventoEditando}
          onSalvar={salvarEvento}
          onFechar={() => setFormAberto(false)}
        />
      )}
      {planoId !== null && <PlanoProva eventoId={planoId} onFechar={() => setPlanoId(null)} />}
      {dialogoConfirmacao}
    </>
  );
}
