import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Toast } from '../components/Toast';
import {
  CHAVE_CONFIG, chaveColecao, gravarColecao, gravarConfig, lerColecao, lerConfig, NOMES_COLECOES,
} from '../lib/colecoes';

// eslint-disable-next-line react-refresh/only-export-components
export const ColecoesContext = createContext(null);

const MSG_COTA = 'Armazenamento cheio. Apague fotos antigas da Galeria e tente de novo.';

function carregarTudo() {
  const dados = {};
  for (const nome of NOMES_COLECOES) dados[nome] = lerColecao(nome);
  return dados;
}

export function ColecoesProvider({ children }) {
  const [colecoes, setColecoes] = useState(carregarTudo);
  const [config, setConfig] = useState(lerConfig);
  const colecoesRef = useRef(colecoes);
  const configRef = useRef(config);
  const [toast, setToast] = useState(null);
  const fecharToast = useCallback(() => setToast(null), []);

  // Grava no localStorage antes de mexer no estado; o ref enxerga escritas seguidas.
  const aplicar = useCallback((nome, transformar) => {
    const atual = colecoesRef.current[nome] ?? [];
    const { itens, resultado } = transformar(atual);
    if (!gravarColecao(nome, itens)) {
      setToast(MSG_COTA);
      return { ok: false };
    }
    colecoesRef.current = { ...colecoesRef.current, [nome]: itens };
    setColecoes(colecoesRef.current);
    return { ok: true, resultado };
  }, []);

  const atualizarConfig = useCallback((mudancas) => {
    const novo = { ...configRef.current, ...mudancas };
    if (!gravarConfig(novo)) {
      setToast(MSG_COTA);
      return false;
    }
    configRef.current = novo;
    setConfig(novo);
    return true;
  }, []);

  useEffect(() => {
    function aoMudarStorage(e) {
      if (e.key === null) {
        colecoesRef.current = carregarTudo();
        configRef.current = lerConfig();
        setColecoes(colecoesRef.current);
        setConfig(configRef.current);
        return;
      }
      if (e.key === CHAVE_CONFIG) {
        configRef.current = lerConfig();
        setConfig(configRef.current);
        return;
      }
      const nome = NOMES_COLECOES.find((n) => chaveColecao(n) === e.key);
      if (!nome) return;
      colecoesRef.current = { ...colecoesRef.current, [nome]: lerColecao(nome) };
      setColecoes(colecoesRef.current);
    }
    window.addEventListener('storage', aoMudarStorage);
    return () => window.removeEventListener('storage', aoMudarStorage);
  }, []);

  const valor = useMemo(
    () => ({ colecoes, config, aplicar, atualizarConfig }),
    [colecoes, config, aplicar, atualizarConfig],
  );

  return (
    <ColecoesContext.Provider value={valor}>
      {children}
      {toast && <Toast message={toast} onClose={fecharToast} />}
    </ColecoesContext.Provider>
  );
}
