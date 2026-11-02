import { useState } from 'react';
import { Pencil, Sparkles } from 'lucide-react';
import { useResumos } from '../../hooks/useResumos';
import { useExerciciosDoResumo } from '../../hooks/useExerciciosDoResumo';
import { tempoLeituraMin } from '../../lib/math';
import { Sheet } from '../../components/Sheet';
import { Toast } from '../../components/Toast';
import { SkeletonCard } from '../../components/Skeleton';
import { ExercicioLista } from '../../components/ExercicioLista';
import { BTN_PRIMARIO, BTN_SECUNDARIO, CAMPO, CAMPO_ROTULO } from '../../components/estilosBotao';

export function ResumoDetalhe({ resumo, onFechar }) {
  const { erro: erroResumo, limparErro, salvarResumo } = useResumos();
  const exercicios = useExerciciosDoResumo(resumo);

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

  return (
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

      <h3 className="mt-6 mb-2.5 text-[11px] font-semibold tracking-[0.09em] text-text-muted uppercase">Exercícios</h3>

      {exercicios.gerando ? (
        <SkeletonCard linhas={3} rotulo="Gerando exercícios com IA" />
      ) : exercicios.temExercicios ? (
        <ExercicioLista itens={exercicios.itens} />
      ) : (
        <button type="button" className={`${BTN_PRIMARIO} w-full`} onClick={exercicios.gerar}>
          <Sparkles size={17} strokeWidth={2} />
          Gerar exercícios
        </button>
      )}

      {exercicios.erro && <Toast message={exercicios.erro} onClose={exercicios.limparErro} />}
      {erroResumo && <Toast message={erroResumo} onClose={limparErro} />}
    </Sheet>
  );
}
