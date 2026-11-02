import { CAMPO_ROTULO } from './estilosBotao';

/** Escolha de resumos por caixas de seleção. `onChange` recebe a nova lista de ids. */
export function ResumoSelecao({ resumos, selecionados, onChange, legenda = 'O que vai cair na prova?' }) {
  function alternar(id) {
    onChange(selecionados.includes(id) ? selecionados.filter((x) => x !== id) : [...selecionados, id]);
  }

  return (
    <fieldset className="m-0 mb-4 min-w-0 border-0 p-0">
      <legend className={CAMPO_ROTULO}>{legenda}</legend>
      <div className="flex flex-col">
        {resumos.map((r) => (
          <label key={r.id} className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={selecionados.includes(r.id)}
              onChange={() => alternar(r.id)}
              className="size-[18px] flex-none accent-accent"
            />
            <span className="min-w-0 [overflow-wrap:anywhere]">{r.titulo}</span>
          </label>
        ))}
      </div>
      {resumos.length === 0 && (
        <p className="m-0 text-[13px] leading-normal text-text-muted">Crie um resumo dessa matéria para incluir no plano.</p>
      )}
    </fieldset>
  );
}
