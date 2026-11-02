import { useCallback, useMemo, useRef, useState } from 'react';
import { useColecao } from './useColecao';
import { montarContextoChat } from '../lib/context';
import { enviarMensagemChat } from '../lib/gemini';

/**
 * Conversa com a IA. `enviar` devolve `false` só quando a mensagem do aluno não
 * pôde ser salva (armazenamento cheio): nesse caso a API nem é chamada.
 * `limpar` dispensa o erro exibido.
 */
export function useChat() {
  const { itens: salvas, adicionar: adicionarMensagem } = useColecao('chatMessages');
  const { itens: materias } = useColecao('materias');
  const { itens: eventos } = useColecao('eventos');
  const { itens: resumos } = useColecao('resumos');
  const { itens: anotacoes } = useColecao('anotacoes');
  const { itens: fotos } = useColecao('fotos');

  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);
  const ocupadoRef = useRef(false);

  const mensagens = useMemo(
    () => [...salvas].sort((a, b) => (a.criadoEm ?? '').localeCompare(b.criadoEm ?? '')),
    [salvas],
  );

  const enviar = useCallback(async (texto) => {
    const conteudo = texto.trim();
    if (!conteudo || ocupadoRef.current) return true;
    ocupadoRef.current = true;
    setEnviando(true);
    setErro(null);
    try {
      const historico = mensagens.map((m) => ({ role: m.role, texto: m.texto }));
      const salva = adicionarMensagem({ role: 'user', texto: conteudo, criadoEm: new Date().toISOString() });
      if (salva === null) return false;
      const contexto = montarContextoChat({ materias, eventos, resumos, anotacoes, fotos });
      const resposta = await enviarMensagemChat(contexto, historico, conteudo);
      adicionarMensagem({ role: 'assistant', texto: resposta, criadoEm: new Date().toISOString() });
    } catch {
      setErro('Erro ao gerar, tente novamente.');
    } finally {
      ocupadoRef.current = false;
      setEnviando(false);
    }
    return true;
  }, [mensagens, adicionarMensagem, materias, eventos, resumos, anotacoes, fotos]);

  const limpar = useCallback(() => setErro(null), []);

  return { mensagens, enviando, erro, enviar, limpar };
}
