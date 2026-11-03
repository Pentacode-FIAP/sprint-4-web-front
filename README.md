# JOVI Cam

Câmera simplificada, guiada por IA e integrada a um app de estudos. Projeto do grupo **Pentacode** para o **Challenge FIAP x JOVI Mobile**.

> ## Aviso: a IA não funciona no `localhost`
>
> Rodando localmente (`npm run dev`, `npm run preview`), **os recursos de IA não funcionam**: ao usá-los, o app mostra a mensagem *"A IA não está disponível nesta execução local. Use o site publicado para testar os recursos de IA."*
> Os recursos de IA estão disponíveis **no site publicado** (link na seção [Deploy](#deploy)).
> Todo o resto do app funciona normalmente no `localhost`.

## Sobre o projeto

A JOVI Mobile apresentou dois problemas: a interface de câmera dos aparelhos tem muitos modos e configurações, e a marca não oferecia nada pensado para estudantes. O JOVI Cam junta os dois em um produto só: uma câmera com poucos modos e um app de estudos conectado a ela.

**Câmera**
- Modos IA, Estudo, Foto, Noite e Vídeo, com onboarding no primeiro acesso e tela de configuração de modos (`/camera/modos`).
- No modo Estudo, a foto vai para a galeria e o botão "Copiar texto" extrai o texto da imagem com IA (OCR).

**App de estudos**
- Matérias, resumos (a partir de fotos ou de texto colado), anotações e lembretes no calendário.
- Exercícios de múltipla escolha com correção, dicas e explicação.
- Simulados com tempo, nota e revisão; histórico dos últimos simulados.
- Plano para provas no calendário (revisão, treino e simulado).
- Progresso: ofensiva, meta diária, gráficos, insights e fila de revisão dos erros.
- Chat com IA sobre o material salvo.

### Evolução em relação à Sprint 3

A Sprint 3 era um app React + Vite sem rotas e sem Tailwind. Nesta entrega o projeto evoluiu para:

- rotas com `react-router-dom` e layout responsivo (mobile, tablet e desktop);
- estilização com Tailwind CSS;
- lógica separada da interface em hooks customizados (`src/hooks`);
- novas funcionalidades: exercícios com tentativas e fila de revisão, simulados, plano para provas, tela de Progresso, câmera com hook próprio e dados de exemplo.

## Tecnologias

- React 18 e JavaScript (JSX)
- Vite 5
- react-router-dom 6
- Tailwind CSS 4
- lucide-react (ícones)
- Google Gemini, chamado diretamente pelo navegador com `fetch`
- `localStorage` para guardar os dados

## Instalação

Requisitos: [Node.js](https://nodejs.org/) 20 ou superior e npm.

```bash
npm install
```

## Execução

```bash
npm run dev       # servidor de desenvolvimento (http://localhost:5173)
npm run build     # gera a versão de produção em dist/
npm run preview   # serve localmente a versão gerada
```

Não é preciso criar nenhum arquivo `.env` nem configurar nada para rodar. Se o navegador pedir, permita o uso da câmera; sem câmera, o restante do app continua funcionando.

## Como testar sem IA

1. Rode `npm run dev` e abra a URL exibida.
2. No primeiro acesso aparece o onboarding da câmera. Conclua-o ou pule.
3. Abra **Progresso** (`/progresso`) e use o botão **Preencher com dados de exemplo** (depois de preenchido, o botão passa a ser **Recarregar dados de exemplo**). Isso substitui os dados do navegador por matérias, fotos, resumos, exercícios, simulados, lembretes e um histórico de estudo de demonstração, após uma confirmação.
4. Explore `/estudar`, `/galeria` e `/calendario` (inclusive o plano para provas). Em `/chat`, sem a IA, a tela mostra o aviso de que ela não está disponível e o campo de mensagem fica desabilitado; nada é gravado.

Tudo isso funciona sem IA. Apenas a geração de conteúdo (resumos, questões, simulados, dicas, OCR e respostas do chat) depende do site publicado.

## Servidores, autenticação e dados

- **Não há back-end.** O app é só front-end; não existe servidor próprio nem banco de dados.
- **Não há login, usuários nem senhas.** Todas as rotas são públicas.
- **Os dados ficam no `localStorage` do navegador** (no aparelho de quem usa). Limpar os dados do site apaga tudo.

Rotas: `/` (câmera), `/camera/modos`, `/progresso`, `/estudar`, `/chat`, `/galeria`, `/calendario`; qualquer outro caminho mostra a página "não encontrada".

## Uso de IA

**No produto:** o JOVI Cam usa o Google Gemini, chamado pelo navegador, para extrair texto de fotos (OCR), gerar resumos, criar questões de múltipla escolha, montar simulados, dar dicas e explicações nas questões e responder às dúvidas no chat de estudos. Esses recursos funcionam no site publicado; no `localhost` o app avisa que a IA não está disponível.

**No desenvolvimento:** usamos agentes de IA como auxílio no desenvolvimento do projeto.

## Deploy

A definir na Task 14

## Integrantes

Grupo **Pentacode**:

- Arthur Jircik - RM 570754
- Andre Luiz - RM 573575
- Felipe Garcia - RM 571741
- Guilherme Amorim - RM 569024
- Matheus Marcelino - RM 571472

A lista também está em `INTEGRANTES.TXT`.
