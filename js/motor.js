/* =====================================================================
   MOTOR — regras do jogo. Tudo aqui é "estado → novo estado".
   As duas telas rodam a mesma função em cima do mesmo estado
   compartilhado (Firebase ou modo local), então ficam sincronizadas.
   ===================================================================== */
(function () {
  const BLOQUEIA = ["fala", "narra", "espera", "mover", "escolha", "clique", "titulo", "relogio", "transicao", "minigame", "deducao"];
  const TEMPORIZADOS = ["espera", "mover", "transicao", "titulo"];

  function inicial() {
    return {
      v: 1, fase: "lobby", jogadores: {}, capitulo: "lobby", sala: "sala", luz: "normal", modo: "",
      pos: {}, pistas: {}, flags: {}, vistos: {}, seq: null, menu: null, conversa: null, examinar: null,
      fx: [], fxn: 0, log: [], logn: 0, isca: null, ded: null, cont: {}, stats: {}
    };
  }

  // O Firebase apaga objetos vazios e nulls: recompõe o formato.
  function norm(S) {
    const b = inicial();
    S = S || b;
    for (const k in b) if (S[k] === undefined) S[k] = b[k];
    for (const k of ["jogadores", "pos", "pistas", "flags", "vistos", "cont", "stats"]) if (!S[k] || typeof S[k] !== "object") S[k] = {};
    if (!Array.isArray(S.fx)) S.fx = S.fx ? Object.values(S.fx) : [];
    if (!Array.isArray(S.log)) S.log = S.log ? Object.values(S.log) : [];
    if (S.seq && S.seq.i === undefined) S.seq.i = 0;
    for (const id in S.pos) {
      const p = S.pos[id];
      if (p.vis === undefined) p.vis = true;
      if (!p.pose) p.pose = "neutro";
      if (!p.exp) p.exp = "neutro";
      if (p.olha === undefined) p.olha = 1;
    }
    if (S.isca && !Array.isArray(S.isca.fotos)) S.isca.fotos = S.isca.fotos ? Object.values(S.isca.fotos) : [];
    if (S.ded) {
      S.ded.votos = S.ded.votos || {};
      S.ded.resp = S.ded.resp || {};
      if (S.ded.q === undefined) S.ded.q = 0;
      if (S.ded.erros === undefined) S.ded.erros = 0;
    }
    return S;
  }

  const clone = (o) => JSON.parse(JSON.stringify(o));
  const nome = (S, slot) => (S.jogadores[slot] && S.jogadores[slot].nome) || (window.PERSONAGENS[slot] || {}).nome || slot;

  function fx(S, tipo, dados) {
    S.fxn = (S.fxn || 0) + 1;
    S.fx.push(Object.assign({ n: S.fxn, tipo }, dados || {}));
    if (S.fx.length > 10) S.fx = S.fx.slice(-10);
  }
  function log(S, txt, slot) {
    S.logn = (S.logn || 0) + 1;
    S.log.push({ n: S.logn, txt, slot: slot || "" });
    if (S.log.length > 6) S.log = S.log.slice(-6);
  }

  function posDe(S, id) {
    if (!S.pos[id]) S.pos[id] = { sala: S.sala, x: 50, pose: "neutro", exp: "neutro", vis: true, olha: 1 };
    return S.pos[id];
  }

  // ---------------- sequências ----------------
  function cmdAtual(S) {
    if (!S.seq) return null;
    const lista = window.ROTEIRO[S.seq.id];
    return lista ? lista[S.seq.i] || null : null;
  }
  const bloqueante = (c) => BLOQUEIA.some((k) => c[k] !== undefined);

  function passa(S, c) {
    if (c.se && !c.se(S)) return false;
    const n = S.vistos[S.seq.id] || 0;
    if (c.primeira && n > 1) return false;
    if (c.depois && n <= 1) return false;
    return true;
  }

  function iniciarSeq(S, id, agora) {
    if (!window.ROTEIRO[id]) { console.warn("sequência não existe:", id); return; }
    S.seq = { id, i: 0, t0: agora };
    S.vistos[id] = (S.vistos[id] || 0) + 1;
    rodar(S, agora);
  }

  function aplicar(S, c, agora) {
    if (c.sala !== undefined) { S.sala = c.sala; S.menu = null; }
    if (c.luz !== undefined) S.luz = c.luz;
    if (c.modo !== undefined) S.modo = c.modo;
    if (c.conversa !== undefined) S.conversa = c.conversa || null;
    if (c.examinar !== undefined) S.examinar = c.examinar || null;
    if (c.cena) {
      if (c.limpar) for (const id in S.pos) S.pos[id].vis = false;
      for (const id in c.cena) {
        const p = posDe(S, id), d = c.cena[id];
        if (c.limpar) { p.pose = "neutro"; p.exp = "neutro"; p.olha = 1; p.y = 0; }
        Object.assign(p, d); p.vis = d.vis === undefined ? true : d.vis;
        p.ms = 0;
      }
    }
    if (c.pos) {
      const p = posDe(S, c.pos);
      for (const k of ["sala", "x", "y", "pose", "exp", "olha", "vis"]) if (c[k] !== undefined) p[k] = c[k];
      if (c.vis === undefined && c.sala !== undefined) p.vis = true;
      p.ms = 0;
    }
    if (c.sai) posDe(S, c.sai).vis = false;
    if (c.pista && !S.pistas[c.pista]) { S.pistas[c.pista] = { t: agora }; fx(S, "pista", { id: c.pista }); }
    if (c.flag) S.flags[c.flag] = c.v === undefined ? true : c.v;
    if (c.capitulo) { S.capitulo = c.capitulo; }
    if (c.som) fx(S, "som", { som: c.som });
    if (c.anim) fx(S, "anim", { quem: c.anim, a: c.a });
    if (c.flash) fx(S, "flash");
    if (c.fim) { S.fase = "fim"; S.stats.fim = agora; S.seq = null; return "fim"; }
    if (c.ir) { iniciarSeq(S, c.ir, agora); return "ir"; }
    return null;
  }

  function prepararBloqueante(S, c, agora) {
    S.seq.t0 = agora;
    // Problems/Xinglau sempre têm posição (para guardar expressão do retrato)
    if (c.fala && !S.pos[c.fala] && window.CONFIG.jogaveis.includes(c.fala)) posDe(S, c.fala).vis = false;
    if ((c.fala) && S.pos[c.fala]) {
      if (c.exp) S.pos[c.fala].exp = c.exp;
      if (c.pose) S.pos[c.fala].pose = c.pose;
    }
    if (c.mover) {
      const p = posDe(S, c.mover);
      if (c.sala) p.sala = c.sala;
      p.olha = c.x < p.x ? -1 : 1;
      p.x = c.x; p.ms = c.ms || 1000; p.vis = true;
    }
    if (c.minigame === "isca") S.isca = { t0: agora, fotos: [], acertos: 0, sala: S.sala };
    if (c.deducao) {
      if (!S.ded) S.ded = { q: 0, votos: {}, resp: {}, erros: 0 };
      S.ded.aberta = true;
    }
  }

  function rodar(S, agora) {
    let guarda = 0;
    while (S.seq && guarda++ < 500) {
      const lista = window.ROTEIRO[S.seq.id] || [];
      const c = lista[S.seq.i];
      if (!c) {
        S.seq = null; S.conversa = null; S.examinar = null;
        checarGatilhos(S, agora); // pode iniciar outra sequência (que já roda sozinha)
        return;
      }
      if (!passa(S, c)) { S.seq.i++; continue; }
      if (bloqueante(c)) {
        // um comando bloqueante pode carregar também partes instantâneas (ex.: sala + fala)
        aplicarParcial(S, c, agora);
        prepararBloqueante(S, c, agora);
        break;
      }
      const r = aplicar(S, c, agora);
      if (r === "fim" || r === "ir") return; // "ir" já rodou a nova sequência
      S.seq.i++;
    }
  }
  // Partes instantâneas permitidas em comando bloqueante: som, flash, anim, pista, flag
  function aplicarParcial(S, c, agora) {
    if (c.som) fx(S, "som", { som: c.som });
    if (c.flash && !c.fala) fx(S, "flash");
    if (c.pista && !S.pistas[c.pista]) { S.pistas[c.pista] = { t: agora }; fx(S, "pista", { id: c.pista }); }
    if (c.flag) S.flags[c.flag] = c.v === undefined ? true : c.v;
    return null;
  }

  function checarGatilhos(S, agora) {
    if (S.seq || S.fase !== "jogo") return;
    for (const g of window.GATILHOS) {
      if (S.flags["g_" + g.id]) continue;
      let ok = false;
      try { ok = g.se(S); } catch (e) { ok = false; }
      if (ok) { S.flags["g_" + g.id] = true; S.menu = null; iniciarSeq(S, g.seq, agora); return; }
    }
  }

  function avancarSeq(S, agora) {
    if (!S.seq) return;
    S.seq.i++;
    rodar(S, agora);
  }

  // Índice da fala anterior na mesma sequência (ou -1). Não volta através de
  // escolhas, cliques, troca de sala/cena ou transições.
  const FRONTEIRA = ["escolha", "clique", "minigame", "deducao", "ir", "sala", "cena", "transicao", "titulo", "relogio", "fim"];
  function anterior(S) {
    if (!S.seq) return -1;
    const c0 = cmdAtual(S);
    if (!c0 || !(c0.fala || c0.narra)) return -1;
    const lista = window.ROTEIRO[S.seq.id] || [];
    for (let j = S.seq.i - 1; j >= 0; j--) {
      const c = lista[j];
      if (FRONTEIRA.some((k) => c[k] !== undefined)) return -1;
      if ((c.fala || c.narra) && passa(S, c)) return j;
    }
    return -1;
  }

  // ---------------- dedução ----------------
  function avaliarDeducao(S, agora) {
    const D = window.DEDUCAO;
    const erradas = [];
    D.forEach((q, i) => { if (!q.correta.includes(S.ded.resp[i])) erradas.push(i); });
    S.ded.aberta = false;
    if (!erradas.length) {
      S.ded.ok = true;
      iniciarSeq(S, "revelacao", agora);
      return;
    }
    S.ded.erros++;
    S.stats.erros = S.ded.erros;
    for (const i of erradas) {
      delete S.ded.resp[i];
      for (const sl in S.ded.votos) if (S.ded.votos[sl]) delete S.ded.votos[sl][i];
    }
    S.ded.q = erradas[0];
    S.ded.ultimaErrada = erradas[0];
    iniciarSeq(S, "ded_erro_" + erradas[0], agora);
  }

  // ---------------- ações ----------------
  function souJogador(S, slot) { return !!slot && !!S.jogadores[slot]; }

  function acao(S0, a, slot, agora) {
    const S = norm(clone(S0 || inicial()));
    const livre = !S.seq && S.fase === "jogo";
    switch (a.t) {
      case "entrar": {
        if (S.fase !== "lobby") return null;
        if (!window.CONFIG.jogaveis.includes(a.slot)) return null;
        const atual = S.jogadores[a.slot];
        if (atual && atual.id !== a.id) return null;
        for (const k in S.jogadores) if (S.jogadores[k] && S.jogadores[k].id === a.id) delete S.jogadores[k];
        S.jogadores[a.slot] = { id: a.id, nome: (a.nome || "").slice(0, 18) || window.PERSONAGENS[a.slot].nome };
        return S;
      }
      case "sairSlot": {
        if (S.fase !== "lobby") return null;
        if (S.jogadores[a.slot] && S.jogadores[a.slot].id === a.id) delete S.jogadores[a.slot];
        return S;
      }
      case "solo": {
        if (S.fase !== "lobby") return null;
        for (const k of window.CONFIG.jogaveis) S.jogadores[k] = { id: a.id, nome: window.PERSONAGENS[k].nome };
        S.stats.solo = true;
        // cai no "comecar"
      }
      // fallthrough
      case "comecar": {
        if (S.fase !== "lobby") return null;
        if (!window.CONFIG.jogaveis.every((k) => S.jogadores[k])) return null;
        S.fase = "jogo"; S.stats.inicio = agora;
        iniciarSeq(S, "intro", agora);
        return S;
      }
      case "avancar": {
        if (!S.seq || S.seq.id !== a.id || S.seq.i !== a.i) return null;
        const c = cmdAtual(S);
        if (c && (c.escolha || c.minigame || c.deducao)) return null;
        avancarSeq(S, agora);
        return S;
      }
      case "voltar": { // volta uma fala (clique sem querer)
        if (!S.seq || S.seq.id !== a.id || S.seq.i !== a.i) return null;
        const j = anterior(S);
        if (j < 0) return null;
        S.seq.i = j; S.seq.t0 = agora;
        const c = cmdAtual(S);
        prepararBloqueante(S, c, agora);
        return S;
      }
      case "escolher": {
        if (!S.seq || S.seq.id !== a.id || S.seq.i !== a.i) return null;
        const c = cmdAtual(S);
        if (!c || !c.escolha || !c.escolha[a.k]) return null;
        const op = c.escolha[a.k];
        log(S, nome(S, slot) + " escolheu: " + op.txt, slot);
        if (op.flag) S.flags[op.flag] = true;
        if (op.seq) iniciarSeq(S, op.seq, agora); else avancarSeq(S, agora);
        return S;
      }
      case "clicar": {
        if (!livre) return null;
        const cen = window.CENARIOS[S.sala];
        if (a.tipo === "porta") {
          const p = cen.portas.find((d) => d.para === a.alvo);
          if (!p) return null;
          S.sala = a.alvo; S.menu = null;
          S.vistos["sala_" + a.alvo] = 1;
          log(S, nome(S, slot) + " foi para: " + window.CENARIOS[a.alvo].nome, slot);
          fx(S, "som", { som: "porta" });
          checarGatilhos(S, agora);
          return S;
        }
        if (a.tipo === "obj") {
          const o = cen.objetos.find((x) => x.id === a.alvo);
          if (!o || (o.se && !o.se(S))) return null;
          let seq = o.clique;
          if (Array.isArray(seq)) { const m = seq.find((r) => !r.se || r.se(S)); seq = m && m.seq; }
          if (!seq) return null;
          S.menu = null;
          S.cont.cliques = (S.cont.cliques || 0) + 1;
          if (S.capitulo === "inv2") { S.cont.inv2 = (S.cont.inv2 || 0) + 1; S.cont.inv2obj = (S.cont.inv2obj || 0) + 1; }
          if (S.capitulo === "inv1") S.cont.inv1 = (S.cont.inv1 || 0) + 1;
          S.vistos["obj_" + o.id] = (S.vistos["obj_" + o.id] || 0) + 1;
          S.ultimoClique = { slot, alvo: o.id, n: (S.ultimoClique ? S.ultimoClique.n : 0) + 1 };
          iniciarSeq(S, seq, agora);
          return S;
        }
        if (a.tipo === "pers") {
          const p = S.pos[a.alvo];
          if (!p || !p.vis || p.sala !== S.sala || !window.TOPICOS[a.alvo]) return null;
          S.menu = { quem: a.alvo, por: slot };
          return S;
        }
        return null;
      }
      case "topico": {
        if (!livre || !S.menu || S.menu.quem !== a.quem) return null;
        const t = (window.TOPICOS[a.quem] || []).find((x) => x.id === a.id);
        if (!t || (t.se && !t.se(S))) return null;
        S.vistos["top_" + a.quem + "_" + a.id] = 1;
        S.vistos.conversou = 1;
        if (S.capitulo === "inv1") S.cont.inv1 = (S.cont.inv1 || 0) + 1;
        if (S.capitulo === "inv2") S.cont.inv2 = (S.cont.inv2 || 0) + 1;
        iniciarSeq(S, t.seq, agora);
        return S;
      }
      case "fecharMenu": {
        if (!S.menu) return null;
        S.menu = null;
        checarGatilhos(S, agora);
        return S;
      }
      case "flash": {
        const c = cmdAtual(S);
        if (!c || c.minigame !== "isca" || !S.isca || S.seq.id !== a.id || S.seq.i !== a.i) return null;
        const I = window.ISCA;
        if (S.isca.fotos.length >= I.fotosMax) return null;
        let foto;
        if (a.hit) { foto = (I.fotos[S.isca.acertos] || I.fotos[I.fotos.length - 1]).quadro; S.isca.acertos++; }
        else foto = I.erro.quadro;
        S.isca.fotos.push({ q: foto, slot: slot || "" });
        fx(S, "flash", { foto, quem: slot });
        if (S.isca.fotos.length >= I.fotosMax) { S.isca.fim = agora; avancarSeq(S, agora); }
        return S;
      }
      case "iscaFim": {
        const c = cmdAtual(S);
        if (!c || c.minigame !== "isca" || S.seq.id !== a.id || S.seq.i !== a.i) return null;
        S.isca.fim = agora;
        avancarSeq(S, agora);
        return S;
      }
      case "ligar": {
        if (!livre) return null;
        if (!S.pistas[a.a] || !S.pistas[a.b] || a.a === a.b) return null;
        const L = window.LIGACOES.find((l) => (l.a === a.a && l.b === a.b) || (l.a === a.b && l.b === a.a));
        S.menu = null;
        log(S, nome(S, slot) + " ligou: " + window.PISTAS[a.a].nome + " + " + window.PISTAS[a.b].nome, slot);
        if (L) iniciarSeq(S, L.seq, agora);
        else { S.cont.nada = (S.cont.nada || 0) + 1; iniciarSeq(S, "lig_nada", agora); }
        return S;
      }
      case "votar": {
        const c = cmdAtual(S);
        if (!c || !c.deducao || !S.ded || !S.ded.aberta || a.q !== S.ded.q) return null;
        if (!souJogador(S, slot)) return null;
        S.ded.votos[slot] = S.ded.votos[slot] || {};
        S.ded.votos[slot][a.q] = a.v;
        const js = window.CONFIG.jogaveis;
        const solo = js.every((k) => S.jogadores[k] && S.jogadores[k].id === S.jogadores[js[0]].id);
        const vs = js.map((k) => (S.ded.votos[k] || {})[a.q]);
        const concordam = solo ? true : vs.every((v) => v !== undefined && v === vs[0]);
        if (concordam) {
          S.ded.resp[a.q] = a.v;
          fx(S, "som", { som: "pista" });
          // próxima pergunta sem resposta
          let prox = -1;
          for (let i = 0; i < window.DEDUCAO.length; i++) if (S.ded.resp[i] === undefined) { prox = i; break; }
          if (prox === -1) avaliarDeducao(S, agora);
          else S.ded.q = prox;
        }
        return S;
      }
      case "retomar": { // jogador recarregou em outro navegador e quer o lugar de volta
        if (!window.CONFIG.jogaveis.includes(a.slot) || !S.jogadores[a.slot]) return null;
        S.jogadores[a.slot].id = a.id;
        return S;
      }
      case "liberarVagas": {
        if (S.fase !== "lobby") return inicial();
        S.jogadores = {};
        return S;
      }
      case "reset": {
        const N = inicial();
        if (a.manterJogadores) N.jogadores = S.jogadores;
        return N;
      }
      case "pular": {
        return atalho(S, a.cap, agora);
      }
    }
    return null;
  }

  // Pula para um capítulo (ADM, para testes)
  function atalho(S, cap, agora) {
    const A = window.ATALHOS[cap];
    if (!A && cap !== "intro" && cap !== "isca" && cap !== "deducao") return null;
    if (!Object.keys(S.jogadores).length) {
      for (const k of window.CONFIG.jogaveis) S.jogadores[k] = { id: "adm", nome: window.PERSONAGENS[k].nome };
    }
    S.fase = "jogo"; S.seq = null; S.menu = null; S.conversa = null; S.ded = null; S.isca = null; S.modo = ""; S.luz = "normal";
    S.stats.inicio = agora;
    if (cap === "intro") { S.pistas = {}; S.flags = {}; S.vistos = {}; iniciarSeq(S, "intro", agora); return S; }
    const base = cap === "isca" ? window.ATALHOS.plano : cap === "deducao" ? window.ATALHOS.pos : A;
    S.pistas = window.ATALHOS._todas(base.pistas);
    S.flags = {}; base.flags.forEach((f) => (S.flags[f] = true));
    S.flags.retratos = true;
    S.vistos = { sala_sala: 1, sala_cozinha: 1, sala_estudio: 1, conversou: 1 };
    aplicar(S, base.cena, agora);
    if (base.pos) for (const id in base.pos) Object.assign(posDe(S, id), base.pos[id], { vis: true });
    S.sala = base.sala;
    S.capitulo = cap === "isca" ? "plano" : cap === "deducao" ? "pos" : cap;
    if (cap === "isca") { S.flags.pegouCartao = true; S.flags.g_anuncio = true; iniciarSeq(S, "anuncio", agora); }
    if (cap === "deducao") { S.flags.lig_argola = true; S.flags.g_acusar = true; iniciarSeq(S, "pre_acusacao", agora); }
    return S;
  }

  window.Motor = { inicial, norm, acao, cmdAtual, anterior, BLOQUEIA, TEMPORIZADOS };
})();
