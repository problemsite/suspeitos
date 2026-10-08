/* =====================================================================
   PLACEHOLDERS — desenhos provisórios em SVG.
   Tudo aqui some quando vocês colocarem os PNGs (ver personagens.js,
   cenarios.js e pistas.js). Não precisa mexer neste arquivo.
   ===================================================================== */
(function () {
  const PH = {};

  // ---------------------------------------------------------------- utilidades
  const esc = (c, f) => { // escurece/clareia cor hex
    const n = parseInt(c.slice(1), 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    r = Math.max(0, Math.min(255, Math.round(r * f))); g = Math.max(0, Math.min(255, Math.round(g * f))); b = Math.max(0, Math.min(255, Math.round(b * f)));
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };
  PH.esc = esc;

  // ================================================================ CENÁRIOS
  const chuva = (x, y, w, h) => {
    let s = `<g clip-path="url(#cj${x})"><clipPath id="cj${x}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath>`;
    s += `<g class="ph-chuva">`;
    for (let i = 0; i < 26; i++) {
      const px = x + ((i * 37) % w), py = y + ((i * 53) % h);
      s += `<line x1="${px}" y1="${py}" x2="${px - 8}" y2="${py + 34}" stroke="#9fc4ff" stroke-opacity=".35" stroke-width="2"/>`;
      s += `<line x1="${px}" y1="${py - h}" x2="${px - 8}" y2="${py - h + 34}" stroke="#9fc4ff" stroke-opacity=".35" stroke-width="2"/>`;
    }
    return s + `</g></g>`;
  };
  const porta = (x, aberta) => `
    <rect x="${x}" y="262" width="168" height="480" fill="#0b0a12"/>
    <rect x="${x + 8}" y="270" width="152" height="472" fill="url(#corredor)"/>
    <rect x="${x - 10}" y="252" width="188" height="16" fill="#2a2140"/>
    <rect x="${x - 10}" y="252" width="14" height="490" fill="#2a2140"/><rect x="${x + 164}" y="252" width="14" height="490" fill="#2a2140"/>
    ${aberta ? `<polygon points="${x + 160},270 ${x + 200},258 ${x + 200},752 ${x + 160},742" fill="#3a2a22"/>` : ""}`;
  const defsComuns = `
    <linearGradient id="corredor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#141226"/><stop offset="1" stop-color="#07060c"/></linearGradient>
    <linearGradient id="vidro" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1b2b52"/><stop offset="1" stop-color="#0c1430"/></linearGradient>
    <radialGradient id="abajur" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffcf7a" stop-opacity=".55"/><stop offset="1" stop-color="#ffcf7a" stop-opacity="0"/></radialGradient>`;

  PH.fundos = {
    sala: () => `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>${defsComuns}
        <linearGradient id="paredeS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c2445"/><stop offset="1" stop-color="#3d3058"/></linearGradient>
        <linearGradient id="chaoS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2a26"/><stop offset="1" stop-color="#1c1412"/></linearGradient>
      </defs>
      <rect width="1600" height="742" fill="url(#paredeS)"/>
      <g opacity=".12">${Array.from({ length: 20 }, (_, i) => `<rect x="${i * 80}" y="0" width="2" height="742" fill="#fff"/>`).join("")}</g>
      <rect y="742" width="1600" height="158" fill="url(#chaoS)"/>
      ${Array.from({ length: 9 }, (_, i) => `<line x1="0" y1="${760 + i * 18}" x2="1600" y2="${760 + i * 18}" stroke="#000" stroke-opacity=".18"/>`).join("")}
      <rect y="730" width="1600" height="14" fill="#1d1630"/>
      ${porta(30, true)} ${porta(1402, true)}
      <!-- janela -->
      <rect x="628" y="104" width="344" height="296" fill="#1a1428"/>
      <rect x="640" y="116" width="320" height="272" fill="url(#vidro)"/>
      ${chuva(640, 116, 320, 272)}
      <rect class="ph-raio" x="640" y="116" width="320" height="272" fill="#cfe0ff" opacity="0"/>
      <rect x="796" y="116" width="8" height="272" fill="#1a1428"/><rect x="640" y="248" width="320" height="8" fill="#1a1428"/>
      <path d="M600 92 h80 v330 q-40 -40 -80 0z" fill="#5a1f3c"/><path d="M1000 92 h-80 v330 q40 -40 80 0z" fill="#5a1f3c"/>
      <rect x="590" y="84" width="420" height="12" rx="6" fill="#1a1428"/>
      <!-- fotos na parede -->
      <g transform="translate(384,146)">
        <rect width="70" height="54" fill="#d8d2c4"/><rect x="5" y="5" width="60" height="44" fill="#6a5a8a"/>
        <rect x="86" y="30" width="62" height="78" fill="#d8d2c4"/><rect x="91" y="35" width="52" height="68" fill="#4a6a8a"/>
        <rect x="10" y="70" width="64" height="86" fill="#d8d2c4"/><rect x="15" y="75" width="54" height="76" fill="#8a5a5a"/>
      </g>
      <!-- estante -->
      <rect x="1180" y="180" width="170" height="380" fill="#241a33"/>
      ${[0, 1, 2, 3].map((i) => `<rect x="1180" y="${250 + i * 90}" width="170" height="10" fill="#3a2b4f"/>`).join("")}
      ${[0, 1, 2, 3].map((i) => [0, 1, 2, 3, 4].map((j) => `<rect x="${1192 + j * 30}" y="${200 + i * 90}" width="${16 + (j % 2) * 6}" height="${44 - (j % 3) * 6}" y2="0" fill="${["#7a3b5a", "#3b5a7a", "#5a7a3b", "#7a6a3b", "#4b3b7a"][(i + j) % 5]}"/>`).join("")).join("")}
      <!-- abajur -->
      <circle cx="210" cy="420" r="210" fill="url(#abajur)"/>
      <rect x="205" y="380" width="10" height="362" fill="#222"/><path d="M160 330 h100 l20 60 h-140z" fill="#e8c27a"/>
      <!-- sofá -->
      <rect x="520" y="520" width="580" height="90" rx="30" fill="#4b2f5e"/>
      <rect x="500" y="580" width="620" height="130" rx="26" fill="#5b3a70"/>
      <rect x="470" y="560" width="70" height="170" rx="26" fill="#4b2f5e"/><rect x="1080" y="560" width="70" height="170" rx="26" fill="#4b2f5e"/>
      <rect x="560" y="600" width="250" height="40" rx="14" fill="#6a4580"/><rect x="820" y="600" width="250" height="40" rx="14" fill="#6a4580"/>
      <!-- tapete e mesinha -->
      <ellipse cx="800" cy="822" rx="560" ry="56" fill="#2b1e3d" opacity=".9"/>
      <rect x="190" y="740" width="260" height="22" rx="6" fill="#3b2a1f"/><rect x="205" y="760" width="12" height="80" fill="#2a1d15"/><rect x="423" y="760" width="12" height="80" fill="#2a1d15"/>
    </svg>`,

    estudio: () => `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>${defsComuns}
        <linearGradient id="paredeE" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14263a"/><stop offset="1" stop-color="#1d3550"/></linearGradient>
        <linearGradient id="chaoE" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#22262e"/><stop offset="1" stop-color="#0f1116"/></linearGradient>
        <radialGradient id="ring" cx=".5" cy=".5" r=".5"><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#e8f6ff" stop-opacity=".9"/><stop offset=".72" stop-color="#e8f6ff" stop-opacity="0"/></radialGradient>
      </defs>
      <rect width="1600" height="742" fill="url(#paredeE)"/>
      <!-- espuma acústica -->
      ${Array.from({ length: 6 }, (_, i) => Array.from({ length: 4 }, (_, j) => `<rect x="${240 + i * 54}" y="${110 + j * 54}" width="48" height="48" fill="${(i + j) % 2 ? "#1a2e46" : "#22395a"}"/>`).join("")).join("")}
      ${Array.from({ length: 5 }, (_, i) => Array.from({ length: 4 }, (_, j) => `<rect x="${1060 + i * 54}" y="${60 + j * 40}" width="48" height="34" fill="${(i + j) % 2 ? "#1a2e46" : "#22395a"}" opacity=".7"/>`).join("")).join("")}
      <rect y="742" width="1600" height="158" fill="url(#chaoE)"/>
      <rect y="730" width="1600" height="14" fill="#0e1a28"/>
      ${porta(30, true)}
      <!-- janela com persiana -->
      <rect x="692" y="96" width="280" height="296" fill="#0e1824"/>
      <rect x="704" y="108" width="256" height="272" fill="url(#vidro)"/>
      ${chuva(704, 108, 256, 272)}
      <rect class="ph-raio" x="704" y="108" width="256" height="272" fill="#cfe0ff" opacity="0"/>
      ${Array.from({ length: 9 }, (_, i) => `<rect x="704" y="${110 + i * 16}" width="256" height="9" fill="#9aa8b8" opacity=".55"/>`).join("")}
      <!-- prateleira de placas -->
      <rect x="380" y="400" width="190" height="10" fill="#0e1a28"/>
      <rect x="400" y="330" width="56" height="70" rx="4" fill="#c9ced6"/><polygon points="420,350 420,380 444,365" fill="#e33"/>
      <rect x="470" y="345" width="0" height="0"/>
      <rect x="480" y="345" width="40" height="55" rx="3" fill="none" stroke="#c9ced6" stroke-dasharray="6 4" stroke-width="2" opacity=".6"/>
      <!-- ring light -->
      <circle cx="610" cy="300" r="70" fill="url(#ring)"/><rect x="606" y="370" width="8" height="372" fill="#111"/>
      <!-- mesa -->
      <rect x="1080" y="496" width="430" height="20" rx="4" fill="#2b2f3a"/>
      <rect x="1100" y="516" width="16" height="226" fill="#1d2029"/><rect x="1480" y="516" width="16" height="226" fill="#1d2029"/>
      <rect x="1210" y="516" width="160" height="60" fill="#242833"/>
      <!-- monitor -->
      <rect x="1190" y="226" width="270" height="200" rx="10" fill="#0a0c10"/>
      <rect x="1202" y="238" width="246" height="176" fill="#16324a" class="ph-monitor"/>
      <rect x="1310" y="426" width="30" height="70" fill="#0a0c10"/><rect x="1270" y="486" width="110" height="12" rx="4" fill="#0a0c10"/>
      <!-- cadeira tombada -->
      <g transform="translate(980,640) rotate(-70)"><rect width="90" height="20" rx="6" fill="#242833"/><rect x="0" y="-90" width="20" height="90" rx="6" fill="#242833"/></g>
    </svg>`,

    cozinha: () => `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>${defsComuns}
        <linearGradient id="paredeC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a3330"/><stop offset="1" stop-color="#36423d"/></linearGradient>
        <pattern id="azulejo" width="44" height="44" patternUnits="userSpaceOnUse"><rect width="44" height="44" fill="#3d4a45"/><rect width="42" height="42" fill="#46554f"/></pattern>
        <pattern id="piso" width="90" height="90" patternUnits="userSpaceOnUse"><rect width="90" height="90" fill="#2a2420"/><rect width="45" height="45" fill="#332b26"/><rect x="45" y="45" width="45" height="45" fill="#332b26"/></pattern>
      </defs>
      <rect width="1600" height="742" fill="url(#paredeC)"/>
      <rect x="600" y="380" width="560" height="120" fill="url(#azulejo)"/>
      <rect y="742" width="1600" height="158" fill="url(#piso)"/>
      <rect y="730" width="1600" height="14" fill="#1d2420"/>
      ${porta(1402, true)}
      <!-- freezer -->
      <rect x="226" y="268" width="172" height="474" rx="10" fill="#c8ced2"/>
      <rect x="236" y="278" width="152" height="150" rx="6" fill="#d8dee2"/><rect x="236" y="436" width="152" height="296" rx="6" fill="#d8dee2"/>
      <rect x="366" y="300" width="10" height="90" rx="5" fill="#8a9298"/><rect x="366" y="460" width="10" height="120" rx="5" fill="#8a9298"/>
      <!-- despensa -->
      <rect x="430" y="248" width="170" height="494" fill="#1a1512"/>
      <rect x="440" y="258" width="150" height="484" fill="#4a3424"/>
      <rect x="452" y="272" width="126" height="190" fill="#3e2b1e"/><rect x="452" y="476" width="126" height="250" fill="#3e2b1e"/>
      <circle cx="574" cy="500" r="7" fill="#c9a24a"/>
      <!-- armários altos -->
      <rect x="610" y="120" width="540" height="150" fill="#3a2f28"/>
      ${[0, 1, 2, 3].map((i) => `<rect x="${618 + i * 133}" y="128" width="125" height="134" fill="#4a3c32"/><rect x="${730 + i * 133}" y="186" width="5" height="20" fill="#c9a24a"/>`).join("")}
      <!-- janela da pia -->
      <rect x="780" y="290" width="200" height="0"/>
      <!-- bancada -->
      <rect x="600" y="490" width="560" height="22" fill="#cfc6b8"/>
      <rect x="610" y="512" width="540" height="230" fill="#5a4a3e"/>
      ${[0, 1, 2, 3].map((i) => `<rect x="${620 + i * 133}" y="524" width="125" height="206" fill="#64544a"/><rect x="${676 + i * 133}" y="540" width="16" height="5" fill="#c9a24a"/>`).join("")}
      <rect x="880" y="470" width="110" height="20" rx="4" fill="#9aa4aa"/><path d="M930 470 v-50 q0 -14 14 -14 h20" stroke="#9aa4aa" stroke-width="8" fill="none"/>
      <!-- porta dos fundos -->
      <rect x="1146" y="210" width="160" height="532" fill="#16120f"/>
      <rect x="1156" y="220" width="140" height="522" fill="#3a2a1e"/>
      <rect x="1170" y="236" width="112" height="120" fill="url(#vidro)"/>${chuva(1170, 236, 112, 120)}
      <circle cx="1280" cy="500" r="8" fill="#c9a24a"/><rect x="1276" y="510" width="8" height="14" fill="#888"/>
      <!-- luminária -->
      <rect x="896" y="0" width="6" height="70" fill="#111"/><path d="M860 70 h80 l20 40 h-120z" fill="#7a6a4a"/>
      <circle cx="900" cy="160" r="220" fill="url(#abajur)" opacity=".7"/>
      <!-- prateleira (onde o vulto bate) -->
      <rect x="1000" y="300" width="130" height="10" fill="#2a2420"/>
      <circle cx="1030" cy="285" r="15" fill="#b0603a"/><rect x="1060" y="270" width="24" height="30" fill="#c0c0c0"/><rect x="1095" y="262" width="20" height="38" fill="#6a8a5a"/>
    </svg>`
  };

  // ================================================================ CORPOS
  // viewBox 0 0 200 350 — o rosto (PNG ou placeholder) fica em cima, fora do SVG.
  // Grupos fixos (usados nas animações do CSS): bE, bD (braços), pe, pd (pernas), tronco.
  let _uid = 0;
  PH.corpo = (cor, pose, roupa, pele, estilo) => {
    const u = "cp" + (++_uid);
    const M = roupa || window.MOLETOM || "#3b2f63";
    pele = pele || "#e9b994";
    const farda = estilo === "farda";
    const Mo = esc(M, 0.55), Ms = esc(M, 0.86), Mc = esc(M, 0.72), Ml = esc(M, 1.35);
    const Pk = esc(pele, 0.72), Pl = esc(pele, 1.08);
    const tenis = "#ecebf2", sola = "#b4b3c2";
    const R = (n) => Math.round(n * 10) / 10;

    // ---- mão: palma + polegar + dedinhos (ang = direção do antebraço)
    const mao = (x, y, ang, lado) => `<g transform="translate(${R(x)} ${R(y)}) rotate(${R(ang)})">
      <ellipse cx="${-8 * lado}" cy="-3" rx="4.6" ry="8.5" fill="${pele}" stroke="${Pk}" stroke-width="1.6" transform="rotate(${22 * lado} ${-8 * lado} -3)"/>
      <ellipse cx="0" cy="0" rx="11" ry="13" fill="${pele}" stroke="${Pk}" stroke-width="1.8"/>
      <ellipse cx="${2 * lado}" cy="-4" rx="5" ry="6" fill="${Pl}" opacity=".45"/>
      <path d="M-5 5.5v5.5M0 7v5.5M5 5.5v5" stroke="${Pk}" stroke-width="1.3" stroke-linecap="round" opacity=".7"/></g>`;
    // ---- braço: ombro S, cotovelo E, pulso W. Manga afinando, punho canelado, mão.
    const seg = (a, b, w, c, op) => `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"${op ? ` opacity="${op}"` : ""}/>`;
    const braco = (S, E, W, o = {}) => {
      const lado = o.lado || 1;
      const dx = W[0] - E[0], dy = W[1] - E[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
      const n = (a, b) => { const x = b[0] - a[0], y = b[1] - a[1], l = Math.hypot(x, y) || 1; let nx = -y / l, ny = x / l; if (nx > 0 || (nx === 0 && ny > 0)) { nx = -nx; ny = -ny; } return [nx, ny]; };
      const n1 = n(S, E), n2 = n(E, W);
      const off = (p, nn, k) => [R(p[0] + nn[0] * k), R(p[1] + nn[1] * k)];
      const C0 = [R(W[0] - ux * 11), R(W[1] - uy * 11)];
      let s = `<polyline points="${S} ${E} ${W}" fill="none" stroke="${Mo}" stroke-width="31" stroke-linecap="round" stroke-linejoin="round"/>`;
      s += seg(S, E, 27, Ms) + seg(E, C0, 24, Ms);
      // luz (lado esquerdo/alto) e sombra
      s += seg(off(S, n1, 8), off(E, n1, 7), 6, Ml, ".28") + seg(off(E, n2, 6), off(C0, n2, 6), 5, Ml, ".22");
      s += seg(off(S, n1, -9), off(E, n1, -8), 6, "#000", ".14") + seg(off(E, n2, -7), off(C0, n2, -7), 5, "#000", ".14");
      // dobra do cotovelo
      s += `<path d="M${off(E, n2, -9)} Q${R(E[0] + ux * 4)} ${R(E[1] + uy * 4)} ${off(E, n2, 8)}" stroke="${Mo}" stroke-width="1.8" fill="none" opacity=".55"/>`;
      // punho canelado
      s += seg(C0, W, 22, Mc);
      s += `<line x1="${off(C0, n2, -11)[0]}" y1="${off(C0, n2, -11)[1]}" x2="${off(C0, n2, 11)[0]}" y2="${off(C0, n2, 11)[1]}" stroke="${Mo}" stroke-width="1.6" opacity=".7"/>`;
      if (o.mao !== false) {
        const H = o.maoEm || [W[0] + ux * 13, W[1] + uy * 13];
        s += mao(H[0], H[1], Math.atan2(uy, ux) * 180 / Math.PI - 90, lado);
      }
      return s;
    };

    // ---- poses (braço esquerdo da tela = bE, direito = bD)
    const OE = [50, 40], OD = [150, 40];
    // pose relaxada: os dois braços soltos ao lado do corpo, iguais (espelhados)
    let bE = braco(OE, [31, 104], [32, 158], { lado: -1 });
    let bD = braco(OD, [169, 104], [168, 158], { lado: 1 });
    let frente = "", atras = "", classeD = "", ordem = "padrao";
    switch (pose) {
      case "cruzados": // antebraço direito por baixo, mão escondida; o esquerdo por cima com a mão no bíceps
        bD = braco(OD, [168, 126], [52, 120], { lado: 1, mao: false });
        bE = braco(OE, [34, 114], [126, 96], { lado: -1, maoEm: [144, 88] });
        ordem = "cruzados";
        break;
      case "cintura":
        bE = braco(OE, [10, 104], [36, 150], { lado: -1, maoEm: [48, 162] });
        bD = braco(OD, [190, 104], [164, 150], { lado: 1, maoEm: [152, 162] });
        ordem = "frente";
        break;
      case "cabeca":
        bD = braco(OD, [194, -4], [158, -54], { lado: 1 });
        break;
      case "coca": // coçando a cabeça
        bD = braco(OD, [200, 2], [166, -50], { lado: 1 }); classeD = "coca";
        break;
      case "alto": // espreguiçando
        bE = braco(OE, [20, -26], [36, -84], { lado: -1 }); bD = braco(OD, [180, -26], [164, -84], { lado: 1 });
        break;
      case "apontar":
        bD = braco(OD, [206, 52], [254, 44], { lado: 1 });
        break;
      case "celular": { // vemos a TRAS do celular (capinha, câmera); dedos por cima
        bD = braco(OD, [170, 116], [128, 98], { lado: 1, mao: false });
        const px = 96, py = 44, pw = 32, ph = 56;
        frente = `<rect x="${px - 2}" y="${py - 2}" width="${pw + 4}" height="${ph + 4}" rx="9" fill="#8fd8ff" opacity=".18"/>
          <rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="7" fill="#22222b" stroke="#0b0b10" stroke-width="2"/>
          <rect x="${px + 2}" y="${py + 2}" width="${pw - 4}" height="${ph - 4}" rx="5.5" fill="none" stroke="#3a3a46" stroke-width="1.4"/>
          <rect x="${px + 4}" y="${py + 4}" width="13" height="14" rx="3.5" fill="#33333f" stroke="#111" stroke-width="1"/>
          <circle cx="${px + 8}" cy="${py + 8.5}" r="2.6" fill="#0c0c12" stroke="#555" stroke-width=".8"/>
          <circle cx="${px + 8}" cy="${py + 14}" r="2.6" fill="#0c0c12" stroke="#555" stroke-width=".8"/>
          <circle cx="${px + 13.5}" cy="${py + 11}" r="1.3" fill="#f3e9b5"/>
          <circle cx="${px + pw / 2}" cy="${py + 30}" r="3.6" fill="none" stroke="#4a4a58" stroke-width="1.4"/>
          <line x1="${px + pw}" y1="${py + 14}" x2="${px + pw}" y2="${py + 24}" stroke="#5a5a68" stroke-width="2"/>
          <g fill="${pele}" stroke="${Pk}" stroke-width="1.5">
            <rect x="${px + 3}" y="${py + 34}" width="9" height="17" rx="4.5" transform="rotate(-10 ${px + 7} ${py + 42})"/>
            <rect x="${px + 11}" y="${py + 31}" width="9" height="20" rx="4.5"/>
            <rect x="${px + 19}" y="${py + 33}" width="9" height="18" rx="4.5" transform="rotate(8 ${px + 23} ${py + 42})"/>
            <ellipse cx="${px + 20}" cy="${py + ph + 2}" rx="15" ry="11"/>
          </g>
          <path d="M${px + 9} ${py + ph - 4} q11 4 22 -1" stroke="${Pk}" stroke-width="1.2" fill="none" opacity=".6"/>`;
        break;
      }
      case "escondendo":
        bE = braco(OE, [36, 108], [82, 132], { lado: -1, maoEm: [92, 136] });
        bD = braco(OD, [164, 108], [118, 132], { lado: 1, maoEm: [108, 136] });
        ordem = "frente";
        break;
      case "pote":
        bE = braco(OE, [34, 112], [62, 96], { lado: -1, maoEm: [70, 88] });
        bD = braco(OD, [166, 112], [138, 96], { lado: 1, maoEm: [130, 88] });
        frente = `<rect x="68" y="58" width="64" height="50" rx="8" fill="#6b3b1f"/><rect x="72" y="62" width="10" height="40" rx="4" fill="#ffffff" opacity=".12"/><rect x="64" y="52" width="72" height="12" rx="5" fill="#f2d7b0"/><text x="100" y="92" font-size="14" text-anchor="middle" fill="#f2d7b0" font-family="sans-serif" font-weight="900">CHOC</text>`;
        ordem = "pote";
        break;
      case "escrevendo": { // prancheta virada pra ELA: vemos o verso; caneta atrás da borda de cima
        bD = braco(OD, [168, 108], [124, 74], { lado: 1, maoEm: [114, 66] }) +
          `<line x1="110" y1="66" x2="122" y2="40" stroke="#1b1b22" stroke-width="4.5" stroke-linecap="round"/><line x1="121" y1="42" x2="123.5" y2="37" stroke="#d33" stroke-width="4.5" stroke-linecap="round"/>`;
        classeD = "escreve";
        frente = `<g transform="rotate(-9 92 100)">
            <rect x="60" y="66" width="64" height="5" fill="#f4f1e6" stroke="#cfc8b4" stroke-width=".8"/>
            <rect x="58" y="69" width="68" height="80" rx="4" fill="#7a5a36" stroke="#4e3920" stroke-width="2"/>
            <rect x="62" y="73" width="60" height="72" rx="3" fill="none" stroke="#8d6c45" stroke-width="1.5"/>
            <path d="M66 90 h52 M66 108 h52 M66 126 h52" stroke="#6a4c2c" stroke-width="1" opacity=".5"/>
            <rect x="80" y="63" width="24" height="10" rx="3" fill="#c9ccd4" stroke="#7d818c" stroke-width="1.5"/>
            <rect x="86" y="66" width="12" height="3" rx="1.5" fill="#7d818c"/>
          </g>`;
        bE = braco(OE, [34, 112], [62, 140], { lado: -1, maoEm: [70, 142] });
        ordem = "escrevendo";
        break;
      }
    }

    // ---- defs (ids únicos: SVGs inline dividem o mesmo espaço de ids)
    const defs = `<defs>
      <linearGradient id="${u}t" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${esc(M, 0.62)}"/><stop offset=".22" stop-color="${esc(M, 1.04)}"/><stop offset=".45" stop-color="${esc(M, 1.1)}"/><stop offset=".78" stop-color="${M}"/><stop offset="1" stop-color="${esc(M, 0.6)}"/></linearGradient>
      <linearGradient id="${u}v" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset=".7" stop-color="#000" stop-opacity=".05"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></linearGradient>
      <linearGradient id="${u}p" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#121119"/><stop offset=".38" stop-color="#2c2b3b"/><stop offset=".7" stop-color="#21202d"/><stop offset="1" stop-color="#0f0e15"/></linearGradient>
      <linearGradient id="${u}n" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${esc(pele, 0.55)}"/><stop offset=".5" stop-color="${esc(pele, 0.78)}"/><stop offset=".85" stop-color="${esc(pele, 0.94)}"/><stop offset="1" stop-color="${pele}"/></linearGradient>
      <linearGradient id="${u}h" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".28"/><stop offset=".3" stop-color="#000" stop-opacity="0"/><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".32"/></linearGradient>
    </defs>`;

    // ---- pernas (calça afunilada, costura, joelho, tênis)
    const perna = (x0, x1, a0, a1, cx) => `
      <path d="M${x0} 176 L${x1} 176 L${x1 - 2} 232 Q${(x1 + a1) / 2} 280 ${a1} 318 L${a0} 318 Q${(x0 + a0) / 2} 280 ${x0 + 2} 232 Z" fill="url(#${u}p)" stroke="#08080c" stroke-width="2"/>
      <path d="M${cx + (x0 < 100 ? -16 : 16)} 182 Q${cx + (x0 < 100 ? -14 : 14)} 260 ${cx + (x0 < 100 ? -12 : 12)} 314" stroke="#3b3a4d" stroke-width="1.4" fill="none" opacity=".7"/>
      <path d="M${cx - 9} 246 q9 5 18 0 M${cx - 6} 254 q6 3 12 0" stroke="#000" stroke-width="1.6" fill="none" opacity=".35"/>
      <path d="M${a0 + 1} 311 Q${cx} 306 ${a1 - 1} 311" stroke="#000" stroke-width="2" fill="none" opacity=".35"/>
      <path d="M${cx - 22} 336 Q${cx - 22} 314 ${cx} 311 Q${cx + 22} 314 ${cx + 22} 336 Z" fill="${tenis}" stroke="#8d8c9c" stroke-width="1.6"/>
      <path d="M${cx - 8} 312 Q${cx} 309 ${cx + 8} 312 L${cx + 6} 322 L${cx - 6} 322 Z" fill="#d6d5e0"/>
      <path d="M${cx - 6} 315.5h12M${cx - 7} 319.5h14M${cx - 8} 323.5h16" stroke="#8a899a" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M${cx + (x0 < 100 ? -20 : 20)} 330 Q${cx + (x0 < 100 ? -12 : 12)} 322 ${cx + (x0 < 100 ? -4 : 4)} 330" stroke="${cor}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <rect x="${cx - 25}" y="333" width="50" height="8" rx="4" fill="${sola}" stroke="#8d8c9c" stroke-width="1.2"/>`;
    const pernas = `<ellipse cx="100" cy="342" rx="66" ry="7" fill="#000" opacity=".28"/>
      <g class="pe">${perna(56, 100, 63, 95, 78)}</g>
      <g class="pd">${perna(100, 144, 105, 137, 122)}</g>`;

    // ---- tronco: moletom com capuz (ou farda da delegada)
    const corpoPath = "M78 16 Q58 20 46 32 Q36 42 38 60 L42 124 Q44 152 48 172 L152 172 Q156 152 158 124 L162 60 Q164 42 154 32 Q142 20 122 16 Z";
    const ribs = Array.from({ length: 16 }, (_, i) => `<line x1="${54 + i * 6}" y1="169" x2="${54 + i * 6}" y2="185" stroke="#000" stroke-width="1" opacity=".18"/>`).join("");
    let tronco = `
      <path d="M52 36 Q50 4 100 2 Q150 4 148 36 Z" fill="${Mc}"/>
      <path d="${corpoPath}" fill="url(#${u}t)" stroke="${Mo}" stroke-width="2"/>
      <path d="${corpoPath}" fill="url(#${u}v)"/>
      <path d="M75 0 H125 Q122 22 131 40 Q100 50 69 40 Q78 22 75 0 Z" fill="url(#${u}n)"/>
      <path d="M75 0 H125 Q122 22 131 40 Q100 50 69 40 Q78 22 75 0 Z" fill="url(#${u}h)"/>
      <path d="M93 31 Q100 34.5 107 31" stroke="${Pk}" stroke-width="1.3" fill="none" opacity=".45"/>
      <path d="M77 20 Q66 40 54 72 M123 20 Q134 40 146 72" stroke="${Mo}" stroke-width="1.6" fill="none" opacity=".45"/>
      <path d="M66 150 q8 -6 16 0 M120 150 q8 -6 16 0 M92 158 q8 4 16 0" stroke="#000" stroke-width="1.4" fill="none" opacity=".15"/>
      <path d="M50 167 L150 167 L149 184 Q100 191 51 184 Z" fill="${Mc}" stroke="${Mo}" stroke-width="1.6"/>${ribs}`;
    if (farda) {
      tronco += `
      <path d="M78 16 L100 58 L122 16 Q112 12 100 12 Q88 12 78 16Z" fill="#e8ecf4"/>
      <path d="M92 24 L100 58 L108 24 L104 20 L96 20 Z" fill="#2b3a5c"/>
      <path d="M78 16 L70 30 L86 40 L100 62 Z M122 16 L130 30 L114 40 L100 62 Z" fill="${Ms}" stroke="${Mo}" stroke-width="1.5"/>
      <line x1="100" y1="62" x2="100" y2="166" stroke="${Mo}" stroke-width="1.6"/>
      <circle cx="104" cy="84" r="2.6" fill="#c8b06a"/><circle cx="104" cy="110" r="2.6" fill="#c8b06a"/><circle cx="104" cy="136" r="2.6" fill="#c8b06a"/>
      <path d="M126 70 l9 -4 9 4 v9 q-9 8 -18 0 Z" fill="#d9b64e" stroke="#8a6d1d" stroke-width="1.4"/>
      <rect x="58" y="90" width="26" height="18" rx="2" fill="none" stroke="${Mo}" stroke-width="1.4" opacity=".7"/>`;
    } else {
      tronco += `
      <ellipse cx="100" cy="54" rx="46" ry="11" fill="#000" opacity=".16"/>
      <path d="M58 18 Q64 48 100 54 Q136 48 142 18 L133 14 Q126 38 100 42 Q74 38 67 14 Z" fill="${cor}" stroke="${esc(cor, 0.6)}" stroke-width="1.4"/>
      <path d="M56 19 Q62 52 100 58 Q138 52 144 19" stroke="${Ms}" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M56 19 Q62 52 100 58 Q138 52 144 19" stroke="${Ml}" stroke-width="1.6" fill="none" opacity=".35" transform="translate(-1 -2)"/>
      <circle cx="91" cy="54" r="2.4" fill="#c9ccd4" stroke="#6d717c" stroke-width="1"/><circle cx="109" cy="54" r="2.4" fill="#c9ccd4" stroke="#6d717c" stroke-width="1"/>
      <path d="M91 55 Q87 72 89 90" stroke="${cor}" stroke-width="3.6" fill="none" stroke-linecap="round"/>
      <path d="M109 55 Q113 74 111 94" stroke="${cor}" stroke-width="3.6" fill="none" stroke-linecap="round"/>
      <rect x="87.2" y="88" width="3.8" height="8" rx="1.4" fill="#d5d7de" stroke="#6d717c" stroke-width=".8"/>
      <rect x="109.2" y="92" width="3.8" height="8" rx="1.4" fill="#d5d7de" stroke="#6d717c" stroke-width=".8"/>
      <path d="M62 128 Q100 122 138 128 L146 164 Q100 168 54 164 Z" fill="${Ms}" stroke="${Mo}" stroke-width="1.4"/>
      <path d="M65 131 Q100 125 135 131 L142 161 Q100 165 58 161 Z" fill="none" stroke="${Ml}" stroke-width="1.1" stroke-dasharray="3 2.5" opacity=".45"/>
      <path d="M62 128 Q70 146 56 162 M138 128 Q130 146 144 162" stroke="${Mo}" stroke-width="2" fill="none" opacity=".55"/>
      <text class="logo" x="100" y="112" font-size="20" text-anchor="middle" fill="#ffffffcc" font-family="Arial Black,sans-serif" font-weight="900">NM</text>`;
    }
    const T = `<g class="tronco">${tronco}</g>`;
    const E = `<g class="bE">${bE}</g>`, D = `<g class="bD ${classeD}">${bD}</g>`;
    let corpo;
    switch (ordem) {
      case "cruzados": corpo = pernas + T + D + E; break;
      case "frente": corpo = pernas + T + E + D; break;
      case "pote": corpo = pernas + T + frente + E + D; frente = ""; break;
      case "escrevendo": corpo = pernas + T + D + frente + E; frente = ""; break;
      default: corpo = pernas + T + atras + E + D;
    }
    return `<svg viewBox="0 0 200 350" preserveAspectRatio="none" overflow="visible" xmlns="http://www.w3.org/2000/svg">${defs}${corpo}${frente}</svg>`;
  };

  // Corpo estirado no chão (viewBox 0 0 400 120). A cabeça (PNG ou placeholder)
  // é posta por cima pela UI, à esquerda; o sangue fica colado nela.
  PH.cadaver = (cor, roupa, pele) => {
    const M = roupa || window.MOLETOM || "#3b2f63";
    pele = pele || "#e9b994";
    const Ms = esc(M, 0.82), calca = "#1c1b26", tenis = "#e8e8f0";
    const sangue = "#8f0e22", sangue2 = "#6d0918";
    return `<svg viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg">
      <g class="sangue">
        <ellipse cx="54" cy="110" rx="50" ry="14" fill="${sangue2}"/>
        <ellipse cx="50" cy="108" rx="45" ry="12" fill="${sangue}"/>
        <ellipse cx="102" cy="116" rx="26" ry="7" fill="${sangue}"/>
        <ellipse cx="10" cy="102" rx="14" ry="7" fill="${sangue}"/>
        <ellipse cx="76" cy="121" rx="20" ry="5" fill="${sangue2}"/>
        <ellipse cx="26" cy="92" rx="9" ry="11" fill="${sangue}"/>
        <circle cx="132" cy="118" r="4" fill="${sangue}"/><circle cx="-6" cy="98" r="3" fill="${sangue}"/>
      </g>
      <polyline points="108,62 80,32 50,20" fill="none" stroke="${Ms}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="44" cy="18" r="10" fill="${pele}" stroke="#00000033" stroke-width="2"/>
      <polyline points="244,66 302,60 360,50" fill="none" stroke="${calca}" stroke-width="30" stroke-linecap="round"/>
      <polyline points="244,94 306,100 362,110" fill="none" stroke="${calca}" stroke-width="30" stroke-linecap="round"/>
      <ellipse cx="378" cy="46" rx="11" ry="20" fill="${tenis}" transform="rotate(-12 378 46)"/>
      <ellipse cx="380" cy="112" rx="11" ry="20" fill="${tenis}" transform="rotate(14 380 112)"/>
      <path d="M92 56 Q170 42 248 54 L250 106 Q170 116 94 108 Z" fill="${M}"/>
      <path d="M90 58 Q80 82 92 108 Q108 82 92 58Z" fill="${cor}"/>
      <polyline points="124,104 172,114 206,110" fill="none" stroke="${Ms}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="214" cy="110" r="10" fill="${pele}" stroke="#00000033" stroke-width="2"/>
    </svg>`;
  };

  PH.lencol = () => `<svg viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="54" cy="106" rx="34" ry="10" fill="#6d0918" opacity=".85"/><ellipse cx="88" cy="111" rx="18" ry="6" fill="#8f0e22"/>
    <path d="M10 112 Q14 56 64 56 Q110 40 160 56 Q260 46 300 62 Q370 52 392 112 Z" fill="#e9e6ef"/>
    <path d="M10 112 Q14 56 64 56 Q110 40 160 56" fill="none" stroke="#c7c3d1" stroke-width="4"/>
    <ellipse cx="60" cy="72" rx="12" ry="7" fill="#b3122a" opacity=".5"/></svg>`;

  // ================================================================ ROSTOS
  // viewBox 0 0 200 200
  PH.rosto = (id, exp) => {
    const P = window.PERSONAGENS[id] || {};
    exp = exp || "neutro";
    if (P.tipo === "vulto") {
      return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path d="M30 200 Q20 40 100 22 Q180 40 170 200Z" fill="#2a2148"/><ellipse cx="100" cy="120" rx="52" ry="62" fill="#050508"/></svg>`;
    }
    const traco = "#1a1a1a";
    // olhos / boca / sobrancelhas por expressão
    const olhos = {
      neutro: `<circle cx="74" cy="104" r="8" fill="${traco}"/><circle cx="126" cy="104" r="8" fill="${traco}"/>`,
      feliz: `<path d="M64 106 q10 -14 20 0" stroke="${traco}" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M116 106 q10 -14 20 0" stroke="${traco}" stroke-width="6" fill="none" stroke-linecap="round"/>`,
      preocupado: `<circle cx="74" cy="106" r="7" fill="${traco}"/><circle cx="126" cy="106" r="7" fill="${traco}"/>`,
      assustado: `<circle cx="74" cy="102" r="14" fill="#fff" stroke="${traco}" stroke-width="3"/><circle cx="74" cy="102" r="5" fill="${traco}"/><circle cx="126" cy="102" r="14" fill="#fff" stroke="${traco}" stroke-width="3"/><circle cx="126" cy="102" r="5" fill="${traco}"/>`,
      bravo: `<circle cx="74" cy="106" r="7" fill="${traco}"/><circle cx="126" cy="106" r="7" fill="${traco}"/>`,
      morto: `<path d="M64 94 l20 20 M84 94 l-20 20 M116 94 l20 20 M136 94 l-20 20" stroke="${traco}" stroke-width="6" stroke-linecap="round"/>`
    }[exp] || "";
    const sobr = {
      neutro: `<path d="M60 84 h28 M112 84 h28" stroke="${traco}" stroke-width="6" stroke-linecap="round"/>`,
      feliz: `<path d="M60 80 q14 -8 28 0 M112 80 q14 -8 28 0" stroke="${traco}" stroke-width="6" fill="none" stroke-linecap="round"/>`,
      preocupado: `<path d="M60 88 L88 78 M112 78 L140 88" stroke="${traco}" stroke-width="6" stroke-linecap="round"/>`,
      assustado: `<path d="M58 76 q16 -10 30 -2 M112 74 q14 -8 30 2" stroke="${traco}" stroke-width="6" fill="none" stroke-linecap="round"/>`,
      bravo: `<path d="M60 78 L88 90 M112 90 L140 78" stroke="${traco}" stroke-width="7" stroke-linecap="round"/>`
    }[exp] || "";
    const boca = {
      neutro: `<path d="M84 146 h32" stroke="${traco}" stroke-width="6" stroke-linecap="round"/>`,
      feliz: `<path d="M74 138 q26 30 52 0 z" fill="#5a1a1a" stroke="${traco}" stroke-width="5" stroke-linejoin="round"/>`,
      preocupado: `<path d="M80 152 q10 -10 20 0 q10 10 20 0" stroke="${traco}" stroke-width="6" fill="none" stroke-linecap="round"/>`,
      assustado: `<ellipse cx="100" cy="152" rx="13" ry="17" fill="#3a0f0f" stroke="${traco}" stroke-width="5"/>`,
      bravo: `<path d="M80 156 q20 -16 40 0" stroke="${traco}" stroke-width="6" fill="none" stroke-linecap="round"/>`,
      morto: `<path d="M86 150 q14 6 28 0" stroke="${traco}" stroke-width="5" fill="none" stroke-linecap="round"/>`
    }[exp] || "";

    if (P.tipo === "hex") { // Problems: hexágono branco com contorno preto
      return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <polygon points="100,8 182,54 182,146 100,192 18,146 18,54" fill="#fff" stroke="#111" stroke-width="10" stroke-linejoin="round"/>
        ${olhos}${sobr}${boca}</svg>`;
    }
    const pele = P.pele || "#e9b994", cab = P.cabelo || "#3b2414";
    let extra = "";
    if (P.oculos) extra += `<g fill="none" stroke="#111" stroke-width="5"><circle cx="74" cy="104" r="20"/><circle cx="126" cy="104" r="20"/><path d="M94 104 h12"/></g>`;
    if (P.quepe) extra += `<path d="M28 62 Q100 0 172 62 Z" fill="#1d2a44"/><rect x="22" y="58" width="156" height="14" rx="6" fill="#111a2c"/><circle cx="100" cy="40" r="10" fill="#e8c34a"/>`;
    if (P.bone) extra += `<path d="M32 66 Q100 4 168 66 Z" fill="${P.cor}"/><path d="M120 62 q60 -6 70 10 l-70 4z" fill="${esc(P.cor, 0.7)}"/>`;
    if (P.fone) extra += `<path d="M26 104 Q28 18 100 16 Q172 18 174 104" fill="none" stroke="#222" stroke-width="10"/><rect x="14" y="92" width="24" height="40" rx="8" fill="${P.cor}"/><rect x="162" y="92" width="24" height="40" rx="8" fill="${P.cor}"/>`;
    return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="112" rx="74" ry="80" fill="${pele}" stroke="#00000033" stroke-width="3"/>
      <ellipse cx="28" cy="116" rx="12" ry="18" fill="${pele}"/><ellipse cx="172" cy="116" rx="12" ry="18" fill="${pele}"/>
      <path d="M26 98 Q22 22 100 20 Q178 22 174 98 Q150 60 100 58 Q50 60 26 98Z" fill="${cab}"/>
      ${olhos}${sobr}${boca}
      ${exp === "preocupado" ? `<ellipse cx="150" cy="80" rx="5" ry="9" fill="#7fd1ff"/>` : ""}
      ${exp === "bravo" ? `<ellipse cx="58" cy="132" rx="12" ry="7" fill="#ff5a5a" opacity=".35"/><ellipse cx="142" cy="132" rx="12" ry="7" fill="#ff5a5a" opacity=".35"/>` : ""}
      ${extra}</svg>`;
  };

  // ================================================================ ÍCONES / OBJETOS
  // viewBox 0 0 100 100 (tripé: 0 0 60 200)
  PH.icones = {
    kit: `<svg viewBox="0 0 100 100"><rect x="8" y="34" width="84" height="56" rx="6" fill="#3b2f63" stroke="#7a68b8" stroke-width="3"/><rect x="4" y="26" width="92" height="16" rx="4" fill="#4b3d7a"/><text x="50" y="74" font-size="22" text-anchor="middle" fill="#fff" font-family="Arial Black,sans-serif">NM</text><rect x="62" y="8" width="20" height="26" rx="3" fill="#f5f0e6" transform="rotate(12 72 20)"/></svg>`,
    pelucia: `<svg viewBox="0 0 100 100"><rect x="10" y="30" width="80" height="58" rx="18" fill="#e84a5f"/><rect x="30" y="18" width="30" height="18" rx="6" fill="#c33a4d"/><circle cx="56" cy="60" r="20" fill="#222"/><circle cx="56" cy="60" r="12" fill="#5ab"/><circle cx="51" cy="55" r="4" fill="#fff"/><circle cx="24" cy="48" r="4" fill="#111"/><circle cx="34" cy="48" r="4" fill="#111"/></svg>`,
    mochila: `<svg viewBox="0 0 100 120"><rect x="14" y="20" width="72" height="92" rx="20" fill="#2f4f6f"/><rect x="24" y="64" width="52" height="34" rx="8" fill="#3f6f8f"/><path d="M34 20 q16 -18 32 0" stroke="#1f3f5f" stroke-width="7" fill="none"/><rect x="52" y="6" width="28" height="36" fill="#f3efe0" transform="rotate(14 66 24)"/></svg>`,
    placa: `<svg viewBox="0 0 100 100"><rect x="10" y="14" width="80" height="72" rx="6" fill="#c9ced6" stroke="#8d949e" stroke-width="3"/><polygon points="40,34 40,64 66,49" fill="#e33"/><path d="M78 16 q8 10 4 22 q-6 -4 -10 -14z" fill="#9b0f22"/></svg>`,
    tripe: `<svg viewBox="0 0 60 200"><rect x="6" y="10" width="48" height="32" rx="5" fill="#1b1b1f"/><circle cx="36" cy="26" r="11" fill="#333"/><circle cx="36" cy="26" r="6" fill="#4a7aa8"/><rect x="2" y="16" width="12" height="16" fill="#e84a5f"/><rect x="14" y="40" width="6" height="12" fill="#2a2a2a" transform="rotate(-25 17 46)"/><rect x="28" y="42" width="5" height="70" fill="#2a2a2a"/><line x1="30" y1="110" x2="6" y2="196" stroke="#2a2a2a" stroke-width="5"/><line x1="30" y1="110" x2="54" y2="196" stroke="#2a2a2a" stroke-width="5"/><line x1="30" y1="110" x2="30" y2="196" stroke="#2a2a2a" stroke-width="5"/></svg>`,
    camera: `<svg viewBox="0 0 100 100"><rect x="10" y="28" width="80" height="52" rx="8" fill="#1b1b1f"/><circle cx="54" cy="54" r="18" fill="#333"/><circle cx="54" cy="54" r="10" fill="#4a7aa8"/><rect x="74" y="44" width="14" height="22" fill="#0a0a0a" stroke="#e84a5f" stroke-width="2" stroke-dasharray="3 2"/></svg>`,
    argola: `<svg viewBox="0 0 100 100"><path d="M50 18 A30 30 0 1 1 26 32" fill="none" stroke="#d6dbe2" stroke-width="10" stroke-linecap="round"/></svg>`,
    celular: `<svg viewBox="0 0 100 100"><rect x="26" y="8" width="48" height="84" rx="8" fill="#111" stroke="#555" stroke-width="3"/><rect x="32" y="18" width="36" height="62" fill="#2b5b7b"/><rect x="36" y="28" width="26" height="8" rx="3" fill="#8fd"/><rect x="36" y="42" width="20" height="8" rx="3" fill="#ddd"/></svg>`,
    janela: `<svg viewBox="0 0 100 100"><rect x="14" y="10" width="72" height="80" fill="#1b2b52" stroke="#9aa8b8" stroke-width="5"/><line x1="50" y1="10" x2="50" y2="90" stroke="#9aa8b8" stroke-width="4"/><rect x="40" y="46" width="20" height="10" fill="#c9a24a"/></svg>`,
    caderno: `<svg viewBox="0 0 100 100"><rect x="18" y="10" width="64" height="82" rx="4" fill="#f3efe0" stroke="#999" stroke-width="2"/>${[0, 1, 2, 3, 4].map((i) => `<line x1="28" y1="${30 + i * 12}" x2="74" y2="${30 + i * 12}" stroke="#7a8aa8"/>`).join("")}<text x="50" y="26" font-size="12" text-anchor="middle" fill="#c22" font-family="sans-serif" font-weight="900">HOJE</text></svg>`,
    gaveta: `<svg viewBox="0 0 100 60"><rect x="4" y="8" width="92" height="46" rx="4" fill="#2d323f" stroke="#4b5366" stroke-width="3"/><rect x="38" y="26" width="24" height="7" rx="3" fill="#9aa4aa"/></svg>`,
    quadroluz: `<svg viewBox="0 0 60 100"><rect x="4" y="4" width="52" height="92" rx="4" fill="#9aa1a6" stroke="#5a6064" stroke-width="3"/>${[0, 1, 2, 3].map((i) => `<rect x="14" y="${16 + i * 18}" width="12" height="12" fill="#333"/><rect x="34" y="${16 + i * 18}" width="12" height="12" fill="#333"/>`).join("")}<rect x="18" y="${16}" width="4" height="7" fill="#e33"/></svg>`,
    disjuntor: `<svg viewBox="0 0 100 100"><rect x="24" y="6" width="52" height="88" rx="4" fill="#9aa1a6" stroke="#5a6064" stroke-width="3"/><rect x="38" y="20" width="24" height="40" fill="#333"/><rect x="42" y="42" width="16" height="14" fill="#e33"/><text x="50" y="80" font-size="11" text-anchor="middle" font-family="sans-serif" font-weight="900">GERAL</text></svg>`,
    depoimento: `<svg viewBox="0 0 100 100"><path d="M10 16 h80 v52 h-44 l-18 18 v-18 h-18z" fill="#f3efe0" stroke="#4caf50" stroke-width="4"/><text x="50" y="50" font-size="16" text-anchor="middle" font-family="sans-serif" font-weight="900" fill="#333">tlim!</text></svg>`,
    garrafa: `<svg viewBox="0 0 100 100"><rect x="38" y="8" width="24" height="16" fill="#555"/><path d="M36 24 h28 l6 18 v48 h-40 v-48z" fill="#b3122a" opacity=".85"/><rect x="34" y="54" width="32" height="20" fill="#f3efe0"/><text x="50" y="68" font-size="8" text-anchor="middle" font-family="sans-serif" font-weight="900">FAKE</text></svg>`,
    lente: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="36" fill="#222"/><circle cx="50" cy="50" r="24" fill="#4a7aa8"/><path d="M30 34 L50 52 L44 70 M50 52 L72 46" stroke="#e8f6ff" stroke-width="3" fill="none"/></svg>`,
    pote: `<svg viewBox="0 0 100 100"><rect x="18" y="26" width="64" height="66" rx="12" fill="#cfe6f0" opacity=".85" stroke="#9ab" stroke-width="3"/><rect x="22" y="14" width="56" height="16" rx="5" fill="#b07a4a"/><path d="M34 60 l10 -8 l8 12 l10 -14 l8 10" stroke="#4a7aa8" stroke-width="4" fill="none"/></svg>`,
    lixo: `<svg viewBox="0 0 80 120"><rect x="10" y="22" width="60" height="94" rx="6" fill="#4a5258"/><rect x="4" y="12" width="72" height="14" rx="5" fill="#5a6268"/><rect x="34" y="4" width="14" height="10" fill="#5a6268"/><rect x="50" y="6" width="12" height="22" rx="3" fill="#b3122a" transform="rotate(18 56 16)"/></svg>`,
    computador: `<svg viewBox="0 0 100 100"><rect x="8" y="12" width="84" height="58" rx="5" fill="#0a0c10"/><rect x="14" y="18" width="72" height="46" fill="#16324a"/><rect x="20" y="30" width="60" height="18" fill="#3a1520"/><text x="50" y="43" font-size="8" text-anchor="middle" fill="#f88" font-family="sans-serif" font-weight="900">SEM CARTÃO</text><rect x="44" y="70" width="12" height="14" fill="#0a0c10"/><rect x="30" y="84" width="40" height="6" fill="#0a0c10"/></svg>`,
    fotos: `<svg viewBox="0 0 100 100"><rect x="14" y="20" width="56" height="64" fill="#f3efe0" transform="rotate(-10 42 52)"/><rect x="30" y="14" width="56" height="64" fill="#f3efe0" transform="rotate(8 58 46)"/><rect x="36" y="20" width="44" height="40" fill="#14101f" transform="rotate(8 58 46)"/><path d="M48 58 q10 -26 20 0z" fill="#3b2f63" transform="rotate(8 58 46)"/></svg>`,
    // tela do computador do Leo ligada (com a janela de "excluir" da Gabi)
    telapc: `<svg viewBox="0 0 300 170" preserveAspectRatio="none"><defs><linearGradient id="tpc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a5fb0"/><stop offset="1" stop-color="#0f2a5c"/></linearGradient></defs>
      <rect width="300" height="170" fill="url(#tpc)"/><rect y="156" width="300" height="14" fill="#0a1630" opacity=".85"/>
      <rect x="18" y="16" width="150" height="100" rx="4" fill="#0d1b33" opacity=".9"/><rect x="18" y="16" width="150" height="14" rx="4" fill="#3a6fd0"/>
      <rect x="28" y="40" width="60" height="34" fill="#1d3a6e"/><rect x="96" y="40" width="60" height="34" fill="#1d3a6e"/><rect x="28" y="84" width="128" height="6" fill="#e84a5f"/><rect x="28" y="96" width="90" height="6" fill="#4a6fae"/>
      <rect x="120" y="58" width="160" height="72" rx="5" fill="#eef2fa"/><rect x="120" y="58" width="160" height="16" rx="5" fill="#c9d4ea"/>
      <text x="200" y="92" font-size="11" text-anchor="middle" font-family="sans-serif" font-weight="700" fill="#222">Excluir gabi_rage_chorando.mp4?</text>
      <rect x="146" y="104" width="44" height="16" rx="3" fill="#e84a5f"/><text x="168" y="116" font-size="10" text-anchor="middle" font-family="sans-serif" font-weight="900" fill="#fff">SIM</text>
      <rect x="208" y="104" width="44" height="16" rx="3" fill="#9aa6bd"/><text x="230" y="116" font-size="10" text-anchor="middle" font-family="sans-serif" font-weight="900" fill="#fff">NÃO</text></svg>`,
    // tela depois: só a importação falhando
    telapc2: `<svg viewBox="0 0 300 170" preserveAspectRatio="none"><defs><linearGradient id="tpc2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a5fb0"/><stop offset="1" stop-color="#0f2a5c"/></linearGradient></defs>
      <rect width="300" height="170" fill="url(#tpc2)"/><rect y="156" width="300" height="14" fill="#0a1630" opacity=".85"/>
      <rect x="40" y="34" width="220" height="92" rx="5" fill="#eef2fa"/><rect x="40" y="34" width="220" height="16" rx="5" fill="#c9d4ea"/>
      <text x="150" y="46" font-size="9" text-anchor="middle" font-family="sans-serif" font-weight="700" fill="#333">Importar mídia</text>
      <text x="150" y="74" font-size="12" text-anchor="middle" font-family="sans-serif" font-weight="900" fill="#222">PROVA_sorteios.mp4</text>
      <rect x="62" y="88" width="176" height="20" rx="3" fill="#fde2e5"/><text x="150" y="102" font-size="10" text-anchor="middle" font-family="sans-serif" font-weight="900" fill="#c2182f">CARTÃO NÃO ENCONTRADO</text></svg>`,
    cama: `<svg viewBox="0 0 260 140"><ellipse cx="130" cy="122" rx="128" ry="16" fill="#000" opacity=".25"/><rect x="6" y="96" width="44" height="26" rx="12" fill="#e8e4d8"/><rect x="134" y="96" width="44" height="26" rx="12" fill="#e8e4d8"/><path d="M40 122 Q44 70 90 74 Q118 66 124 96 L126 124 Z" fill="#4a6fa5"/><path d="M168 122 Q172 64 214 72 Q246 70 252 124 Z" fill="#a5544a"/><path d="M60 86 q30 -8 56 6" stroke="#2f4f80" stroke-width="3" fill="none"/><path d="M186 82 q30 -6 52 10" stroke="#7a3830" stroke-width="3" fill="none"/></svg>`,
    laudo: `<svg viewBox="0 0 100 100"><rect x="22" y="8" width="56" height="84" rx="4" fill="#8a6a42"/><rect x="28" y="16" width="44" height="70" fill="#f3efe0"/><rect x="40" y="4" width="20" height="9" rx="2" fill="#bbb"/><text x="50" y="34" font-size="10" text-anchor="middle" font-family="sans-serif" font-weight="900" fill="#333">LAUDO</text><path d="M34 46 h32 M34 56 h26 M34 66 h30" stroke="#7a8aa8" stroke-width="3"/><rect x="56" y="70" width="12" height="4" fill="#7a5bc4"/></svg>`,
    chaveiro: `<svg viewBox="0 0 100 100"><path d="M60 10 A12 12 0 1 1 46 14" fill="none" stroke="#d6dbe2" stroke-width="6" stroke-linecap="round"/><line x1="56" y1="30" x2="56" y2="40" stroke="#d6dbe2" stroke-width="4"/><path d="M30 46 L56 40 L82 46 L74 78 L56 90 L38 78 Z" fill="#ff6b3d"/><path d="M30 46 L40 62 L36 44Z M82 46 L72 62 L76 44Z" fill="#c94a24"/><path d="M46 74 L56 90 L66 74 Q56 80 46 74Z" fill="#fff"/><circle cx="48" cy="60" r="3.5" fill="#111"/><circle cx="64" cy="60" r="3.5" fill="#111"/><circle cx="56" cy="86" r="3" fill="#111"/></svg>`
  };
  PH.icone = (k) => PH.icones[k] || `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="30" fill="#888"/><text x="50" y="58" font-size="30" text-anchor="middle">?</text></svg>`;

  // ================================================================ FOTOS DA ISCA (polaroid)
  PH.foto = (q) => {
    const grao = `<rect width="160" height="120" fill="url(#grao)" opacity=".5"/>`;
    const defs = `<defs><filter id="bl"><feGaussianBlur stdDeviation="${q === "parede" ? 0.6 : 1.6}"/></filter>
      <pattern id="grao" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="#000"/><rect width="1" height="1" fill="#fff" opacity=".25"/></pattern></defs>`;
    const M = window.MOLETOM || "#3b2f63";
    const corpo = {
      capuz: `<g filter="url(#bl)"><path d="M40 130 Q36 40 84 30 Q132 40 128 130Z" fill="${M}"/><ellipse cx="84" cy="66" rx="26" ry="30" fill="#050508"/></g>`,
      costas: `<g filter="url(#bl)"><path d="M20 130 Q20 50 70 38 Q120 50 120 130Z" fill="${M}"/><path d="M42 54 Q70 20 98 54 Q70 46 42 54Z" fill="${esc(M, 0.8)}"/><rect x="104" y="80" width="46" height="20" fill="#3a2f28"/></g>`,
      braco: `<g filter="url(#bl)"><path d="M30 130 Q30 50 80 40 Q130 50 130 130Z" fill="${M}"/><ellipse cx="80" cy="70" rx="24" ry="28" fill="#050508"/><rect x="36" y="56" width="96" height="26" rx="13" fill="${esc(M, 0.85)}" transform="rotate(-12 84 69)"/></g>`,
      parede: `<rect width="160" height="120" fill="#3a3430"/><rect x="20" y="20" width="40" height="60" fill="#4a4038"/>`
    }[q] || "";
    return `<svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg">${defs}<rect width="160" height="120" fill="${q === "parede" ? "#2a2622" : "#16121f"}"/>${corpo}<rect width="160" height="120" fill="#ffffff" opacity=".07"/>${grao}</svg>`;
  };

  window.PH = PH;
})();
