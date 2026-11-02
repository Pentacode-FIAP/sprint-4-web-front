import { useState } from 'react';
import { Sheet } from '../../components/Sheet';
import { Segmented } from '../../components/Segmented';
import { MateriaSelect } from '../../components/MateriaSelect';
import { BTN_PRIMARIO, CAMPO, CAMPO_ROTULO } from '../../components/estilosBotao';

const TIPOS = [
  { id: 'prova', label: 'Prova' },
  { id: 'atividade', label: 'Atividade' },
  { id: 'revisao', label: 'Revisão' },
];

export function EventoForm({ dataInicial, evento, onFechar, onSalvar }) {
  const [titulo, setTitulo] = useState(evento?.titulo ?? '');
  const [data, setData] = useState(evento?.data ?? dataInicial);
  const [materiaId, setMateriaId] = useState(evento?.materiaId);
  const [tipo, setTipo] = useState(evento?.tipo ?? 'prova');
  const [erro, setErro] = useState(null);

  const valido = titulo.trim().length > 0 && Boolean(data);

  function salvar() {
    if (!valido) return;
    if (onSalvar({ titulo: titulo.trim(), data, materiaId, tipo }, evento?.id)) {
      onFechar();
    } else {
      setErro('Erro ao salvar lembrete, tente novamente.');
    }
  }

  return (
    <Sheet
      titulo={evento ? 'Editar lembrete' : 'Novo lembrete'}
      onFechar={onFechar}
      footer={
        <button type="button" onClick={salvar} disabled={!valido} className={`${BTN_PRIMARIO} w-full`}>
          {evento ? 'Salvar alterações' : 'Salvar lembrete'}
        </button>
      }
    >
      <label className="mb-3.5 block">
        <span className={CAMPO_ROTULO}>Título</span>
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ex.: Prova de Cálculo I"
          className={CAMPO}
        />
      </label>

      <label className="mb-3.5 block">
        <span className={CAMPO_ROTULO}>Data</span>
        <input type="date" value={data} onChange={(e) => setData(e.target.value)} className={CAMPO} />
      </label>

      <MateriaSelect value={materiaId} onChange={setMateriaId} />

      <div className="mb-3.5">
        <span className={CAMPO_ROTULO}>Tipo</span>
        <Segmented itens={TIPOS} valor={tipo} onChange={setTipo} rotulo="Tipo do lembrete" modo="radio" />
      </div>

      {erro && <p role="alert" className="m-0 text-[13px] leading-normal text-danger">{erro}</p>}
    </Sheet>
  );
}
