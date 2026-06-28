# PRISMA TV — Plano da Etapa 3

*Campanha e convite. Documento para revisar e aprovar **antes** de qualquer código ou SQL. Mesmo espírito do `PLANO_DA_ETAPA_2.md`: escopo pequeno, decisões no topo, blocos testáveis, nada de inchar.*

> **Objetivo da Etapa 3, em uma frase:** uma **Mestra** cria **uma campanha** (a PRISMA TV) e **convida jogadores** por código/link; um **Jogador** entra na campanha usando esse código e passa a ser **membro** dela — tudo com segurança (RLS), e **sem** ainda criar ficha, rolagens ou painel completo.

---

## Decisões para você aprovar (antes de tudo)

Estas escolhas definem tabelas, RLS e fluxo. Minha recomendação ao lado; é só confirmar ou trocar.

1. **Papel global vs. papel por campanha.**
   - Hoje existe `profile.role` (global, `jogador`/`mestra`). O modelo prevê `campaign_member` com papel **por campanha**.
   - **Recomendação:** o papel que **vale para a experiência** passa a ser o **da campanha** (`campaign_member.role`). O `profile.role` global vira **secundário** (um "padrão"/atalho), e quem manda dentro de uma campanha é o papel naquela campanha. Assim, no futuro, a mesma conta poderia ser mestra numa campanha e jogadora em outra. *Para a V1 (uma campanha só), na prática os dois coincidem — mas modelar certo agora evita retrabalho.*
   - **Alternativa:** manter só o `profile.role` global e não usar papel em `campaign_member`. Mais simples agora, porém amarra a conta a um único papel para sempre. **Não recomendo.**

2. **Quem pode criar campanha.**
   - **Recomendação:** **qualquer usuário autenticado** pode criar uma campanha e, ao criar, **vira `mestra` daquela campanha** (vira o `owner`). Simples e suficiente para a V1.
   - *(Não vamos depender do `profile.role` global para "poder criar"; criar uma campanha é o que torna alguém mestra dela.)*

3. **Quantas campanhas por pessoa (nesta etapa).**
   - **Recomendação:** o **modelo** suporta várias (uma pessoa pode ser dona de N campanhas e membro de N), mas a **UI da Etapa 3** assume **uma campanha ativa** para manter simples. Sem listas/seletores complexos agora.

4. **Formato do convite.**
   - **Recomendação:** um **código curto por campanha** (ex.: 6–8 caracteres, tipo `PRISMA-7K2Q`), que vira a base do **link** (`/entrar?codigo=...`) e, no futuro, do **QR**. Detalhes (rotativo? expira? limite de usos?) na seção "Como o convite funciona". Para a V1, recomendo **código fixo por campanha, regenerável pela Mestra** — sem expiração nem limite, simples e suficiente para uma mesa privada.

5. **O que acontece ao entrar com um código.**
   - **Recomendação:** o Jogador autenticado abre o link/insere o código → o sistema valida → cria uma linha em `campaign_member` com `role = 'jogador'` para aquela campanha. Idempotente (entrar duas vezes não duplica).

6. **Relação com a rota `/inicio` (Etapa 2).**
   - **Recomendação:** `/inicio` passa a refletir o **estado de campanha**: se a pessoa **não** tem campanha, oferece "criar campanha" (se mestra-candidata) ou "entrar com código"; se **tem**, mostra a campanha e o papel **dentro dela**. Mudança mínima, sem virar painel.

---

## 1. Objetivo da Etapa 3

Entregar a **base de campanha e convite**: criar campanha (Mestra), entrar por código (Jogador), e o vínculo `campaign_member` com papel por campanha — protegido por RLS. É o alicerce para, nas próximas etapas, pendurar ficha, sessões e painel **dentro de uma campanha**.

---

## 2. O que ENTRA na Etapa 3

