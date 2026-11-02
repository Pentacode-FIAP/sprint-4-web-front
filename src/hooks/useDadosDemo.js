import { useCallback, useRef, useState } from 'react';
import { useColecao } from './useColecao';
import { useConfig } from './useConfig';
import { montarDadosDemo } from '../lib/seedDemo';

const META_DEMO = 8;
// Fotos primeiro: são o que mais pesa, então uma cota estourada falha logo, sem nada para desfazer.
const ORDEM = ['fotos', 'resumos', 'exercicios', 'simulados', 'tentativas', 'materias', 'eventos', 'anotacoes', 'chatMessages'];

/**
 * Troca todos os dados do app pelos de demonstração. Cada coleção é gravada
 * com `substituir`; se uma gravação falhar (o Provider já mostra o aviso de
 * armazenamento), as já gravadas voltam ao que eram. Devolve true se carregou.
 */
export function useDadosDemo() {
  const colecoes = {
    materias: useColecao('materias'),
    eventos: useColecao('eventos'),
    fotos: useColecao('fotos'),
    resumos: useColecao('resumos'),
    exercicios: useColecao('exercicios'),
    anotacoes: useColecao('anotacoes'),
    chatMessages: useColecao('chatMessages'),
    tentativas: useColecao('tentativas'),
    simulados: useColecao('simulados'),
  };
  const { atualizarConfig } = useConfig();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const ocupadoRef = useRef(false);
  const colecoesRef = useRef(colecoes);
  colecoesRef.current = colecoes;

  const carregarDemo = useCallback(async () => {
    if (ocupadoRef.current) return false;
    ocupadoRef.current = true;
    setCarregando(true);
    setErro(null);
    try {
      const atuais = colecoesRef.current;
      const anteriores = Object.fromEntries(ORDEM.map((nome) => [nome, atuais[nome].itens]));
      const dados = await montarDadosDemo(new Date());
      const gravadas = [];
      let ok = true;
      for (const nome of ORDEM) {
        if (!atuais[nome].substituir(dados[nome])) {
          ok = false;
          break;
        }
        gravadas.push(nome);
      }
      ok = ok && atualizarConfig({ metaDiaria: META_DEMO });
      if (!ok) {
        for (const nome of gravadas.reverse()) atuais[nome].substituir(anteriores[nome]);
      }
      return ok;
    } catch {
      setErro('Não foi possível montar os dados de exemplo. Tente novamente.');
      return false;
    } finally {
      ocupadoRef.current = false;
      setCarregando(false);
    }
  }, [atualizarConfig]);

  return { carregarDemo, carregando, erro, limparErro: () => setErro(null) };
}
