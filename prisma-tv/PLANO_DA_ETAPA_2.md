# PRISMA TV — Plano da Etapa 2

*Autenticação real com Supabase. Documento para revisar e aprovar **antes** de escrever qualquer código. Mesmo espírito do `PLANO_DA_ETAPA_1.md`: escopo pequeno, passos testáveis, nada de inchar.*

> **Objetivo da Etapa 2, em uma frase:** uma pessoa consegue **criar conta, entrar e sair** do app de verdade; ao entrar, o sistema **sabe quem ela é e se é Jogador ou Mestra**, e **rotas protegidas só abrem logado** — tudo sem ainda ter ficha, campanha ou painel.

---

## Decisões para você aprovar (antes de tudo)

Quatro escolhas definem o resto. Minha recomendação ao lado; é só você confirmar ou trocar.

1. **Método de login:** **e-mail + senha** (recomendado para a V1). É o mais simples e previsível para uma mesa pequena, sem depender de entrega de e-mail funcionando perfeitamente. *Link mágico e login social ficam para depois, se você quiser.*
2. **Cadastro aberto ou fechado:** por enquanto **aberto** (quem tem o link cria conta, e entra como `jogador`). É o mais simples agora. *Quando a campanha/convite chegar (Etapa 3), dá para fechar o cadastro e exigir convite.*
3. **Confirmação de e-mail:** **ligada** (padrão do Supabase, mais seguro) — exige clicar num link enviado por e-mail. *Se atrapalhar nos testes, dá para desligar no painel do Supabase durante o desenvolvimento e religar depois. Você decide.*
4. **Onde o papel mora nesta etapa:** um campo **`role` global na tabela `profile`** (`jogador`/`mestra`). Simples e suficiente para a Etapa 2. *Quando houver campanha, o papel por campanha (`campaign_member`) refina isso — sem quebrar o que fizermos agora.*

---

## O que ENTRA na Etapa 2

1. Projeto no **Supabase** criado e conectado ao app.
2. **Cadastro** de conta real (e-mail + senha) e **confirmação por e-mail**.
3. **Login** real (ligando a tela `/login` visual que já existe) e **logout**.
4. Tabela **`profile`** (perfil do usuário) com **papel** `jogador`/`mestra`.
5. **Criação automática do perfil** quando a conta nasce.
6. **Sessão** mantida via cookies (com renovação automática pelo middleware).
7. **Rota(s) protegida(s):** uma **área pós-login mínima** que só abre logado e mostra "você está logado como `<e-mail>` · papel: `<jogador/mestra>`".
8. **Diferenciação simples** entre Jogador e Mestra (cada papel vê um texto/placeholder diferente — ainda sem telas reais).
9. **Variáveis de ambiente** configuradas com segurança (local e na Vercel).
10. App **publicado** com o login funcionando no celular.

---

## O que fica FORA da Etapa 2

- ❌ **Ficha** (criação, campos, trackers) → etapas seguintes.
- ❌ **Painel da Mestra** funcional → etapa seguinte.
- ❌ **Campanha** e **convite** → Etapa 3.
- ❌ **Rolagens** → etapa posterior.
- ❌ **Banco completo** (as ~14 tabelas do modelo) → criadas fase a fase. **Nesta etapa só nasce a `profile`.**
- ❌ **IA**, **cenas visuais**, **documentos/pistas** → fases futuras.
- ❌ Mudança no **visual base** sem necessidade (só ligamos o `/login` que já existe e criamos uma área pós-login simples).
- ❌ Qualquer coisa que **quebre o app publicado** (vamos em passos testáveis).

---

## Como será o uso do Supabase Auth

- Usaremos o pacote oficial **`@supabase/ssr`** (o `auth-helpers` está descontinuado) junto com `@supabase/supabase-js`.
- Haverá **dois clientes** Supabase, organizados em `src/lib/supabase/`:
  - **cliente de navegador** (`client.ts`) — para Client Components;
  - **cliente de servidor** (`server.ts`) — para Server Components, Server Actions e Route Handlers.
- Um **middleware** (`src/middleware.ts`) **renova a sessão** a cada navegação (porque Server Components não escrevem cookies) e serve de porta para **redirecionar quem não está logado**.
- A **sessão** fica em **cookies** gerenciados pelo Supabase; o servidor lê o usuário a partir deles.
- Para **autorização** (proteger página/saber o papel), o servidor verifica a identidade com `getClaims()`/`getUser()` — **nunca** confiando cegamente no `getSession()` para decisão de acesso.
- **Segurança em duas barreiras (como na memória):** **RLS (Row Level Security)** ligado na tabela `profile` é a barreira do banco; o cliente usa a **chave publishable** (pública por natureza) e o RLS garante que cada um só lê/edita o próprio perfil. Operações privilegiadas (com chave secreta) **não** são necessárias nesta etapa e ficam fora.

---

## Variáveis de ambiente

Só **duas**, e ambas podem ser públicas (são feitas para isso):

- `NEXT_PUBLIC_SUPABASE_URL` — a URL do seu projeto Supabase.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — a chave **publishable** (`sb_publishable_...`). *O painel pode ainda mostrar `NEXT_PUBLIC_SUPABASE_ANON_KEY`; o valor da chave `anon` serve nesse mesmo nome durante a transição.*

