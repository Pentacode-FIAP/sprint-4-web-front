import { useState } from 'react';
import { Segmented } from '../../components/Segmented';
import { Sheet } from '../../components/Sheet';
import { BTN_PRIMARIO } from '../../components/estilosBotao';

const OPCOES = ['5', '10', '15', '20'].map((v) => ({ id: v, label: v }));

export function MetaSheet({ metaAtual, onSalvar, onFechar }) {
  // Se a meta salva não for uma das opções, cai na mais próxima acima; acima de
  // todas, na maior (nunca volta em silêncio para um valor menor que o salvo).
  const [valor, setValor] = useState(
    (OPCOES.find((o) => Number(o.id) >= metaAtual) ?? OPCOES[OPCOES.length - 1]).id,
  );

  function salvar() {
    onSalvar(Number(valor));
    onFechar();
  }

  return (
    <Sheet
      titulo="Meta diária"
      onFechar={onFechar}
      footer={
        <button type="button" onClick={salvar} className={`${BTN_PRIMARIO} w-full`}>
          Salvar meta
        </button>
      }
    >
      <p className="mb-3.5 text-[13px] leading-normal text-text-muted">
        Quantas questões você quer responder por dia. Bater a meta mantém sua ofensiva —
        acertar ou errar não interfere.
      </p>
      <Segmented itens={OPCOES} valor={valor} onChange={setValor} rotulo="Questões por dia" modo="radio" />
    </Sheet>
  );
}
