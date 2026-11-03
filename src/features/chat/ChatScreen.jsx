import { useEffect, useRef, useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { ScreenHeader } from '../../components/ScreenHeader';
import { EmptyState } from '../../components/EmptyState';
import { MENSAGEM_SEM_CHAVE } from '../../lib/gemini';
import { BTN_PRIMARIO_ICONE_REDONDO, BTN_SECUNDARIO, CAMPO_REDONDO } from '../../components/estilosBotao';

const SUGESTOES = [
  'Do que trata meu último resumo?',
  'O que eu tenho pra essa semana?',
  'Me faça uma pergunta de revisão',
];

export function ChatScreen() {
  const { mensagens, enviando, erro, semChave, podeTentarDeNovo, enviar, tentarDeNovo } = useChat();
  const [texto, setTexto] = useState('');
  const mensagensRef = useRef(null);
  const campoRef = useRef(null);
  const devolverFoco = useRef(false);

  useEffect(() => {
    const el = mensagensRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [mensagens.length, enviando]);

  // O campo fica desabilitado enquanto envia e perde o foco: devolve quando liberar.
  useEffect(() => {
    if (enviando || !devolverFoco.current) return;
    devolverFoco.current = false;
    campoRef.current?.focus();
  }, [enviando]);

  async function enviarTexto(conteudo) {
    const limpo = conteudo.trim();
    if (!limpo || enviando || semChave) return;
    devolverFoco.current = true;
    setTexto('');
    // Se a mensagem não foi salva (armazenamento cheio), devolve o texto ao campo.
    if (!(await enviar(limpo))) setTexto(limpo);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ScreenHeader title="Chat com a IA" subtitle="Sabe tudo que você já estudou aqui" />

      <div ref={mensagensRef} className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto py-4">
        {mensagens.length === 0 && !enviando && (
          <div className="my-auto">
            <EmptyState
              Icone={Sparkles}
              titulo="Pergunte qualquer coisa"
              descricao="A IA enxerga seus resumos, anotações e lembretes pra responder com contexto."
            />
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {SUGESTOES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => enviarTexto(s)}
                  disabled={semChave}
                  className="min-h-11 cursor-pointer rounded-full border border-border bg-surface px-3.5 py-2 text-[12.5px] text-text-2 hover:border-accent hover:bg-accent-soft hover:text-accent disabled:cursor-default disabled:opacity-45"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {mensagens.map((m) => (
          <div
            key={m.id}
            className={`max-w-[82%] animate-rise-in px-3.5 py-[11px] text-sm leading-[1.55] whitespace-pre-wrap [overflow-wrap:anywhere] ${
              m.role === 'user'
                ? 'self-end rounded-lg rounded-br-xs bg-accent text-accent-contrast shadow-accent'
                : 'self-start rounded-lg rounded-bl-xs border border-border bg-surface shadow-1'
            }`}
          >
            {m.texto}
          </div>
        ))}

        {enviando && (
          <div
            role="status"
            aria-label="Gerando resposta"
            className="inline-flex items-center gap-1 self-start rounded-lg rounded-bl-xs border border-border bg-surface px-3.5 py-3.5 shadow-1"
          >
            {[0, 150, 300].map((atraso) => (
              <i
                key={atraso}
                aria-hidden="true"
                style={{ animationDelay: `${atraso}ms` }}
                className="h-1.5 w-1.5 animate-typing-dot rounded-full bg-text-faint"
              />
            ))}
          </div>
        )}
      </div>

      {semChave && (
        <p role="status" className="m-0 mb-2.5 flex-none rounded-md border border-border bg-surface-2 px-3.5 py-3 text-[13px] leading-normal text-text-2">
          {MENSAGEM_SEM_CHAVE}
        </p>
      )}
      {erro && (
        <div role="alert" className="mb-2.5 flex flex-none flex-wrap items-center justify-between gap-2 rounded-md border border-danger/35 bg-danger-soft px-3.5 py-3 text-[13px] leading-normal text-danger">
          <span className="min-w-0 [overflow-wrap:anywhere]">{erro}</span>
          {podeTentarDeNovo && (
            <button type="button" onClick={tentarDeNovo} className={BTN_SECUNDARIO}>
              Tentar de novo
            </button>
          )}
        </div>
      )}

      <form
        className="flex flex-none items-end gap-2 border-t border-border pt-2.5"
        onSubmit={(e) => {
          e.preventDefault();
          enviarTexto(texto);
        }}
      >
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Pergunte sobre seus estudos…"
          ref={campoRef}
          aria-label="Mensagem"
          disabled={enviando || semChave}
          className={`${CAMPO_REDONDO} flex-1`}
        />
        <button
          type="submit"
          disabled={enviando || semChave || !texto.trim()}
          aria-label="Enviar mensagem"
          className={BTN_PRIMARIO_ICONE_REDONDO}
        >
          {enviando ? (
            <span className="h-[15px] w-[15px] animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />
          ) : (
            <Send size={18} strokeWidth={2} />
          )}
        </button>
      </form>
    </div>
  );
}
