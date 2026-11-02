import { dataLocal } from './date';
import { diaLocal } from './progresso';

/**
 * Dados de demonstração, calculados a partir de `hoje` no fuso LOCAL para que o
 * app pareça atual em qualquer dia. Não toca em `localStorage`: quem grava é
 * quem chama, coleção por coleção. Só roda no navegador (as fotos usam canvas).
 */

const CORES = { matematica: '#2563eb', historia: '#b45309', biologia: '#047857', fisica: '#7c3aed' };
const LADO_MAX_FOTO = 400;

/** Gerador determinístico: a demonstração é a mesma toda vez que carrega. */
function criarAleatorio(semente) {
  let s = semente;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** `dias` positivo = passado, negativo = futuro. Nunca devolve um instante depois de `hoje`. */
function momento(hoje, dias, hora = 19) {
  const d = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - dias, hora, 0, 0, 0);
  return d > hoje ? new Date(hoje) : d;
}

const diaEm = (hoje, dias) => dataLocal(new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - dias));

/** Canvas em vez de asset embutido: gera a "foto de caderno" sem rede. JPEG pequeno, para caber no localStorage. */
function criarFotoPlaceholder(titulo, linhas) {
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = LADO_MAX_FOTO;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas indisponível');
  ctx.scale(300 / 720, LADO_MAX_FOTO / 960);
  ctx.fillStyle = '#fdfaf3';
  ctx.fillRect(0, 0, 720, 960);
  ctx.strokeStyle = '#ddd6c4';
  ctx.lineWidth = 1;
  for (let y = 150; y < 920; y += 42) {
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(680, y);
    ctx.stroke();
  }
  ctx.fillStyle = '#1f2937';
  ctx.font = 'bold 34px sans-serif';
  ctx.fillText(titulo, 44, 90);
  ctx.font = '22px sans-serif';
  linhas.forEach((linha, i) => ctx.fillText(linha, 48, 178 + i * 42));
  return canvas.toDataURL('image/jpeg', 0.7);
}

const ITENS_MATEMATICA = [
  { pergunta: 'Qual é o valor de f(x) = x² - 4 quando x = 2?', dificuldade: 'facil', alternativas: ['0', '2', '4', '-4'], correta: 0, resposta: '2² - 4 = 4 - 4 = 0.' },
  { pergunta: 'O gráfico de uma função do 2º grau é chamado de:', dificuldade: 'facil', alternativas: ['Reta', 'Parábola', 'Hipérbole', 'Círculo'], correta: 1, resposta: 'Toda função quadrática tem gráfico em forma de parábola.' },
  { pergunta: 'Na função f(x) = ax² + bx + c, se a > 0 a parábola tem concavidade para:', dificuldade: 'facil', alternativas: ['Baixo', 'Esquerda', 'Cima', 'Direita'], correta: 2, resposta: 'a > 0 abre a concavidade para cima.' },
  { pergunta: 'As raízes de x² - 5x + 6 = 0 são:', dificuldade: 'medio', alternativas: ['1 e 6', '2 e 3', '-2 e -3', '2 e -3'], correta: 1, resposta: 'Fatorando: (x-2)(x-3) = 0, logo x = 2 ou x = 3.' },
  { pergunta: 'O vértice da parábola y = x² - 4x + 3 tem coordenada x igual a:', dificuldade: 'medio', alternativas: ['1', '2', '3', '4'], correta: 1, resposta: 'xv = -b/2a = 4/2 = 2.' },
  { pergunta: 'O discriminante (Δ) de x² + 2x + 5 = 0 é:', dificuldade: 'medio', alternativas: ['16', '4', '-4', '-16'], correta: 3, resposta: 'Δ = b² - 4ac = 4 - 20 = -16.' },
  { pergunta: 'Quantas raízes reais tem a equação x² + 2x + 5 = 0?', dificuldade: 'dificil', alternativas: ['Duas distintas', 'Uma', 'Duas iguais', 'Nenhuma'], correta: 3, resposta: 'Δ < 0 (= -16), então não há raízes reais.' },
  { pergunta: 'Para que valores de k a equação x² - 2x + k = 0 tem raízes reais e distintas?', dificuldade: 'dificil', alternativas: ['k < 1', 'k > 1', 'k = 1', 'k < 0'], correta: 0, resposta: 'Δ > 0 exige 4 - 4k > 0, ou seja, k < 1.' },
];

