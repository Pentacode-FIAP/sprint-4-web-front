import { useCallback, useEffect, useRef, useState } from 'react';
import { useColecao } from './useColecao';
import { diaLocal } from '../lib/progresso';

const MSG_FALHA_GRAVAR =
  'Não deu pra salvar o simulado. Sua prova continua aberta: libere espaço (apague fotos da Galeria) e finalize de novo.';

/**
 * Uma prova em andamento: tempo, respostas e finalização.
 *
 * O prazo é um instante (`fimEm`), não um contador decrementado: se a aba ficar
 * em segundo plano e o navegador atrasar os timers, o tempo restante continua certo.
 *
 * `finalizar` grava as tentativas numa única escrita e só depois marca o
 * simulado como finalizado. Se a segunda escrita falhar, as tentativas são
 * desfeitas (e, se nem isso der, lembradas em `loteRef`), então tentar de novo
 * nunca duplica tentativas nem infla a nota.
 */
export function useSimulado(simulado) {
  const { adicionarLote, removerLote } = useColecao('tentativas');
  const { atualizar, remover } = useColecao('simulados');
  const total = simulado.itens.length;

  const [indice, setIndice] = useState(0);
  const [respostas, setRespostas] = useState(() => Array(total).fill(undefined));
  const [fimEm] = useState(() => (simulado.minutos ? Date.now() + simulado.minutos * 60_000 : null));
  const calcularRestante = useCallback(
    () => (fimEm === null ? null : Math.max(0, Math.ceil((fimEm - Date.now()) / 1000))),
    [fimEm],
  );
  const [restanteSeg, setRestanteSeg] = useState(calcularRestante);
  const [finalizado, setFinalizado] = useState(false);
  const [finalizando, setFinalizando] = useState(false);
  const [erro, setErro] = useState(null);

  const finalizadoRef = useRef(false);
  const travaRef = useRef(false);
  const autoRef = useRef(false);
  // Tentativas já gravadas desta prova que ainda não foram desfeitas.
  const loteRef = useRef(null);

  const responder = useCallback(
    (alternativa) => {
      // Depois do tempo (ou de uma gravação em andamento) a prova não aceita mudança.
      if (finalizadoRef.current || loteRef.current || calcularRestante() === 0) return;
      setRespostas((atual) => atual.map((r, i) => (i === indice ? alternativa : r)));
    },
    [indice, calcularRestante],
  );

  const irPara = useCallback(
    (i) => setIndice(Math.max(0, Math.min(total - 1, i))),
    [total],
  );

  /** Devolve true se a prova ficou gravada como finalizada. */
  const finalizar = useCallback(() => {
    if (finalizadoRef.current || travaRef.current) return false;
    travaRef.current = true;
    setFinalizando(true);
    setErro(null);
    try {
      if (!loteRef.current) {
        const agora = new Date();
        // Gravadas no fim, não a cada escolha: durante a prova ainda dá para trocar de resposta.
        const tentativas = respostas.flatMap((escolha, i) => {
          if (escolha === undefined) return [];
          return [{
            origem: 'simulado',
            origemId: simulado.id,
            itemIndex: i,
            materiaId: simulado.materiaId,
            dificuldade: simulado.itens[i].dificuldade,
            escolha,
            acertou: escolha === simulado.itens[i].correta,
            dia: diaLocal(agora),
            respondidoEm: agora.toISOString(),
          }];
        });
        let ids = [];
        if (tentativas.length > 0) {
          const gravadas = adicionarLote(tentativas);
          if (!gravadas) {
            setErro(MSG_FALHA_GRAVAR);
            return false;
          }
          ids = gravadas.map((t) => t.id);
        }
        loteRef.current = { ids, instante: agora.toISOString() };
      }

      // O mesmo instante das tentativas: é o corte que separa a prova da revisão.
      if (!atualizar(simulado.id, { finalizadoEm: loteRef.current.instante })) {
        if (removerLote(loteRef.current.ids)) loteRef.current = null;
        setErro(MSG_FALHA_GRAVAR);
        return false;
      }
      finalizadoRef.current = true;
      setFinalizado(true);
      return true;
    } finally {
      travaRef.current = false;
      setFinalizando(false);
    }
  }, [respostas, simulado, adicionarLote, removerLote, atualizar]);

  // Cronômetro.
  useEffect(() => {
    if (fimEm === null || finalizado) return;
    const id = setInterval(() => setRestanteSeg(calcularRestante()), 500);
    return () => clearInterval(id);
  }, [fimEm, finalizado, calcularRestante]);

  // Tempo esgotado: finaliza sozinho, uma vez só. O ref (e não o state) aguenta
  // o efeito duplo do StrictMode; se a gravação falhar, o aluno tenta de novo pelo botão.
  useEffect(() => {
    if (restanteSeg !== 0 || autoRef.current) return;
    autoRef.current = true;
    finalizar();
  }, [restanteSeg, finalizar]);

  /** Sair sem finalizar: a prova não é retomada, então não deixa rastro. */
  const abandonar = useCallback(() => {
    if (finalizadoRef.current) return;
    if (loteRef.current) removerLote(loteRef.current.ids);
    remover(simulado.id);
  }, [removerLote, remover, simulado.id]);

  return {
    indice, respostas, restanteSeg, responder, irPara, finalizar, finalizado,
    finalizando, erro, abandonar,
  };
}
