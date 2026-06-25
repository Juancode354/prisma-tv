// Service worker mínimo da PRISMA TV.
// Único objetivo na V1: tornar a PWA instalável (especialmente no Android).
// Ainda SEM cache e SEM offline — a rede responde normalmente.

self.addEventListener("install", () => {
  // Ativa esta versão imediatamente, sem esperar abas antigas fecharem.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Assume o controle das páginas abertas assim que ativa.
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Handler de fetch propositalmente vazio: não intercepta nada,
  // deixa o navegador buscar pela rede como sempre.
  // A simples existência deste handler é o que satisfaz o critério
  // de instalação da PWA. (Cache fica para um bloco futuro, se quisermos.)
});