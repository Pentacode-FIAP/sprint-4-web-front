import { useEffect, useId, useState } from 'react';
import { MateriasScreen } from '../features/materias/MateriasScreen';
import { Sheet } from './Sheet';
import { useColecao } from '../hooks/useColecao';
import { BTN_TEXTO, CAMPO } from './estilosBotao';

export function MateriaSelect({ value, onChange, permitirVazio = true }) {
  const { itens: materias } = useColecao('materias');
  const [gerenciando, setGerenciando] = useState(false);
  // Pode haver mais de um MateriaSelect montado (um por sheet aberto).
  const selectId = useId();

  // Sem a opção "Sem matéria", o <select> exibe a primeira matéria assim que a
  // lista carrega; sincroniza o estado do formulário com o que aparece na tela.
  useEffect(() => {
    if (!permitirVazio && value === undefined && materias.length > 0) {
      onChange(materias[0].id);
    }
  }, [permitirVazio, value, materias, onChange]);

  return (
    <>
      <div className="mb-3.5 block">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <label className="block text-xs font-semibold text-text-2" htmlFor={selectId}>
            Matéria
          </label>
          <button
            type="button"
            onClick={() => setGerenciando(true)}
            className={BTN_TEXTO}
          >
            {materias.length === 0 ? 'Criar matéria' : 'Gerenciar'}
          </button>
        </div>
        <select
          id={selectId}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
          className={CAMPO}
        >
          {permitirVazio && <option value="">Sem matéria</option>}
          {materias.map((m) => (
            <option key={m.id} value={m.id}>{m.nome}</option>
          ))}
        </select>
      </div>
      {gerenciando && (
        <Sheet titulo="Matérias" onFechar={() => setGerenciando(false)}>
          <MateriasScreen />
        </Sheet>
      )}
    </>
  );
}
