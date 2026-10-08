/* =====================================================================
   CENÁRIOS (3 ambientes)
   ---------------------------------------------------------------------
   fundo: PNG/JPG 16:9 (ex.: "img/sala.webp"). null = placeholder desenhado.
   fundoApagado: versão do cenário com a luz apagada (opcional). Sem ela, o
     jogo escurece a imagem normal. O filtro preto por cima fica em estilo.css (.luz-apagada #luz).
   Coordenadas em % da tela: x/y = canto superior esquerdo, w/h = tamanho.
   Objetos:
     deco:    true = só enfeite (não é clicável)
     desenho: placeholder a desenhar (null = área invisível, só brilha no hover)
     img:     PNG do objeto (substitui o desenho)
     se:      (S) => true/false   — quando o objeto aparece
     clique:  id da sequência (roteiro.js) ou lista [{ se, seq }] (a primeira que valer)
   janelas: áreas de vidro onde o jogo desenha a chuva e o relâmpago (em %).
   Evite pôr objetos importantes nos cantos de cima (espaço da facecam).
   ===================================================================== */
// atalhos usados nas condições (também valem em roteiro.js)
var tem = (S, p) => !!(S.pistas && S.pistas[p]);   // já tem a pista?
var fl = (S, f) => !!(S.flags && S.flags[f]);       // flag ligada?

/* CLOSE-UPS: objetos que "saem" do cenário e aparecem grandes na tela, como se
   alguém tivesse tirado e segurado na mão. Usados no roteiro com { examinar: "gaveta" }.
   de: de onde o objeto sai (em % da tela)  ·  w: largura final (% da tela) */
window.CLOSEUPS = {
  gaveta: { img: "img/objetos/gaveta_revirada.webp", de: { x: 73.3, y: 55.8 }, w: 34 }
};

