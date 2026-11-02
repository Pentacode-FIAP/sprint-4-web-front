import { diaLocal, errosParaRevisar } from '../../lib/progresso';

const JANELA_DIAS = 30;

/**
 * As questões que estão erradas agora, prontas para responder de novo.
 * Pura e síncrona: não chama a IA nem lê o localStorage, recebe as coleções
 * já carregadas e remonta tudo a partir delas.
 *
 * Sem `escopo` é a fila global; com ele, os erros de um simulado ou do
 * exercício de um resumo só.
 */
export function montarFilaRevisao({ tentativas, exercicios, simulados }, escopo, dias = JANELA_DIAS) {
  const pendentes = errosParaRevisar(tentativas, dias, diaLocal(new Date()), escopo);
  if (pendentes.length === 0) return [];

  const porChave = new Map();
  exercicios.forEach((e) => porChave.set(`exercicio:${e.id}`, e));
  simulados.forEach((s) => porChave.set(`simulado:${s.id}`, s));

  return pendentes.flatMap((t) => {
    const item = porChave.get(`${t.origem}:${t.origemId}`)?.itens?.[t.itemIndex];
    // A origem pode ter sido apagada, ou ser um item legado sem alternativas:
    // nos dois casos não há o que responder.
    if (!item || item.alternativas === undefined) return [];
    return [{ item, origem: t.origem, origemId: t.origemId, itemIndex: t.itemIndex, materiaId: t.materiaId }];
  });
}
