/* SUSPEITOS — inicialização */
(async function () {
  window.UI.ligarEntradas();
  await window.Rede.iniciar();
  window.Rede.onEstado((S) => window.UI.render(S));
  window.Rede.onCursor((c) => window.UI.renderCursores(c));
  window.Rede.onOnline(() => { if (window.Rede.estado) window.UI.render(window.Rede.estado); });
})();
