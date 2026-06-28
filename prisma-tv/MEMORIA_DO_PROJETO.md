# PRISMA TV — Memória do Projeto

*Documento-âncora da V1. Resume tudo que já foi decidido e aprovado, para não se perder contexto entre conversas. Sempre que houver dúvida sobre "o que combinamos", a resposta está aqui.*

> **Status:** fundação de produto, modelo de dados e direção visual **fechados**. Moodboard **V1.4 congelado** como referência visual oficial. **Etapa 1 (fundação visual + PWA)** e **Etapa 2 (autenticação real com Supabase)** **CONCLUÍDAS e PUBLICADAS** na Vercel: **https://prisma-tv-pi.vercel.app**. Próximo passo combinado: **Etapa 3 — campanha e convite** (ainda **não** iniciada; começará por planejamento técnico antes do código).

---

## 0. Estado atual da implementação

**Etapa 1 — concluída e publicada (✅).** App no ar, instalável e fiel à identidade da PRISMA TV.

- ✅ App publicado na **Vercel** com link HTTPS fixo: **https://prisma-tv-pi.vercel.app**
- ✅ Projeto **Next.js + TypeScript + Tailwind + `src/`** criado e **versionado no GitHub**
- ✅ **Deploy de produção feito via Vercel CLI** (comando `vercel`/`vercel --prod`). ⚠️ **O deploy automático por `push` no `main` ainda NÃO está configurado** — a Vercel não foi conectada ao GitHub (houve um problema de login/conexão na importação). Por ora, **publicar uma nova versão exige rodar o deploy pela CLI** manualmente
- ✅ Fontes **Oswald / Inter / Space Mono** (via `next/font`) e **tokens** de cor no Tailwind
- ✅ **Componentes** base em `src/components/ui/` (RecBadge, Timecode, SpectralLine, BrandMark, Field, PrimaryButton, ScreenAtmosphere, PrismaSplash)
- ✅ **Atmosfera CRT** funcionando (chiado, scanlines, vinheta, barra de varredura vertical; respeita `prefers-reduced-motion`)
- ✅ **Assets** organizados em `public/brand/`, `public/icons/`, `public/reference/` + caminhos centrais em `src/lib/assets.ts`
- ✅ **Logo oficial transparente** integrada (sem retângulo/recriação)
- ✅ **PWA básica**: `manifest.json`, ícones (192/512 + maskable), metadados; **service worker mínimo** registrado e ativo
- ✅ **Splash** funcionando (entra a marca, fade, libera a tela; versão estática em movimento reduzido)
- ✅ **Home (`/`)** funcionando
- ✅ **Login visual (`/login`)** funcionando — campos, botão "Sintonizar", link "Entrar por convite / QR Code"
- ✅ **PWA instalável no celular** (testado: abre pelo link, instala na tela inicial; ícone/cache/tela cheia em observação fina)

**Etapa 2 — autenticação real com Supabase — concluída e publicada (✅).**

