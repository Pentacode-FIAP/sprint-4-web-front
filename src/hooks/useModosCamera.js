import { useState } from 'react';
import {
  FUNDO_IA, ICONE_MODO_CUSTOM, MODOS_INICIAIS, SOMBRA_IA,
} from '../lib/modosCamera';
import { useConfirmacao } from './useConfirmacao';

/**
 * Modos da câmera: ativos e "outros modos", remoção (com confirmação), reativação
 * e criação de modo próprio. `dialogoConfirmacao` precisa ser renderizado pela tela.
 */
export function useModosCamera() {
  const [modos, setModos] = useState(MODOS_INICIAIS);
  const [editando, setEditando] = useState(false);
  const { confirmar, dialogoConfirmacao } = useConfirmacao();

  async function alternarModo(nome) {
    const item = modos.find((m) => m.nome === nome);
    if (!item) return;

    if (item.ativo) {
      const ok = await confirmar({
        titulo: 'Remover modo?',
        descricao: `Remover o modo "${nome}" da câmera?`,
        rotuloConfirmar: 'Remover',
        destrutivo: true,
      });
      if (!ok) return;

      if (item.custom && nome !== 'IA' && nome !== 'Estudo') {
        setModos((atual) => atual.filter((m) => m.nome !== nome));
        window.alert(`Modo "${nome}" excluído permanentemente.`);
      } else {
        setModos((atual) => atual.map((m) => (m.nome === nome ? { ...m, ativo: false } : m)));
        window.alert(`Modo "${nome}" movido para Outros Modos.`);
      }
    } else {
      setModos((atual) => atual.map((m) => (m.nome === nome ? { ...m, ativo: true } : m)));
      window.alert(`Modo "${nome}" adicionado à câmera.`);
    }
  }

  function alternarEdicao() {
    if (editando) {
      setEditando(false);
      return;
    }

    const nome = window.prompt('Nome do novo modo customizado:');
    if (nome === null) return;

    const nomeTratado = nome.trim();
    if (nomeTratado.length < 2) {
      window.alert('Nome muito curto. O modo não foi criado.');
      return;
    }

    const jaExiste = modos.some((m) => m.nome.toLowerCase() === nomeTratado.toLowerCase());
    if (jaExiste) {
      window.alert(`Já existe um modo chamado "${nomeTratado}".`);
      return;
    }

    setModos((atual) => [
      ...atual,
      {
        nome: nomeTratado,
        ativo: true,
        custom: true,
        fundo: FUNDO_IA,
        sombra: SOMBRA_IA,
        corLabel: 'text-cam-azul-2/85',
        icone: ICONE_MODO_CUSTOM,
      },
    ]);
    window.alert(`Modo "${nomeTratado}" criado!`);
  }

  return {
    ativos: modos.filter((m) => m.ativo),
    inativos: modos.filter((m) => !m.ativo),
    editando,
    alternarModo,
    alternarEdicao,
    dialogoConfirmacao,
  };
}
