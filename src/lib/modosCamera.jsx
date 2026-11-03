// Modos de câmera de partida (dados da tela de configuração) e o visual dos modos criados pelo aluno.
export const FUNDO_IA =
  'border-[rgba(107,171,255,0.3)] bg-[linear-gradient(145deg,rgba(79,140,255,0.18),rgba(107,171,255,0.08))]';
export const SOMBRA_IA = 'shadow-[0_0_16px_rgba(107,171,255,0.1)]';
export const MODOS_INICIAIS = [
  {
    nome: 'Alta Resolução',
    ativo: true,
    custom: false,
    fundo: 'border-[rgba(250,193,70,0.18)] bg-[rgba(250,193,70,0.08)]',
    icone: (
      <svg width="22" height="18" viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 14.5C21 15.3284 20.3284 16 19.5 16H2.5C1.67157 16 1 15.3284 1 14.5V5.5C1 4.67157 1.67157 4 2.5 4H5.5L7 2H15L16.5 4H19.5C20.3284 4 21 4.67157 21 5.5V14.5Z" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
        <circle cx="11" cy="10" r="3" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
        <circle cx="11" cy="10" r="1.2" fill="rgba(255,255,255,0.5)" />
      </svg>
    ),
  },
  {
    nome: 'Noturno',
    ativo: true,
    custom: false,
    fundo: 'border-[rgba(79,140,255,0.22)] bg-[rgba(79,140,255,0.1)]',
    icone: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 11.5C17.2 15.1 13.9 17.8 10 17.8C5.6 17.8 2 14.3 2 9.9C2 6.3 4.3 3.3 7.5 2.2C6.5 3.5 6 5.1 6 6.8C6 11 9.5 14.4 13.8 14.4C15.4 14.4 16.8 13.9 18 13L18 11.5Z" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    nome: 'Panorâmica',
    ativo: true,
    custom: false,
    fundo: 'border-[rgba(76,175,80,0.18)] bg-[rgba(76,175,80,0.08)]',
    icone: (
      <svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1" width="20" height="12" rx="2" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
        <line x1="7" y1="1" x2="7" y2="13" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
        <line x1="15" y1="1" x2="15" y2="13" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
      </svg>
    ),
  },
  {
    nome: 'Retrato',
    ativo: true,
    custom: false,
    fundo: 'border-[rgba(233,30,99,0.18)] bg-[rgba(233,30,99,0.08)]',
    icone: (
      <svg width="18" height="22" viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="9" cy="7" r="4" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
        <path d="M1 21C1 16.5817 4.58172 13 9 13C13.4183 13 17 16.5817 17 21" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    nome: 'Estudo',
    ativo: true,
    custom: true,
    fundo: 'border-[rgba(51,199,120,0.28)] bg-[rgba(51,199,120,0.1)]',
    corLabel: 'text-cam-verde/85',
    icone: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3H10V17H3V3Z" stroke="rgba(51,199,120,0.9)" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M10 3H17V17H10V3Z" stroke="rgba(51,199,120,0.9)" strokeWidth="1.5" strokeLinejoin="round" />
        <line x1="5" y1="7" x2="8" y2="7" stroke="rgba(51,199,120,0.7)" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="5" y1="10" x2="8" y2="10" stroke="rgba(51,199,120,0.7)" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="12" y1="7" x2="15" y2="7" stroke="rgba(51,199,120,0.7)" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="12" y1="10" x2="15" y2="10" stroke="rgba(51,199,120,0.7)" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    nome: 'IA',
    ativo: true,
    custom: true,
    fundo: FUNDO_IA,
    sombra: SOMBRA_IA,
    corLabel: 'text-cam-azul-2/85',
    icone: <span className="text-[24px] text-cam-azul-2">✦</span>,
  },
  {
    nome: 'Comida',
    ativo: false,
    custom: false,
    fundo: 'border-[rgba(255,152,0,0.18)] bg-[rgba(255,152,0,0.08)]',
    icone: (
      <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 1V7C3 9.209 4.791 11 7 11V19" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M7 1V11" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M11 1C11 1 15 4 15 8C15 10.5 13.5 11.5 11 12V19" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    nome: 'Intervalo',
    ativo: false,
    custom: false,
    fundo: 'border-[rgba(76,175,80,0.18)] bg-[rgba(76,175,80,0.08)]',
    icone: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="11" r="7" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" />
        <path d="M10 8V11L12 13" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M7 2H13" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M10 2V4" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    nome: 'Instantâneo',
    ativo: false,
    custom: false,
    fundo: 'border-[rgba(255,235,59,0.18)] bg-[rgba(255,235,59,0.08)]',
    icone: (
      <svg width="16" height="22" viewBox="0 0 16 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 1L1 13H8L7 21L15 9H8L9 1Z" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    nome: 'Astro',
    ativo: false,
    custom: false,
    fundo: 'border-[rgba(124,77,255,0.22)] bg-[rgba(103,58,183,0.1)]',
    icone: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="11" cy="11" r="9" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" />
        <circle cx="11" cy="11" r="3" stroke="rgba(255,255,255,0.65)" strokeWidth="1.2" />
        <circle cx="4" cy="4" r="1" fill="rgba(255,255,255,0.5)" />
        <circle cx="18" cy="5" r="1" fill="rgba(255,255,255,0.5)" />
        <circle cx="6" cy="18" r="1" fill="rgba(255,255,255,0.5)" />
      </svg>
    ),
  },
  {
    nome: 'Visualização Dupla',
    ativo: false,
    custom: false,
    fundo: 'border-[rgba(0,172,193,0.18)] bg-[rgba(0,188,212,0.08)]',
    icone: (
      <svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1" width="9" height="14" rx="1.5" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" />
        <rect x="12" y="1" width="9" height="14" rx="1.5" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    nome: 'Documento em Ultra HD',
    ativo: false,
    custom: false,
    fundo: 'border-[rgba(171,71,188,0.18)] bg-[rgba(156,39,176,0.08)]',
    icone: (
      <svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 2C1 1.44772 1.44772 1 2 1H10L15 6V18C15 18.5523 14.5523 19 14 19H2C1.44772 19 1 18.5523 1 18V2Z" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" />
        <path d="M10 1V6H15" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" strokeLinejoin="round" />
        <line x1="4" y1="10" x2="12" y2="10" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="4" y1="13" x2="12" y2="13" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
];

export const ICONE_MODO_CUSTOM = <span className="text-[24px] text-cam-azul-2">✦</span>;
