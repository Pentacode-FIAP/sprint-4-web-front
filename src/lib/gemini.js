export const MENSAGEM_SEM_CHAVE =
  'A IA não está disponível nesta execução local. Use o site publicado para testar os recursos de IA.';

export class ErroSemChave extends Error {
  constructor() {
    super(MENSAGEM_SEM_CHAVE);
    this.name = 'ErroSemChave';
  }
}

// Lida a cada chamada (não na carga do módulo) para que o estado "sem chave"
// seja avaliado no momento do uso.
function lerChave() {
  return String(import.meta.env.VITE_GEMINI_API_KEY ?? '').trim();
}

/** O valor de exemplo do .env.example não conta como chave. */
export function temChaveGemini() {
  const chave = lerChave();
  return chave !== '' && chave !== 'coloque_sua_chave_aqui';
}

// 'gemini-3.5-flash-lite' é um modelo fixado (não um alias flutuante), para o
// comportamento continuar previsível ao longo do tempo.
const MODEL = 'gemini-3.5-flash-lite';

function dataUrlParaBase64(dataUrl) {
  const [cabecalho, base64] = dataUrl.split(',');
  const mimeType = cabecalho.match(/data:(.*);base64/)?.[1] ?? 'image/jpeg';
  return { mimeType, base64 };
}

const TIMEOUT_MS = 30_000;

async function callGemini(parts) {
  if (!temChaveGemini()) throw new ErroSemChave();
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${lerChave()}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let res;
  try {
    res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts }] }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('A IA demorou demais pra responder. Tente novamente.');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
  if (!res.ok) {
    throw new Error(`Gemini API error: ${res.status}`);
  }
  const data = await res.json();
  const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof texto !== 'string') {
    throw new Error('Resposta da IA vazia ou inválida');
  }
  return texto;
}

export async function runOcr(dataUrl) {
  const { mimeType, base64 } = dataUrlParaBase64(dataUrl);
  return callGemini([
    { text: 'Extraia todo o texto visível nesta imagem. Preserve fórmulas matemáticas quando possível. Devolva apenas o texto extraído, sem comentários adicionais.' },
    { inline_data: { mime_type: mimeType, data: base64 } },
  ]);
}

export async function gerarResumo(fotos, materiaNome) {
  const parts = [
    { text: `Você é um assistente de estudos. Baseado nestas fotos de anotações da matéria "${materiaNome}", gere um resumo organizado em tópicos, em português, cobrindo os principais conceitos. Devolva em texto simples, sem formatação markdown (sem **, ###, $$, listas com * etc.) — use apenas quebras de linha e numeração simples como "1." para organizar os tópicos, já que o texto é exibido sem renderização de markdown.` },
  ];
  for (const dataUrl of fotos) {
    const { mimeType, base64 } = dataUrlParaBase64(dataUrl);
    parts.push({ inline_data: { mime_type: mimeType, data: base64 } });
  }
  return callGemini(parts);
}

/** Padrão usado por quem chama sem opções. */
const OPCOES_PADRAO = { qtd: 5, nivel: 'misto' };

const NIVEIS = ['facil', 'medio', 'dificil'];

/**
 * O que cada nível significa. Sem isso o modelo calibra sozinho e devolve três
 * questões praticamente iguais rotuladas de forma diferente — a queixa que
 * motivou esta mudança.
 */
const DESCRICAO_NIVEL = {
  facil: 'reconhecimento direto — definição, fórmula ou fato explícito no resumo',
  medio: 'aplicação — usar um conceito do resumo num caso concreto, com um passo de raciocínio',
  dificil: 'análise — combinar dois ou mais conceitos, ou identificar o erro num raciocínio parecido com o certo',
};

function ehItemValido(bruto) {
  if (typeof bruto !== 'object' || bruto === null) return false;
  const item = bruto;
  if (typeof item.pergunta !== 'string' || item.pergunta.trim() === '') return false;
  if (typeof item.resposta !== 'string' || item.resposta.trim() === '') return false;
  if (!NIVEIS.includes(item.dificuldade)) return false;
  if (!Array.isArray(item.alternativas) || item.alternativas.length !== 4) return false;
  if (!item.alternativas.every((alt) => typeof alt === 'string' && alt.trim() !== '')) return false;
  if (!Number.isInteger(item.correta)) return false;
  const correta = item.correta;
  return correta >= 0 && correta <= 3;
}

/**
 * Tolerante por item, estrito no conjunto: um campo torto descarta a questão,
 * não a geração inteira.
 */
export function parseQuestoes(texto) {
  const limpo = texto.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');

  let bruto;
  try {
    bruto = JSON.parse(limpo);
  } catch {
    throw new Error('A IA devolveu uma resposta que não é JSON. Tente novamente.');
  }
  if (!Array.isArray(bruto)) throw new Error('Formato inesperado da IA.');

  const validos = bruto.filter(ehItemValido);
  if (validos.length === 0) {
    throw new Error('Nenhuma questão válida foi gerada. Tente novamente.');
  }
  return validos;
}

