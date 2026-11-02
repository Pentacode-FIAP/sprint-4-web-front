import { useState } from 'react';
import { X } from 'lucide-react';
import { MateriaSelect } from '../../components/MateriaSelect';

export function EventoForm({ dataInicial, evento, onFechar, onSalvar }) {
  const [titulo, setTitulo] = useState(evento?.titulo ?? '');
  const [data, setData] = useState(evento?.data ?? dataInicial);
  const [materiaId, setMateriaId] = useState(evento?.materiaId);
  const [tipo, setTipo] = useState(evento?.tipo ?? 'prova');
  const [erro, setErro] = useState(null);

  function confirmar() {
    if (!titulo.trim() || !data) return;
    if (onSalvar({ titulo: titulo.trim(), data, materiaId, tipo }, evento?.id)) {
      onFechar();
    } else {
      setErro('Erro ao salvar lembrete, tente novamente.');
    }
  }

  return (
    <div className="overlay">
      <div className="overlay-content">
        <div className="overlay-header">
          <h2>{evento ? 'Editar lembrete' : 'Novo lembrete'}</h2>
          <button onClick={onFechar}>
            <X size={18} strokeWidth={2} /> Fechar
          </button>
        </div>
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título" />
        <input type="date" value={data} onChange={(e) => setData(e.target.value)} />
        <MateriaSelect value={materiaId} onChange={setMateriaId} />
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="prova">Prova</option>
          <option value="atividade">Atividade</option>
          <option value="revisao">Revisão</option>
        </select>
        {erro && <p className="meta" style={{ color: 'var(--prova)' }}>{erro}</p>}
        <button className="btn-primary" onClick={confirmar}>{evento ? 'Salvar alterações' : 'Salvar'}</button>
      </div>
    </div>
  );
}