const ITENS_BIOLOGIA = [
  { pergunta: 'A membrana plasmática é composta principalmente por:', dificuldade: 'facil', alternativas: ['Celulose', 'Bicamada lipídica', 'Amido', 'Colágeno'], correta: 1, resposta: 'A membrana é formada por uma bicamada de fosfolipídios.' },
  { pergunta: 'A organela responsável pela respiração celular é:', dificuldade: 'facil', alternativas: ['Ribossomo', 'Lisossomo', 'Mitocôndria', 'Golgi'], correta: 2, resposta: 'A mitocôndria produz ATP através da respiração celular.' },
  { pergunta: 'Qual estrutura só existe em células vegetais?', dificuldade: 'facil', alternativas: ['Núcleo', 'Parede celular', 'Membrana plasmática', 'Citoplasma'], correta: 1, resposta: 'A parede celular, feita de celulose, é exclusiva das células vegetais.' },
  { pergunta: 'Os ribossomos são responsáveis por:', dificuldade: 'medio', alternativas: ['Digestão celular', 'Síntese de proteínas', 'Fotossíntese', 'Divisão celular'], correta: 1, resposta: 'Os ribossomos traduzem o RNA mensageiro em proteínas.' },
  { pergunta: 'O retículo endoplasmático liso está associado à:', dificuldade: 'medio', alternativas: ['Síntese de proteínas', 'Respiração celular', 'Síntese de lipídios', 'Fotossíntese'], correta: 2, resposta: 'O REL sintetiza lipídios e ajuda na desintoxicação da célula.' },
  { pergunta: 'O núcleo celular contém:', dificuldade: 'medio', alternativas: ['Apenas água', 'Cloroplastos', 'Material genético (DNA)', 'Só proteínas'], correta: 2, resposta: 'O núcleo abriga o DNA, que carrega a informação genética.' },
  { pergunta: 'Em qual fase da mitose os cromossomos se alinham no centro da célula?', dificuldade: 'dificil', alternativas: ['Prófase', 'Metáfase', 'Anáfase', 'Telófase'], correta: 1, resposta: 'Na metáfase os cromossomos se organizam na placa equatorial.' },
  { pergunta: 'A diferença fundamental entre células procariontes e eucariontes é:', dificuldade: 'dificil', alternativas: ['Ausência de citoplasma', 'Ausência de DNA', 'Ausência de núcleo organizado nas procariontes', 'Ausência de membrana plasmática'], correta: 2, resposta: 'Procariontes não têm núcleo delimitado por membrana; eucariontes têm.' },
];

const ITENS_HISTORIA = [
  { pergunta: 'A Revolução Industrial teve início em qual país?', dificuldade: 'facil', alternativas: ['França', 'Inglaterra', 'Alemanha', 'Estados Unidos'], correta: 1, resposta: 'A Inglaterra reunia capital, mão de obra e matéria-prima para iniciar o processo.' },
  { pergunta: 'Qual máquina é símbolo da Primeira Revolução Industrial?', dificuldade: 'facil', alternativas: ['Computador', 'Automóvel', 'Máquina a vapor', 'Avião'], correta: 2, resposta: 'A máquina a vapor, aperfeiçoada por James Watt, moveu a indústria têxtil e os transportes.' },
  { pergunta: 'O êxodo rural durante a Revolução Industrial se refere a:', dificuldade: 'facil', alternativas: ['Migração das cidades para o campo', 'Fim da agricultura', 'Migração do campo para as cidades', 'Criação de novas fazendas'], correta: 2, resposta: 'Trabalhadores deixaram o campo em busca de emprego nas fábricas urbanas.' },
  { pergunta: 'O sistema de produção baseado em fábricas substituiu principalmente:', dificuldade: 'medio', alternativas: ['O comércio marítimo', 'O trabalho artesanal', 'A agricultura de subsistência', 'O escambo'], correta: 1, resposta: 'As fábricas substituíram o modelo artesanal e doméstico de produção.' },
  { pergunta: 'A Segunda Revolução Industrial é marcada pelo uso de:', dificuldade: 'medio', alternativas: ['Vapor e carvão', 'Energia nuclear', 'Eletricidade e petróleo', 'Energia solar'], correta: 2, resposta: 'A partir de 1850, eletricidade e petróleo tornaram-se as novas fontes de energia.' },
  { pergunta: 'As péssimas condições de trabalho nas fábricas levaram ao surgimento de:', dificuldade: 'medio', alternativas: ['Feudalismo', 'Sindicatos e movimentos operários', 'Escravidão colonial', 'Monarquias absolutistas'], correta: 1, resposta: 'Trabalhadores se organizaram em sindicatos para reivindicar direitos.' },
  { pergunta: 'O ludismo foi um movimento que:', dificuldade: 'dificil', alternativas: ['Defendia a industrialização acelerada', 'Criava novas tecnologias', 'Destruía máquinas em protesto ao desemprego', 'Apoiava os donos de fábrica'], correta: 2, resposta: 'Os luditas culpavam as máquinas pelo desemprego e as destruíam em protesto.' },
  { pergunta: 'Um dos principais efeitos sociais da Revolução Industrial foi:', dificuldade: 'dificil', alternativas: ['O fim das cidades', 'A volta ao feudalismo', 'A eliminação do capitalismo', 'O surgimento do proletariado urbano'], correta: 3, resposta: 'A nova classe operária urbana, o proletariado, surgiu do trabalho fabril.' },
];