> A **chave secreta / service_role** (privilegiada) **não** será usada nesta etapa. Quando um dia for, ela vai **só no servidor**, **nunca** com prefixo `NEXT_PUBLIC_` e **nunca** no repositório.

---

## Onde colocar as chaves no `.env.local`

- Arquivo **`.env.local`** na **raiz do projeto** (`prisma-tv/.env.local`), com as duas linhas acima preenchidas.
- Esse arquivo é **só seu, local**. O `create-next-app` já configurou o `.gitignore` para ignorar `.env*`, então ele **não vai** para o GitHub.
- Depois de criar/editar o `.env.local`, é preciso **reiniciar o `npm run dev`** para o Next reler as variáveis.

---

## Como configurar as mesmas variáveis na Vercel

1. No projeto na Vercel: **Settings → Environment Variables**.
2. Adicionar **`NEXT_PUBLIC_SUPABASE_URL`** e **`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`** com os mesmos valores do `.env.local`.
3. Marcar os ambientes (no mínimo **Production**; pode marcar Preview/Development também).
4. **Redeploy** — variáveis novas só passam a valer num novo deploy.

---

## Como evitar subir segredos para o GitHub

- **`.env.local` já está no `.gitignore`** (vem do `create-next-app`). Antes do primeiro commit desta etapa, conferir com `git status` que **nenhum** arquivo `.env*` aparece na lista.
- **Nunca** colar chave dentro de um arquivo de código versionado.
- Variáveis `NEXT_PUBLIC_` são expostas ao navegador **de propósito** — por isso só colocamos ali a URL e a chave **publishable**, que são públicas. Qualquer segredo de verdade (service_role) fica fora do `NEXT_PUBLIC_` e fora do Git.
- Se algum dia uma chave secreta vazar para o repositório, o procedimento é **rotacionar** (gerar nova) no Supabase — guardo isso como nota de segurança.

---

## A tabela `profile`

Perfil do usuário, ligada 1:1 ao usuário de autenticação do Supabase. Campos previstos (nível de plano, não é o SQL final):

```
profile
├─ id            uuid  (PK, = id do usuário em auth.users)
├─ role          user_role  (enum: 'jogador' | 'mestra')  default 'jogador'
├─ display_name  text  (nome de exibição; opcional na Etapa 2)
├─ created_at    timestamptz  default now()
└─ updated_at    timestamptz  default now()
```

- **Enum `user_role`:** `jogador`, `mestra`.
- **RLS ligado:** políticas para o usuário **ler e editar apenas o próprio** `profile` (`id = auth.uid()`).
- **Criação automática:** um **gatilho** simples cria a linha de `profile` (com `role = 'jogador'`) assim que uma conta nasce em `auth.users`. *(Alternativa, se preferir não usar gatilho: o app cria/garante o perfil no primeiro login. Recomendo o gatilho por ser mais confiável; é poucas linhas, não é "banco complexo".)*

> É a **única** tabela criada na Etapa 2. As demais (campanha, personagem, etc.) vêm nas etapas seguintes.

---

## Papéis iniciais: `jogador` e `mestra`

- Todo mundo nasce **`jogador`** (padrão seguro).
- A **Mestra** (você) é definida **manualmente** nesta etapa: depois de criar sua conta, mude o `role` do seu `profile` para **`mestra`** direto no painel do Supabase (Table editor). Sem tela de "promover usuário" agora — isso seria escopo a mais.
- *Quando a campanha existir (Etapa 3), o papel por campanha (`campaign_member`) passa a mandar dentro de cada campanha; o `profile.role` continua como papel global/base.*

---

## O fluxo (abrir → login → entrar → perfil → área pós-login)

1. **Abrir o app** → roda a splash → cai na home (`/`).
2. **Ir para o login** → o usuário acessa `/login` (ou é mandado para lá ao tentar abrir uma rota protegida sem estar logado).
3. **Entrar** → digita e-mail e senha; o app autentica no Supabase. *(Se for cadastro: cria a conta em `/signup`, confirma pelo e-mail, e então faz login.)*
4. **Criar/obter perfil** → na primeira vez, o `profile` é criado automaticamente (gatilho) com `role = 'jogador'`; nas próximas, o app apenas lê o perfil existente.
5. **Ir para a área pós-login** → uma rota protegida mínima abre mostrando "logado como `<e-mail>` · papel: `<jogador/mestra>`", com um botão **Sair**. *(Aqui, no futuro, jogador vai para a ficha e mestra para o painel — mas isso é etapa seguinte.)*

---

## Rotas novas necessárias

- **`/signup`** — criar conta (visual + ação real). *(Pode, no futuro, ser fechada por convite.)*
- **`/login`** — **já existe** (visual do Bloco 11) → será **ligada** à autenticação real (sem refazer o visual).
- **Área pós-login** (ex.: **`/app`** ou **`/inicio`**) — rota **protegida**, mínima, mostrando quem está logado e o papel.
- **`/auth/callback`** — *route handler* que recebe o link de confirmação de e-mail e troca o código por sessão.
- **Sair (logout)** — um *route handler* ou *server action* que encerra a sessão.

