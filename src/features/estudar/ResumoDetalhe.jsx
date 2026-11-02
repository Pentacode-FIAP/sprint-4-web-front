import { useState } from 'react';
import { Pencil, Play, Sparkles } from 'lucide-react';
import { useResumos } from '../../hooks/useResumos';
import { tempoLeituraMin } from '../../lib/math';
import { Sheet } from '../../components/Sheet';
import { Toast } from '../../components/Toast';
import { SkeletonCard } from '../../components/Skeleton';
import { ExercicioLista } from '../../components/ExercicioLista';
import { Segmented } from '../../components/Segmented';
import { BTN_PRIMARIO, BTN_SECUNDARIO, CAMPO, CAMPO_ROTULO } from '../../components/estilosBotao';
import { SerieExercicios } from '../exercicios/SerieExercicios';
import { itensLegados, questoesDoExercicio } from '../exercicios/questoes';

const QTDS = [
  { id: '5', label: '5' },
  { id: '10', label: '10' },
  { id: '15', label: '15' },
];

const NIVEIS = [
  { id: 'facil', label: 'Fácil' },
  { id: 'medio', label: 'Médio' },
  { id: 'dificil', label: 'Difícil' },
  { id: 'misto', label: 'Misto' },
];

export function ResumoDetalhe({ resumo, onFechar }) {
  const { erro, limparErro, salvarResumo, gerando, exercicioDe, gerarQuestoes } = useResumos();

  const exercicio = exercicioDe(resumo.id);
  const questoes = questoesDoExercicio(exercicio, resumo.materiaId);
  const legados = itensLegados(exercicio);

  const [qtd, setQtd] = useState('5');
  const [nivel, setNivel] = useState('misto');
  const [respondendo, setRespondendo] = useState(false);

  const [editando, setEditando] = useState(false);
  const [titulo, setTitulo] = useState(resumo.titulo);
  const [conteudo, setConteudo] = useState(resumo.conteudo);

  function iniciarEdicao() {
    setTitulo(resumo.titulo);
    setConteudo(resumo.conteudo);
    setEditando(true);
  }

  function salvarEdicao() {
    if (!titulo.trim() || !conteudo.trim()) return;
    const ok = salvarResumo({ id: resumo.id, titulo, materiaId: resumo.materiaId, conteudo });
    if (ok) setEditando(false);
  }

  async function gerar() {
    const novo = await gerarQuestoes(resumo, { qtd: Number(qtd), nivel });
    if (novo) setRespondendo(true);
  }

  return (
    <>
    <Sheet titulo={resumo.titulo} onFechar={onFechar}>
      {editando ? (
        <div className="flex flex-col gap-3.5">
          <label className="block">
            <span className={CAMPO_ROTULO}>Título do resumo</span>
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} className={CAMPO} />
          </label>
          <label className="block">
            <span className={CAMPO_ROTULO}>Conteúdo</span>
            <textarea rows={12} value={conteudo} onChange={(e) => setConteudo(e.target.value)} className={CAMPO} />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" className={BTN_SECUNDARIO} onClick={() => setEditando(false)}>
              Cancelar
            </button>
            <button
              type="button"
              className={BTN_PRIMARIO}
              disabled={!titulo.trim() || !conteudo.trim()}
              onClick={salvarEdicao}
            >
              Salvar alterações
            </button>
          </div>
          <p className="m-0 text-[13px] leading-normal text-text-muted">
            Novos exercícios usarão o conteúdo atualizado. Os já gerados continuam no histórico.
          </p>
        </div>
      ) : (
        <>
          <button type="button" className={`${BTN_SECUNDARIO} mb-3.5`} onClick={iniciarEdicao}>
            <Pencil size={16} />
            Editar resumo
          </button>
          <p className="m-0 text-sm leading-[1.65] whitespace-pre-wrap [overflow-wrap:anywhere]">{resumo.conteudo}</p>
          <p className="mt-3 mb-0 text-xs text-text-muted">~{tempoLeituraMin(resumo.conteudo)} min de leitura</p>
        </>
      )}

      <h3 className="mt-6 mb-2.5 text-[11px] font-semibold tracking-[0.09em] text-text-muted uppercase">Questões</h3>

      {gerando ? (
        <SkeletonCard linhas={3} rotulo="Gerando questões com IA" />
      ) : (
        <>
          {questoes.length > 0 && (
            <button type="button" className={`${BTN_PRIMARIO} mb-4 w-full`} onClick={() => setRespondendo(true)}>
              <Play size={17} strokeWidth={2} />
              Responder {questoes.length} {questoes.length === 1 ? 'questão' : 'questões'}
            </button>
          )}

          <div className="rounded-md border border-border bg-surface p-3.5">
            <span className={CAMPO_ROTULO}>Quantas questões</span>
            <Segmented itens={QTDS} valor={qtd} onChange={setQtd} rotulo="Quantidade de questões" modo="radio" />
            <span className={CAMPO_ROTULO}>Nível</span>
            <Segmented itens={NIVEIS} valor={nivel} onChange={setNivel} rotulo="Nível das questões" modo="radio" />
            <button type="button" className={`${BTN_SECUNDARIO} w-full`} onClick={gerar}>
              <Sparkles size={17} strokeWidth={2} />
              {questoes.length > 0 ? 'Gerar novas questões' : 'Gerar questões'}
            </button>
          </div>

          {legados.length > 0 && (
            <>
              <p className="mt-4 mb-2.5 text-[13px] leading-normal text-text-muted">
                Questões antigas, sem alternativas. Elas não entram nas suas estatísticas.
              </p>
              <ExercicioLista itens={legados} />
            </>
          )}
        </>
      )}

      {erro && <Toast message={erro} onClose={limparErro} />}
    </Sheet>

    {respondendo && questoes.length > 0 && (
      <SerieExercicios
        titulo={resumo.titulo}
        questoes={questoes}
        onFechar={() => setRespondendo(false)}
        onRefazer={() => {
          setRespondendo(false);
          gerar();
        }}
      />
    )}
    </>
  );
}