function gerarLote({ itens, materiaId, origemId, diasAtras, porDia, acerto, hoje, aleatorio }) {
  const lote = [];
  for (const dias of diasAtras) {
    const base = momento(hoje, dias);
    const dia = diaLocal(base);
    for (let i = 0; i < porDia; i++) {
      const itemIndex = i % itens.length;
      const item = itens[itemIndex];
      const correta = item.correta ?? 0;
      const acertou = aleatorio() < acerto;
      const escolha = acertou ? correta : (correta + 1 + Math.floor(aleatorio() * 3)) % 4;
      lote.push({
        origem: 'exercicio',
        origemId,
        itemIndex,
        materiaId,
        dificuldade: item.dificuldade,
        escolha,
        acertou,
        dia,
        respondidoEm: new Date(base.getTime() + i * 45_000).toISOString(),
      });
    }
  }
  return lote;
}

function gerarTentativasDeSimulado({ itens, materiaId, origemId, iniciado, acertos }) {
  return itens.map((item, itemIndex) => {
    const acertou = itemIndex < acertos;
    const correta = item.correta ?? 0;
    return {
      origem: 'simulado',
      origemId,
      itemIndex,
      materiaId,
      dificuldade: item.dificuldade,
      escolha: acertou ? correta : (correta + 1) % 4,
      acertou,
      dia: diaLocal(iniciado),
      respondidoEm: new Date(iniciado.getTime() + itemIndex * 90_000).toISOString(),
    };
  });
}

function intervalo(inicio, fim) {
  const dias = [];
  for (let d = inicio; d >= fim; d--) dias.push(d);
  return dias;
}

const comIds = (lista) => lista.map((item, i) => ({ id: i + 1, ...item }));

/**
 * Monta todas as coleções do app, já com `id`. As datas partem de `hoje` e o
 * estado do plano de prova bate com o resto: a prova de Funções tem o resumo
 * revisado, o treino feito e o simulado de Matemática (id 1) como teste final.
 */
