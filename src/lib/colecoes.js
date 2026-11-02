import { carregar, salvar } from './storage';

export const NOMES_COLECOES = [
  'materias', 'eventos', 'fotos', 'resumos', 'exercicios',
  'anotacoes', 'chatMessages', 'tentativas', 'simulados',
];

export const META_PADRAO = 10;
export const CHAVE_CONFIG = 'estudos:config';

export const chaveColecao = (nome) => `estudos:${nome}`;

export function lerColecao(nome) {
  const valor = carregar(chaveColecao(nome), []);
  return Array.isArray(valor) ? valor : [];
}

export function gravarColecao(nome, itens) {
  return salvar(chaveColecao(nome), itens);
}

export function adicionarItem(itens, dados) {
  const id = itens.reduce((max, i) => (typeof i.id === 'number' && i.id > max ? i.id : max), 0) + 1;
  const item = { id, ...dados };
  return { itens: [...itens, item], item };
}

export function atualizarItem(itens, id, mudancas) {
  return itens.map((i) => (i.id === id ? { ...i, ...mudancas } : i));
}

export function removerItem(itens, id) {
  return itens.filter((i) => i.id !== id);
}

export function lerConfig() {
  const salvo = carregar(CHAVE_CONFIG, null);
  const config = salvo && typeof salvo === 'object' && !Array.isArray(salvo) ? salvo : {};
  return { metaDiaria: META_PADRAO, ...config };
}

export function gravarConfig(config) {
  return salvar(CHAVE_CONFIG, config);
}
