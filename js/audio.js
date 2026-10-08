/* =====================================================================
   ÁUDIO — sons sintetizados (sem arquivos). Para usar arquivos de verdade,
   coloque em ARQUIVOS: { baque: "sons/baque.mp3", ... } — tem prioridade.
   ===================================================================== */
(function () {
  const ARQUIVOS = {}; // ex.: { baque: "sons/baque.mp3", ambiente: "sons/chuva.mp3" }
  let ctx = null, master = null, ambiente = null, mudo = false;
  let busMusica = null, busEfeitos = null;
  // volumes de cada canal (0 a 1) — lembrados neste navegador
  const vol = { musica: 0.6, efeitos: 0.8 };
  try { const v = JSON.parse(localStorage.getItem("suspeitos_volume") || "null"); if (v) Object.assign(vol, v); } catch (e) {}
  const MUSICA = ["musica", "ambiente"]; // arquivos com esses nomes contam como música

  function iniciar() {
    if (ctx) { if (ctx.state === "suspended") ctx.resume(); return; }
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = mudo ? 0 : ((window.CONFIG && CONFIG.volume) || 0.5); master.connect(ctx.destination);
      busMusica = ctx.createGain(); busMusica.gain.value = vol.musica; busMusica.connect(master);
      busEfeitos = ctx.createGain(); busEfeitos.gain.value = vol.efeitos; busEfeitos.connect(master);
      ligarAmbiente();
      iniciarMusica();
    } catch (e) { ctx = null; }
  }

  function ruido(seg) {
    const b = ctx.createBuffer(1, ctx.sampleRate * seg, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }
  function env(g, t, a, sus, rel, pico) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(pico || 1, t + a);
    g.gain.setValueAtTime(pico || 1, t + a + sus);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + sus + rel);
  }
  function tom(freq, tipo, dur, vol, quando, glide) {
    const t = ctx.currentTime + (quando || 0);
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = tipo || "sine"; o.frequency.setValueAtTime(freq, t);
    if (glide) o.frequency.exponentialRampToValueAtTime(glide, t + dur);
    env(g, t, 0.01, dur * 0.3, dur * 0.7, vol || 0.3);
    o.connect(g).connect(busEfeitos); o.start(t); o.stop(t + dur + 0.05);
  }
  function chiado(dur, vol, filtro, freq, quando, q) {
    const t = ctx.currentTime + (quando || 0);
    const s = ctx.createBufferSource(); s.buffer = ruido(dur + 0.1);
    const f = ctx.createBiquadFilter(); f.type = filtro || "lowpass"; f.frequency.value = freq || 800; f.Q.value = q || 1;
    const g = ctx.createGain(); env(g, t, 0.005, dur * 0.2, dur * 0.8, vol || 0.3);
    s.connect(f).connect(g).connect(busEfeitos); s.start(t); s.stop(t + dur + 0.1);
  }

  // CHUVA: arquivo sons/chuva.mp3 em loop. Conta como EFEITO SONORO (slider de efeitos).
  const CHUVA_ARQ = "sons/chuva.mp3", CHUVA_VOL = 0.55; // volume base da chuva (0 a 1)
  let chuvaEl = null, nivelChuva = 1, volChuvaAtual = 0, tChuva = null;
  function alvoChuva() { return mudo ? 0 : Math.min(1, (CONFIG.volume || 0.5) * 2 * vol.efeitos * CHUVA_VOL * nivelChuva); }
  function atualizarChuva() { // aproxima o volume aos poucos (sem estalo)
    if (!chuvaEl) return;
    clearInterval(tChuva);
    tChuva = setInterval(() => {
      const alvo = alvoChuva(); volChuvaAtual += (alvo - volChuvaAtual) * 0.25;
      if (Math.abs(alvo - volChuvaAtual) < 0.004) { volChuvaAtual = alvo; clearInterval(tChuva); }
      chuvaEl.volume = Math.max(0, Math.min(1, volChuvaAtual));
    }, 50);
  }
  function ligarChuva() {
    chuvaEl = new Audio(CHUVA_ARQ); chuvaEl.loop = true; chuvaEl.volume = 0; volChuvaAtual = 0;
    // emenda o loop um pouco antes do fim pra não ficar o "buraco" do mp3
    chuvaEl.addEventListener("timeupdate", () => { if (chuvaEl.duration && chuvaEl.currentTime > chuvaEl.duration - 0.25) chuvaEl.currentTime = 0.05; });
    const p = chuvaEl.play(); if (p && p.catch) p.catch(() => {});
    atualizarChuva();
  }

  function ligarAmbiente() {
    ligarChuva();
    // zumbido grave de fundo (fica no canal de música)
    const g = { gain: { setTargetAtTime() {} } };
    const o = ctx.createOscillator(), go = ctx.createGain(); o.type = "sine"; o.frequency.value = 55; go.gain.value = 0.035;
    const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.08; lg.gain.value = 6;
    lfo.connect(lg).connect(o.frequency); lfo.start();
    o.connect(go).connect(busMusica); o.start();
    ambiente = { chuva: g, drone: go };
  }

  const SONS = {
    clac: () => { chiado(0.06, 0.6, "highpass", 2000); tom(180, "square", 0.05, 0.15); },
    apagao: () => { tom(120, "sawtooth", 0.6, 0.12, 0, 40); },
    baque: () => { tom(70, "sine", 0.5, 0.9, 0, 35); chiado(0.25, 0.5, "lowpass", 300); },
    passos: () => { for (let i = 0; i < 4; i++) { chiado(0.07, 0.25, "lowpass", 500, i * 0.32); tom(90, "sine", 0.08, 0.15, i * 0.32); } },
    porta: () => { tom(300, "sawtooth", 0.5, 0.04, 0, 180); chiado(0.12, 0.2, "lowpass", 600, 0.45); },
    rangido: () => { tom(420, "sawtooth", 1.1, 0.05, 0, 260); tom(440, "triangle", 1.1, 0.03, 0.05, 300); },
    tlim: () => { [0, 0.18, 0.5, 0.68].forEach((q) => { tom(2600, "triangle", 0.12, 0.12, q); tom(3400, "sine", 0.1, 0.06, q + 0.02); }); },
    flash: () => { tom(2000, "sine", 0.08, 0.15, 0, 4000); chiado(0.08, 0.3, "highpass", 3000); },
    sting: () => { [110, 116.5, 164.8].forEach((fq) => tom(fq, "sawtooth", 2.2, 0.08)); tom(55, "sine", 2.4, 0.4); },
    sting2: () => { tom(880, "triangle", 0.15, 0.2); tom(1320, "triangle", 0.5, 0.2, 0.15); tom(110, "sawtooth", 1.4, 0.1, 0.15); },
    pista: () => { tom(660, "triangle", 0.12, 0.18); tom(990, "triangle", 0.25, 0.18, 0.1); },
    notificacao: () => { tom(1046, "sine", 0.1, 0.2); tom(1318, "sine", 0.18, 0.2, 0.12); },
    crash: () => { chiado(0.6, 0.7, "highpass", 1500); tom(400, "square", 0.2, 0.1, 0.02, 120); chiado(0.3, 0.4, "bandpass", 3000, 0.15, 3); },
    gaveta: () => { chiado(0.3, 0.3, "bandpass", 900, 0, 2); },
    clique: () => { tom(1500, "square", 0.03, 0.08); },
    susto: () => { tom(220, "sawtooth", 0.5, 0.25, 0, 110); chiado(0.3, 0.4, "highpass", 1200); },
    texto: () => { tom(520 + Math.random() * 60, "square", 0.02, 0.025); },
    escolha: () => { tom(700, "triangle", 0.06, 0.12); },
    trovao: () => { chiado(1.8, 0.35, "lowpass", 220); }
  };

  const cacheArq = {};
  function tocar(nome) {
    if (mudo || !ctx) return;
    if (ARQUIVOS[nome]) {
      const a = cacheArq[nome] || (cacheArq[nome] = new Audio(ARQUIVOS[nome]));
      const canal = MUSICA.includes(nome) ? vol.musica : vol.efeitos;
      try { a.currentTime = 0; a.volume = (CONFIG.volume || 0.5) * canal; a.play(); } catch (e) {}
      return;
    }
    try { SONS[nome] && SONS[nome](); } catch (e) {}
  }

  // =================================================================== MÚSICA NOIR
  // Trilha procedural: baixo acústico caminhando, acordes de piano elétrico,
  // escovinha na bateria e um vibrafone de vez em quando. Lá menor, ~70 bpm.
  // Para usar uma música em arquivo, coloque ARQUIVOS.musica = "sons/musica.mp3".
  let musica = null;
  const nota = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const PROG = [ // [baixo (MIDI), acorde (MIDI)]
    { b: [45, 48, 52, 55], c: [57, 60, 64, 67, 71] },      // Am9
    { b: [50, 53, 57, 55], c: [53, 57, 60, 64, 65] },      // Dm9
    { b: [41, 45, 48, 47], c: [53, 57, 60, 64] },          // Fmaj7
    { b: [40, 44, 47, 46], c: [52, 56, 59, 62, 65] }       // E7(b9)
  ];
  const ESCALA = [69, 72, 74, 76, 79, 81, 84, 75];          // pentatônica de lá menor + blue note
  function iniciarMusica() {
    if (ARQUIVOS.musica) {
      const a = cacheArq.musica || (cacheArq.musica = new Audio(ARQUIVOS.musica));
      a.loop = true; a.volume = (CONFIG.volume || 0.5) * vol.musica; try { a.play(); } catch (e) {}
      return;
    }
    const g = ctx.createGain(); g.gain.value = 0.9; g.connect(busMusica);
    // reverb simples (eco curto filtrado) pra dar clima de clube enfumaçado
    const dl = ctx.createDelay(); dl.delayTime.value = 0.23;
    const fb = ctx.createGain(); fb.gain.value = 0.28;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1800;
    const wet = ctx.createGain(); wet.gain.value = 0.35;
    dl.connect(lp).connect(fb).connect(dl); lp.connect(wet).connect(g);
    musica = { g, eco: dl, prox: ctx.currentTime + 0.3, passo: 0, compasso: 0 };
    setInterval(agendar, 120);
  }
  function voz(freq, tipo, t, dur, volume, destino, opt) {
    const o = ctx.createOscillator(), e = ctx.createGain();
    o.type = tipo; o.frequency.setValueAtTime(freq, t);
    if (opt && opt.detune) o.detune.value = opt.detune;
    const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = (opt && opt.corte) || 2000;
    e.gain.setValueAtTime(0.0001, t);
    e.gain.exponentialRampToValueAtTime(volume, t + ((opt && opt.ataque) || 0.01));
    e.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(f).connect(e); e.connect(destino);
    if (opt && opt.eco) e.connect(musica.eco);
    if (opt && opt.trem) { // tremolo do vibrafone
      const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 5.5; lg.gain.value = volume * 0.4;
      l.connect(lg).connect(e.gain); l.start(t); l.stop(t + dur);
    }
    o.start(t); o.stop(t + dur + 0.05);
  }
  // CLIMA: "normal" = noir de clube; "tenso" = pulsação grave, acordes dissonantes, tique-taque
  let clima = "normal";
  function setClima(c) {
    if (c === clima) return;
    clima = c;
    if (ctx && musica) musica.g.gain.setTargetAtTime(c === "tenso" ? 0.8 : 0.9, ctx.currentTime, 0.8);
  }
  function batidaTensa(t, p, seminima, g) {
    // coração: tum-tum grave nos tempos 1 e 3
    if (p === 0 || p === 2) {
      voz(55, "sine", t, 0.35, 0.42, g, { corte: 200, ataque: 0.008 });
      voz(52, "sine", t + 0.2, 0.3, 0.26, g, { corte: 200, ataque: 0.008 });
    }
    // tique-taque de relógio em todo tempo
    const sb = ctx.createBufferSource(); sb.buffer = ruidoCurto || (ruidoCurto = ruido(0.4));
    const sf = ctx.createBiquadFilter(); sf.type = "highpass"; sf.frequency.value = p % 2 ? 6000 : 4200;
    const se = ctx.createGain(); se.gain.setValueAtTime(0.0001, t); se.gain.exponentialRampToValueAtTime(0.03, t + 0.004); se.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    sb.connect(sf).connect(se).connect(g); sb.start(t); sb.stop(t + 0.08);
    // acorde dissonante sustentado a cada 2 compassos (lá, si bemol, mi bemol)
    if (p === 0 && musica.compasso % 2 === 0) {
      [45, 57, 58, 63].forEach((m, i) => voz(nota(m), i ? "triangle" : "sine", t + i * 0.05, seminima * 7.5, i ? 0.03 : 0.05, g, { ataque: 1.6, corte: 900, eco: true }));
    }
    // "plim" agudo e estranho de vez em quando
    if (Math.random() < 0.12) {
      const m = [81, 82, 87, 88][Math.floor(Math.random() * 4)];
      voz(nota(m), "sine", t + seminima * 0.5, seminima * 3, 0.03, g, { ataque: 0.004, trem: true, eco: true, corte: 4000 });
    }
  }
  function agendar() {
    if (!ctx || !musica || mudo) return;
    while (musica.prox < ctx.currentTime + 0.5) {
      const seminima = clima === "tenso" ? 60 / 58 : 60 / 70;
      if (clima === "tenso") {
        batidaTensa(musica.prox, musica.passo, seminima, musica.g);
        musica.passo = (musica.passo + 1) % 4;
        if (musica.passo === 0) musica.compasso++;
        musica.prox += seminima;
        continue;
      }
      const t = musica.prox, p = musica.passo, C = PROG[musica.compasso % PROG.length], g = musica.g;
      // baixo caminhando (com um leve "swing" e ataque de dedo)
      voz(nota(C.b[p] - 12), "triangle", t, seminima * 0.95, 0.32, g, { corte: 600, ataque: 0.015 });
      voz(nota(C.b[p]), "sine", t, seminima * 0.5, 0.08, g, { corte: 900 });
      // escovinha: chiado suave em todo tempo, mais forte no 2 e no 4
      const sb = ctx.createBufferSource(); sb.buffer = ruidoCurto || (ruidoCurto = ruido(0.4));
      const sf = ctx.createBiquadFilter(); sf.type = "bandpass"; sf.frequency.value = 5000; sf.Q.value = 0.7;
      const se = ctx.createGain(); const forte = p % 2 === 1;
      se.gain.setValueAtTime(0.0001, t); se.gain.exponentialRampToValueAtTime(forte ? 0.05 : 0.018, t + 0.02);
      se.gain.exponentialRampToValueAtTime(0.0001, t + (forte ? 0.28 : 0.12));
      sb.connect(sf).connect(se).connect(g); sb.start(t); sb.stop(t + 0.35);
      // piano elétrico: acorde no 1º tempo (e às vezes uma antecipação no "e" do 3)
      if (p === 0 || (p === 2 && Math.random() < 0.35)) {
        const tt = p === 0 ? t : t + seminima * 0.66;
        C.c.forEach((m, i) => {
          voz(nota(m), "sine", tt + i * 0.012, seminima * (p === 0 ? 3.6 : 1.4), 0.045, g, { ataque: 0.02, eco: true });
          voz(nota(m) * 2, "triangle", tt + i * 0.012, seminima * 1.2, 0.008, g, { corte: 2500 });
        });
      }
      // vibrafone: frases curtas e esparsas, só em alguns compassos
      if (musica.compasso % 4 >= 2 && Math.random() < 0.38) {
        const m = ESCALA[Math.floor(Math.random() * ESCALA.length)];
        const tt = t + (Math.random() < 0.5 ? 0 : seminima * 0.5);
        voz(nota(m), "sine", tt, seminima * 2.2, 0.05, g, { ataque: 0.005, trem: true, eco: true, corte: 3000 });
      }
      musica.passo = (p + 1) % 4;
      if (musica.passo === 0) musica.compasso++;
      musica.prox += seminima;
    }
  }
  let ruidoCurto = null;

  function ambienteNivel(n) { // 0 = silêncio total (tensão), 1 = normal
    if (!ambiente) return;
    const t = ctx.currentTime;
    // (a música agora muda de clima em vez de sumir — ver setClima)
    nivelChuva = n >= 1 ? 1 : Math.max(0.35, n); // no escuro a chuva fica mais baixa, mas não some
    atualizarChuva();
    ambiente.drone.gain.setTargetAtTime(0.035 * (n === 0 ? 0.3 : n), t, 0.8);
  }

  function alternarMudo() { mudo = !mudo; if (master) master.gain.value = mudo ? 0 : (CONFIG.volume || 0.5); atualizarChuva(); return mudo; }

  // painel de som: muda o volume de um canal ("musica" ou "efeitos")
  function setVolume(tipo, v) {
    vol[tipo] = Math.max(0, Math.min(1, v));
    if (tipo === "efeitos") atualizarChuva();
    if (ctx) (tipo === "musica" ? busMusica : busEfeitos).gain.setTargetAtTime(vol[tipo], ctx.currentTime, 0.05);
    for (const k in cacheArq) if ((MUSICA.includes(k) ? "musica" : "efeitos") === tipo) cacheArq[k].volume = (CONFIG.volume || 0.5) * vol[tipo];
    try { localStorage.setItem("suspeitos_volume", JSON.stringify(vol)); } catch (e) {}
  }
  const getVolume = (tipo) => vol[tipo];
  const estaMudo = () => mudo;

  window.Som = { iniciar, tocar, ambienteNivel, alternarMudo, setVolume, getVolume, estaMudo, setClima };
})();