- ✅ **Supabase Auth integrado** via `@supabase/ssr` (+ `@supabase/supabase-js`): cliente de navegador, cliente de servidor (async, Next 16) e **proxy de sessão** (`src/proxy.ts`, renovação de cookies).
- ✅ Tabela **`public.profile`** (1:1 com `auth.users`) com enum **`user_role`** (`jogador`/`mestra`), **RLS** ("só o próprio perfil") e **trigger** que cria o perfil automaticamente no cadastro.
- ✅ **Cadastro real** em **`/signup`** (e-mail + senha; cria usuário + linha em `profile` com `role = jogador`).
- ✅ **Login e logout reais** em **`/login`** via Server Actions (`signInWithPassword`/`signOut`, com `revalidatePath`).
- ✅ **Rota protegida `/inicio`** (proteção server-side com `getUser()`; sem sessão → redireciona para `/login`); mostra **e-mail + papel** lido do `profile`.
- ✅ **Diferenciação mínima por papel** em `/inicio` (placeholder distinto para `jogador` e `mestra`; ainda sem ficha/painel reais).
- ✅ **Publicado em produção** (Vercel CLI) com as variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` no ambiente da Vercel; **Site/Redirect URLs** de produção configuradas no Supabase. **Testado no celular** (login → `/inicio` com papel → logout).

**Decisões/limitações registradas da Etapa 2:**

- **Confirmação de e-mail real (por link) NÃO implementada na Etapa 2.** O painel atual exige **custom SMTP** para editar templates, e não usamos SMTP nesta etapa. A opção **"Confirm email" foi localizada e desativada** no Supabase para esta etapa, de modo que **cadastro e login funcionam sem confirmação** — e **não** há confirmação manual de usuários no painel. O fluxo de e-mail real (SMTP + template, ou Send Email Hook) e a rota `/auth/confirm` ficam para uma etapa futura, se necessário.
- **A Mestra ainda é definida manualmente** no painel do Supabase (trocar `profile.role` para `mestra` no Table Editor). Não há tela de "promover usuário" na V1.
- **Deploy continua via Vercel CLI** (`vercel --prod`); a integração **GitHub→Vercel não está conectada**, então `git push` não republica.
- **Navegação ainda não implementada:** a home (`/`) não tem botão para `/login`/`/inicio` (acesso digitando a rota). Não é bug; é passo futuro.
- **Segurança:** o cliente usa a chave **publishable** (pública) + **RLS**; `service_role`/secret **não** é usada. Segredos ficam no `.env.local` (local) e nas variáveis da Vercel — **nunca** no repositório.

**Ainda NÃO existe (propositalmente, fica para as próximas etapas):**

- ❌ **Campanha** e **convite** (Etapa 3).
- ❌ **Demais tabelas do modelo** (só `profile` existe; as outras ~13 vêm fase a fase).
- ❌ **Ficha funcional**, **painel da Mestra** real, **rolagens**.
- ❌ Confirmação de e-mail por link / SMTP; integração GitHub→Vercel (deploy automático).

---

## Princípios que governam todas as decisões

1. **O aplicativo serve ao RPG, nunca o contrário.** Em conflito entre conveniência técnica e fidelidade ao sistema Rede Prisma, a fidelidade vence.
2. **A Mestra é entidade central do produto**, não uma usuária comum: constrói e dirige a experiência por interface visual, sem programar. Os jogadores consomem e interagem.
3. **Tudo é movido a dados, não a código.** Nenhum conteúdo narrativo (NPC, cena, pista, ajuste de regra) exige mexer no código. É restrição de arquitetura.
4. **Atmosfera nunca acima da legibilidade.** A estética cria clima, mas jamais atrapalha ler um número ou tocar num botão. Na dúvida, clareza vence efeito.

---

## 1. Objetivo da PRISMA TV

Entregar uma plataforma **mobile, instalável como PWA**, em que **uma mesa real (4–6 jogadores + 1 Mestra) consiga jogar uma sessão inteira** pelo app: ficha de personagem, rolagens e registro dos acontecimentos — com a Mestra no controle do que acontece e do que cada um vê.

Critério de valor: ao fim da V1, a mesa deve **preferir abrir o app a usar a ficha de papel**, porque ele faz a conta sozinho, guarda o histórico e dá à Mestra uma visão que o papel nunca deu. Sucesso não é "ter muitos recursos"; é **ser usável e confiável numa sessão de verdade**.

---

## 2. Conceito da aplicação

Uma **plataforma narrativa mobile, privada**, para a campanha da PRISMA TV — não apenas uma "ficha digital". Dois perfis (relação "professor e aluno"):

- **Jogador:** vê e edita a própria ficha; rola/registra dados; vê só o que a Mestra liberou.
- **Mestra:** vê e controla tudo (personagens, NPCs, sessões, estados, registros) e decide **quem vê o quê**.

O **pilar arquitetural invisível** é a **visibilidade**: quase toda informação responde "quem pode ver isto?". Esse campo existe no modelo de dados desde o primeiro dia, mesmo onde a interface rica só chega na V2.

---

## 3. Escopo da V1 (o que ENTRA)

1. **Autenticação** com dois papéis: Jogador e Mestra.
2. **Campanha:** a Mestra cria a campanha PRISMA TV e convida jogadores (link/código → base do QR).
3. **Ficha de personagem viva** (todos os campos da ficha oficial), com criação guiada e cálculos automáticos.
4. **Trackers ao vivo:** Vida, Sanidade, Pontos de Impulso e Pontos de Afinidade, com estados derivados (Saudável/Ferido/Crítico; metade da sanidade; Ruptura).
5. **Rolagem digital:** 2d6 + Atributo + Perícia + (até 1 modificador), com DT e sucesso/falha.
6. **Registro manual de dados físicos:** inserir à mão o resultado dos dados rolados na mesa.
7. **Sessões:** a Mestra abre/fecha sessões dentro da campanha.
8. **Diário / registro de acontecimentos:** cada rolagem e anotação relevante vira registro organizado por sessão.
9. **Painel básico da Mestra:** ver todas as fichas; ajustar Vida/Sanidade/Impulso/Afinidade; aplicar Ruptura; criar NPCs simples.
10. **NPCs simples:** nome, imagem, descrição, papel, visibilidade.
11. **Controle inicial de estados:** Vida, Sanidade, Impulso, Afinidade e Ruptura.
12. **PWA + publicação:** link HTTPS fixo (Vercel), QR Code de entrada, instalável, com splash da marca PRISMA. *(Base já no ar a partir da Etapa 1.)*

---

## 4. Stack técnica (fechada)

- **PWA mobile-first** (sem APK no início).
- **Next.js** (App Router, full-stack).
- **TypeScript.**
- **Tailwind CSS** (com os tokens da direção visual).
- **Supabase** (PostgreSQL + Auth + Storage) — **Auth integrado na Etapa 2** (`@supabase/ssr`, `profile`+RLS+trigger); banco/Storage crescem fase a fase.
- **Vercel** (deploy, link HTTPS fixo) — **ativo**: https://prisma-tv-pi.vercel.app *(deploy atual feito via **Vercel CLI**; a integração GitHub→Vercel ainda **não** está conectada — deploy automático por push pendente)*
- **Entrada por QR Code / link HTTPS.**

**Barreira de segurança principal (V1):** o celular **nunca** fala direto com o banco. Toda leitura/escrita passa pela **camada de servidor do Next.js**, autenticada pelo token do Supabase, que confere o papel do usuário na campanha antes de responder. **Segunda barreira (defesa em profundidade):** Row Level Security (RLS) do Supabase em todas as tabelas.

**Segredos:** chaves nunca entram no repositório — vão em `.env.local`, já protegido pelo `.gitignore`. Na Etapa 1 não há nenhum segredo no projeto.

**Limitações aceitas do plano gratuito:** Vercel Hobby (uso não-comercial); Supabase Free (~500 MB banco, ~1 GB arquivos, pausa após ~1 semana ociosa — Mestra reativa antes da sessão); PWA no iPhone com limites de armazenamento/notificação (a V1 não depende de notificação); possível "cold start" imperceptível; disciplina ao comprimir imagens. Nenhuma impede a V1.

---

## 5. Decisões de modelo de dados

Banco **PostgreSQL (Supabase)**. Convenções: PK `uuid` (`gen_random_uuid()`), datas `timestamptz`, `snake_case`, entidades no singular, enums nativos, FKs com `ON DELETE` apropriado.

**Decisões-chave já tomadas (versão FINAL/2.0):**

- **Nomes sem ambiguidade SQL:** `player_character` (não `character`) e `game_session` (não `session`).
- **Morte separada do ferimento:** enum `character_status` (`ativo`/`morto`/`inativo`) **separado** de `estado_fisico` (`saudavel`/`ferido`/`critico`). Um personagem pode estar `critico` mas ainda `ativo`.
- **Rolagem manual robusta:** `dado1`/`dado2` opcionais; `dados_total` (obrigatório, 2–12) é a **fonte de verdade** da soma dos 2d6 (serve para dado digital e total digitado da mesa).
- **Snapshots na rolagem:** `roll` guarda `valor_atributo`, `pericia_treinada`, `bonus_pericia` e `character_nome_snapshot` no momento da jogada — registros antigos continuam compreensíveis mesmo se a ficha mudar ou o personagem sumir.
- **Objeto Emocional com histórico:** tabela `emotional_object_use` com `UNIQUE (character_id, session_id)` — o **banco** garante "1 uso por sessão" e preserva o histórico (substitui o antigo booleano frágil).
- **Validações em duas camadas:** o **banco** garante o que nunca pode ser violado (`CHECK`/`UNIQUE`/`FK`: atributos 0–3, vida/sanidade ≥ 0 e ≤ máx, impulso 0–3, afinidade 0–2, dados 1–6, total 2–12, consistência da Ruptura); a **aplicação** (`lib/rules/`) garante as regras de jogo (soma 6 / teto 3, exatamente 4 perícias, cálculos de Vida e Sanidade, modificador único, Adrenalina, etc.).

**Tabelas que já existem na V1:** `profile`, `campaign`, `campaign_member`, `player_character`, `player_character_skill` (13 por personagem, 4 treinadas), `player_character_trait` (2 na V1), `item` (inventário de 6 espaços), `npc` (simples), `affinity` (0–2 por NPC), `emotional_object_use`, `game_session`, `scene` (**estrutura só** — base da V3), `roll`, `event_log` (diário).

**Fora da V1 (criadas quando a fase pedir):** `document`/`clue` (V2), `timeline_event` (V2), `*_visibility_grant` (V2 — revelar para um jogador específico), tabuleiro visual `scene_element`/camadas/posições (V3). O enum `visibility` fica com dois valores na V1 (`mestra`/`revelado`); a granularidade vem por tabela auxiliar, sem alterar o enum.

> **Importante:** dessas tabelas, **apenas `profile` foi criada** (Etapa 2: com enum `user_role`, RLS e trigger de criação automática). As **demais ainda não existem** — modelo aprovado **no papel**, criadas fase a fase a partir da Etapa 3.

---

## 6. Direção visual aprovada

**Conceito-resumo:** *uma sala de controle escura, de madrugada, numa emissora apagando as luzes — com um prisma sobre a mesa captando a única luz que resta.* Três ideias-mãe: **o prisma e a refração** (luz branca entra, espectro sai — assinatura pontual), **a televisão e o sinal** (estática, scanlines, glitch, REC, timecode, "no ar/fora do ar"), **a decadência institucional** (escuro, sóbrio, levemente desgastado; suspense e mistério, não terror gráfico).

**Decisão registrada:** a leve **degradação das cores** (espectro mais "lavado" após o tratamento da logo) foi **aceita como acerto temático** — combina com transmissão falhando, TV antiga e decadência da PRISMA TV. Não é problema a corrigir.

**Tokens de cor (no Tailwind via `@theme`; apelido de código entre parênteses):**

| Token (guia) | Apelido no código | Hex | Uso |
|---|---|---|---|
| `bg-base` | `base` | `#0B0B0F` | Fundo principal |
| `surface-1` | `surface-1` | `#16161D` | Cartões, barras, painéis |
| `surface-2` | `surface-2` | `#1E1F28` | Elevados, modais |
| `hairline` | `hairline` | `#2A2C37` | Bordas finas, divisórias |
| `text-hi` | `ink-hi` | `#F4F4F6` | Texto principal, números |
| `text-mid` | `ink-mid` | `#A0A4AF` | Secundário, rótulos |
| `text-low` | `ink-low` | `#6B6F7B` | Auxiliar, placeholders |
| `prisma-300` | `prisma-300` | `#C4B5FD` | Brilhos, hover |
| `prisma-500` | `prisma-500` | `#8B5CF6` | Acento de marca, foco, links |
| `prisma-600` | `prisma-600` | `#7C3AED` | Botões primários, ativos |
| `vida` | `vida` | `#E5484D` | Vida / dano / crítico |
| `sanidade` | `sanidade` | `#8B5CF6` | Sanidade / Ruptura |
| `impulso` | `impulso` | `#F5A623` | Pontos de Impulso |
| `rec` | `rec` | `#EF4444` | Selo REC, gravação, alertas |
| `sucesso` | `sucesso` | `#34D399` | Teste bem-sucedido |
| `alerta` | `alerta` | `#F59E0B` | Avisos (ex.: metade da sanidade) |
| `morte` | `morte` | `#6B7280` | Personagem morto/inativo |

