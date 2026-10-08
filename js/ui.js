/* =====================================================================
   UI — desenha o estado compartilhado na tela e manda os cliques pro motor.
   Nada de história aqui: textos e dados ficam em js/dados/.
   ===================================================================== */
(function () {
  const $ = (s) => document.querySelector(s);
  const palco = $("#palco");
  const C = window.CONFIG, PERS = window.PERSONAGENS, PISTAS = window.PISTAS;
  const L = { // estado local (só desta tela)
    S: null, eu: null, chaveSeq: "", salaFundo: null, chaveObjs: "", fxVisto: null, logVisto: null,
    timers: [], digitando: null, textoCheio: "", inicioFala: 0, prontoEm: 0,
    painel: { aberto: false, sel: null, ligar: false, par: [] }, raf: null, ultimoMenuKey: "", vultoAtivo: false,
    abriuPainel: false, modoLigar: false, dicasFeitas: {}, dicaAtual: null, dicaDesde: 0
  };
  const pc = (v) => v + "%";
  const corDe = (slot) => C.coresJogador[slot] || "#fff";

  // ---------------------------------------------------------------- imagens (PNG ou placeholder)
  // naCabeca = rosto em cima do corpo: imagens maiores (cabelo comprido, rostoCanvas) passam do quadrado e caem por cima do moletom
  function rostoHTML(id, exp, naCabeca) {
    const P = PERS[id] || {};
    const r = P.rosto || {};
    const src = r[exp] || r.neutro;
    if (!src) return window.PH.rosto(id, exp);
    const cv = P.rostoCanvas;
    if (naCabeca && cv) {
      const w = cv[0] / 640 * 100, ml = (cv[0] - 640) / 2 / 640 * 100;
      return `<img src="${src}" alt="" style="width:${w}%;height:auto;max-width:none;margin-left:-${ml}%">`;
    }
    return `<img src="${src}" alt="">`;
  }
  // "auto": procura sozinho as fotos que faltam (ex.: delegada_neutro.png, jazzghost_morto.png)
  (function procurarRostos() {
    const EXPS = ["neutro", "feliz", "preocupado", "assustado", "bravo", "morto"];
    for (const id in PERS) {
      const P = PERS[id]; if (!P.auto) continue;
      P.rosto = P.rosto || {};
      for (const e of EXPS) {
        if (P.rosto[e]) continue;
        const src = `${P.auto}_${e}.png`, im = new Image();
        im.onload = () => { P.rosto[e] = src; for (const k in elPers) if (k === id) elPers[k].exp = null; };
        im.src = src;
      }
    }
  })();
  function iconeHTML(desenho, img) { return img ? `<img src="${img}" alt="">` : window.PH.icone(desenho); }
  function iconePista(id) { const p = PISTAS[id] || {}; return iconeHTML(p.desenho, p.img); }

  // ---------------------------------------------------------------- ações
  const podeAgir = () => !!L.eu;
  function agir(a) { if (!podeAgir() && !["entrar", "solo", "retomar", "sairSlot", "reset"].includes(a.t)) return; window.Rede.acao(a); }

  // ---------------------------------------------------------------- fundo
  function renderFundo(S) {
    const cen = window.CENARIOS[S.sala];
    const escuro = S.luz === "apagada" || S.luz === "isca";
    // versão "luz apagada" do cenário, se existir; senão usa o normal escurecido
    const src = escuro && cen.fundoApagado ? cen.fundoApagado : cen.fundo;
    const chave = S.sala + "|" + (src || "ph");
    palco.classList.toggle("sem-fundo-escuro", escuro && !cen.fundoApagado);
    if (L.salaFundo === chave) return;
    const trocouSala = !L.salaFundo || L.salaFundo.split("|")[0] !== S.sala;
    L.salaFundo = chave;
    const div = document.createElement("div");
    div.className = "camada"; div.style.opacity = 0;
    if (!trocouSala) div.style.transition = "opacity .08s"; // apagão: troca na hora
    div.innerHTML = src ? `<img src="${src}" alt="">` : window.PH.fundos[S.sala]();
    const f = $("#fundo"); f.appendChild(div);
    requestAnimationFrame(() => (div.style.opacity = 1));
    setTimeout(() => { while (f.children.length > 1) f.removeChild(f.firstChild); }, trocouSala ? 700 : 150);
    if (trocouSala) mostrarNomeSala(cen.nome);
  }
  let tNome = null;
  function mostrarNomeSala(n) {
    const el = $("#nomeSala"); el.textContent = n; el.classList.add("on");
    clearTimeout(tNome); tNome = setTimeout(() => el.classList.remove("on"), 1800);
  }

  // ---------------------------------------------------------------- objetos e portas
  let rotuloEl = null;
  function rotulo(txt, x, y) {
    if (!rotuloEl) { rotuloEl = document.createElement("div"); rotuloEl.className = "rotulo"; palco.appendChild(rotuloEl); }
    if (!txt) { rotuloEl.style.display = "none"; return; }
    rotuloEl.style.display = "block"; rotuloEl.textContent = txt; rotuloEl.style.left = x + "%"; rotuloEl.style.top = y + "%";
  }
  function renderObjetos(S) {
    const cen = window.CENARIOS[S.sala];
    const vis = cen.objetos.filter((o) => !o.se || o.se(S));
    const chave = S.sala + "|" + vis.map((o) => o.id + (S.vistos["obj_" + o.id] ? "v" : "")).join(",");
    if (chave === L.chaveObjs) return;
    L.chaveObjs = chave;
    const box = $("#objetos"); box.innerHTML = ""; rotulo(null);
    for (const o of vis) {
      const el = document.createElement("div");
      el.dataset.id = o.id;
      el.className = "obj" + (o.desenho || o.img ? "" : " invisivel") + (o.deco ? " deco" : "");
      if (!S.vistos["obj_" + o.id] && !o.deco) el.dataset.novo = "1";
      Object.assign(el.style, { left: pc(o.x), top: pc(o.y), width: pc(o.w), height: pc(o.h) });
      if (o.desenho || o.img) el.innerHTML = iconeHTML(o.desenho, o.img);
      if (o.deco) { box.appendChild(el); continue; }
      el.onmouseenter = () => rotulo(o.rotulo, o.x + o.w / 2, o.y);
      el.onmouseleave = () => rotulo(null);
      el.onclick = (ev) => { ev.stopPropagation(); rotulo(null); Som.tocar("clique"); agir({ t: "clicar", tipo: "obj", alvo: o.id }); };
      box.appendChild(el);
    }
    for (const p of cen.portas) {
      const el = document.createElement("div");
      el.className = "porta " + (p.lado || "dir"); el.dataset.para = p.para;
      Object.assign(el.style, { left: pc(p.x), top: pc(p.y), width: pc(p.w), height: pc(p.h) });
      el.innerHTML = `<span class="seta"></span>`;
      el.onmouseenter = () => rotulo(p.rotulo, p.x + p.w / 2, p.y + p.h / 2);
      el.onmouseleave = () => rotulo(null);
      el.onclick = (ev) => { ev.stopPropagation(); rotulo(null); agir({ t: "clicar", tipo: "porta", alvo: p.para }); };
      box.appendChild(el);
    }
  }

  // ---------------------------------------------------------------- personagens
  const elPers = {};
  function criarPers(id) {
    const el = document.createElement("div");
    el.className = "pers"; el.dataset.id = id;
    el.innerHTML = `<div class="wrap"><div class="respira"><div class="corpo"></div><div class="cabeca"></div></div></div><div class="nome">${(PERS[id] || {}).nome || id}</div>`;
    el.onclick = (ev) => { ev.stopPropagation(); if (el.classList.contains("clicavel")) agir({ t: "clicar", tipo: "pers", alvo: id }); };
    $("#personagens").appendChild(el);
    elPers[id] = { el, pose: null, exp: null, sala: null, vis: false, x: null };
    return elPers[id];
  }
  function desenharCorpo(R, id, pose) {
    const P = PERS[id] || {};
    R.el.classList.toggle("caido", pose === "caido");
    R.el.classList.toggle("coberto", pose === "coberto");
    R.el.className = R.el.className.replace(/\bp-\S+/g, "").trim() + " p-" + pose;
    const wrap = R.el.querySelector(".wrap");
    if (pose === "coberto") { wrap.innerHTML = window.PH.lencol(); R.exp = null; return; }
    if (pose === "caido") { // estirado no chão, cabeça de lado, sangue colado na cabeça
      wrap.innerHTML = `<div class="cadaver">${window.PH.cadaver(P.cor || "#888", P.roupa, P.pele)}<div class="cab-morta">${rostoHTML(id, "morto")}</div></div>`;
      R.exp = null; return;
    }
    if (!R.el.querySelector(".corpo")) {
      wrap.innerHTML = `<div class="respira"><div class="corpo"></div><div class="cabeca"></div></div>`; R.exp = null;
    }
    R.el.querySelector(".corpo").innerHTML = window.PH.corpo(P.cor || "#888", pose, P.roupa, P.pele, P.quepe ? "farda" : "");
  }
  function renderPersonagens(S, falandoId) {
    for (const id in S.pos) {
      const p = S.pos[id];
      const R = elPers[id] || criarPers(id);
      const mostra = p.vis && p.sala === S.sala;
      if (!mostra) { if (R.vis) { R.el.style.display = "none"; R.vis = false; } R.sala = p.sala; continue; }
      const apareceu = !R.vis || R.sala !== p.sala;
      R.el.style.display = "";
      if (apareceu) {
        R.el.style.transitionDuration = "0ms"; R.el.style.left = pc(p.x);
        R.el.classList.remove("entrou"); void R.el.offsetWidth; R.el.classList.add("entrou");
      } else if (R.x !== p.x) {
        R.el.style.transitionDuration = (p.ms || 0) + "ms"; R.el.style.left = pc(p.x);
        if (p.ms) { // anda: pernas e braços balançando enquanto desliza
          R.el.classList.add("andando"); R.poseTemp = null;
          clearTimeout(R.tAnda); R.tAnda = setTimeout(() => R.el.classList.remove("andando"), p.ms);
        }
      }
      R.x = p.x; R.vis = true; R.sala = p.sala;
      R.el.style.bottom = (3 + (p.y || 0)) + "%";
      R.el.style.zIndex = Math.round(100 - (p.y || 0));
      R.el.style.scale = p.y ? String(1 - p.y * 0.008) : "";  // mais pro fundo = um pouco menor
      const pose = (R.poseTemp && p.pose === "neutro" && falandoId !== id) ? R.poseTemp : p.pose;
      if (R.pose !== pose) { desenharCorpo(R, id, pose); R.pose = pose; }
      const cab = R.el.querySelector(".cabeca");
      if (cab && R.exp !== p.exp) { cab.innerHTML = rostoHTML(id, p.exp, true); R.exp = p.exp; }
      const wrap = R.el.querySelector(".wrap");
      wrap.classList.toggle("vira", p.olha === -1 && p.pose !== "caido" && p.pose !== "coberto");
      const clicavel = !S.seq && S.fase === "jogo" && !!window.TOPICOS[id] && S.modo !== "espiar" && S.luz === "normal";
      R.el.classList.toggle("clicavel", clicavel);
      R.el.classList.toggle("falando", falandoId === id);
    }
  }

  // ---------------------------------------------------------------- animações ociosas ("estão vivos")
  // Só visual, cada tela sorteia as suas. Pelo menos 8 gestos diferentes.
  const IDLES = [
    { pose: "coca", ms: 2600 },          // coça a cabeça
    { pose: "cintura", ms: 3200 },       // mão na cintura
    { pose: "cruzados", ms: 3600 },      // cruza os braços
    { pose: "celular", ms: 3200 },       // olha o celular
    { pose: "alto", ms: 1700, a: "alto" }, // espreguiça
    { a: "olhar", ms: 1400 },            // olha pros lados
    { a: "pe", ms: 1400 },               // bate o pé
    { a: "suspiro", ms: 1500 }           // suspira
  ];
  function idleTick() {
    const S = L.S;
    if (!S || S.fase !== "jogo" || S.luz !== "normal") return;
    const c = window.Motor.cmdAtual(S);
    const agora = Date.now();
    const cands = Object.keys(elPers).filter((id) => {
      const R = elPers[id], p = S.pos[id];
      return R.vis && p && p.pose === "neutro" && !R.poseTemp && !R.el.classList.contains("andando") &&
        !(c && c.fala === id) && !(R.idleAte > agora) && id !== "vulto";
    });
    if (!cands.length || Math.random() > 0.45) return;
    const id = cands[Math.floor(Math.random() * cands.length)], R = elPers[id], I = IDLES[Math.floor(Math.random() * IDLES.length)];
    R.idleAte = agora + I.ms + 5000 + Math.random() * 7000;
    if (I.a) animar(id, I.a);
    if (I.pose) {
      R.poseTemp = I.pose; renderPersonagens(S, c && c.fala);
      setTimeout(() => { R.poseTemp = null; if (L.S) renderPersonagens(L.S, (window.Motor.cmdAtual(L.S) || {}).fala); }, I.ms);
    }
  }

  function animar(quem, a) {
    const R = elPers[quem]; if (!R) return;
    const w = R.el.querySelector(".wrap");
    w.classList.remove("a-" + a); void w.offsetWidth; w.classList.add("a-" + a);
    setTimeout(() => w.classList.remove("a-" + a), 1400);
  }

  // ---------------------------------------------------------------- bustos
  const bustos = {};
  function slotBusto(lado) {
    if (bustos[lado]) return bustos[lado];
    const el = document.createElement("div");
    el.className = "busto " + lado;
    el.innerHTML = `<div class="fig"><div class="wrap"><div class="respira"><div class="corpo"></div><div class="cabeca"></div></div></div></div>`;
    $("#bustos").appendChild(el);
    return (bustos[lado] = { el, key: "" });
  }
  function encherBusto(B, id, S, vira) {
    const p = S.pos[id] || {}, P = PERS[id] || {};
    let pose = p.pose || "neutro"; if (pose === "caido" || pose === "coberto") pose = "neutro";
    const key = id + "|" + pose + "|" + (p.exp || "neutro");
    if (B.key !== key) {
      B.key = key;
      B.el.querySelector(".corpo").innerHTML = window.PH.corpo(P.cor || "#888", pose, P.roupa, P.pele, P.quepe ? "farda" : "");
      B.el.querySelector(".cabeca").innerHTML = rostoHTML(id, p.exp || "neutro", true);
    }
    B.el.querySelector(".wrap").classList.toggle("vira", !!vira);
  }
  // retorna os ids que estão em busto agora (para esconder o retratinho da caixa)
  function renderBustos(S, c) {
    const box = $("#bustos");
    const fala = c && c.fala;
    const emDialogo = !!(c && (c.fala || c.narra || c.escolha));
    const npc = (S.menu && S.menu.quem) || S.conversa || null;
    const js = C.jogaveis;
    const pxOn = !!S.flags.retratos && S.fase === "jogo" && (!!npc && (emDialogo || (S.menu && !S.seq)) || js.includes(fala));
    const npcOn = !!npc && S.fase === "jogo" && (emDialogo || (S.menu && !S.seq));
    const on = [];
    const B1 = slotBusto("esq"), B2 = slotBusto("dir"), B3 = slotBusto("centro");
    const marcar = (B, id, vis) => {
      B.el.classList.toggle("on", vis);
      B.el.classList.toggle("fala", vis && fala === id);
      B.el.classList.toggle("apagado", vis && !!fala && fala !== id || vis && !fala && !!npc && id !== npc);
      if (vis) on.push(id);
    };
    if (pxOn) { encherBusto(B1, js[0], S, false); encherBusto(B2, js[1], S, true); }
    marcar(B1, js[0], pxOn); marcar(B2, js[1], pxOn);
    if (npcOn) encherBusto(B3, npc, S, false);
    marcar(B3, npc, npcOn);
    box.classList.toggle("foco", npcOn);
    // quem vem pra frente some do cenário enquanto está em destaque
    for (const id in elPers) elPers[id].el.classList.toggle("embusto", npcOn && id === npc);
    return on;
  }

  // ---------------------------------------------------------------- close-up (gaveta etc.)
  let examAtual = null;
  function renderExaminar(S) {
    const id = S.fase === "jogo" ? S.examinar : null;
    if (id === examAtual) return;
    const el = $("#examinar"), C = window.CLOSEUPS || {};
    const sai = (cfg) => { // volta pro lugar de onde saiu
      el.classList.remove("aberto");
      if (cfg) { el.style.left = cfg.de.x + "%"; el.style.top = cfg.de.y + "%"; }
    };
    const antigo = examAtual && C[examAtual];
    examAtual = id;
    if (!id || !C[id]) { sai(antigo); return; }
    const cfg = C[id];
    el.querySelector("img").src = cfg.img;
    el.style.width = (cfg.w || 34) + "cqw";
    el.style.transition = "none"; el.classList.remove("aberto");
    el.style.left = cfg.de.x + "%"; el.style.top = cfg.de.y + "%";
    void el.offsetWidth; el.style.transition = "";
    el.style.left = "50%"; el.style.top = "40%";
    el.classList.add("aberto");
  }

  // ---------------------------------------------------------------- sequência atual
  function limparTimers() { L.timers.forEach(clearTimeout); L.timers = []; if (L.digitando) clearInterval(L.digitando); L.digitando = null; }
  function esconderCena() {
    for (const s of ["#dlg", "#escolhas", "#relogio", "#titulo", "#deducao"]) $(s).classList.add("oculto");
    $("#escolhas").innerHTML = ""; $("#alvos").innerHTML = "";
    $("#transicao").classList.remove("on");
    pararIsca();
  }
  function depois(ms, f) { L.timers.push(setTimeout(f, Math.max(0, ms))); }

  function renderSeq(S) {
    const c = window.Motor.cmdAtual(S);
    const chave = S.seq ? S.seq.id + ":" + S.seq.i + ":" + (S.seq.t0 || 0) : "";
    if (c && c.deducao) renderDeducao(S); // atualiza votos a cada mudança
    if (chave === L.chaveSeq) return;
    L.chaveSeq = chave;
    limparTimers(); esconderCena();
    if (!c) return;
    const id = S.seq.id, i = S.seq.i, t0 = S.seq.t0 || window.Rede.agora();
    const avancar = () => agir({ t: "avancar", id, i });
    const resta = (ms) => t0 + ms - window.Rede.agora();

    if (c.fala || c.narra) mostrarFala(c, avancar);
    else if (c.espera !== undefined) depois(resta(c.espera), avancar);
    else if (c.mover) depois(resta(c.ms || 1000), avancar);
    else if (c.transicao !== undefined) {
      const tr = $("#transicao"); tr.querySelector(".txt").textContent = c.txt || ""; tr.classList.add("on");
      depois(resta(c.transicao), avancar);
    } else if (c.titulo !== undefined) {
      const t = $("#titulo"); t.querySelector(".t").textContent = c.titulo; t.querySelector(".s").textContent = c.sub || "";
      t.classList.remove("oculto"); t.style.animation = "none"; void t.offsetWidth; t.style.animation = "";
      depois(resta(c.ms || 2600), avancar);
    } else if (c.relogio) {
      const r = $("#relogio"); r.querySelector(".hora").textContent = c.relogio; r.querySelector(".txt").textContent = c.txt || "";
      r.classList.remove("oculto"); L.prontoEm = Date.now() + 700;
      r.onclick = (ev) => { ev && ev.stopPropagation(); if (Date.now() >= L.prontoEm) avancar(); };
      L.avancarRelogio = () => { if (Date.now() >= L.prontoEm) avancar(); };
      Som.tocar("sting2");
    } else if (c.escolha) {
      mostrarEscolhas(c, id, i);
    } else if (c.clique) {
      const a = c.clique, el = document.createElement("div");
      el.className = "alvo"; Object.assign(el.style, { left: pc(a.x), top: pc(a.y), width: pc(a.w), height: pc(a.h) });
      el.innerHTML = `<span>${a.rotulo || "Clique"}</span>`;
      el.onclick = (ev) => { ev.stopPropagation(); Som.tocar("passos"); avancar(); };
      $("#alvos").appendChild(el);
    } else if (c.minigame === "isca") {
      iniciarIsca(S, id, i);
    } else if (c.deducao) {
      renderDeducao(S, true);
    }
  }

  // ---------------------------------------------------------------- diálogo
  function mostrarFala(c, avancar) {
    const d = $("#dlg");
    d.classList.remove("oculto", "pronto");
    d.classList.toggle("narra", !!c.narra);
    const quem = c.fala;
    if (quem) {
      const P = PERS[quem] || {};
      d.querySelector(".retrato").innerHTML = rostoHTML(quem, c.exp || "neutro");
      const pl = d.querySelector(".placa"); pl.textContent = P.nome || quem;
      d.style.setProperty("--c", C.coresJogador[quem] || P.cor || "#fff");
    }
    const txt = c.fala ? c.txt : c.narra;
    const el = d.querySelector(".texto");
    el.textContent = ""; L.textoCheio = txt; L.inicioFala = Date.now();
    let n = 0;
    L.digitando = setInterval(() => {
      n += 1; el.textContent = txt.slice(0, n);
      if (n % 3 === 0 && c.fala) Som.tocar("texto");
      if (n >= txt.length) { clearInterval(L.digitando); L.digitando = null; d.classList.add("pronto"); }
    }, C.velocidadeTexto);
    d.onclick = (ev) => { ev && ev.stopPropagation(); clicarFala(avancar); };
    L.avancarFala = avancar;
    // voltar uma fala (para quando alguém clica sem querer)
    const S = L.S, bv = d.querySelector(".voltar");
    const pode = S && window.Motor.anterior(S) >= 0;
    bv.classList.toggle("oculto", !pode);
    bv.onclick = (ev) => { ev.stopPropagation(); voltarFala(); };
  }
  function voltarFala() {
    const S = L.S; if (!S || !S.seq || window.Motor.anterior(S) < 0) return;
    Som.tocar("clique");
    agir({ t: "voltar", id: S.seq.id, i: S.seq.i });
  }
  function clicarFala(avancar) {
    const d = $("#dlg");
    if (L.digitando) { clearInterval(L.digitando); L.digitando = null; d.querySelector(".texto").textContent = L.textoCheio; d.classList.add("pronto"); return; }
    if (Date.now() - L.inicioFala < C.tempoMinimoFala) return;
    avancar();
  }
  function mostrarEscolhas(c, id, i) {
    const box = $("#escolhas"); box.innerHTML = ""; box.classList.remove("oculto");
    c.escolha.forEach((op, k) => {
      const b = document.createElement("button");
      b.textContent = op.txt;
      if (/^ACUSAR/.test(op.txt)) b.className = "destaque";
      b.onclick = (ev) => { ev.stopPropagation(); Som.tocar("escolha"); agir({ t: "escolher", id, i, k }); };
      box.appendChild(b);
    });
  }

  // ---------------------------------------------------------------- menu de conversa
  function renderMenu(S) {
    const m = $("#menu");
    const mostrar = !S.seq && S.menu && S.fase === "jogo";
    if (!mostrar) { m.classList.add("oculto"); L.ultimoMenuKey = ""; return; }
    const quem = S.menu.quem, P = PERS[quem] || {};
    const tops = (window.TOPICOS[quem] || []).filter((t) => !t.se || t.se(S));
    const key = quem + "|" + tops.map((t) => t.id + (S.vistos["top_" + quem + "_" + t.id] ? "v" : "")).join(",");
    if (key === L.ultimoMenuKey && !m.classList.contains("oculto")) return;
    L.ultimoMenuKey = key;
    m.classList.remove("oculto");
    m.style.setProperty("--c", P.cor || "#fff");
    m.innerHTML = `<div class="placa">${P.nome || quem}</div><div class="lista"></div>`;
    const lista = m.querySelector(".lista");
    for (const t of tops) {
      const b = document.createElement("button");
      b.textContent = t.txt;
      if (S.vistos["top_" + quem + "_" + t.id]) b.classList.add("visto");
      b.onclick = (ev) => { ev.stopPropagation(); Som.tocar("escolha"); agir({ t: "topico", quem, id: t.id }); };
      lista.appendChild(b);
    }
    const sair = document.createElement("button");
    sair.className = "sair"; sair.textContent = "Tchau";
    sair.onclick = (ev) => { ev.stopPropagation(); agir({ t: "fecharMenu" }); };
    lista.appendChild(sair);
  }

  // ---------------------------------------------------------------- pistas
  function renderBotaoPistas(S) {
    const b = $("#btnPistas");
    const vis = S.fase === "jogo" && S.capitulo !== "intro";
    b.classList.toggle("oculto", !vis);
    b.querySelector(".n").textContent = Object.keys(S.pistas).length;
    b.classList.toggle("pulsa", !!S.flags.ligarAberto && !(S.flags.lig_argola || S.flags.lig_kit || S.flags.lig_tlim) && !S.seq);
    if (L.painel.aberto) renderPainel();
  }
  function abrirPainel(v) {
    L.painel.aberto = v === undefined ? !L.painel.aberto : v;
    if (L.painel.aberto) L.abriuPainel = true;
    if (!L.painel.aberto) { L.painel.ligar = false; L.painel.par = []; }
    $("#painel").classList.toggle("oculto", !L.painel.aberto);
    if (L.painel.aberto) renderPainel();
  }
  function renderPainel() {
    const S = L.S; if (!S) return;
    const p = $("#painel"), Pn = L.painel;
    const tem = window.ORDEM_PISTAS.filter((k) => S.pistas[k]);
    if (!Pn.sel || !S.pistas[Pn.sel]) Pn.sel = tem[tem.length - 1] || null;
    const ligarLiberado = !!S.flags.ligarAberto || tem.length >= 6;
    p.innerHTML = `<h2>PISTAS <small>${tem.length} encontradas</small></h2>
      <div class="grade"></div><div class="detalhe"></div>
      <div class="barra"><span class="dica"></span>
        ${ligarLiberado ? `<button class="btn ligar ${Pn.ligar ? "on" : ""}">🔗 Ligar pistas</button>` : ""}
        <button class="btn fechar">Fechar</button></div>`;
    const g = p.querySelector(".grade");
    for (const k of window.ORDEM_PISTAS) {
      const c = document.createElement("div");
      const tenho = !!S.pistas[k];
      c.className = "carta" + (tenho ? "" : " vazia") + ((Pn.ligar ? Pn.par.includes(k) : Pn.sel === k) && tenho ? " sel" : "");
      c.innerHTML = tenho ? `<div class="ic">${iconePista(k)}</div><div class="nm">${PISTAS[k].nome}</div>` : `<div class="ic"></div><div class="nm">?</div>`;
      if (tenho) c.onclick = (ev) => {
        ev.stopPropagation();
        if (Pn.ligar) {
          if (Pn.par.includes(k)) Pn.par = Pn.par.filter((x) => x !== k);
          else { Pn.par.push(k); if (Pn.par.length > 2) Pn.par.shift(); }
          if (Pn.par.length === 2) {
            const [a, b] = Pn.par;
            if (L.S.seq) { Pn.par = []; renderPainel(); return; }
            agir({ t: "ligar", a, b }); abrirPainel(false); return;
          }
        } else Pn.sel = k;
        Som.tocar("clique"); renderPainel();
      };
      g.appendChild(c);
    }
    const det = p.querySelector(".detalhe");
    if (Pn.ligar) det.innerHTML = `<p>Escolha <b style="display:inline;font-size:inherit">duas pistas</b> que tenham a ver uma com a outra.${Pn.par.length ? " Selecionada: " + PISTAS[Pn.par[0]].nome : ""}</p>`;
    else if (Pn.sel) det.innerHTML = `<div class="ic">${iconePista(Pn.sel)}</div><div><b>${PISTAS[Pn.sel].nome}</b><p>${PISTAS[Pn.sel].desc}</p></div>`;
    else det.innerHTML = `<p>Nenhuma pista ainda.</p>`;
    p.querySelector(".dica").textContent = S.seq ? "" : (S.flags.ligarAberto && !(S.flags.lig_argola || S.flags.lig_kit || S.flags.lig_tlim) ? "Alguma coisa aqui combina com o que caiu no chão..." : "");
    const bl = p.querySelector(".ligar");
    if (bl) bl.onclick = (ev) => { ev.stopPropagation(); Pn.ligar = !Pn.ligar; Pn.par = []; if (Pn.ligar) L.modoLigar = true; renderPainel(); };
    p.querySelector(".fechar").onclick = (ev) => { ev.stopPropagation(); abrirPainel(false); };
  }
  function novaPista(id) {
    const n = $("#novaPista");
    n.innerHTML = `<div class="ic">${iconePista(id)}</div><div><small>nova pista</small><b>${PISTAS[id].nome}</b></div>`;
    n.classList.remove("oculto"); n.style.animation = "none"; void n.offsetWidth; n.style.animation = "";
    clearTimeout(n._t); n._t = setTimeout(() => n.classList.add("oculto"), 2400);
    const b = $("#btnPistas"); b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop");
    Som.tocar("pista");
  }

  // ---------------------------------------------------------------- isca (vulto no escuro)
  let vultoR = null;
  function posVulto(caminho, t) {
    let a = caminho[0], b = caminho[caminho.length - 1];
    for (let k = 0; k < caminho.length - 1; k++) if (t >= caminho[k].t && t <= caminho[k + 1].t) { a = caminho[k]; b = caminho[k + 1]; break; }
    if (t >= b.t) return { x: b.x, pose: b.pose, dir: 1 };
    const f = b.t === a.t ? 1 : (t - a.t) / (b.t - a.t);
    return { x: a.x + (b.x - a.x) * f, pose: a.pose, dir: b.x >= a.x ? 1 : -1 };
  }
  function iniciarIsca(S, id, i) {
    const I = window.ISCA, cam = I.caminhos[S.sala] || I.caminhos.cozinha;
    const camada = $("#vulto-camada"); camada.innerHTML = ""; camada.classList.add("ativo");
    const el = document.createElement("div"); el.className = "pers";
    el.innerHTML = `<div class="wrap"><div class="respira"><div class="corpo"></div><div class="cabeca">${window.PH.rosto("vulto")}</div></div></div>`;
    camada.appendChild(el);
    vultoR = { el, pose: null };
    const t0 = S.isca ? S.isca.t0 : window.Rede.agora();
    const passo = () => {
      const t = window.Rede.agora() - t0;
      const p = posVulto(cam, t);
      el.style.left = p.x + "%";
      if (vultoR.pose !== p.pose) { el.querySelector(".corpo").innerHTML = window.PH.corpo("#2a2148", p.pose, null, "#1a1626"); vultoR.pose = p.pose; }
      el.querySelector(".wrap").classList.toggle("vira", p.dir < 0);
      el.classList.toggle("andando", vultoR.x !== undefined && Math.abs(p.x - vultoR.x) > 0.005);
      vultoR.x = p.x;
      L.raf = requestAnimationFrame(passo);
    };
    passo();
    camada.onclick = (ev) => {
      ev.stopPropagation();
      const r = palco.getBoundingClientRect();
      const x = ((ev.clientX - r.left) / r.width) * 100, y = ((ev.clientY - r.top) / r.height) * 100;
      const hit = Math.abs(x - vultoR.x) < 6.5 && y > 38 && y < 97;
      agir({ t: "flash", id, i, hit });
    };
    depois(t0 + I.duracao - window.Rede.agora(), () => agir({ t: "iscaFim", id, i }));
    Som.ambienteNivel(0);
  }
  function renderFotosRest(S) {
    const el = $("#fotosRest"), c = window.Motor.cmdAtual(S);
    if (!c || c.minigame !== "isca" || !S.isca) { el.classList.add("oculto"); return; }
    const usadas = S.isca.fotos.length, max = window.ISCA.fotosMax;
    el.classList.remove("oculto");
    el.innerHTML = "📸 clique na pessoa " + Array.from({ length: max }, (_, k) => `<i class="${k < usadas ? "usada" : ""}"></i>`).join("");
  }
  function pararIsca() {
    if (L.raf) cancelAnimationFrame(L.raf); L.raf = null;
    const camada = $("#vulto-camada"); camada.innerHTML = ""; camada.classList.remove("ativo"); camada.onclick = null;
  }
  function mostrarFoto(q) {
    const I = window.ISCA;
    const info = I.fotos.find((f) => f.quadro === q) || I.erro;
    const f = $("#foto");
    f.innerHTML = window.PH.foto(q) + `<p>${info.txt}</p>`;
    f.classList.remove("oculto"); f.style.animation = "none"; void f.offsetWidth; f.style.animation = "";
    clearTimeout(f._t); f._t = setTimeout(() => f.classList.add("oculto"), 2200);
  }

  // ---------------------------------------------------------------- dedução
  function renderDeducao(S, forcar) {
    const box = $("#deducao");
    if (!S.ded || !S.ded.aberta) { box.classList.add("oculto"); return; }
    box.classList.remove("oculto");
    const D = window.DEDUCAO, q = S.ded.q, Q = D[q];
    const key = JSON.stringify([q, S.ded.votos, S.ded.resp, Object.keys(S.pistas).length]);
    if (!forcar && box._key === key) return;
    box._key = key;
    const passos = D.map((_, k) => `<i class="${S.ded.resp[k] !== undefined ? "ok" : k === q ? "at" : ""}"></i>`).join("");
    const votosDe = (v) => C.jogaveis.filter((sl) => (S.ded.votos[sl] || {})[q] === v)
      .map((sl) => `<i style="background:${corDe(sl)}"></i>`).join("");
    let ops = [], classe = "txt";
    if (Q.tipo === "suspeito") { classe = "sus"; ops = window.SUSPEITOS.map((id) => ({ v: id, html: `<div class="ic">${rostoHTML(id, "neutro")}</div>${PERS[id].nome}` })); }
    else if (Q.tipo === "pista") { classe = "pis"; ops = window.ORDEM_PISTAS.filter((k) => S.pistas[k]).map((k) => ({ v: k, html: `<div class="ic">${iconePista(k)}</div><span style="font-size:.85cqw">${PISTAS[k].nome}</span>` })); }
    else ops = Q.opcoes.map((o) => ({ v: o.id, html: o.txt }));
    const meu = L.eu && (S.ded.votos[L.eu] || {})[q];
    box.innerHTML = `<div class="topo"><h2>ACUSAÇÃO</h2><div class="passos">${passos}</div></div>
      <div class="perg">${q + 1}. ${Q.pergunta}</div>
      <div class="ops ${classe}">${ops.map((o) => `<div class="op ${meu === o.v ? "meu" : ""}" data-v="${o.v}" style="--c:${corDe(L.eu)}"><div class="votos">${votosDe(o.v)}</div>${o.html}</div>`).join("")}</div>
      <div class="rodape">Os dois precisam escolher a mesma resposta.${S.ded.erros ? " · Erros: " + S.ded.erros : ""}</div>`;
    box.querySelectorAll(".op").forEach((el) => (el.onclick = (ev) => { ev.stopPropagation(); Som.tocar("escolha"); agir({ t: "votar", q, v: el.dataset.v }); }));
  }

  // ---------------------------------------------------------------- efeitos (sons, flash, animações, pistas)
  function processarFx(S) {
    const lista = S.fx || [];
    if (L.fxVisto === null) { L.fxVisto = S.fxn || 0; return; }
    for (const f of lista) {
      if (f.n <= L.fxVisto) continue;
      if (f.tipo === "som") Som.tocar(f.som);
      if (f.tipo === "anim") animar(f.quem, f.a);
      if (f.tipo === "pista") novaPista(f.id);
      if (f.tipo === "flash") {
        const fl = $("#flash"); fl.classList.remove("on"); void fl.offsetWidth; fl.classList.add("on");
        if (f.foto) { Som.tocar("flash"); mostrarFoto(f.foto); }
      }
    }
    L.fxVisto = Math.max(L.fxVisto, S.fxn || 0);
  }
  function processarLog(S) {
    if (L.logVisto === null) { L.logVisto = S.logn || 0; return; }
    for (const g of S.log || []) {
      if (g.n <= L.logVisto) continue;
      const t = document.createElement("div"); t.className = "toast";
      const nome = (S.jogadores[g.slot] && S.jogadores[g.slot].nome) || "";
      t.style.setProperty("--c", corDe(g.slot));
      t.innerHTML = nome && g.txt.startsWith(nome) ? `<b>${nome}</b>${g.txt.slice(nome.length)}` : g.txt;
      $("#toasts").appendChild(t); setTimeout(() => t.remove(), 3500);
    }
    L.logVisto = Math.max(L.logVisto, S.logn || 0);
  }

  // ---------------------------------------------------------------- lobby
  function renderLobby(S) {
    const lob = $("#lobby");
    lob.classList.remove("oculto");
    const vagas = C.jogaveis.map((sl) => {
      const j = S.jogadores[sl], P = PERS[sl], minha = j && j.id === window.Rede.id;
      const on = j && window.Rede.estaOnline(j.id);
      let corpo;
      if (!j) corpo = `<input maxlength="18" placeholder="seu nome" data-slot="${sl}"><button class="btn" data-entrar="${sl}">SOU ${P.nome.toUpperCase()}</button>`;
      else if (minha) corpo = `<div class="st on">você · ${j.nome}</div><button class="btn" data-sair="${sl}">trocar</button>`;
      else corpo = `<div class="st ${on ? "on" : ""}">${j.nome} · ${on ? "conectado" : "desconectado"}</div>`;
      return `<div class="vaga ${minha ? "minha" : ""}" style="--c:${corDe(sl)}"><div class="rosto">${rostoHTML(sl, j ? "feliz" : "neutro")}</div><h3>${P.nome}</h3>${corpo}</div>`;
    }).join("");
    const cheio = C.jogaveis.every((k) => S.jogadores[k]);
    const souJog = C.jogaveis.some((k) => S.jogadores[k] && S.jogadores[k].id === window.Rede.id);
    const html = `<div class="logo">SUSPEITOS</div><div class="sub">um caso de assassinato para dois investigadores</div>
      <div class="vagas">${vagas}</div>
      <button class="btn grande" id="btnComecar" ${cheio && souJog ? "" : "disabled"}>COMEÇAR INVESTIGAÇÃO</button>
      <div class="rodape"><span>${window.Rede.modo === "firebase" ? "online" : "modo local (abra outra aba para o 2º jogador)"}</span>
        <a id="lkReset">resetar sala</a>${C.permitirTesteSozinho ? `<a id="lkSolo">testar sozinho</a>` : ""}</div>`;
    // só redesenha se mudou (para não apagar o que a pessoa está digitando)
    const key = JSON.stringify([S.jogadores, C.jogaveis.map((sl) => S.jogadores[sl] && window.Rede.estaOnline(S.jogadores[sl].id)), window.Rede.modo]);
    if (lob._key === key) return;
    const digitado = {}; lob.querySelectorAll("input[data-slot]").forEach((i) => (digitado[i.dataset.slot] = i.value));
    lob._key = key; lob.innerHTML = html;
    lob.querySelectorAll("input[data-slot]").forEach((i) => { if (digitado[i.dataset.slot]) i.value = digitado[i.dataset.slot]; });
    lob.querySelectorAll("[data-entrar]").forEach((b) => (b.onclick = () => {
      Som.iniciar();
      const sl = b.dataset.entrar, inp = lob.querySelector(`input[data-slot="${sl}"]`);
      agir({ t: "entrar", slot: sl, id: window.Rede.id, nome: inp ? inp.value.trim() : "" });
    }));
    lob.querySelectorAll("[data-sair]").forEach((b) => (b.onclick = () => agir({ t: "sairSlot", slot: b.dataset.sair, id: window.Rede.id })));
    lob.querySelector("#btnComecar").onclick = () => { Som.iniciar(); agir({ t: "comecar" }); };
    lob.querySelector("#lkReset").onclick = () => { if (confirm("Resetar a sala? Os dois jogadores saem.")) agir({ t: "reset" }); };
    const solo = lob.querySelector("#lkSolo");
    if (solo) solo.onclick = () => { Som.iniciar(); agir({ t: "solo", id: window.Rede.id }); };
  }

  function renderFim(S) {
    const f = $("#fimTela");
    if (S.fase !== "fim") { f.classList.add("oculto"); return; }
    if (!f.classList.contains("oculto")) return;
    const ms = (S.stats.fim || 0) - (S.stats.inicio || 0);
    const min = Math.floor(ms / 60000), seg = Math.floor((ms % 60000) / 1000);
    f.innerHTML = `<h1>CASO ENCERRADO</h1>
      <div class="stats"><div><b>${min}:${String(seg).padStart(2, "0")}</b><span>tempo</span></div>
      <div><b>${Object.keys(S.pistas).length}/${window.ORDEM_PISTAS.length}</b><span>pistas</span></div>
      <div><b>${(S.ded && S.ded.erros) || 0}</b><span>acusações erradas</span></div></div>
      <button class="btn grande" id="btnDeNovo">JOGAR DE NOVO</button>`;
    f.classList.remove("oculto");
    f.querySelector("#btnDeNovo").onclick = () => agir({ t: "reset", manterJogadores: true });
  }

  function renderAssistindo(S) {
    const a = $("#assistindo");
    if (S.fase === "lobby" || L.eu) { a.classList.add("oculto"); return; }
    a.classList.remove("oculto");
    if (a._k === "ok") return; a._k = "ok";
    a.innerHTML = `assistindo · ${C.jogaveis.map((sl) => `<button class="btn" data-ret="${sl}">sou ${PERS[sl].nome}</button>`).join("")}`;
    a.querySelectorAll("[data-ret]").forEach((b) => (b.onclick = () => window.Rede.acao({ t: "retomar", slot: b.dataset.ret, id: window.Rede.id })));
  }

  // ---------------------------------------------------------------- render principal
  function render(S) {
    L.S = S;
    L.eu = window.Rede.meuSlot(S);
    $("#carregando").classList.add("oculto");
    processarLog(S);
    if (S.fase === "lobby") {
      renderLobby(S); $("#fimTela").classList.add("oculto"); Som.setClima("normal");
      limparTimers(); esconderCena(); L.chaveSeq = ""; abrirPainel(false); $("#menu").classList.add("oculto");
      $("#btnPistas").classList.add("oculto"); $("#assistindo").classList.add("oculto");
      for (const id in elPers) { elPers[id].el.remove(); delete elPers[id]; }
      L.salaFundo = null; L.chaveObjs = ""; L.fxVisto = S.fxn || 0;
      return;
    }
    $("#lobby").classList.add("oculto"); $("#lobby")._key = "";
    palco.classList.remove("luz-normal", "luz-apagada", "luz-isca");
    palco.classList.add("luz-" + (S.luz || "normal"));
    palco.classList.toggle("modo-espiar", S.modo === "espiar");
    Som.ambienteNivel(S.luz === "apagada" || S.luz === "isca" ? 0.15 : S.modo === "espiar" ? 0.4 : 1);
    // música tensa: escuro, espionagem, perseguições e acusação
    Som.setClima(S.luz !== "normal" || S.modo === "espiar" || ["obs1", "obs2", "isca", "deducao"].includes(S.capitulo) ? "tenso" : "normal");
    renderFundo(S);
    renderObjetos(S);
    const c = window.Motor.cmdAtual(S);
    renderPersonagens(S, c && c.fala);
    $("#objetos").style.pointerEvents = S.seq ? "none" : "";
    renderSeq(S);
    const emBusto = renderBustos(S, c);
    renderExaminar(S);
    $("#dlg").classList.toggle("semRetrato", !!(c && c.fala && emBusto.includes(c.fala)));
    renderMenu(S);
    renderBotaoPistas(S);
    processarFx(S);
    renderAssistindo(S);
    renderFotosRest(S);
    renderFim(S);
    renderDica(S);
  }

  // ---------------------------------------------------------------- dicas rápidas (tutorial mínimo)
  function renderDica(S) {
    const el = $("#dica");
    if (!S || S.fase !== "jogo" || !window.TUTORIAL) { el.classList.add("oculto"); return; }
    const livre = !S.seq && !L.painel.aberto;
    for (const d of window.TUTORIAL) {
      if (L.dicasFeitas[d.id]) continue;
      let ate = false; try { ate = d.ate(S, L); } catch (e) {}
      if (ate) { L.dicasFeitas[d.id] = 1; if (L.dicaAtual === d.id) L.dicaAtual = null; continue; }
    }
    if (L.dicaAtual) { const d0 = window.TUTORIAL.find((d) => d.id === L.dicaAtual); let ainda = true; try { ainda = d0.se(S, L); } catch (e) {} if (!ainda && d0.id !== "pistas") { L.dicasFeitas[d0.id] = 1; L.dicaAtual = null; } }
    if (L.dicaAtual && Date.now() - L.dicaDesde > (window.TUTORIAL.find((d) => d.id === L.dicaAtual) || {}).ms) {
      L.dicasFeitas[L.dicaAtual] = 1; L.dicaAtual = null;
    }
    if (!L.dicaAtual && livre) {
      const d = window.TUTORIAL.find((d) => { if (L.dicasFeitas[d.id]) return false; try { return d.se(S, L); } catch (e) { return false; } });
      if (d) { L.dicaAtual = d.id; L.dicaDesde = Date.now(); }
    }
    const d = L.dicaAtual && window.TUTORIAL.find((x) => x.id === L.dicaAtual);
    if (!d || !livre || S.menu && d.id !== "conversar") { el.classList.add("oculto"); return; }
    el.className = "dica-" + d.onde; el.textContent = d.txt;
  }

  // ---------------------------------------------------------------- brilho raro em algo não examinado
  function brilhoTick() {
    const S = L.S;
    if (!S || S.fase !== "jogo" || S.seq || S.luz !== "normal" || S.modo || L.painel.aberto) return;
    const novos = [...document.querySelectorAll('#objetos .obj[data-novo="1"]')];
    if (!novos.length) return;
    const el = novos[Math.floor(Math.random() * novos.length)];
    el.classList.remove("glint"); void el.offsetWidth; el.classList.add("glint");
    setTimeout(() => el.classList.remove("glint"), 1300);
  }

  // ---------------------------------------------------------------- cursores remotos
  function renderCursores(cur) {
    const box = $("#cursores"), S = L.S;
    const ids = Object.keys(cur || {}).filter((id) => id !== window.Rede.id && window.Rede.estaOnline(id));
    box.querySelectorAll(".cur").forEach((el) => { if (!ids.includes(el.dataset.id)) el.remove(); });
    for (const id of ids) {
      const c = cur[id]; if (!c) continue;
      let el = box.querySelector(`.cur[data-id="${id}"]`);
      const slot = c.s, cor = corDe(slot);
      const nome = (S && S.jogadores[slot] && S.jogadores[slot].nome) || (PERS[slot] || {}).nome || "?";
      if (!el) {
        el = document.createElement("div"); el.className = "cur"; el.dataset.id = id;
        el.innerHTML = `<svg viewBox="0 0 20 24"><path d="M2 2 L2 20 L7 15 L11 23 L14 21.5 L10 14 L17 14Z" fill="${cor}" stroke="#000" stroke-width="1.5"/></svg><span></span>`;
        box.appendChild(el);
      }
      el.style.setProperty("--c", cor);
      el.querySelector("span").textContent = nome;
      el.style.left = c.x + "%"; el.style.top = c.y + "%";
      el.style.display = S && S.fase === "lobby" ? "none" : "";
    }
  }

  // ---------------------------------------------------------------- entradas
  function ligarEntradas() {
    palco.addEventListener("mousemove", (ev) => {
      const r = palco.getBoundingClientRect();
      window.Rede.cursor(((ev.clientX - r.left) / r.width) * 100, ((ev.clientY - r.top) / r.height) * 100, L.eu);
    });
    palco.addEventListener("click", () => {
      Som.iniciar();
      if (L.painel.aberto) { abrirPainel(false); return; }
      const S = L.S; if (!S || S.fase !== "jogo") return;
      const c = window.Motor.cmdAtual(S);
      if (c && (c.fala || c.narra) && L.avancarFala) clicarFala(L.avancarFala);       // clicar em qualquer lugar passa a fala
      else if (c && c.relogio && L.avancarRelogio) L.avancarRelogio();
    });
    setInterval(idleTick, 1200);
    setInterval(() => renderDica(L.S), 1000);
    const brilho = () => setTimeout(() => { brilhoTick(); brilho(); }, 9000 + Math.random() * 7000);
    brilho();
    $("#btnPistas").onclick = (ev) => { ev.stopPropagation(); Som.tocar("clique"); abrirPainel(); };
    $("#painel").onclick = (ev) => ev.stopPropagation();
    $("#deducao").onclick = (ev) => ev.stopPropagation();
    // painel de som: clique no ícone abre/fecha; dá pra arrastar ou usar a rodinha do mouse em cima
    const ps = $("#painelSom"), bs = $("#btnSom");
    const iconeSom = () => { bs.textContent = Som.estaMudo() || (Som.getVolume("musica") === 0 && Som.getVolume("efeitos") === 0) ? "🔇" : "🔊"; ps.querySelector(".mudo").classList.toggle("on", Som.estaMudo()); };
    const syncSom = () => { ps.querySelectorAll("input[data-canal]").forEach((r) => { const v = Math.round(Som.getVolume(r.dataset.canal) * 100); r.value = v; r.nextElementSibling.textContent = v + "%"; }); iconeSom(); };
    bs.onclick = (ev) => { ev.stopPropagation(); Som.iniciar(); ps.classList.toggle("oculto"); bs.classList.toggle("aberto", !ps.classList.contains("oculto")); syncSom(); };
    ps.onclick = (ev) => ev.stopPropagation();
    ps.querySelectorAll("input[data-canal]").forEach((r) => {
      r.oninput = () => { Som.setVolume(r.dataset.canal, r.value / 100); syncSom(); };
      r.addEventListener("wheel", (ev) => { ev.preventDefault(); r.value = Math.max(0, Math.min(100, +r.value + (ev.deltaY < 0 ? 5 : -5))); r.oninput(); }, { passive: false });
      r.onchange = () => { if (r.dataset.canal === "efeitos") Som.tocar("pista"); };
    });
    bs.addEventListener("wheel", (ev) => { ev.preventDefault(); const sobe = ev.deltaY < 0 ? .05 : -.05; Som.setVolume("musica", Som.getVolume("musica") + sobe); Som.setVolume("efeitos", Som.getVolume("efeitos") + sobe); syncSom(); }, { passive: false });
    ps.querySelector(".mudo").onclick = (ev) => { ev.stopPropagation(); Som.iniciar(); Som.alternarMudo(); syncSom(); };
    document.addEventListener("click", () => { if (!ps.classList.contains("oculto")) { ps.classList.add("oculto"); bs.classList.remove("aberto"); } });
    syncSom();
    document.addEventListener("keydown", (ev) => {
      if (ev.target && ev.target.tagName === "INPUT") return;
      const S = L.S; if (!S) return;
      if (ev.code === "Space" || ev.code === "Enter") {
        ev.preventDefault();
        const c = window.Motor.cmdAtual(S);
        if (c && (c.fala || c.narra) && L.avancarFala) clicarFala(L.avancarFala);
        else if (c && c.relogio && L.avancarRelogio) L.avancarRelogio();
      }
      if (ev.key === "Backspace" || ev.key === "ArrowLeft") { ev.preventDefault(); voltarFala(); }
      if (ev.key === "p" || ev.key === "P") { if (S.fase === "jogo" && S.capitulo !== "intro") abrirPainel(); }
      if (ev.key === "Escape") abrirPainel(false);
      if (ev.key === "m" || ev.key === "M") $("#painelSom .mudo").click();
    });
    // (chuva e relâmpagos agora ficam em js/chuva.js)
  }

  // pré-carrega os cenários para a troca de sala e o apagão não piscarem
  for (const k in window.CENARIOS) for (const src of [window.CENARIOS[k].fundo, window.CENARIOS[k].fundoApagado]) if (src) { const im = new Image(); im.src = src; }
  for (const k in (window.CLOSEUPS || {})) { const im = new Image(); im.src = window.CLOSEUPS[k].img; }

  window.UI = { render, renderCursores, ligarEntradas };
})();
