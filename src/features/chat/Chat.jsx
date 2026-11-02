import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { useColecao } from '../../hooks/useColecao';
import { montarContextoChat } from '../../lib/context';
import { enviarMensagemChat } from '../../lib/gemini';
import { Toast } from '../../components/Toast';
import { Header } from '../../components/Header';

export function Chat() {
  const { itens: mensagens, adicionar: adicionarMensagem } = useColecao('chatMessages');
  const { itens: materias } = useColecao('materias');
  const { itens: eventos } = useColecao('eventos');
  const { itens: resumos } = useColecao('resumos');
  const { itens: anotacoes } = useColecao('anotacoes');
  const { itens: fotos } = useColecao('fotos');

  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);
  const mensagensRef = useRef(null);

  useEffect(() => {
    const el = mensagensRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [mensagens, enviando]);

  async function enviar() {
    const conteudo = texto.trim();
    if (!conteudo) return;
    setTexto('');
    setEnviando(true);
    setErro(null);
    try {
      const historico = mensagens.map((m) => ({ role: m.role, texto: m.texto }));
      adicionarMensagem({ role: 'user', texto: conteudo, criadoEm: new Date().toISOString() });
      const contexto = montarContextoChat({
        materias, eventos, resumos, anotacoes, fotos,
      });
      const resposta = await enviarMensagemChat(contexto, historico, conteudo);
      adicionarMensagem({ role: 'assistant', texto: resposta, criadoEm: new Date().toISOString() });
    } catch {
      setErro('Erro ao gerar, tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="chat-tela">
      <Header title="Chat com a IA" subtitle="Sabe tudo que você já estudou aqui" />

      <div className="chat-mensagens" ref={mensagensRef}>
        {mensagens.map((m) => (
          <div key={m.id} className={`chat-bolha chat-bolha-${m.role}`}>{m.texto}</div>
        ))}
        {enviando && <div className="chat-bolha chat-bolha-assistant">Pensando...</div>}
      </div>

      <div className="chat-input-row">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && enviar()}
          placeholder="Pergunte algo sobre seus estudos..."
          disabled={enviando}
        />
        <button className="btn-primary" onClick={enviar} disabled={enviando || !texto.trim()}>
          <Send size={18} strokeWidth={2} /> Enviar
        </button>
      </div>

      {erro && <Toast message={erro} onClose={() => setErro(null)} />}
    </div>
  );
}