> Nota técnica: os tokens de texto foram nomeados `ink-hi/mid/low` no código (em vez de `text-hi/mid/low`) só para o utilitário do Tailwind não virar `text-text-hi`. Mesmas cores e papéis.

Espectro (assinatura, fino e pontual, **nunca** atrás de texto): `#22D3EE` cyan · `#34D399` verde · `#FACC15` amarelo · `#FB7185` rosa.

**Tipografia (fechada, três papéis):** **Oswald** (títulos/broadcast) · **Inter** (interface/corpo) · **Space Mono** (REC, timecode, dados). Auto-hospedadas com `next/font`, pesos enxutos (Oswald 500/600/700; Inter 400/500/600; Space Mono 400/700), `font-display: swap`. **Implementado na Etapa 1.**

**Dosagem da V1:** **um motivo de atmosfera por tela.** Scanline/ruído só em **fundos**, baixa opacidade, nunca sobre texto/números. Glitch só em microinterações curtas. REC + timecode como assinatura recorrente.

**Splash (sequência V1, 2.5–3.5s):** estática → glitch rápido → convergência de luz → refração → **termina na logo oficial**. Respeita `prefers-reduced-motion`. **Implementada na Etapa 1** (versão simples em CSS).

**Referência congelada:** o **moodboard V1.4** é a referência visual oficial da V1.