window.CENARIOS = {
  sala: {
    nome: "Sala", fundo: "img/sala.webp", fundoApagado: "img/sala_apagada.webp",
    janelas: [{ x: 42.4, y: 12, w: 7.6, h: 30.4 }, { x: 50.6, y: 12, w: 7.6, h: 30.4 }],
    portas: [
      { para: "cozinha", rotulo: "Corredor / Cozinha", x: 0, y: 19, w: 8, h: 55, lado: "esq" },
      { para: "estudio", rotulo: "Estúdio do Jazz", x: 89, y: 19, w: 11, h: 55, lado: "dir" }
    ],
    objetos: [
      { id: "kit", rotulo: "Kit de boas-vindas", desenho: "kit", img: "img/objetos/kit_boas_vindas.webp", x: 11, y: 67.6, w: 6.2, h: 11,
        clique: "obj_kit" },
      { id: "pelucia", rotulo: "Bicho de pelúcia", desenho: "pelucia", img: "img/objetos/pelucia_lentinho.webp", x: 56.2, y: 55.2, w: 4.6, h: 8.2,
        clique: "obj_pelucia" },
      { id: "mochila", rotulo: "Mochila do Jazz", desenho: "mochila", img: "img/objetos/mochila.webp", x: 83, y: 63, w: 6.3, h: 12.5,
        clique: "obj_mochila" },
      { id: "janela_sala", rotulo: "Janela", desenho: null, x: 37, y: 9, w: 26, h: 35,
        clique: "obj_janela_sala" },
      { id: "quadro_placas", rotulo: "Fotos na parede", desenho: null, x: 22.5, y: 12.5, w: 11.5, h: 24,
        clique: "obj_placas_parede" }
    ]
  },

  estudio: {
    nome: "Estúdio do Jazz", fundo: "img/escritorio.webp", fundoApagado: null,
    janelas: [{ x: 45.2, y: 9.2, w: 15, h: 35, mascara: "img/mascaras/escritorio_janela.png" }],
    portas: [
      { para: "sala", rotulo: "Voltar pra sala", x: 1.5, y: 10, w: 11, h: 62, lado: "esq" }
    ],
    objetos: [
      { id: "corpo", rotulo: "Jazz", desenho: null, x: 37.5, y: 79, w: 31, h: 18,
        se: (S) => S.pos.leo && S.pos.leo.vis !== false && ["caido", "coberto"].includes(S.pos.leo.pose) && S.pos.leo.sala === "estudio",
        clique: "obj_corpo" },
      { id: "placa", rotulo: "Placa de Prata", desenho: "placa", img: "img/objetos/placa_prata.webp", x: 70, y: 85, w: 6, h: 8.2,
        se: (S) => S.capitulo !== "intro" && S.capitulo !== "revelacao", clique: "obj_placa" },
      { id: "camera", rotulo: "Câmera no tripé", desenho: "tripe", img: "img/objetos/tripe_camera.webp", x: 26.6, y: 34, w: 6.6, h: 38,
        clique: "obj_camera" },
      { id: "argola", rotulo: "Algo no chão", desenho: "argola", img: "img/objetos/argolinha.webp", x: 38.2, y: 80, w: 2.8, h: 3.7,
        se: (S) => !tem(S, "argola") && S.capitulo !== "revelacao", clique: "obj_argola" },
      { id: "celular", rotulo: "Celular do Jazz", desenho: "celular", img: "img/objetos/celular.webp", x: 73.7, y: 45.3, w: 2.3, h: 5.4,
        clique: "obj_celular" },
      { id: "janela_est", rotulo: "Janela", desenho: null, x: 43, y: 7, w: 20, h: 41,
        clique: "obj_janela_est" },
      { id: "tela_pc", deco: true, desenho: "telapc", img: null, x: 76.1, y: 32.2, w: 14.5, h: 15.2,
        se: (S) => fl(S, "pcLigado") && !fl(S, "pcApagou") },
      { id: "tela_pc2", deco: true, desenho: "telapc2", img: null, x: 76.1, y: 32.2, w: 14.5, h: 15.2,
        se: (S) => fl(S, "pcApagou") },
      { id: "computador", rotulo: "Computador", desenho: null, x: 75.5, y: 31, w: 15.5, h: 18,
        clique: [{ se: (S) => tem(S, "computador"), seq: "obj_computador_depois" }, { seq: "obj_computador" }] },
      { id: "gaveta", rotulo: "Gaveta da mesa", desenho: null, img: null, x: 69.2, y: 52.6, w: 8.2, h: 6.4,
        clique: [
          { se: (S) => S.capitulo === "plano" && !fl(S, "pegouCartao"), seq: "pegar_cartao" },
          { se: (S) => tem(S, "gaveta"), seq: "obj_gaveta_depois" },
          { seq: "obj_gaveta" }
        ] },
      { id: "chaveiro_chao", rotulo: "Alguma coisa no chão", desenho: "chaveiro", img: "img/objetos/chaveiro_raposa.webp", x: 72, y: 81, w: 4, h: 7.9,
        se: (S) => fl(S, "chaveiroNoChao") && !tem(S, "chaveiro"), clique: "obj_chaveiro" }
    ]
  },

  cozinha: {
    nome: "Cozinha", fundo: "img/cozinha.webp", fundoApagado: "img/cozinha_apagada.webp",
    janelas: [{ x: 74.6, y: 23, w: 3.7, h: 9.3 }, { x: 79, y: 23, w: 3.75, h: 9.3 }, { x: 74.6, y: 33.3, w: 3.7, h: 12.6 }, { x: 79, y: 33.3, w: 3.75, h: 12.6 }],
    portas: [
      { para: "sala", rotulo: "Voltar pra sala", x: 90.5, y: 10, w: 9.5, h: 68, lado: "dir" }
    ],
    objetos: [
      { id: "quadro", rotulo: "Quadro de luz", desenho: null, img: null, x: 1.5, y: 23, w: 5, h: 24,
        clique: "obj_quadro" },
      { id: "freezer", rotulo: "Geladeira", desenho: null, x: 11, y: 24, w: 12, h: 51,
        clique: [{ se: (S) => fl(S, "obs1ok"), seq: "obj_freezer_depois" }, { seq: "obj_freezer" }] },
      { id: "despensa", rotulo: "Despensa", desenho: null, x: 24.5, y: 17, w: 11.5, h: 57,
        clique: "obj_despensa" },
      { id: "pote", rotulo: "Pote de biscoito", desenho: "pote", img: "img/objetos/pote_biscoito.webp", x: 43.6, y: 44.6, w: 4.6, h: 7.5,
        clique: "obj_pote" },
      { id: "lixo", rotulo: "Lixo", desenho: "lixo", img: "img/objetos/lixo.webp", x: 64.5, y: 66.2, w: 5.2, h: 11.7,
        clique: "obj_lixo" },
      { id: "porta_fundos", rotulo: "Porta dos fundos", desenho: null, x: 72.5, y: 17, w: 13.5, h: 57,
        clique: "obj_porta_fundos" },
      { id: "cama", deco: true, desenho: "cama", img: null, x: 28, y: 79, w: 26, h: 14,
        se: (S) => fl(S, "cama") && (S.capitulo === "isca" || S.capitulo === "pos") },
      { id: "chaveiro_chao", rotulo: "Alguma coisa no chão", desenho: "chaveiro", img: "img/objetos/chaveiro_raposa.webp", x: 64, y: 83, w: 4, h: 7.9,
        se: (S) => fl(S, "chaveiroNoChao") && !tem(S, "chaveiro"), clique: "obj_chaveiro" }
    ]
  }
};
