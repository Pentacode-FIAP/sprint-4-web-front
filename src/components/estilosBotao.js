// Classes compartilhadas das telas. O Tailwind (preflight) zera botões e campos,
// então tudo que eles precisam para parecer botão ou campo vem daqui.
const BASE_BOTAO =
  'inline-flex cursor-pointer items-center justify-center gap-1.5 text-sm transition-[transform,background-color,border-color,opacity] active:scale-[0.97] disabled:cursor-default';
const PRIMARIO =
  `${BASE_BOTAO} min-h-11 border border-transparent bg-accent font-semibold text-accent-contrast shadow-accent hover:bg-accent-hover disabled:opacity-45 disabled:shadow-none`;
const SECUNDARIO =
  `${BASE_BOTAO} min-h-11 border border-border bg-surface font-medium text-text hover:bg-surface-2 disabled:opacity-45`;
const QUADRADO = 'h-11 w-11 min-w-11 p-0';

// Botões com texto (padding horizontal) e botões só com ícone (44px quadrados).
export const BTN_PRIMARIO = `${PRIMARIO} rounded-md px-4 py-2`;
export const BTN_SECUNDARIO = `${SECUNDARIO} rounded-md px-4 py-2`;
export const BTN_DESTRUTIVO = `${BASE_BOTAO} min-h-11 rounded-md border border-transparent bg-danger px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-45`;
export const BTN_PRIMARIO_ICONE = `${PRIMARIO} ${QUADRADO} rounded-md`;
export const BTN_SECUNDARIO_ICONE = `${SECUNDARIO} ${QUADRADO} rounded-md`;
export const BTN_PRIMARIO_ICONE_REDONDO = `${PRIMARIO} ${QUADRADO} rounded-full`;

export const BTN_ICONE_SUTIL =
  `${BASE_BOTAO} ${QUADRADO} rounded-sm text-text-muted hover:bg-accent-soft hover:text-accent`;
// Ação textual discreta, sem caixa (ex.: "Voltar ao material").
export const BTN_TEXTO =
  `${BASE_BOTAO} min-h-11 rounded-sm px-3 font-semibold text-accent hover:bg-accent-soft`;

const BASE_CAMPO =
  'block w-full min-h-11 border border-border bg-surface px-3 py-2.5 text-base text-text placeholder:text-text-faint focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent md:text-sm';
export const CAMPO = `${BASE_CAMPO} rounded-md`;
export const CAMPO_REDONDO = `${BASE_CAMPO} rounded-full pl-4`;
export const CAMPO_ROTULO = 'mb-1.5 block text-xs font-semibold text-text-2';

// Cartão e pílula das listas de estudo.
export const CARTAO = 'rounded-md border border-border bg-surface p-3.5 shadow-1';
export const PILULA =
  'inline-flex max-w-full items-center rounded-full border border-border bg-surface-2 px-2.5 py-0.5 text-[11px] font-semibold text-text-muted';