---

## 7. Regra de legibilidade (inegociável)

- Texto e números **sempre** sobre superfície sólida e escura, contraste alto (mira AA). Violet é acento/ícone, **não** cor de texto longo sobre preto.
- Texturas (scanline, ruído) só em fundos, opacidade baixa; **jamais** sobre números ou campos.
- Alvos de toque generosos. Hierarquia clara: o que importa agora (vida, sanidade, rolar) é o maior e mais visível.
- Movimento com propósito, respeitando `prefers-reduced-motion`. Efeitos em CSS/SVG leves; nada de vídeo pesado.
- **Consistência** dos mesmos componentes em todo lugar é o que dá sensação premium — mais que efeitos.

---

## 8. Uso da logo oficial

A **logo oficial é a marca** e deve ser respeitada (design, cores, proporção originais), sempre sobre fundo escuro:

- **Tratamento aprovado (V1.4):** a logo veio em JPEG (fundo preto). O fundo foi **removido por luminância** (preto → transparente; prisma, feixe, espectro, "REDE PRISMA" cromado, brilhos e reflexos preservados), gerando assets transparentes. **Arquivos no projeto:** `public/brand/prisma-logo.png` (logo completa), `prisma-mark.png` (prisma isolado → base do ícone da PWA), `prisma-wordmark.png` (texto "REDE PRISMA").
- **Splash:** marca **integrada à composição**, não um bloco colado.
- **Login:** logo oficial transparente no topo, integrada ao fundo escuro.
- **Ícone do app (PWA)/favicon:** o **prisma isolado** como símbolo (gerado em 192/512 + maskable, com fundo escuro da marca).
- **Proibições:** nunca esticar, recolorir, pôr sobre fundo claro, recriar com fonte, substituir por SVG aproximado, simplificar ou usar um prisma genérico no lugar da marca. Efeitos só **ao redor** dela.
- **Nota de produção:** a extração por luminância é ideal para fundo escuro. Para escalas grandes/impressão, o ideal futuro é um **PNG transparente em alta resolução** ou **SVG/vetor** oficial — troca simples quando houver.

