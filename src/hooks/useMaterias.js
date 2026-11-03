import { useCallback } from 'react';
import { useColecao } from './useColecao';

/**
 * Matérias do aluno. Remover uma matéria limpa `materiaId` de resumos, lembretes
 * e anotações, que continuam existindo "sem matéria". Tentativas e simulados são
 * histórico e não mudam: a tela mostra "Sem matéria" quando o id não existe mais.
 */
export function useMaterias() {
  const { itens: materias, adicionar, atualizar, remover } = useColecao('materias');
  const { itens: resumos, substituir: substituirResumos } = useColecao('resumos');
  const { itens: eventos, substituir: substituirEventos } = useColecao('eventos');
  const { itens: anotacoes, substituir: substituirAnotacoes } = useColecao('anotacoes');

  const removerMateria = useCallback(
    (id) => {
      const semMateria = (lista) =>
        lista.map((item) => (item.materiaId === id ? { ...item, materiaId: undefined } : item));
      const afeta = (lista) => lista.some((item) => item.materiaId === id);
      // Se alguma gravação falhar (armazenamento cheio), a matéria fica: nada fica pela metade.
      if (afeta(resumos) && !substituirResumos(semMateria(resumos))) return false;
      if (afeta(eventos) && !substituirEventos(semMateria(eventos))) return false;
      if (afeta(anotacoes) && !substituirAnotacoes(semMateria(anotacoes))) return false;
      return remover(id);
    },
    [resumos, eventos, anotacoes, substituirResumos, substituirEventos, substituirAnotacoes, remover],
  );

  return { materias, adicionar, atualizar, removerMateria };
}
