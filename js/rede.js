/* =====================================================================
   REDE — sincroniza o estado entre os dois jogadores.
   - Com a trava (problemsite.github.io/trava.js): Firebase "jogos-github",
     em sites/suspeitos/sala (estado, cursores, online).
   - Sem a trava (arquivo aberto no PC / localhost): MODO LOCAL — duas abas
     do mesmo navegador conversam pelo localStorage.
   Toda mudança de estado passa por Motor.acao dentro de uma transação,
   então duas pessoas clicando ao mesmo tempo nunca "brigam".
   ===================================================================== */
(function () {
  const C = window.CONFIG;
  const SITE = C.site;
  const ESCRITA = { [C.caminho]: true }; // pastas que os jogadores podem gravar
  const params = new URLSearchParams(location.search);
  const ouvintes = [], ouvCursor = [], ouvOnline = [];
  let estado = null, modo = "local", offset = 0, conectado = true;
  let root = null, meuId = null;
  let online = {}, cursores = {};

  function gerarId() { return "j" + Math.random().toString(36).slice(2, 10); }
  function pegarId(local) {
    const usarSessao = local || params.has("aba");
    const store = usarSessao ? sessionStorage : localStorage;
    let id = null;
    try { id = store.getItem("suspeitos_id"); } catch (e) {}
    if (!id) { id = gerarId(); try { store.setItem("suspeitos_id", id); } catch (e) {} }
    return id;
  }
  const agora = () => Date.now() + offset;
  const limpar = (o) => JSON.parse(JSON.stringify(o));

  function avisar() { for (const f of ouvintes) try { f(estado); } catch (e) { console.error(e); } }
  function avisarCursor() { for (const f of ouvCursor) try { f(cursores); } catch (e) {} }
  function avisarOnline() { for (const f of ouvOnline) try { f(online); } catch (e) {} }

  function meuSlot(S) {
    S = S || estado;
    if (!S || !S.jogadores) return null;
    for (const k of C.jogaveis) if (S.jogadores[k] && S.jogadores[k].id === meuId) return k;
    return null;
  }

  // ============================================================ FIREBASE
  async function carregar(src) {
    return new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
  }
  async function iniciarFirebase() {
    const t = await window.Trava.ready;
    if (!t) throw new Error("trava sem liberação");
    const SDK = "https://www.gstatic.com/firebasejs/10.12.2/";
    if (!window.firebase) await carregar(SDK + "firebase-app-compat.js");
    if (!firebase.auth) await carregar(SDK + "firebase-auth-compat.js");
    if (!firebase.database) await carregar(SDK + "firebase-database-compat.js");
    if (!firebase.apps.length) firebase.initializeApp(window.FIREBASE_CONFIG);
    const db = firebase.database(), auth = firebase.auth();
    if (!auth.currentUser) await auth.signInAnonymously();
    meuId = pegarId(false);
    // navegador da equipe: garante que a Central saiba qual pasta o jogo grava
    if (window.Trava.admin) {
      try {
        const ref = db.ref("controle/sites/" + SITE);
        const cur = (await ref.once("value")).val();
        if (!cur) await ref.set({ open: false, escrita: ESCRITA, t: firebase.database.ServerValue.TIMESTAMP });
        else if (!cur.escrita || !cur.escrita[C.caminho]) await ref.child("escrita/" + C.caminho).set(true);
      } catch (e) { console.warn("controle", e); }
    }
    root = db.ref((window.DB_ROOT || "sites/" + SITE) + "/" + C.caminho);
    db.ref(".info/serverTimeOffset").on("value", (s) => { offset = s.val() || 0; });
    db.ref(".info/connected").on("value", (s) => {
      conectado = !!s.val();
      if (conectado) {
        const me = root.child("online/" + meuId);
        me.onDisconnect().remove(); me.set({ t: firebase.database.ServerValue.TIMESTAMP });
        root.child("cursores/" + meuId).onDisconnect().remove();
      }
    });
    root.child("estado").on("value", (s) => { estado = window.Motor.norm(s.val() || window.Motor.inicial()); avisar(); },
      (e) => console.warn("sem acesso à sala", e));
    root.child("online").on("value", (s) => { online = s.val() || {}; avisarOnline(); });
    root.child("cursores").on("value", (s) => { cursores = s.val() || {}; avisarCursor(); });
    modo = "firebase";
  }

  function acaoFirebase(a) {
    return new Promise((res) => {
      root.child("estado").transaction((cur) => {
        const S = cur ? window.Motor.norm(cur) : window.Motor.inicial();
        const n = window.Motor.acao(S, a, meuSlotPara(S, a), agora());
        return n === null ? undefined : limpar(n);
      }, (err, ok) => { if (err) console.warn("transação", err); res(ok); }, true);
    });
  }

  // ============================================================ LOCAL
  const CHAVE = "suspeitos_estado_v1";
  let canal = null;
  function lerLocal() {
    try { const t = localStorage.getItem(CHAVE); return t ? window.Motor.norm(JSON.parse(t)) : window.Motor.inicial(); } catch (e) { return window.Motor.inicial(); }
  }
  function iniciarLocal() {
    meuId = pegarId(true);
    modo = "local";
    estado = lerLocal();
    window.addEventListener("storage", (e) => { if (e.key === CHAVE) { estado = lerLocal(); avisar(); } });
    try {
      canal = new BroadcastChannel("suspeitos");
      canal.onmessage = (ev) => {
        const m = ev.data || {};
        if (m.tipo === "cursor") { cursores[m.id] = m.c; avisarCursor(); }
        if (m.tipo === "oi") { online[m.id] = { t: Date.now() }; avisarOnline(); }
        if (m.tipo === "tchau") { delete online[m.id]; delete cursores[m.id]; avisarOnline(); avisarCursor(); }
      };
    } catch (e) {}
    const oi = () => { online[meuId] = { t: Date.now() }; canal && canal.postMessage({ tipo: "oi", id: meuId }); };
    oi(); setInterval(() => {
      oi();
      const lim = Date.now() - 5000; let mudou = false;
      for (const k in online) if (online[k].t < lim) { delete online[k]; delete cursores[k]; mudou = true; }
      if (mudou) { avisarOnline(); avisarCursor(); }
    }, 1500);
    window.addEventListener("beforeunload", () => canal && canal.postMessage({ tipo: "tchau", id: meuId }));
    setTimeout(avisar, 0);
  }
  function acaoLocal(a) {
    const S = lerLocal();
    const n = window.Motor.acao(S, a, meuSlotPara(S, a), agora());
    if (n === null) return Promise.resolve(false);
    try { localStorage.setItem(CHAVE, JSON.stringify(limpar(n))); } catch (e) {}
    estado = window.Motor.norm(limpar(n)); avisar();
    return Promise.resolve(true);
  }

  // Ações de lobby carregam o próprio id; as outras usam o slot de quem clicou.
  function meuSlotPara(S, a) {
    if (a.comoSlot && S.jogadores[a.comoSlot] && S.jogadores[a.comoSlot].id === meuId) return a.comoSlot;
    return meuSlot(S);
  }

  // ============================================================ API
  let ultimoCursor = 0, cursorPendente = null, timerCursor = null;
  window.Rede = {
    get modo() { return modo; }, get id() { return meuId; }, get estado() { return estado; }, get conectado() { return conectado; },
    agora, meuSlot,
    async iniciar() {
      if (window.Trava && window.Trava.ready && !params.has("local")) {
        try { await iniciarFirebase(); return modo; } catch (e) { console.warn("Firebase indisponível, usando modo local", e); }
      }
      iniciarLocal(); return modo;
    },
    acao(a) { return modo === "firebase" ? acaoFirebase(a) : acaoLocal(a); },
    onEstado(f) { ouvintes.push(f); if (estado) f(estado); },
    onCursor(f) { ouvCursor.push(f); },
    onOnline(f) { ouvOnline.push(f); },
    estaOnline(id) {
      if (!id) return false;
      if (modo === "local") return !!online[id];
      return !!online[id];
    },
    cursor(x, y, slot) {
      cursorPendente = { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, s: slot || "" };
      const envia = () => {
        timerCursor = null; ultimoCursor = Date.now();
        const c = cursorPendente;
        if (modo === "firebase") root && root.child("cursores/" + meuId).set(c);
        else canal && canal.postMessage({ tipo: "cursor", id: meuId, c });
      };
      if (Date.now() - ultimoCursor > 90) envia(); else if (!timerCursor) timerCursor = setTimeout(envia, 90);
    }
  };
})();
