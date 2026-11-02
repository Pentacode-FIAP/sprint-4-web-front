import { useContext } from 'react';
import { ColecoesContext } from '../context/ColecoesContext';

export function useConfig() {
  const ctx = useContext(ColecoesContext);
  if (!ctx) throw new Error('useConfig precisa estar dentro de ColecoesProvider');
  return { config: ctx.config, atualizarConfig: ctx.atualizarConfig };
}
