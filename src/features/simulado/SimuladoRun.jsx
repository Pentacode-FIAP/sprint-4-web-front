import { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { QuestaoCard } from '../../components/QuestaoCard';
import { Sheet } from '../../components/Sheet';
import { BTN_PRIMARIO, BTN_SECUNDARIO } from '../../components/estilosBotao';
import { useConfirmacao } from '../../hooks/useConfirmacao';
import { useGuardaSaida } from '../../hooks/useGuardaSaida';
import { useSimulado } from '../../hooks/useSimulado';

function mmss(segundos) {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function SimuladoRun({ simulado, onFinalizar, onFechar }) {
  const prova = useSimulado(simulado);
  const { indice, respostas, restanteSeg, finalizado, finalizando, erro } = prova;
  const { confirmar, dialogoConfirmacao } = useConfirmacao();
  const total = simulado.itens.length;
  const emBranco = respostas.filter((r) => r === undefined).length;

  // Idempotente: o tempo esgotado também finaliza por dentro do hook.
  useEffect(() => {
    if (finalizado) onFinalizar(simulado.id);
  }, [finalizado, onFinalizar, simulado.id]);

  async function tentarFinalizar() {
    if (emBranco > 0) {
      const ok = await confirmar({
        titulo: 'Finalizar simulado',
        descricao: `${emBranco} ${emBranco === 1 ? 'questão está' : 'questões estão'} em branco e ${emBranco === 1 ? 'contará' : 'contarão'} como erro.`,
        rotuloConfirmar: 'Finalizar',
      });
      if (!ok) return;
    }
    prova.finalizar();
  }

  // Sair sempre pede confirmação: fechar pelo fundo, Esc ou "voltar" do navegador
  // não pode abandonar a prova em silêncio, nem sem respostas.
  const perguntandoRef = useRef(false);
  async function sair() {
    if (finalizado || perguntandoRef.current) return;
    perguntandoRef.current = true;
    try {
      const ok = await confirmar({
        titulo: 'Sair do simulado',
        descricao:
          emBranco < total
            ? 'A prova não pode ser retomada. Se sair agora, suas respostas serão perdidas.'
            : 'A prova não pode ser retomada. Se sair agora, ela será descartada.',
        rotuloConfirmar: 'Sair',
        destrutivo: true,
      });
      if (!ok) return;
    } finally {
      perguntandoRef.current = false;
    }
    prova.abandonar();
    onFechar();
  }

  useGuardaSaida(!finalizado, sair);

  return (
    <>
      <Sheet
        titulo={restanteSeg === null ? 'Simulado' : `Simulado · ${mmss(restanteSeg)}`}
        onFechar={sair}
        footer={
          <>
            {erro && (
              <p role="alert" className="mt-0 mb-2.5 text-[13px] leading-normal text-danger">
                {erro}
              </p>
            )}
            <button type="button" className={`${BTN_PRIMARIO} w-full`} onClick={tentarFinalizar} disabled={finalizando}>
              Finalizar simulado
            </button>
          </>
        }
      >
        <div className="mb-[18px] flex flex-wrap gap-1.5" role="group" aria-label="Ir para questão">
          {simulado.itens.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-current={i === indice ? 'true' : undefined}
              aria-label={`Questão ${i + 1}${respostas[i] === undefined ? ', em branco' : ', respondida'}`}
              onClick={() => prova.irPara(i)}
              className={`size-11 cursor-pointer rounded-sm border font-mono text-xs transition-colors ${
                i === indice ? 'border-accent shadow-[0_0_0_2px_var(--color-accent-soft)]' : 'border-border'
              } ${respostas[i] === undefined ? 'bg-surface text-text-muted' : 'bg-accent-soft-2 text-accent'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <QuestaoCard
          key={indice}
          item={simulado.itens[indice]}
          numero={indice + 1}
          total={total}
          escolha={respostas[indice]}
          // Modo prova: nunca revela antes de finalizar.
          revelado={false}
          onEscolher={prova.responder}
        />

        <div className="mt-5 flex justify-between gap-2.5">
          <button type="button" className={BTN_SECUNDARIO} onClick={() => prova.irPara(indice - 1)} disabled={indice === 0}>
            <ChevronLeft size={17} strokeWidth={2} />
            Anterior
          </button>
          <button type="button" className={BTN_SECUNDARIO} onClick={() => prova.irPara(indice + 1)} disabled={indice + 1 >= total}>
            Próxima
            <ChevronRight size={17} strokeWidth={2} />
          </button>
        </div>
      </Sheet>

      {dialogoConfirmacao}
    </>
  );
}
