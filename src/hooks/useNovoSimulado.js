import { useCallback, useEffect, useRef, useState } from 'react';
import { useColecao } from './useColecao';
import { ErroSemChave, MENSAGEM_SEM_CHAVE, gerarSimulado, temChaveGemini } from '../lib/gemini';

export const QTDS = ['5', '10', '20', '30'].map((n) => ({ id: n, label: n }));
export const NIVEIS = [
  { id: 'facil', label: 'Fácil' },
  { id: 'medio', label: 'Médio' },
  { id: 'dificil', label: 'Difícil' },
  { id: 'misto', label: 'Misto' },
];
export const TEMPOS = [
  { id: '0', label: 'Livre' },
  { id: '30', label: '30min' },
  { id: '60', label: '60min' },
  { id: '90', label: '90min' },
];

/** Configuração e geração de um simulado. `onIniciar(simulado, aviso)` recebe o simulado já salvo. */
export function useNovoSimulado({ materiaInicial, resumoIdsIniciais, onIniciar }) {
  const { itens: todosResumos } = useColecao('resumos');
  const { adicionar } = useColecao('simulados');
  const { itens: materias } = useColecao('materias');
  const [materiaId, setMateriaId] = useState(materiaInicial);
  const [qtd, setQtd] = useState('5');
  const [nivel, setNivel] = useState('misto');
  const [tempo, setTempo] = useState('0');
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState(null);
  const [selecionados, setSelecionados] = useState(resumoIdsIniciais ?? null);
  const ocupadoRef = useRef(false);
  const montadoRef = useRef(true);

  useEffect(() => {
    montadoRef.current = true;
    return () => {
      montadoRef.current = false;
    };
  }, []);

  const semChave = !temChaveGemini();
  const resumos = materiaId === undefined ? [] : todosResumos.filter((r) => r.materiaId === materiaId);
  const ids = selecionados ?? resumos.map((r) => r.id);
  const fontes = resumos.filter((r) => ids.includes(r.id));

  const escolherMateria = useCallback((id) => {
    setMateriaId(id);
    setSelecionados(null);
  }, []);

  async function comecar() {
    if (ocupadoRef.current || materiaId === undefined || fontes.length === 0) return;
    if (semChave) {
      setErro(MENSAGEM_SEM_CHAVE);
      return;
    }
    ocupadoRef.current = true;
    setGerando(true);
    setErro(null);
    try {
      const pedidas = Number(qtd);
      const itens = await gerarSimulado(fontes, { qtd: pedidas, nivel });
      // Fechou a configuração enquanto a IA respondia: não abre uma prova que ninguém pediu mais.
      if (!montadoRef.current) return;
      const dados = {
        materiaId,
        resumoIds: fontes.map((r) => r.id),
        itens,
        qtd: itens.length,
        nivel,
        minutos: tempo === '0' ? undefined : Number(tempo),
        iniciadoEm: new Date().toISOString(),
      };
      const salvo = adicionar(dados);
      // Sem gravar não há como registrar a nota depois: o Provider já avisou do armazenamento.
      if (!salvo) return;
      const aviso = itens.length < pedidas
        ? `Só deu pra gerar ${itens.length} de ${pedidas} questões pedidas. O simulado começa com o que foi possível gerar.`
        : undefined;
      onIniciar(salvo, aviso);
    } catch (e) {
      if (!montadoRef.current) return;
      setErro(e instanceof ErroSemChave ? MENSAGEM_SEM_CHAVE : (e instanceof Error && e.message) || 'Não deu pra gerar o simulado.');
    } finally {
      ocupadoRef.current = false;
      if (montadoRef.current) setGerando(false);
    }
  }

  return {
    materiaId, escolherMateria, qtd, setQtd, nivel, setNivel, tempo, setTempo,
    resumos, ids, fontes, definirResumos: setSelecionados, gerando, erro: erro ?? (semChave ? MENSAGEM_SEM_CHAVE : null),
    semChave, semResumo: materiaId !== undefined && resumos.length === 0, semMaterias: materias.length === 0,
    temResumoSemMateria: todosResumos.some((r) => r.materiaId === undefined || !materias.some((m) => m.id === r.materiaId)),
    comecar,
  };
}
