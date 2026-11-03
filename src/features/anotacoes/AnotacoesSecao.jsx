import { useState } from 'react';
import { NotebookPen, Pencil, Trash2 } from 'lucide-react';
import { useColecao } from '../../hooks/useColecao';
import { useConfirmacao } from '../../hooks/useConfirmacao';
import { MateriaSelect } from '../../components/MateriaSelect';
import { EmptyState } from '../../components/EmptyState';
import { Sheet } from '../../components/Sheet';
import { Toast } from '../../components/Toast';
import {
  BTN_ICONE_SUTIL, BTN_PRIMARIO, CAMPO, CAMPO_ROTULO, CARTAO, PILULA,
} from '../../components/estilosBotao';

export function AnotacoesSecao({ novoAberto, onFecharNovo }) {
  const { itens, adicionar, atualizar, remover } = useColecao('anotacoes');
  const { itens: resumos } = useColecao('resumos');
  const { confirmar, dialogoConfirmacao } = useConfirmacao();
  const anotacoes = [...itens].sort((a, b) => b.data.localeCompare(a.data));

  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [materiaId, setMateriaId] = useState(undefined);
  const [resumoId, setResumoId] = useState(undefined);
  const [editandoId, setEditandoId] = useState(undefined);
  const [erro, setErro] = useState(null);

  // O sheet abre por dois caminhos: nota nova (o pai manda) ou edição (interno).
  const editando = editandoId !== undefined;
  const sheetAberto = novoAberto || editando;

  function resumoTitulo(id) {
    return resumos.find((r) => r.id === id)?.titulo;
  }

  function limparFormulario() {
    setTitulo('');
    setConteudo('');
    setMateriaId(undefined);
    setResumoId(undefined);
  }

  function abrirEdicao(id) {
    const anotacao = anotacoes.find((item) => item.id === id);
    if (!anotacao) return;
    setTitulo(anotacao.titulo);
    setConteudo(anotacao.conteudo);
    setMateriaId(anotacao.materiaId);
    setResumoId(anotacao.resumoId);
    setEditandoId(anotacao.id);
  }

  function fecharFormulario() {
    limparFormulario();
    if (editando) setEditandoId(undefined);
    else onFecharNovo();
  }

  async function excluirAnotacao(id, tituloAnotacao) {
    const ok = await confirmar({
      titulo: 'Excluir anotação',
      descricao: `“${tituloAnotacao}” será apagada. Essa ação não pode ser desfeita.`,
      rotuloConfirmar: 'Excluir',
      destrutivo: true,
    });
    if (ok) remover(id);
  }

  function salvar() {
    if (!titulo.trim()) return;
    const dados = {
      titulo: titulo.trim(),
      conteudo: conteudo.trim(),
      materiaId,
      resumoId,
      data: new Date().toISOString(),
    };
    const ok = editando ? atualizar(editandoId, dados) : adicionar(dados) !== null;
    if (ok) fecharFormulario();
    else setErro('Erro ao salvar anotação, tente novamente.');
  }

  return (
    <>
      {anotacoes.length === 0 ? (
        <EmptyState
          Icone={NotebookPen}
          titulo="Nenhuma anotação ainda"
          descricao="Toque no + para anotar uma dúvida, uma ideia da aula ou um lembrete."
        />
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2.5 p-0 md:grid md:grid-cols-2">
          {anotacoes.map((a) => (
            <li key={a.id} className={`${CARTAO} flex flex-col items-start gap-1.5`}>
              <div className="flex w-full items-center justify-between gap-2">
                <span className="min-w-0 text-sm font-semibold [overflow-wrap:anywhere]">{a.titulo}</span>
                <div className="flex flex-none gap-0.5">
                  <button
                    type="button"
                    className={BTN_ICONE_SUTIL}
                    onClick={() => abrirEdicao(a.id)}
                    aria-label={`Editar ${a.titulo}`}
                  >
                    <Pencil size={16} strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    className={`${BTN_ICONE_SUTIL} hover:bg-danger-soft hover:text-danger`}
                    onClick={() => excluirAnotacao(a.id, a.titulo)}
                    aria-label={`Excluir ${a.titulo}`}
                  >
                    <Trash2 size={16} strokeWidth={2} />
                  </button>
                </div>
              </div>
              {a.conteudo && (
                <p className="m-0 text-sm leading-[1.55] whitespace-pre-wrap text-text-2 [overflow-wrap:anywhere]">
                  {a.conteudo}
                </p>
              )}
              <span className={PILULA}>{resumoTitulo(a.resumoId) ?? 'Sem resumo vinculado'}</span>
            </li>
          ))}
        </ul>
      )}

      {sheetAberto && (
        <Sheet
          titulo={editando ? 'Editar nota' : 'Nova nota'}
          onFechar={fecharFormulario}
          footer={
            <button type="button" className={`${BTN_PRIMARIO} w-full`} onClick={salvar} disabled={!titulo.trim()}>
              {editando ? 'Salvar alterações' : 'Salvar nota'}
            </button>
          }
        >
          <label className="mb-3.5 block">
            <span className={CAMPO_ROTULO}>Título</span>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex.: Dúvida sobre integrais"
              className={CAMPO}
            />
          </label>

          <label className="mb-3.5 block">
            <span className={CAMPO_ROTULO}>Anotação</span>
            <textarea
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              placeholder="Escreva sua anotação"
              rows={6}
              className={CAMPO}
            />
          </label>

          <MateriaSelect value={materiaId} onChange={setMateriaId} />

          <label className="mb-3.5 block">
            <span className={CAMPO_ROTULO}>Resumo vinculado</span>
            <select
              value={resumoId ?? ''}
              onChange={(e) => setResumoId(e.target.value ? Number(e.target.value) : undefined)}
              className={CAMPO}
            >
              <option value="">Sem resumo vinculado</option>
              {resumos.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.titulo}
                </option>
              ))}
            </select>
            <span className="mt-1.5 block text-xs text-text-muted">Opcional — ajuda a IA a achar a nota depois.</span>
          </label>
        </Sheet>
      )}

      {erro && <Toast message={erro} onClose={() => setErro(null)} />}
      {dialogoConfirmacao}
    </>
  );
}