1. Tabela **`campaign`** (a campanha, com dono/Mestra e código de convite).
2. Tabela **`campaign_member`** (vínculo usuário ↔ campanha, com **papel na campanha**).
3. **Criar campanha** (usuário autenticado vira Mestra/owner; gera código de convite).
4. **Entrar por código/link** (Jogador autenticado vira membro com `role = 'jogador'`).
5. **RLS** em ambas as tabelas (membros leem a própria campanha; Mestra gerencia a dela; ninguém vê campanha alheia).
6. **Regenerar o código** de convite (Mestra).
7. Ajuste mínimo da **`/inicio`** para refletir o estado de campanha (criar / entrar / ver campanha + papel).
8. **Rota de entrada por link** (ex.: `/entrar?codigo=...`).
9. Publicação e teste (local e produção) do fluxo.

---

## 3. O que fica FORA da Etapa 3

- ❌ **Ficha** (personagem, atributos, trackers) — etapas seguintes.
- ❌ **Rolagens**.
- ❌ **Painel da Mestra completo** (visão de mesa, ajustes, validação). Nesta etapa, no máximo "ver a campanha e quem entrou", **sem** controles.
- ❌ **Sessões/diário**.
- ❌ **Sistema visual complexo** (seletor de múltiplas campanhas, dashboards, animações novas).
- ❌ **QR Code renderizado** (o código/link já preparam o terreno; gerar a imagem do QR pode ficar para o fim da V1).
- ❌ **Convite por e-mail** (depende de SMTP, que não usamos). Convite é por **código/link**.
- ❌ **Remover/banir membros, transferir campanha, papéis extras** (co-mestre etc.) — futuro.
- ❌ Qualquer coisa da **Etapa 4** (IA, documentos, etc.).

---

## 4. Decisões técnicas necessárias (resumo do que será fixado)