export function promptQuestoes(conteudo, opcoes) {
  const instrucaoNivel =
    opcoes.nivel === 'misto'
      ? `Varie a dificuldade entre "facil", "medio" e "dificil", distribuindo de forma equilibrada. Critérios:\n${NIVEIS.map(
          (n) => `- ${n}: ${DESCRICAO_NIVEL[n]}`,
        ).join('\n')}`
      : `TODAS as questões devem ter dificuldade "${opcoes.nivel}", no sentido de: ${DESCRICAO_NIVEL[opcoes.nivel]}.`;

  return `Baseado neste resumo de estudos:

${conteudo}

Gere exatamente ${opcoes.qtd} questões de múltipla escolha.

${instrucaoNivel}

Cada questão tem exatamente 4 alternativas e uma única correta. Os 3 distratores devem ser erros plausíveis que um aluno realmente cometeria (confusão de conceito, sinal trocado, passo pulado) — nunca alternativas absurdas ou obviamente erradas. Não inclua letras nem numeração nas alternativas: só o texto.

O campo "resposta" é a justificativa curta de por que a correta está certa.

Devolva APENAS um JSON válido, sem markdown e sem comentários, no formato:
[{"pergunta": "...", "alternativas": ["...", "...", "...", "..."], "correta": 0, "dificuldade": "facil", "resposta": "..."}]`;
}

export async function gerarExercicios(resumoConteudo, opcoes = OPCOES_PADRAO) {
  const texto = await callGemini([{ text: promptQuestoes(resumoConteudo, opcoes) }]);
  return parseQuestoes(texto);
}

const TAMANHO_LOTE = 10;
const SEPARADOR = '\n\n---\n\n';
/** Abaixo disso não é simulado, é exercício avulso. */
const MINIMO_SIMULADO = 5;

/**
 * Divide a geração em lotes de até 10 questões. Pedir 30 numa chamada só
 * degrada a qualidade e arrisca truncar a resposta.
 *
 * Cada lote recebe um subconjunto diferente dos resumos, então os lotes cobrem
 * material distinto em vez de gerarem as mesmas questões três vezes.
 */
export function montarLotes(resumos, qtd, tamanho = TAMANHO_LOTE) {
  const nLotes = Math.ceil(qtd / tamanho);
  const baldes = Array.from({ length: nLotes }, () => []);
  resumos.forEach((r, i) => baldes[i % nLotes].push(r.conteudo));

  // Com menos resumos que lotes, algum balde fica vazio: ele recebe o material
  // inteiro em vez de gerar questões a partir de nada.
  const todos = resumos.map((r) => r.conteudo).join(SEPARADOR);

  return baldes.map((balde, i) => ({
    conteudo: balde.length > 0 ? balde.join(SEPARADOR) : todos,
    qtd: Math.min(tamanho, qtd - i * tamanho),
  }));
}

export async function gerarSimulado(resumos, opcoes) {
  const lotes = montarLotes(resumos, opcoes.qtd);

  // allSettled, não all: um lote que falha não pode derrubar o simulado inteiro.
  const resultados = await Promise.allSettled(
    lotes.map((lote) => gerarExercicios(lote.conteudo, { qtd: lote.qtd, nivel: opcoes.nivel })),
  );
  const itens = resultados.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));

  if (itens.length < MINIMO_SIMULADO) {
    throw new Error('Não deu pra gerar questões suficientes. Tente novamente.');
  }
  return itens.slice(0, opcoes.qtd);
}

export async function enviarMensagemChat(contexto, historico, mensagem) {
  const prompt = `${contexto}\n\n---\n\nHistórico da conversa:\n${historico
    .map((h) => `${h.role === 'user' ? 'Aluno' : 'IA'}: ${h.texto}`)
    .join('\n')}\n\nAluno: ${mensagem}\n\nResponda como assistente de estudos, em português, de forma direta e útil. Use texto simples, sem formatação markdown (sem **, ###, listas com * etc.), pois a resposta é exibida sem renderização de markdown.`;
  return callGemini([{ text: prompt }]);
}


export async function gerarResumoTexto(texto, materia) {
  return callGemini([{ text: `Organize o material abaixo em um resumo de ${materia}, em português.
Use texto simples com títulos e quebras de linha. Preserve fórmulas e não invente informações.
Material:
${texto}` }]);
}

export function promptAjudaQuestao(item, escolha, revelar, fonte) {
  return `Você é um tutor paciente. Responda em português e texto simples.
${revelar ? 'Explique o raciocínio passo a passo e por que a escolha do aluno está certa ou errada.' : 'Dê somente uma dica curta sobre como começar. Não revele a alternativa correta nem resolva a conta.'}
Material de apoio: ${fonte}
Questão: ${item.pergunta}
Alternativas: ${item.alternativas?.map((a, i) => `${String.fromCharCode(65 + i)}: ${a}`).join(' | ')}
${revelar ? `Escolha do aluno: ${escolha === undefined ? 'em branco' : item.alternativas?.[escolha]}. Gabarito: ${item.resposta}` : ''}`;
}

export async function ajudarQuestao(item, escolha, revelar, fonte) {
  return callGemini([{ text: promptAjudaQuestao(item, escolha, revelar, fonte) }]);
}
