import { useCallback, useMemo, useRef, useState } from 'react';
import { useColecao } from './useColecao';
import { montarContextoChat } from '../lib/context';
import { ErroSemChave, MENSAGEM_SEM_CHAVE, enviarMensagemChat, temChaveGemini } from '../lib/gemini';

/**
 * Conversa com a IA. Sem chave, nada é gravado nem enviado (`semChave` vale para a
 * tela avisar de forma persistente). `enviar` devolve `false` quando a mensagem do
 * aluno não foi salva (sem chave ou armazenamento cheio): a API nem é chamada.
 * Se a IA falhar, a pergunta continua salva e `erro` fica na tela até
 * `tentarDeNovo` responder, sem gravar a pergunta outra vez.
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
  // Pergunta já salva que ficou sem resposta: texto e o histórico anterior a ela.
  const [pendente, setPendente] = useState(null);
  const ocupadoRef = useRef(false);
  const semChave = !temChaveGemini();

  const mensagens = useMemo(
    () => [...salvas].sort((a, b) => (a.criadoEm ?? '').localeCompare(b.criadoEm ?? '')),
    [salvas],
  );

  const perguntarIa = useCallback(async (conteudo, historico) => {
    try {
      const contexto = montarContextoChat({ materias, eventos, resumos, anotacoes, fotos });
      const resposta = await enviarMensagemChat(contexto, historico, conteudo);
      adicionarMensagem({ role: 'assistant', texto: resposta, criadoEm: new Date().toISOString() });
      setPendente(null);
    } catch (err) {
      setPendente({ conteudo, historico });
      setErro(err instanceof ErroSemChave ? MENSAGEM_SEM_CHAVE : 'Erro ao gerar, tente novamente.');
    }
  }, [adicionarMensagem, materias, eventos, resumos, anotacoes, fotos]);

  const enviar = useCallback(async (texto) => {
    const conteudo = texto.trim();
    if (!conteudo || ocupadoRef.current) return true;
    if (!temChaveGemini()) return false;
    ocupadoRef.current = true;
    setEnviando(true);
    setErro(null);
    try {
      const historico = mensagens.map((m) => ({ role: m.role, texto: m.texto }));
      const salva = adicionarMensagem({ role: 'user', texto: conteudo, criadoEm: new Date().toISOString() });
      if (salva === null) return false;
      await perguntarIa(conteudo, historico);
    } finally {
      ocupadoRef.current = false;
      setEnviando(false);
    }
    return true;
  }, [mensagens, adicionarMensagem, perguntarIa]);

  const tentarDeNovo = useCallback(async () => {
    if (!pendente || ocupadoRef.current) return;
    ocupadoRef.current = true;
    setEnviando(true);
    setErro(null);
    try {
      await perguntarIa(pendente.conteudo, pendente.historico);
    } finally {
      ocupadoRef.current = false;
      setEnviando(false);
    }
  }, [pendente, perguntarIa]);

  return { mensagens, enviando, erro, semChave, podeTentarDeNovo: pendente !== null, enviar, tentarDeNovo };
}