- **Papel efetivo = `campaign_member.role`** (decisão #1); `profile.role` global continua existindo como padrão.
- **Identidade da campanha:** `uuid` PK; dono via `owner_id → auth.users`. 
- **Código de convite:** string curta única por campanha; regenerável; sem expiração na V1.
- **Enum de papel na campanha:** reutilizar `user_role` (`jogador`/`mestra`) **ou** criar um enum próprio `campaign_role`. *Recomendação:* **reutilizar `user_role`** (já existe, mesmos valores) para não multiplicar tipos. (Decisão menor, mas registro.)
- **RLS sem recursão:** as políticas que perguntam "este usuário é membro/dono desta campanha?" devem usar **funções `SECURITY DEFINER`** (que ignoram RLS internamente) para evitar **recursão de política** entre `campaign` e `campaign_member`. Isso é detalhe de implementação; o SQL final vem nos blocos, revisado pelo Codex.
- **Validação do código de convite no servidor:** a "entrada por código" acontece via **Server Action/Route Handler** no servidor (não confiar no cliente). A leitura do código para validar pode precisar de uma função `SECURITY DEFINER` que devolve só o `campaign_id` correspondente, sem expor a tabela inteira.

---

## 5. Proposta de tabelas (nível de plano — NÃO é o SQL final)

```
campaign
├─ id           uuid  (PK, default gen_random_uuid())
├─ owner_id     uuid  (FK -> auth.users, NOT NULL)   -- a Mestra dona
├─ name         text  (NOT NULL)                      -- ex.: "PRISMA TV"
├─ invite_code  text  (UNIQUE, NOT NULL)              -- ex.: "PRISMA-7K2Q"
├─ created_at   timestamptz default now()
└─ updated_at   timestamptz default now()

campaign_member
├─ id           uuid  (PK, default gen_random_uuid())
├─ campaign_id  uuid  (FK -> campaign ON DELETE CASCADE, NOT NULL)
├─ user_id      uuid  (FK -> auth.users ON DELETE CASCADE, NOT NULL)
├─ role         user_role  (NOT NULL, default 'jogador')   -- papel NA campanha
├─ created_at   timestamptz default now()
└─ UNIQUE (campaign_id, user_id)   -- 1 vínculo por pessoa por campanha
```

Notas:
- Ao **criar** uma campanha, cria-se também a linha de `campaign_member` do dono com `role = 'mestra'` (idealmente numa transação/função, para nascerem juntas).
- `UNIQUE (campaign_id, user_id)` garante idempotência de entrada (entrar 2x não duplica).
- `owner_id` redundante com "o membro mestra"? É proposital: `owner_id` deixa explícito quem é o dono mesmo que no futuro haja vários papéis; simplifica RLS de "gestão".

---

## 6. Proposta de RLS (nível de plano — NÃO é o SQL final)

Princípio: **fechado por padrão**, abrir só o necessário; testar como `anon`/`authenticated`, nunca como `postgres`.

- **`campaign` (SELECT):** um usuário pode ler uma campanha se for **dono** (`owner_id = auth.uid()`) **ou** **membro** dela (existe linha em `campaign_member` com aquele `campaign_id` e `user_id = auth.uid()`). → para evitar recursão, o "é membro?" usa **função `SECURITY DEFINER`**.
- **`campaign` (INSERT):** autenticado pode criar campanha **com `owner_id = auth.uid()`** (`with check`).
- **`campaign` (UPDATE):** só o **dono** (`owner_id = auth.uid()`) — ex.: renomear, regenerar `invite_code`.
- **`campaign` (DELETE):** fora da V1 (ou só dono; decidir nos blocos). Recomendo **não** expor delete agora.
- **`campaign_member` (SELECT):** um usuário pode ver os membros de uma campanha se for **dono ou membro** dela (mesma função `SECURITY DEFINER`); no mínimo, **vê o próprio vínculo**.
- **`campaign_member` (INSERT):** a entrada por código é feita por **função/Server Action no servidor** que valida o código e insere `user_id = auth.uid()`, `role = 'jogador'`. Política restrita para o usuário só conseguir inserir o **próprio** vínculo.
- **`campaign_member` (UPDATE/DELETE):** fora da V1 (gerir membros é futuro).

A função `SECURITY DEFINER` central (algo como `is_campaign_member(campaign_id, user_id)`) com `search_path` travado é o que quebra a recursão e centraliza a regra de pertencimento. (Detalhe de implementação; SQL final nos blocos.)

---

## 7. Fluxo da Mestra

1. Mestra autenticada acessa `/inicio` (ou uma rota de campanha) e **não** tem campanha → opção **"Criar campanha"**.
2. Informa um nome (ex.: "PRISMA TV") → o sistema cria a `campaign` (com `owner_id` = ela) **e** o `campaign_member` dela com `role = 'mestra'`, e gera o `invite_code`.
3. A Mestra vê a campanha criada, seu **papel (MESTRA)** e o **código/link de convite** para compartilhar.
4. Pode **regenerar** o código (invalida o anterior).
5. (Opcional, leitura) ver **quem já entrou** (lista simples de membros) — sem controles de gestão.

---

## 8. Fluxo do Jogador

1. Jogador recebe o **link** (`/entrar?codigo=PRISMA-7K2Q`) ou o **código** para digitar.
2. Se não estiver logado, é levado a `/login` (ou `/signup`); depois volta ao fluxo de entrada.
3. Autenticado, ao abrir o link/inserir o código → o servidor **valida** o código e cria o `campaign_member` (`role = 'jogador'`). Idempotente.
4. Jogador vê que entrou na campanha e seu **papel (JOGADOR)** ali. (Ainda sem ficha — isso é etapa seguinte.)

---

## 9. Como o convite (código/link) deve funcionar

- **Código:** curto, único por campanha, legível (ex.: prefixo `PRISMA-` + 4–5 caracteres alfanuméricos sem ambíguos como O/0, I/1). Gerado na criação; **regenerável** pela Mestra.
- **Link:** `https://prisma-tv-pi.vercel.app/entrar?codigo=<CÓDIGO>` (e `http://localhost:3000/entrar?codigo=...` em dev).
- **QR:** **fora desta etapa** renderizar a imagem; o link já é "QR-ready" para o fim da V1.
- **Validação:** sempre **no servidor**. O código resolve para um `campaign_id` (via função `SECURITY DEFINER` que não expõe a tabela toda). Código inválido → mensagem clara, sem vazar se a campanha existe.
- **V1 (recomendado):** sem expiração e sem limite de usos (mesa pequena, privada). Regenerar o código é a forma de "revogar" convites antigos.
- *(Decisões opcionais para você: quer expiração? limite de usos? Recomendo **não**, para simplificar.)*

---

## 10. Riscos de segurança

- **Recursão de política RLS** (`campaign` ↔ `campaign_member`) → loop no Postgres. **Mitigação:** função `SECURITY DEFINER` para "é membro?/é dono?", com `search_path` travado.
- **Vazar campanhas alheias** → SELECT mal escrito deixando ver tudo. **Mitigação:** políticas restritas a dono/membro; **testar como `anon` e como outro usuário** (não só `postgres`).
- **Enumerar códigos de convite** → adivinhar códigos curtos. **Mitigação:** código com entropia razoável (evitar muito curto), validação server-side, e regenerável. (Para mesa privada o risco é baixo, mas registro.)
- **Inserir vínculo para outra pessoa** → usuário tentando entrar como `user_id` alheio ou se autopromover a `mestra`. **Mitigação:** Server Action força `user_id = auth.uid()` e `role = 'jogador'`; políticas com `with check` correspondentes.
- **Auto-promoção a Mestra** → `campaign_member.update` exposto. **Mitigação:** **não** expor UPDATE de `role` na V1.
- **Confiar no cliente** para validar código → bypass. **Mitigação:** validação e inserção **no servidor**.
- **Service_role** continua **proibida** no cliente; segredos só no `.env.local`/Vercel.

---

## 11. Ordem sugerida de blocos pequenos

Cada bloco no formato de 11 itens + relatório, com "quem executa" (você no painel/SQL vs. Codex no repo).

- **Bloco 3.0 — Plano aprovado + decisões fixadas** (este documento; registrar decisões na Memória).
- **Bloco 3.1 — Banco: `campaign` + `campaign_member` + enum/RLS + função de pertencimento** (você no SQL Editor; Codex revisa o SQL). Testar RLS como `anon`/2 usuários.
- **Bloco 3.2 — Função/Server Action "criar campanha"** (cria campanha + membership da Mestra juntas). Codex no repo. Testar criação.
- **Bloco 3.3 — Função/Server Action "entrar por código"** (valida código, cria membership do Jogador, idempotente). Codex no repo. Testar entrada e idempotência.
- **Bloco 3.4 — Rota `/entrar?codigo=...`** (link de convite) + ligação com login. Codex no repo.
- **Bloco 3.5 — Ajuste mínimo da `/inicio`** (refletir estado: sem campanha → criar/entrar; com campanha → ver campanha + papel + código). Codex no repo.
- **Bloco 3.6 — Regenerar código (Mestra)** + (opcional) lista simples de membros. Codex no repo.
- **Bloco 3.7 — Publicação (Vercel CLI) + teste em produção e no celular** + atualização da Memória (Etapa 3 concluída).

*(Ordem pode ser ajustada na execução; a ideia é banco → criar → entrar → link → UI mínima → regenerar → publicar.)*

---

## 12. Critérios de aprovação (da Etapa 3 como um todo)

- `campaign` e `campaign_member` criadas, com **RLS fechado** (testado como `anon` e como dois usuários diferentes; ninguém vê campanha alheia).
- **Criar campanha** funciona: nasce a campanha + o vínculo da Mestra (`role = 'mestra'`) e o `invite_code`.
- **Entrar por código/link** funciona: Jogador vira `campaign_member` (`role = 'jogador'`), idempotente; código inválido tratado.
- **Regenerar código** funciona (Mestra); código antigo deixa de valer.
- **`/inicio`** reflete o estado de campanha sem virar painel; mostra papel **da campanha**.
- **Sem** ficha/rolagens/painel completo; **sem** `service_role`/segredos expostos.
- Publicado e testado em **produção** e **no celular**.

---

## 13. Quais arquivos provavelmente serão tocados

- **Banco (Supabase, via painel):** SQL de `campaign`/`campaign_member`/enum/RLS/funções. (Opcional: salvar cópia em `db/` ou `supabase/migrations/`, se você aprovar.)
- **Server Actions:** provavelmente `src/app/(campaign)/actions.ts` (ou reutilizar/ampliar a área de actions) — criar campanha, entrar por código, regenerar código.
- **Rotas:** `src/app/entrar/page.tsx` (ou route handler) para o link de convite; ajuste em `src/app/inicio/page.tsx`.
- **Lib:** talvez `src/lib/campaign/*` para leitura "minha campanha + papel" no servidor (se reduzir duplicação).
- **Componentes:** pequenos, reutilizando os existentes (`Field`, `PrimaryButton`, atmosfera) para os formulários de criar/entrar.

## 14. Quais arquivos NÃO devem ser tocados

- `src/lib/supabase/**` e `src/proxy.ts` (a fiação de auth está pronta; não mexer salvo justificativa).
- `/signup` e `/login` (a auth já funciona; no máximo um link de "entrar" pode apontar para eles, sem alterá-los).
- `globals.css`, `manifest.json`, `sw.js`, `public/**` (sem mudança visual base).
- `package.json`/`.env.local`/`.gitignore` (sem dependências novas previstas).
- Nada de ficha, rolagens, painel completo, ou Etapa 4.

---

## 15. Como testar localmente

- **Banco:** no SQL Editor, conferir tabelas/políticas; testar SELECT como **`anon`** (deve negar) e simular **dois usuários** (um dono, um membro) para garantir isolamento.
- **Criar campanha:** logar como usuário A → criar campanha → conferir no Table Editor a `campaign` e o `campaign_member` (A como `mestra`) + o `invite_code`.
- **Entrar por código:** logar como usuário B → abrir `/entrar?codigo=...` (ou digitar o código) → conferir `campaign_member` (B como `jogador`); repetir para checar **idempotência** (não duplica).
- **Isolamento:** usuário C (sem entrar) **não** deve ver a campanha de A/B em `/inicio`.
- **Regenerar código:** como A, regenerar → o código antigo não funciona mais; o novo funciona.
- `npm.cmd run lint` / `npm.cmd run build` / `npm.cmd run dev` a cada bloco de repo.

## 16. Como testar em produção depois

- Configurar nada novo de variável (as do Supabase já estão na Vercel). Publicar via **Vercel CLI** (`vercel --prod`).
- Repetir no link de produção: criar campanha (conta A), pegar o link de convite, **entrar pelo celular** com a conta B, confirmar papéis e isolamento.
- Conferir que o **link de convite de produção** (`https://prisma-tv-pi.vercel.app/entrar?codigo=...`) funciona no celular.

---

## 17. Relatório obrigatório ao fim de cada bloco

Todo bloco da Etapa 3 termina com relatório resumido e completo:
1. arquivos criados/alterados (se houver);
2. SQL executado (se houver);
3. mudanças de painel (Supabase/Vercel, se houver);
4. comandos executados;
5. resultado de `lint`/`build`/`dev` (e testes de painel);
6. resultado dos testes (incluindo RLS como `anon`/2 usuários quando aplicável);
7. riscos restantes;
8. o que NÃO foi feito;
9. precisa commit? (mensagem sugerida);
10. precisa deploy? (lembrando: Vercel CLI);
11. confirmação de que não avançou além do bloco/da Etapa 3.

---

*Fim do plano da Etapa 3. Nada será executado até você aprovar este documento e as decisões do topo. Aprovando, o primeiro passo é o **Bloco 3.0** (registrar as decisões na Memória) e, em seguida, o **Bloco 3.1** (banco: `campaign` + `campaign_member` + RLS), no formato de 11 itens para o Codex/você.*