Arquivos de apoio (não são telas) que vão nascer: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/middleware.ts` e um pequeno helper para "pegar usuário + perfil no servidor".

---

## Como proteger rotas que exigem login

- O **middleware** renova a sessão a cada navegação e pode **redirecionar para `/login`** quem tentar acessar a área protegida sem estar logado.
- A **própria área protegida** (no servidor) confere o usuário com `getClaims()`/`getUser()` antes de renderizar; se não houver usuário, redireciona para `/login`. *(Dupla checagem: middleware + a página no servidor.)*
- Rotas públicas (`/`, `/login`, `/signup`) continuam abertas.

---

## Como diferenciar Jogador e Mestra

- Depois de autenticar, o **servidor lê o `profile.role`** do usuário.
- Na Etapa 2, a área pós-login só usa isso para **mostrar um texto/placeholder diferente** por papel (ex.: jogador vê "sua ficha aparecerá aqui"; mestra vê "seu painel aparecerá aqui"). **Sem** telas reais ainda.
- *Nas próximas etapas, esse mesmo `role` decide o destino (ficha vs painel) e o que cada um pode ver/fazer, reforçado pelo RLS no banco.*

---

## Sub-blocos de implementação (pequenos e testáveis)

Cada um entrega algo verificável; só se avança com o anterior funcionando.

- **Bloco 2.0 — Criar projeto no Supabase.** No painel do Supabase: criar a conta/projeto, anotar a **URL** e a **chave publishable**. *Sem código.* *Teste:* projeto criado e chaves em mãos.
- **Bloco 2.1 — Instalar libs + variáveis.** Instalar `@supabase/supabase-js` e `@supabase/ssr`; criar `.env.local`; configurar as 2 variáveis na Vercel; conferir que `.env*` não aparece no `git status`. *Teste:* `npm run dev` roda normal; `git status` limpo de segredos.
- **Bloco 2.2 — Clientes Supabase + middleware.** Criar `client.ts`, `server.ts` e `middleware.ts` (renovação de sessão). *Teste:* app continua abrindo `/` e `/login` sem erro; sessão "encanada".
- **Bloco 2.3 — Tabela `profile` + papéis + RLS + gatilho.** No Supabase: enum `user_role`, tabela `profile`, RLS (cada um só o próprio), gatilho de criação automática. *Teste:* dá para inspecionar a tabela vazia e as políticas no painel.
- **Bloco 2.4 — Cadastro real (`/signup`) + callback.** Tela de cadastro ligada ao Supabase + `/auth/callback` para confirmar e-mail. *Teste:* criar uma conta → aparece em **Authentication** no Supabase e uma linha em `profile` (via gatilho).
- **Bloco 2.5 — Login real + logout.** Ligar o `/login` visual à autenticação; botão Sair. *Teste:* entrar e sair funcionando.
- **Bloco 2.6 — Proteção de rota + área pós-login.** Criar `/app` (ou `/inicio`) protegida mostrando "logado como `<e-mail>` · papel". *Teste:* deslogado em `/app` → vai para `/login`; logado → mostra os dados.
- **Bloco 2.7 — Definir a Mestra + diferenciação.** Marcar seu `profile` como `mestra` no painel; a área pós-login mostra placeholder diferente por papel. *Teste:* sua conta vê "mestra"; uma conta de teste vê "jogador".
- **Bloco 2.8 — Publicar e testar no celular.** Garantir as variáveis na Vercel, `push`, e testar cadastro/login/logout pelo link de produção no celular. *Teste:* fluxo completo funcionando no celular.

---

## Critério de pronto da Etapa 2

A Etapa 2 está concluída quando **tudo** abaixo for verdade:

1. Projeto Supabase conectado; variáveis configuradas **localmente e na Vercel**, **sem** segredos no GitHub.
2. Dá para **criar conta** (com confirmação de e-mail) e ela aparece no Supabase.
3. A tabela **`profile`** existe, com **RLS** e o `role` `jogador`/`mestra`; o perfil é **criado automaticamente** no cadastro.
4. Dá para **entrar e sair** de verdade; a sessão persiste entre páginas.
5. A **rota protegida** só abre logado e mostra **quem é** e **o papel**.
6. **Jogador e Mestra** veem placeholders diferentes (diferenciação mínima funcionando).
7. O app **publicado** faz o fluxo de login no **celular**.
8. **Nada além disto** foi construído (sem ficha, campanha, painel ou rolagens).

---

## Como vamos trabalhar

- Passos pequenos, cada um testável, com explicação do "porquê" antes do "como", no mesmo ritmo da Etapa 1.
- A cada bloco, você confere (no navegador, no painel do Supabase ou no celular) antes de seguir.
- Só avançamos para a **Etapa 3 (campanha e convite)** depois da Etapa 2 verde e aprovada por você.

---

*Fim do plano da Etapa 2. Aprovando este documento (e as 4 decisões do topo), começamos pelo **Bloco 2.0 — criar o projeto no Supabase**.*
