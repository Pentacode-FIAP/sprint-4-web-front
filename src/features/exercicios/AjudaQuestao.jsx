import { Lightbulb, Sparkles } from 'lucide-react';
import { Sheet } from '../../components/Sheet';
import { BTN_PRIMARIO, BTN_SECUNDARIO, BTN_TEXTO } from '../../components/estilosBotao';
import { useAjudaQuestao } from '../../hooks/useAjudaQuestao';

export function AjudaQuestao({ item, escolha, revelado, origem, origemId }) {
  const { aberto, abrir, fechar, resposta, erro, tentarDeNovo } = useAjudaQuestao({
    item, escolha, revelado, origem, origemId,
  });
  const rotulo = !revelado
    ? 'Pedir uma dica'
    : escolha === item.correta
      ? 'Entender o raciocínio'
      : 'Me explica por que errei';

  return (
    <>
      <button type="button" className={`${BTN_TEXTO} mt-3`} onClick={abrir}>
        {revelado ? <Sparkles size={17} /> : <Lightbulb size={17} />}
        {rotulo}
      </button>
      {aberto && (
        <Sheet
          titulo={revelado ? 'Vamos entender juntos' : 'Uma dica para começar'}
          onFechar={fechar}
          footer={
            <button type="button" className={`${BTN_PRIMARIO} w-full`} onClick={fechar}>
              {revelado ? 'Entendi, continuar' : 'Voltar e tentar'}
            </button>
          }
        >
          <div className="mb-3.5 rounded-md border border-border bg-surface p-3.5">
            <span className="mb-1.5 block text-xs font-semibold text-text-2">Sua questão</span>
            <p className="m-0 text-sm leading-normal [overflow-wrap:anywhere]">{item.pergunta}</p>
            {revelado && escolha !== undefined && (
              <p className="mt-2 mb-0 text-xs text-text-muted [overflow-wrap:anywhere]">
                Sua escolha: {item.alternativas?.[escolha]}
              </p>
            )}
          </div>
          <div className="rounded-md border border-border bg-surface-2 p-3.5" aria-live="polite">
            <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-text-2">
              <Sparkles size={16} /> Tutor IA
            </span>
            {resposta ? (
              <p className="m-0 text-sm leading-[1.65] whitespace-pre-wrap [overflow-wrap:anywhere]">{resposta}</p>
            ) : erro ? (
              <>
                <p role="alert" className="m-0 mb-3 text-sm leading-normal">{erro}</p>
                <button type="button" className={BTN_SECUNDARIO} onClick={tentarDeNovo}>
                  Tentar novamente
                </button>
              </>
            ) : (
              <p role="status" className="m-0 text-sm text-text-muted">Pensando em como te ajudar…</p>
            )}
          </div>
        </Sheet>
      )}
    </>
  );
}
