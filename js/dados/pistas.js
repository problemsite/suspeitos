/* =====================================================================
   PISTAS
   ---------------------------------------------------------------------
   img: caminho do PNG (ex.: "img/objetos/camera.webp"). null = placeholder.
   desenho: qual placeholder desenhar (ver placeholders.js → ICONES).
   As descrições aparecem no painel de pistas.
   ===================================================================== */
window.PISTAS = {
  placa: {
    nome: "Placa de Prata", desenho: "placa", img: "img/objetos/placa_prata.webp",
    desc: "A primeira Placa de Prata do Jazz (100 mil inscritos), guardada de lembrança. Tava no chão, do lado dele, com uma mancha de sangue na ponta. Foi a arma."
  },
  camera: {
    nome: "Câmera sem cartão", desenho: "camera", img: "img/objetos/tripe_camera.webp",
    desc: "A câmera do Jazz no tripé. A tampinha do cartão de memória tá aberta... e não tem cartão nenhum dentro."
  },
  argola: {
    nome: "Argolinha arrebentada", desenho: "argola", img: "img/objetos/argolinha.webp",
    desc: "Uma argolinha de metal aberta, torta, no chão perto da mão do Jazz. Parece ter arrebentado com força."
  },
  celular: {
    nome: "Celular do Jazz", desenho: "celular", img: "img/objetos/celular.webp",
    desc: "Grupo \"Noite na Mansão 🏚️\" — 21:01: 🚫 Esta mensagem foi apagada.  21:02, Jazz: \"tá. vou agora. sozinho.\""
  },
  janela: {
    nome: "Janela do estúdio", desenho: "janela", img: null,
    desc: "Trancada por dentro. A poeira do parapeito tá intacta. Ninguém entrou nem saiu por aqui."
  },
  caderno: {
    nome: "Caderno do Jazz", desenho: "caderno", img: null,
    desc: "Última página: \"HOJE EU CONTO. 2 anos de sorteios falsos, a galera pagando 'taxa de envio' de prêmio que não existe. A prova tá gravada. Não acredito que foi justo quem eu mais confiava.\""
  },
  kit: {
    nome: "Kit de boas-vindas", desenho: "kit", img: null,
    desc: "Cartão do kit: cada convidado ganhou o moletom da collab + um chaveirinho de bicho. Mel 🐻 urso · Bruna 🐙 polvo · Enaldinho 🐸 sapo · Jujubinha 🐰 coelho · Felipe Neto 🦉 coruja · Giuliana Mafra 🦊 raposa."
  },
  disjuntor: {
    nome: "Quadro de luz", desenho: "disjuntor", img: null,
    desc: "Quadro de luz da cozinha. Nada tava ligado na tomada que pudesse ter derrubado a energia. A luz não caiu sozinha."
  },
  teo: {
    nome: "Depoimento do Mel", desenho: "depoimento", img: null,
    desc: "Agachado atrás da porta da geladeira durante o apagão: ouviu um CLAC no quadro de luz (do lado dele), a luz apagou, e alguém passou rápido pro corredor do estúdio fazendo \"tlim-tlim\". Depois ele religou a chave geral."
  },
  sangue: {
    nome: "Garrafa de sangue falso", desenho: "garrafa", img: null,
    desc: "Uma garrafinha de \"SANGUE CENOGRÁFICO\" no lixo da cozinha, quase vazia. Era do Enaldinho, pra uma pegadinha."
  },
  lente: {
    nome: "Lente quebrada", desenho: "lente", img: null,
    desc: "Cacos de uma lente cara de câmera escondidos no pote de biscoito. A Jujubinha quebrou de tarde e ficou com vergonha."
  },
  laudo: {
    nome: "Laudo da delegada", desenho: "laudo", img: null,
    desc: "O Jazz morreu durante o apagão, entre 21:06 e 21:10. Tinha um fiapo de moletom preso na unha: ele agarrou o bolso de quem fez isso."
  },
  computador: {
    nome: "Computador do Jazz", desenho: "computador", img: null,
    desc: "Importação pendente: PROVA_sorteios.mp4 — origem: cartão de memória. \"Cartão não encontrado.\" O vídeo nunca foi copiado pro computador."
  },
  gaveta: {
    nome: "Gaveta revirada", desenho: "gaveta", img: "img/objetos/gaveta_revirada.webp",
    desc: "A gaveta do estúdio foi revirada ANTES da Bruna entrar. Cartões de memória reserva espalhados, todos vazios. Alguém tá procurando um cartão específico."
  },
  fotos: {
    nome: "Fotos do vulto", desenho: "fotos", img: null,
    desc: "As fotos com flash da noite na cozinha. Só dá pra ver o moletom da collab com o capuz levantado... e todo mundo tem um."
  },
  chaveiro: {
    nome: "Chaveirinho de raposa", desenho: "chaveiro", img: "img/objetos/chaveiro_raposa.webp",
    desc: "Caiu do bolso do vulto quando ele bateu na prateleira. Um chaveirinho de raposa 🦊 — e a argolinha dele tá arrebentada."
  }
};

// Ordem em que aparecem no painel
window.ORDEM_PISTAS = ["placa", "camera", "argola", "celular", "janela", "caderno", "kit", "disjuntor", "teo",
  "sangue", "lente", "laudo", "computador", "gaveta", "fotos", "chaveiro"];

/* LIGAR PISTAS: escolher duas pistas no painel e clicar em "Ligar".
   Se o par existir aqui, roda a sequência indicada (roteiro.js). */
window.LIGACOES = [
  { a: "chaveiro", b: "argola", seq: "lig_argola" },
  { a: "chaveiro", b: "kit", seq: "lig_kit" },
  { a: "chaveiro", b: "teo", seq: "lig_tlim" },
  { a: "laudo", b: "argola", seq: "lig_laudo" },
  { a: "camera", b: "computador", seq: "lig_cartao" },
  { a: "caderno", b: "computador", seq: "lig_prova" },
  { a: "disjuntor", b: "teo", seq: "lig_luz" }
];
