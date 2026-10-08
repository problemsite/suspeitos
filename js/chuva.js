/* =====================================================================
   CHUVA E RELÂMPAGOS nas janelas dos cenários (só visual, cada tela a sua).
   As áreas de vidro ficam em cenarios.js → janelas: [{ x, y, w, h }].
   ===================================================================== */
(function () {
  const palco = document.getElementById("palco");
  const cv = document.createElement("canvas");
  cv.id = "chuva";
  palco.insertBefore(cv, document.getElementById("objetos"));
  const ctx = cv.getContext("2d");
  const off = document.createElement("canvas"), octx = off.getContext("2d"); // para janelas com máscara
  const mascaras = {}; // src -> Image
  let W = 0, H = 0, sala = null, gotas = [], escorre = [], flash = 0, proxRaio = performance.now() + 9000;

  function medir() {
    const r = palco.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
    W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    gerar();
  }
  const janelas = () => ((window.CENARIOS[sala] || {}).janelas || []);
  // máscara: PNG do tamanho da janela, branco = vidro onde a chuva aparece (ex.: vãos da persiana)
  for (const k in window.CENARIOS) for (const j of (window.CENARIOS[k].janelas || [])) if (j.mascara && !mascaras[j.mascara]) {
    const im = new Image(); im.src = j.mascara; mascaras[j.mascara] = im;
  }
  function gerar() {
    gotas = []; escorre = [];
    for (const j of janelas()) {
      const area = (j.w * W / 100) * (j.h * H / 100);
      const n = Math.max(16, Math.round(area / 650));
      for (let i = 0; i < n; i++) gotas.push(novaGota(j, true));
      const m = Math.max(2, Math.round(area / 9000));
      for (let i = 0; i < m; i++) escorre.push(novoEscorre(j, true));
    }
  }
  function novaGota(j, inicio) {
    const z = Math.random(); // profundidade: longe = fina e lenta
    return { j, x: Math.random() * 1.2 - 0.1, y: inicio ? Math.random() : -Math.random() * 0.3,
      v: 0.9 + z * 1.6, len: 0.06 + z * 0.12, a: 0.12 + z * 0.3, lw: 0.6 + z * 0.9 };
  }
  function novoEscorre(j, inicio) {
    return { j, x: Math.random(), y: inicio ? Math.random() : -0.05, v: 0.02 + Math.random() * 0.06, r: 1 + Math.random() * 1.6, para: Math.random() * 2 };
  }

  let ultimo = performance.now();
  function quadro(agora) {
    const dt = Math.min(0.05, (agora - ultimo) / 1000); ultimo = agora;
    const S = window.Rede && window.Rede.estado;
    const ativa = S && S.fase !== "lobby";
    const s2 = ativa ? S.sala : null;
    if (s2 !== sala) { sala = s2; gerar(); }
    ctx.clearRect(0, 0, W, H);
    if (ativa && janelas().length) {
      // relâmpago de vez em quando (duplo, como relâmpago de verdade)
      if (agora > proxRaio) {
        flash = 1; setTimeout(() => (flash = 0.8), 160);
        proxRaio = agora + 16000 + Math.random() * 22000;
        setTimeout(() => window.Som && Som.tocar("trovao"), 700 + Math.random() * 900);
        const g = document.getElementById("relampago");
        if (g) { g.classList.remove("on"); void g.offsetWidth; g.classList.add("on"); }
      }
      for (const j of janelas()) {
        const x = j.x * W / 100, y = j.y * H / 100, w = j.w * W / 100, h = j.h * H / 100;
        const mk = j.mascara && mascaras[j.mascara];
        const comMascara = mk && mk.complete && mk.naturalWidth;
        let g = ctx, ox = x, oy = y;
        if (comMascara) { // desenha numa tela separada e recorta pelos vãos
          const dpr = cv.width / W;
          off.width = Math.ceil(w * dpr); off.height = Math.ceil(h * dpr);
          octx.setTransform(dpr, 0, 0, dpr, 0, 0); octx.clearRect(0, 0, w, h);
          g = octx; ox = 0; oy = 0;
        } else { ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); }
        if (flash > 0.02) { g.fillStyle = `rgba(200,215,255,${0.55 * flash})`; g.fillRect(ox, oy, w, h); }
        g.lineCap = "round";
        for (const d of gotas) {
          if (d.j !== j) continue;
          d.y += d.v * dt * (h > 0 ? 300 / h : 1) * 1.6;
          if (d.y - d.len > 1.05) Object.assign(d, novaGota(j, false));
          const gx = ox + d.x * w, gy = oy + d.y * h, l = d.len * Math.max(h, 120);
          g.strokeStyle = `rgba(185,205,255,${Math.min(0.75, d.a * (comMascara ? 1.5 : 1))})`; g.lineWidth = d.lw;
          g.beginPath(); g.moveTo(gx, gy); g.lineTo(gx - l * 0.12, gy - l); g.stroke();
        }
        for (const e of escorre) {
          if (e.j !== j) continue;
          if (e.para > 0) e.para -= dt; else e.y += e.v * dt * 3;
          if (Math.random() < 0.004) e.para = Math.random() * 1.5;
          if (e.y > 1.05) Object.assign(e, novoEscorre(j, false));
          const ex = ox + e.x * w, ey = oy + e.y * h;
          g.fillStyle = "rgba(200,220,255,.35)"; g.beginPath(); g.arc(ex, ey, e.r, 0, 6.3); g.fill();
          g.strokeStyle = "rgba(200,220,255,.12)"; g.lineWidth = e.r * 0.8;
          g.beginPath(); g.moveTo(ex, ey); g.lineTo(ex, ey - 14 * e.r); g.stroke();
        }
        if (comMascara) {
          octx.globalCompositeOperation = "destination-in";
          octx.drawImage(mk, 0, 0, w, h);
          octx.globalCompositeOperation = "source-over";
          ctx.drawImage(off, x, y, w, h);
        } else ctx.restore();
      }
      flash *= Math.pow(0.02, dt); // some rápido
    }
    requestAnimationFrame(quadro);
  }
  window.addEventListener("resize", medir);
  medir(); requestAnimationFrame(quadro);
})();