---

## 9. Funcionamento geral da ficha

A ficha de papel oficial **é o norte** (moldura de fita/gravador, REC + timecode, seções). Tradução mobile, por toque e leitura:

- **Criação guiada (em etapas):** básico → atributos → perícias → traços → emocional/relações → revisão. O app **trava** as regras: distribuir **6 pontos** entre 4 atributos (teto **3** cada), escolher **exatamente 4 perícias treinadas** (+2 cada), 1 Traço Positivo + 1 Negativo, Objeto Emocional, Ferida Emocional e as 4 perguntas de Relações. Calcula **Vida = 8 + Força + Agilidade** e **Sanidade = 6 + Intelecto + Presença**.
- **Campos:** Informações básicas; 4 Atributos; 13 Perícias (4 treinadas com +2); Vida/Sanidade/Impulso (trackers); Traços (+/−); Afinidades (corações por NPC); Objeto Emocional; Inventário (6 espaços); Ferida Emocional; Relações; Anotações.
- **Núcleo emocional em primeiro plano:** Objeto Emocional, Ferida Emocional e Relações têm cartões próprios.
- **Trackers grandes e tocáveis**, com estados por cor + rótulo ("EM RUPTURA" nomeando o efeito). Morto/inativo recua em `morte` ("SINAL PERDIDO").
- **Sem level up:** evolução é narrativa; modelado como estado atual + histórico.

> Ainda não implementado — começa após a autenticação e o banco.

---

## 10. Painel da Mestra

Conceito: **sala de controle / switcher de telejornal**. Funções da V1: visão de mesa (cartões por personagem com Vida/Sanidade/estado/Impulso de relance); ajuste de estados (Vida, Sanidade, Impulso, Afinidade, Ruptura) gerando `event_log`; sessões (abrir/fechar, "NO AR" + timecode); rolagens (fila, DT, sucesso/falha, consequência); NPCs simples (criar e revelar); diário filtrável; visibilidade (`mestra` ↔ `revelado`). Tudo por interface, nunca por código.

> Ainda não implementado.

---

## 11. Sistema de rolagens

**Base:** `2d6 + Atributo + Perícia (+ no máximo 1 modificador)`. DT de **6 a 19**, sempre definida pela **Mestra**.

