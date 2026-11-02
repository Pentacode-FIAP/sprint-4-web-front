import { useEffect, useRef, useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { Toast } from '../../components/Toast';
import { ScreenHeader } from '../../components/ScreenHeader';
import { EmptyState } from '../../components/EmptyState';
import { BTN_PRIMARIO_ICONE_REDONDO, CAMPO_REDONDO } from '../../components/estilosBotao';

const SUGESTOES = [
  'Do que trata meu último resumo?',
  'O que eu tenho pra essa semana?',
  'Me faça uma pergunta de revisão',
];

export function ChatScreen() {
  const { mensagens, enviando, erro, enviar, limpar } = useChat();
  const [texto, setTexto] = useState('');
  const mensagensRef = useRef(null);

  useEffect(() => {
    const el = mensagensRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [mensagens.length, enviando]);

  async function enviarTexto(conteudo) {
    const limpo = conteudo.trim();
    if (!limpo || enviando) return;
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
                  className="min-h-11 cursor-pointer rounded-full border border-border bg-surface px-3.5 py-2 text-[12.5px] text-text-2 hover:border-accent hover:bg-accent-soft hover:text-accent"
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
          aria-label="Mensagem"
          disabled={enviando}
          className={`${CAMPO_REDONDO} flex-1`}
        />
        <button
          type="submit"
          disabled={enviando || !texto.trim()}
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

      {erro && <Toast message={erro} onClose={limpar} />}
    </div>
  );
}
