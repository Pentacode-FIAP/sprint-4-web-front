import { useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { useColecao } from '../../hooks/useColecao';
import { useResumos } from '../../hooks/useResumos';
import { Sheet } from '../../components/Sheet';
import { MateriaSelect } from '../../components/MateriaSelect';
import { BTN_PRIMARIO, BTN_TEXTO, CAMPO, CAMPO_ROTULO } from '../../components/estilosBotao';

export function NovoResumoSheet({ onFechar, fotoInicialId, materiaInicial }) {
  const { itens: fotosTodas } = useColecao('fotos');
  const { gerando, erro, gerarDeFotos, gerarDeTexto, salvarResumo } = useResumos();
  const { itens: materias } = useColecao('materias');
  const fotos = [...fotosTodas].sort((a, b) => b.dataUpload.localeCompare(a.dataUpload));

  const [fotoIds, setFotoIds] = useState(fotoInicialId !== undefined ? [fotoInicialId] : []);
  const [titulo, setTitulo] = useState('');
  const [materiaId, setMateriaId] = useState(materiaInicial);
  const [conteudo, setConteudo] = useState('');
  const [revisando, setRevisando] = useState(false);
  const [modo, setModo] = useState('fotos');
  const [texto, setTexto] = useState('');

  function alternarFoto(id) {
    setFotoIds((atual) => (atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]));
  }

  const materiaNomeSelecionada = materias.find((m) => m.id === materiaId)?.nome;

  async function gerar() {
    if (gerando) return;
    if (modo === 'fotos' ? fotoIds.length === 0 : !texto.trim()) return;
    const resultado =
      modo === 'fotos'
        ? await gerarDeFotos(fotoIds, materiaId)
        : await gerarDeTexto(texto.trim(), materiaNomeSelecionada);
    if (resultado !== null) {
      setConteudo(resultado);
      setRevisando(true);
    }
  }

  function salvar() {
    if (!titulo.trim() || !conteudo.trim()) return;
    if (salvarResumo({ titulo, materiaId, conteudo, fotoIds })) onFechar();
  }

  const podeAvancar = revisando
    ? Boolean(titulo.trim() && conteudo.trim())
    : modo === 'fotos'
      ? fotoIds.length > 0
      : Boolean(texto.trim());

  return (
    <Sheet
      titulo={revisando ? 'Revise seu resumo' : 'Novo resumo'}
      onFechar={onFechar}
      footer={
        <button
          type="button"
          className={`${BTN_PRIMARIO} w-full`}
          disabled={gerando || !podeAvancar}
          onClick={revisando ? salvar : gerar}
        >
          {gerando ? (
            <span className="h-[15px] w-[15px] animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />
          ) : revisando ? (
            <Check size={17} />
          ) : (
            <Sparkles size={17} />
          )}
          {gerando ? 'Aguarde…' : revisando ? 'Salvar resumo' : modo === 'fotos' ? 'Gerar resumo com IA' : 'Resumir texto com IA'}
        </button>
      }
    >
      <fieldset disabled={gerando} className="m-0 min-w-0 border-0 p-0">
        <label className="mb-3.5 block">
          <span className={CAMPO_ROTULO}>Nome do resumo</span>
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex.: Cinemática — aula 3"
            className={CAMPO}
          />
        </label>
        <MateriaSelect value={materiaId} onChange={setMateriaId} />

        {revisando ? (
          <>
            <p className="mt-0 mb-3 text-[13px] leading-normal text-text-muted">
              Confira os conceitos e ajuste o texto antes de salvar.
            </p>
            <label className="mb-3.5 block">
              <span className={CAMPO_ROTULO}>Conteúdo do resumo</span>
              <textarea
                rows={13}
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                className={CAMPO}
              />
            </label>
            <button type="button" className={BTN_TEXTO} onClick={() => setRevisando(false)}>
              Voltar ao material
            </button>
          </>
        ) : (
          <>
            <div role="group" aria-label="Origem do material" className="mb-3 flex gap-2">
              {[['fotos', 'Das fotos'], ['texto', 'De um texto']].map(([id, rotulo]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={modo === id}
                  onClick={() => setModo(id)}
                  className="min-h-11 flex-1 cursor-pointer rounded-sm border border-border bg-surface-2 px-3 text-[13px] font-semibold text-text-muted aria-pressed:border-2 aria-pressed:border-accent aria-pressed:text-accent"
                >
                  {rotulo}
                </button>
              ))}
            </div>
            {modo === 'texto' ? (
              <label className="mb-3.5 block">
                <span className={CAMPO_ROTULO}>Texto do material</span>
                <textarea
                  rows={10}
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  placeholder="Cole aqui o texto que a IA deve organizar em resumo."
                  className={CAMPO}
                />
              </label>
            ) : (
            <>
            <p className="mt-0 mb-3 text-[13px] leading-normal text-text-muted">
              {fotos.length
                ? `${fotoIds.length} ${fotoIds.length === 1 ? 'foto selecionada' : 'fotos selecionadas'}`
                : 'Envie fotos na Galeria para começar.'}
            </p>
            <div className="grid grid-cols-3 gap-1.5 md:grid-cols-4">
              {fotos.map((f) => {
                const marcada = fotoIds.includes(f.id);
                return (
                  <button
                    key={f.id}
                    type="button"
                    aria-label="Selecionar foto"
                    aria-pressed={marcada}
                    onClick={() => alternarFoto(f.id)}
                    className="relative aspect-square min-h-11 cursor-pointer overflow-hidden rounded-sm border border-border bg-surface-2 p-0 aria-pressed:border-2 aria-pressed:border-accent"
                  >
                    <img src={f.dataUrl} alt="" loading="lazy" className="block h-full w-full object-cover" />
                    {marcada && (
                      <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-contrast shadow-2">
                        <Check size={14} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            </>
            )}
          </>
        )}
      </fieldset>
      {erro && (
        <p role="alert" className="mt-3 mb-0 text-[13px] leading-normal text-danger">
          {erro}
        </p>
      )}
    </Sheet>
  );
}