**Automatizado pelo app:** bônus de perícia (+2 treinada / 0 não); **modificador único** (Traço +2 / Afinidade +2 / Traço Negativo −2); **Adrenalina** (Sobrevivência sem treino) = **+3 e bloqueia outros**; **Impulso** (máx 3, 1 por jogada, rerrola os 2d6 e escolhe o melhor); soma final e, com DT visível, sucesso/falha.

**Modo manual:** monta o teste igual, mas digita o resultado dos dados (ou o total 2d6) da mesa; o app soma, avalia e grava como `origem = manual`. Registro e organização são sempre do app.

**Decisão manual da Mestra:** DT, quando/qual teste, improviso, usos de objeto (1–3), aplicar Afinidade, conceder Impulso/Afinidade, qual efeito de Ruptura e quando sai, DT de recuperação de Sanidade, dano, consequências e quando revelar NPCs.

> Ainda não implementado.

---

## 12. O que fica FORA da V1

- **Documentos, pistas e Arquivos** → V2.
- **NPCs completos** (notas, estado avançado, afinidade por jogador) → V2. Na V1, NPC é só o básico.
- **Cronologia/linha do tempo** dedicada → V2 (na V1 só o diário por sessão).
- **Visibilidade granular item a item** → V2. *O campo já existe no banco desde a V1.*
- **Cenas visuais, PNGs arrastáveis, camadas** → V3.
- **IA, resumo de sessão, busca inteligente** → V4 (auxílio opcional, nunca pilar).
- **APK, Play Store, App Store** → fora do escopo inicial.
- **Web/desktop com paridade, áudio/vídeo, chat/voz no app** → futuro/fora.
- **Modo offline completo** → fora (a V1 assume internet; a PWA cacheia só a "casca").
- **Combate tático avançado** → fora; combate na V1 é rolagem normal + ajuste manual de Vida.

> A seção de escopo é **lei**: só se mexe nela com decisão consciente. O maior risco do projeto é inchar puxando recursos de fases futuras para a V1.

---

## 13. Ordem das próximas etapas

Roadmap de implementação (cada passo entrega algo visível e testável; não se avança sem o anterior funcionando):

1. ✅ **Esqueleto + PWA — CONCLUÍDO E PUBLICADO.** Projeto Next.js, TypeScript, Tailwind com tokens, fontes, atmosfera CRT, manifest/ícones, service worker, **splash** e **login visual**. Construído em 13 blocos pequenos e publicado na Vercel (**https://prisma-tv-pi.vercel.app**). *Entregável atingido:* abre no celular como "app", com a marca PRISMA.
2. ✅ **Autenticação e papéis — CONCLUÍDO E PUBLICADO (Etapa 2).** Supabase Auth (`@supabase/ssr`), `profile`+RLS+trigger, cadastro `/signup`, login/logout `/login`, rota protegida `/inicio` com papel, diferenciação mínima Jogador/Mestra. Publicado e testado no celular.
3. ⏳ **Campanha e convite (PRÓXIMO — Etapa 3):** Mestra cria campanha, jogador entra por código. *Começa por planejamento técnico antes de escrever código.*
4. **Banco + ficha estática conectada:** tabelas; criar e salvar um personagem.
5. **Regras de criação:** atributos (6/teto 3), 4 perícias, cálculo de Vida e Sanidade.
6. **Ficha viva + trackers:** Vida/Sanidade/Impulso/Afinidade com estados e Ruptura.
7. **Rolagem digital + registro manual:** DiceRoller, modificador único, Adrenalina, Impulso; modo manual.
8. **Sessões + diário:** abrir/fechar, registros vinculados, filtros.
9. **Painel da Mestra:** visão de mesa, ajustes, validação de rolagens, NPCs simples, visibilidade.
10. **Publicação + QR + ajustes finais:** já há **deploy de produção na Vercel (via CLI)**; faltam **conectar a Vercel ao GitHub** (para o deploy automático por push), o **QR Code** de entrada e o polimento → **V1 pronta para a mesa**.

**Regra de ouro:** uma fase só começa quando a anterior está funcionando e na mão da mesa.

---

*Fim da Memória do Projeto. Este arquivo deve ser atualizado sempre que uma decisão nova for aprovada, para que o contexto nunca se perca. Última atualização: **conclusão e publicação da Etapa 2** (autenticação real com Supabase: `profile`+RLS+trigger, `/signup`, `/login` com login/logout, `/inicio` protegida com papel, diferenciação Jogador/Mestra; confirmação de e-mail não implementada / "Confirm email" desativado; Mestra definida manualmente; deploy via Vercel CLI).*
