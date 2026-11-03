import { useEffect, useState } from 'react';
import { useColecao } from './useColecao';
import { ErroSemChave, MENSAGEM_SEM_CHAVE, ajudarQuestao } from '../lib/gemini';

const MENSAGEM_FALHA = 'Não consegui responder agora. Tente novamente.';

/** Dica (antes de responder) ou explicação (depois) do tutor de IA para uma questão. */
export function useAjudaQuestao({ item, escolha, revelado, origem, origemId }) {
  const { itens: resumos } = useColecao('resumos');
  const { itens: exercicios } = useColecao('exercicios');
  const { itens: simulados } = useColecao('simulados');
  const [aberto, setAberto] = useState(false);
  const [resposta, setResposta] = useState('');
  const [erro, setErro] = useState('');
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    if (!aberto) return;
    let ativo = true;
    setResposta('');
    setErro('');

    const exercicio = origem === 'exercicio' ? exercicios.find((e) => e.id === origemId) : undefined;
    const simulado = origem === 'simulado' ? simulados.find((s) => s.id === origemId) : undefined;
    const ids = exercicio ? [exercicio.resumoId] : (simulado?.resumoIds ?? []);
    const fonte = resumos
      .filter((r) => ids.includes(r.id))
      .map((r) => `${r.titulo}: ${r.conteudo}`)
      .join('\n\n');

    ajudarQuestao(item, escolha, revelado, fonte).then(
      (texto) => ativo && setResposta(texto),
      (err) => ativo && setErro(err instanceof ErroSemChave ? MENSAGEM_SEM_CHAVE : MENSAGEM_FALHA),
    );
    return () => {
      ativo = false;
    };
    // Resumos/exercícios ficam de fora de propósito: mudar a coleção no meio da
    // conversa não deve refazer a chamada à IA.
  }, [aberto, item, escolha, revelado, origem, origemId, tentativa]);

  return {
    aberto,
    abrir: () => setAberto(true),
    fechar: () => setAberto(false),
    resposta,
    erro,
    tentarDeNovo: () => setTentativa((n) => n + 1),
  };
}
