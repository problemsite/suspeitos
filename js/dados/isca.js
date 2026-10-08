/* =====================================================================
   TENTATIVA DE REVELAR O CULPADO (a isca no escuro)
   ---------------------------------------------------------------------
   Um vulto de moletom da collab entra no escuro. Os jogadores clicam
   NELE para tirar foto com flash (3 fotos no total, compartilhadas).
   Errar o clique gasta a foto (sai só a parede).
   A 3ª foto (ou o fim do tempo) assusta o vulto: ele bate na prateleira,
   foge e deixa cair a pista final.
   caminho: pontos { t (ms desde o começo), x (% da tela), pose }
   ===================================================================== */
window.ISCA = {
  duracao: 17000,
  fotosMax: 3,
  caminhos: {
    cozinha: [
      { t: 0, x: 104, pose: "escondendo" }, { t: 2600, x: 80, pose: "escondendo" },
      { t: 5200, x: 58, pose: "escondendo" }, { t: 9500, x: 52, pose: "celular" },
      { t: 12500, x: 46, pose: "escondendo" }, { t: 15000, x: 70, pose: "escondendo" }, { t: 17000, x: 104, pose: "escondendo" }
    ],
    estudio: [
      { t: 0, x: -6, pose: "escondendo" }, { t: 2600, x: 22, pose: "escondendo" },
      { t: 5200, x: 60, pose: "escondendo" }, { t: 9500, x: 78, pose: "celular" },
      { t: 12500, x: 70, pose: "escondendo" }, { t: 15000, x: 34, pose: "escondendo" }, { t: 17000, x: -6, pose: "escondendo" }
    ]
  },
  // O que aparece em cada foto que ACERTA o vulto (na ordem dos acertos)
  fotos: [
    { quadro: "capuz", txt: "Só o capuz do moletom da collab." },
    { quadro: "costas", txt: "De costas, mexendo na gaveta. As mãos escondidas na manga." },
    { quadro: "braco", txt: "O vulto se vira... e cobre o rosto com o braço!" }
  ],
  erro: { quadro: "parede", txt: "Só saiu a parede." }
};
