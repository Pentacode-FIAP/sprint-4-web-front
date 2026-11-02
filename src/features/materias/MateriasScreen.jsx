import { useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import { useColecao } from '../../hooks/useColecao';
import { useConfirmacao } from '../../hooks/useConfirmacao';
import { Sheet } from '../../components/Sheet';
import {
  BTN_ICONE_SUTIL, BTN_PRIMARIO, BTN_PRIMARIO_ICONE, CAMPO, CAMPO_ROTULO,
} from '../../components/estilosBotao';

const CORES = ['#2563eb', '#0e7490', '#b45309', '#7c3aed', '#e11d48', '#047857'];
const NOMES_CORES = ['Azul', 'Ciano', 'Laranja', 'Roxo', 'Rosa', 'Verde'];

function corPara(nome) {
  let hash = 0;
  for (let i = 0; i < nome.length; i++) hash = (hash * 31 + nome.charCodeAt(i)) >>> 0;
  return CORES[hash % CORES.length];
}

/** Gerenciador de matérias. Vive dentro do Sheet aberto por `MateriaSelect`. */
export function MateriasScreen() {
  const { itens: materias, adicionar, atualizar, remover } = useColecao('materias');
  const [nome, setNome] = useState('');
  const [editando, setEditando] = useState(null);
  const [erro, setErro] = useState('');
  const { confirmar, dialogoConfirmacao } = useConfirmacao();

  function adicionarMateria() {
    const limpo = nome.trim();
    if (!limpo) return;
    if (adicionar({ nome: limpo, cor: corPara(limpo) }) !== null) {
      setNome('');
      setErro('');
    } else {
      setErro('Erro ao salvar matéria, tente novamente.');
    }
  }

  function salvarEdicao() {
    const limpo = editando?.nome.trim();
    if (!limpo) return;
    if (atualizar(editando.id, { nome: limpo, cor: editando.cor })) {
      setEditando(null);
    } else {
      setErro('Não foi possível salvar. Tente novamente.');
    }
  }

  async function removerMateria(materia) {
    const ok = await confirmar({
      titulo: 'Remover matéria',
      descricao: `“${materia.nome}” sai da lista. Resumos e lembretes já criados continuam existindo, mas ficam sem matéria.`,
      rotuloConfirmar: 'Remover',
      destrutivo: true,
    });
    if (ok) remover(materia.id);
  }

  return (
    <>
      <form
        className="mb-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          adicionarMateria();
        }}
      >
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome da matéria"
          aria-label="Nome da matéria"
          className={`${CAMPO} flex-1`}
        />
        <button
          type="submit"
          disabled={!nome.trim()}
          aria-label="Adicionar matéria"
          className={BTN_PRIMARIO_ICONE}
        >
          <Plus size={18} strokeWidth={2.2} />
        </button>
      </form>
      {erro && !editando && <p role="alert" className="mt-0 mb-3 text-[13px] leading-normal text-danger">{erro}</p>}

      {materias.length === 0 ? (
        <p className="m-0 py-4 text-center text-[13px] text-text-muted">Nenhuma matéria cadastrada ainda</p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
          {materias.map((m) => (
            <li
              key={m.id}
              className="flex items-center gap-2.5 rounded-md border border-border bg-surface py-1.5 pr-1.5 pl-3 text-sm"
            >
              <span className="h-2.5 w-2.5 flex-none rounded-full" style={{ background: m.cor }} aria-hidden="true" />
              <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">{m.nome}</span>
              <button
                type="button"
                aria-label={`Editar ${m.nome}`}
                onClick={() => { setEditando({ ...m }); setErro(''); }}
                className={BTN_ICONE_SUTIL}
              >
                <Pencil size={17} />
              </button>
              <button
                type="button"
                onClick={() => removerMateria(m)}
                className="min-h-11 flex-none cursor-pointer rounded-md border border-danger/35 px-3 text-[13px] font-medium text-danger hover:border-danger hover:bg-danger-soft"
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}

      {editando && (
        <Sheet
          titulo="Editar matéria"
          onFechar={() => setEditando(null)}
          footer={
            <button
              type="button"
              onClick={salvarEdicao}
              disabled={!editando.nome.trim()}
              className={`${BTN_PRIMARIO} w-full`}
            >
              Salvar alterações
            </button>
          }
        >
          <label className="mb-3.5 block">
            <span className={CAMPO_ROTULO}>Nome da matéria</span>
            <input
              value={editando.nome}
              onChange={(e) => setEditando({ ...editando, nome: e.target.value })}
              className={CAMPO}
            />
          </label>
          <fieldset className="m-0 mb-3.5 min-w-0 border-0 p-0">
            <legend className={CAMPO_ROTULO}>Cor da matéria</legend>
            <div className="flex flex-wrap gap-1.5">
              {CORES.map((cor, i) => (
                <button
                  key={cor}
                  type="button"
                  aria-label={NOMES_CORES[i]}
                  aria-pressed={editando.cor === cor}
                  onClick={() => setEditando({ ...editando, cor })}
                  className="flex h-11 w-11 min-w-11 cursor-pointer items-center justify-center rounded-md border border-border bg-surface p-0 aria-pressed:border-accent aria-pressed:shadow-[0_0_0_2px_var(--color-accent-soft-2)]"
                >
                  <span className="h-[26px] w-[26px] rounded-full" style={{ background: cor }} />
                </button>
              ))}
            </div>
          </fieldset>
          {erro && <p role="alert" className="m-0 text-[13px] leading-normal text-danger">{erro}</p>}
        </Sheet>
      )}
      {dialogoConfirmacao}
    </>
  );
}