export async function montarDadosDemo(hoje = new Date()) {
  const aleatorio = criarAleatorio(20260915);

  const materias = comIds([
    { nome: 'Matemática', cor: CORES.matematica },
    { nome: 'História', cor: CORES.historia },
    { nome: 'Biologia', cor: CORES.biologia },
    { nome: 'Física', cor: CORES.fisica },
  ]);
  const [matematicaId, historiaId, biologiaId, fisicaId] = materias.map((m) => m.id);

  const fotos = comIds([
    {
      dataUrl: criarFotoPlaceholder('Bhaskara', [
        'x = (-b ± √Δ) / 2a', 'Δ = b² - 4ac', '', 'Ex: x² - 5x + 6 = 0', 'Δ = 25 - 24 = 1', 'x = (5 ± 1) / 2 → 2 ou 3',
      ]),
      materiaId: matematicaId,
      dataUpload: momento(hoje, 6).toISOString(),
      ocrText: 'x = (-b ± √Δ) / 2a\nΔ = b² - 4ac\n\nEx: x² - 5x + 6 = 0\nΔ = 25 - 24 = 1\nx = (5 ± 1) / 2 → 2 ou 3',
    },
    {
      dataUrl: criarFotoPlaceholder('Célula', [
        'Membrana plasmática', 'Núcleo → DNA', 'Mitocôndria → ATP', 'Ribossomo → proteínas', 'REL → lipídios',
      ]),
      materiaId: biologiaId,
      dataUpload: momento(hoje, 4).toISOString(),
      ocrText: 'Membrana plasmática\nNúcleo → DNA\nMitocôndria → ATP\nRibossomo → proteínas\nREL → lipídios',
    },
  ]);
  const [fotoMatId, fotoBioId] = fotos.map((f) => f.id);

  const resumos = comIds([
    {
      titulo: 'Funções do 2º grau',
      materiaId: matematicaId,
      conteudo:
        'Uma função do 2º grau tem a forma f(x) = ax² + bx + c, com a ≠ 0. Seu gráfico é uma parábola: ' +
        'concavidade para cima quando a > 0, para baixo quando a < 0. As raízes (quando existem) são dadas ' +
        'pela fórmula de Bhaskara, usando o discriminante Δ = b² - 4ac. Se Δ > 0 há duas raízes reais e ' +
        'distintas, se Δ = 0 há uma raiz dupla, e se Δ < 0 não há raízes reais.',
      fotoIds: [fotoMatId],
      criadoEm: momento(hoje, 6).toISOString(),
    },
    {
      titulo: 'Citologia: estrutura da célula',
      materiaId: biologiaId,
      conteudo:
        'A célula é a unidade básica da vida. A membrana plasmática, formada por uma bicamada lipídica, ' +
        'controla a entrada e saída de substâncias. O núcleo guarda o DNA. A mitocôndria realiza a ' +
        'respiração celular, produzindo ATP. Os ribossomos sintetizam proteínas, e o retículo ' +
        'endoplasmático liso sintetiza lipídios.',
      fotoIds: [fotoBioId],
      criadoEm: momento(hoje, 4).toISOString(),
    },
    {
      titulo: 'Revolução Industrial',
      materiaId: historiaId,
      conteudo:
        'Iniciada na Inglaterra no fim do século XVIII, a Revolução Industrial substituiu a produção ' +
        'artesanal pelo sistema fabril. A máquina a vapor foi central na Primeira Revolução; a partir de ' +
        '1850, eletricidade e petróleo marcaram a Segunda. O processo gerou êxodo rural, formação do ' +
        'proletariado urbano e, em resposta às condições de trabalho, os primeiros sindicatos.',
      fotoIds: [],
      criadoEm: momento(hoje, 20).toISOString(),
    },
  ]);
  const [resumoMatId, resumoBioId, resumoHistId] = resumos.map((r) => r.id);

  const exercicios = comIds([
    { resumoId: resumoMatId, itens: ITENS_MATEMATICA, criadoEm: momento(hoje, 6).toISOString() },
    { resumoId: resumoBioId, itens: ITENS_BIOLOGIA, criadoEm: momento(hoje, 4).toISOString() },
    { resumoId: resumoHistId, itens: ITENS_HISTORIA, criadoEm: momento(hoje, 20).toISOString() },
  ]);
  const [exercicioMatId, exercicioBioId, exercicioHistId] = exercicios.map((e) => e.id);

  const simuladoMatIniciado = momento(hoje, 3, 15);
  const simuladoBioIniciado = momento(hoje, 6, 16);
  const simulados = comIds([
    {
      materiaId: matematicaId,
      resumoIds: [resumoMatId],
      itens: ITENS_MATEMATICA,
      qtd: ITENS_MATEMATICA.length,
      nivel: 'misto',
      minutos: 30,
      iniciadoEm: simuladoMatIniciado.toISOString(),
      finalizadoEm: new Date(simuladoMatIniciado.getTime() + 22 * 60_000).toISOString(),
    },
    {
      materiaId: biologiaId,
      resumoIds: [resumoBioId],
      itens: ITENS_BIOLOGIA.slice(0, 5),
      qtd: 5,
      nivel: 'misto',
      iniciadoEm: simuladoBioIniciado.toISOString(),
      finalizadoEm: new Date(simuladoBioIniciado.getTime() + 18 * 60_000).toISOString(),
    },
  ]);
  const [simuladoMatId, simuladoBioId] = simulados.map((s) => s.id);

  const eventos = comIds([
    // Plano completo: resumo revisado, treino feito e simulado de Matemática como teste final.
    {
      titulo: 'Prova de Funções do 2º Grau', data: diaEm(hoje, -5), materiaId: matematicaId, tipo: 'prova',
      resumoIds: [resumoMatId], revisadosIds: [resumoMatId], treinoConcluido: true, simuladoId: simuladoMatId,
    },
    { titulo: 'Entrega de lista de exercícios', data: diaEm(hoje, -2), materiaId: matematicaId, tipo: 'atividade' },
    { titulo: 'Revisão de Citologia', data: diaEm(hoje, -1), materiaId: biologiaId, tipo: 'revisao' },
    // Plano montado, ainda sem nenhuma etapa feita.
    {
      titulo: 'Prova de Citologia', data: diaEm(hoje, -10), materiaId: biologiaId, tipo: 'prova',
      resumoIds: [resumoBioId], revisadosIds: [], treinoConcluido: false,
    },
    { titulo: 'Seminário de Revolução Industrial', data: diaEm(hoje, -7), materiaId: historiaId, tipo: 'atividade' },
    {
      titulo: 'Prova de História', data: diaEm(hoje, -14), materiaId: historiaId, tipo: 'prova',
      resumoIds: [resumoHistId], revisadosIds: [], treinoConcluido: false,
    },
    // Sem resumos de Física: o plano pede para escolher o conteúdo.
    { titulo: 'Prova de Física — Cinemática', data: diaEm(hoje, -20), materiaId: fisicaId, tipo: 'prova' },
  ]);

  const anotacoes = comIds([
    {
      titulo: 'Dúvida sobre Bhaskara',
      conteudo: 'Ainda confundo o sinal do discriminante quando ele é negativo. Perguntar pro professor.',
      materiaId: matematicaId, resumoId: resumoMatId, data: momento(hoje, 2).toISOString(),
    },
    {
      titulo: 'Ideia pro seminário',
      conteudo: 'Trazer exemplos de fábricas têxteis inglesas do século 18 pra ilustrar a apresentação.',
      materiaId: historiaId, resumoId: resumoHistId, data: momento(hoje, 1).toISOString(),
    },
  ]);

  const chatMessages = comIds([
    { role: 'user', texto: 'Pode revisar rapidamente Bhaskara comigo?', criadoEm: momento(hoje, 0, 10).toISOString() },
    {
      role: 'assistant',
      texto: 'Claro! Δ = b² - 4ac. Se Δ > 0, duas raízes reais e distintas: x = (-b ± √Δ) / 2a. Quer que eu monte um exemplo com seu resumo de Funções do 2º grau?',
      criadoEm: momento(hoje, 0, 10).toISOString(),
    },
    { role: 'user', texto: 'Quais tópicos de Citologia caem mais?', criadoEm: momento(hoje, 0, 11).toISOString() },
    {
      role: 'assistant',
      texto: 'Pelas suas anotações, organelas e suas funções (mitocôndria, ribossomo, núcleo) aparecem mais. Vale revisar também as fases da mitose.',
      criadoEm: momento(hoje, 0, 11).toISOString(),
    },
  ]);

  const lote = (params) => gerarLote({ ...params, hoje, aleatorio });
  const tentativas = comIds([
    // Semana anterior: volume alto, acerto mais baixo, base para o "seu acerto subiu" da semana atual.
    ...lote({ itens: ITENS_MATEMATICA, materiaId: matematicaId, origemId: exercicioMatId, diasAtras: intervalo(13, 7), porDia: 10, acerto: 0.55 }),
    // Esta semana: acerto melhor, e hoje fica mais fraco de propósito para alimentar a fila de revisão.
    ...lote({ itens: ITENS_MATEMATICA, materiaId: matematicaId, origemId: exercicioMatId, diasAtras: intervalo(6, 1), porDia: 9, acerto: 0.8 }),
    ...lote({ itens: ITENS_MATEMATICA, materiaId: matematicaId, origemId: exercicioMatId, diasAtras: [0], porDia: 8, acerto: 0.5 }),
    ...lote({ itens: ITENS_BIOLOGIA, materiaId: biologiaId, origemId: exercicioBioId, diasAtras: intervalo(5, 1), porDia: 4, acerto: 0.75 }),
    ...lote({ itens: ITENS_BIOLOGIA, materiaId: biologiaId, origemId: exercicioBioId, diasAtras: [0], porDia: 8, acerto: 0.5 }),
    // História parada há mais de uma semana: dispara o insight de matéria parada.
    ...lote({ itens: ITENS_HISTORIA, materiaId: historiaId, origemId: exercicioHistId, diasAtras: intervalo(20, 16), porDia: 3, acerto: 0.6 }),
    ...gerarTentativasDeSimulado({ itens: ITENS_MATEMATICA, materiaId: matematicaId, origemId: simuladoMatId, iniciado: simuladoMatIniciado, acertos: 6 }),
    ...gerarTentativasDeSimulado({ itens: ITENS_BIOLOGIA.slice(0, 5), materiaId: biologiaId, origemId: simuladoBioId, iniciado: simuladoBioIniciado, acertos: 3 }),
  ]);

  return { materias, eventos, fotos, resumos, exercicios, anotacoes, chatMessages, tentativas, simulados };
}
