/* =====================================================================
   ROTEIRO — todas as falas, sequências, conversas, gatilhos e o final.
   ---------------------------------------------------------------------
   Uma SEQUÊNCIA é uma lista de comandos rodados em ordem, iguais nas duas telas.

   Comandos que ESPERAM (a tela para até alguém clicar / o tempo passar):
     { fala: "nina", txt: "...", exp: "preocupado", pose: "cruzados" }
     { narra: "texto do narrador" }
     { espera: 1200 }                         — pausa (ms)
     { mover: "teo", x: 4, ms: 2000 }         — anda até x (% da tela)
     { escolha: [ { txt: "...", seq: "outra", flag: "x" }, ... ] }
     { clique: { x, y, w, h, rotulo } }       — espera clicarem numa área
     { titulo: "TEXTO", sub: "...", ms: 2600 }
     { relogio: "21:06", txt: "..." }         — cartão da reconstrução
     { transicao: 900, txt: "23:40" }         — tela preta
     { minigame: "isca" }                     — tentativa com o flash
     { deducao: true }                        — tela de acusação
   Comandos INSTANTÂNEOS:
     { sala: "estudio" }  { luz: "normal" | "apagada" | "isca" }  { modo: "espiar" | "" }
     { pos: "teo", sala, x, pose, exp, vis, olha }  { sai: "teo" }
     { cena: { teo: { sala, x }, ... }, limpar: true }
     { conversa: "gabi" | null }
     { examinar: "gaveta" | null } — objeto sai do cenário e aparece grande (ver CLOSEUPS em cenarios.js)  — põe a pessoa em destaque (busto) até o fim da sequência
     { pista: "camera" }  { flag: "nome", v: true }  { capitulo: "inv2" }
     { ir: "outra_sequencia" }  { som: "baque" }  { anim: "teo", a: "tremer" | "olhar" | "pular" | "recuar" }
     { flash: true }  { fim: true }
   Qualquer comando aceita:
     se: (S) => condição     primeira: true (só na 1ª vez)     depois: true (só da 2ª vez em diante)
   Retratos: depois da flag "retratos" (apagão), Problems e Xinglau só aparecem
     como bustos grandes nas laterais quando falam ou durante conversas.
   Sons: clac, apagao, baque, passos, porta, rangido, tlim, flash, sting, sting2,
     pista, notificacao, crash, gaveta, clique, susto
   ===================================================================== */
(function () {
  const f = (q, txt, exp, pose) => ({ fala: q, txt, exp, pose });
  const P = (txt, exp, pose) => f("problems", txt, exp, pose);
  const X = (txt, exp, pose) => f("xinglau", txt, exp, pose);
  const N = (txt) => ({ narra: txt });
  const D = (txt, exp, pose) => f("delegada", txt, exp, pose);

  // ---------- posições prontas ----------
  // Investigação: a delegada fica perto da janela do estúdio, o Felipe Neto perto do tripé
  // e a Giuliana na cozinha, perto da porta dos fundos. O resto fica na sala.
  const CENA_INV = {
    cena: {
      teo: { sala: "sala", x: 24 }, beto: { sala: "sala", x: 34 },
      duda: { sala: "sala", x: 49.5 }, gabi: { sala: "sala", x: 70 },
      caio: { sala: "estudio", x: 21, olha: 1 },
      nina: { sala: "cozinha", x: 79, pose: "cruzados", olha: -1 },
      delegada: { sala: "estudio", x: 52, y: 13, pose: "escrevendo", olha: -1 },
      leo: { sala: "estudio", x: 53, pose: "caido" }
    }, limpar: true
  };
  // depois do Mel (1ª observação): a Giuliana já voltou pra sala, o Mel ficou na cozinha
  const CENA_INV2 = {
    cena: {
      teo: { sala: "cozinha", x: 31 }, beto: { sala: "sala", x: 34 }, nina: { sala: "sala", x: 60 },
      duda: { sala: "sala", x: 49.5 }, gabi: { sala: "sala", x: 70 },
      caio: { sala: "estudio", x: 21, olha: 1 },
      delegada: { sala: "estudio", x: 52, y: 13, pose: "escrevendo", olha: -1 },
      leo: { sala: "estudio", x: 53, pose: "caido" }
    }, limpar: true
  };
  const CENA_TODOS_SALA = {
    cena: {
      teo: { sala: "sala", x: 18 }, nina: { sala: "sala", x: 28 }, beto: { sala: "sala", x: 38 },
      duda: { sala: "sala", x: 48 }, caio: { sala: "sala", x: 67.5 }, gabi: { sala: "sala", x: 77 },
      delegada: { sala: "estudio", x: 52, y: 13, pose: "escrevendo", olha: -1 },
      leo: { sala: "estudio", x: 53, pose: "coberto" }
    }, limpar: true
  };

  const R = {};
  // qualquer uma das 3 ligações do chaveiro já libera a acusação
  const sabe = (S) => fl(S, "lig_argola") || fl(S, "lig_kit") || fl(S, "lig_tlim");

  /* ===================== INTRO ===================== */
  R.intro = [
    { capitulo: "intro" }, { sala: "sala" }, { luz: "normal" }, { modo: "" },
    { cena: {
      teo: { sala: "sala", x: 9 }, gabi: { sala: "sala", x: 19 }, beto: { sala: "sala", x: 29 },
      problems: { sala: "sala", x: 39.5 }, leo: { sala: "sala", x: 50, exp: "feliz" }, xinglau: { sala: "sala", x: 60.5 },
      duda: { sala: "sala", x: 71 }, caio: { sala: "sala", x: 81 }, nina: { sala: "sala", x: 91 }
    }, limpar: true },
    { titulo: "SUSPEITOS", sub: "Caso 1 — Noite na Mansão", ms: 3200 },
    N("20:58 — Casa do Jazzghost. Ele quase nunca faz collab... então a \"Noite na Mansão\" é um evento. Lá fora, chove forte."),
    f("leo", "Beleza, galera! Cada um com o moletom de uma cor, pra thumb ficar colorida. Foto!", "feliz", "apontar"),
    f("beto", "Faz cara de assustado, é vídeo de mistério! Eu sou especialista, já resolvi o Mistério da Lagoa.", "feliz"),
    { som: "flash" }, { flash: true }, { espera: 700 },
    f("duda", "Ficou linda! Mas o Felipe piscou.", "feliz"),
    f("caio", "Eu sempre pisco. É um absurdo, mas eu sempre pisco.", "preocupado", "cabeca"),
    { som: "notificacao" }, { pos: "leo", pose: "celular", exp: "neutro" }, { espera: 900 },
    { pos: "leo", exp: "preocupado" }, { anim: "leo", a: "recuar" }, { espera: 900 },
    X("Jazz? Tá tudo bem?"),
    f("leo", "Tá. Quer dizer... preciso resolver uma coisa. Rapidinho.", "preocupado", "celular"),
    f("leo", "Ninguém mexe na minha câmera, hein. Já volto.", "preocupado", "neutro"),
    { som: "passos" }, { mover: "leo", x: 104, ms: 2600 }, { sai: "leo" }, { som: "porta" },
    P("Ele estava com uma cara estranha...", "preocupado"),
    f("teo", "Vou pegar uma água.", "neutro"),
    { mover: "teo", x: -6, ms: 1500 }, { sai: "teo" },
    f("gabi", "Banheiro. Já volto.", "neutro"),
    { mover: "gabi", x: -6, ms: 1800 }, { sai: "gabi" },
    { anim: "beto", a: "olhar" }, { espera: 700 },
    f("beto", "Eu vou ali rapidinho e já volto.", "feliz"),
    { mover: "beto", x: -6, ms: 1300 },
    P("Ali onde?"),
    { sai: "beto" },
    X("Ele já foi."),
    f("nina", "Amores, vou retocar a maquiagem. Já volto, tá bom?", "feliz", "cintura"),
    { mover: "nina", x: -6, ms: 3600 }, { sai: "nina" },
    f("duda", "Ai, eu trouxe uns docinhos pra gente e esqueci na mala, lá em cima.", "feliz"),
    f("duda", "Felipe, me ajuda a trazer?", "feliz", "apontar"),
    f("caio", "Vou. Mas eu escolho os docinhos. Se tiver de coco, eu vou reclamar. Muito.", "neutro", "cruzados"),
    { mover: "duda", x: -6, ms: 2800 }, { mover: "caio", x: -6, ms: 3000 }, { sai: "duda" }, { sai: "caio" },
    X("Só sobrou a gente.", "neutro", "cintura"),
    P("Esvaziou geral, hein.", "neutro"),
    { espera: 1500 },
    { som: "clac" }, { luz: "apagada" }, { som: "apagao" },
    { sai: "problems" }, { sai: "xinglau" }, { flag: "retratos" },
    { espera: 1300 },
    X("...Problems?", "assustado"),
    P("Tô aqui. Não tô vendo NADA.", "assustado"),
    X("Será que caiu a energia por causa da chuva?", "preocupado"),
    P("Pode ser. Mas só aqui? Lá fora a rua tá acesa.", "preocupado"),
    N("Lá de cima, um grito."),
    f("caio", "QUEM APAGOU A LUZ?! EU TAVA NO MEIO DE UM DOCINHO! ISSO É UM ABSURDO!", "bravo", "cabeca"),
    X("...É o Felipe.", "neutro"),
    P("Pelo menos ele tá vivo.", "neutro"),
    { espera: 1200 }, { som: "baque" }, { espera: 1600 },
    X("Você ouviu isso?", "assustado"),
    P("Veio do lado do estúdio.", "assustado"),
    X("Do estúdio... onde o Jazz foi.", "assustado"),
    { espera: 1800 },
    { som: "clac" }, { luz: "normal" },
    { cena: {
      teo: { sala: "sala", x: 15, exp: "preocupado" }, gabi: { sala: "sala", x: 26, exp: "preocupado" },
      beto: { sala: "sala", x: 37, exp: "preocupado" }, duda: { sala: "sala", x: 62, exp: "assustado" },
      caio: { sala: "sala", x: 73, exp: "bravo", pose: "cruzados" }, nina: { sala: "sala", x: 85, exp: "preocupado" }
    }, limpar: true },
    N("21:10 — A luz volta. Um por um, todo mundo volta pra sala."),
    f("teo", "Que susto. Tá todo mundo bem?", "preocupado"),
    P("...Cadê o Jazz?", "preocupado"),
    X("Jazz? JAZZ!", "assustado"),
    { som: "passos" }, { transicao: 900 },
    { sala: "estudio" },
    { cena: { leo: { sala: "estudio", x: 53, pose: "caido" } }, limpar: true },
    { som: "sting" }, { espera: 1800 },
    X("Não... não, não, não.", "assustado"),
    P("JAZZ?!", "assustado"),
    N("Jazzghost está caído no chão do estúdio. Ele não se mexe."),
    f("duda", "ALGUÉM CHAMA AJUDA!", "assustado"),
    { transicao: 1100 },
    { pos: "delegada", sala: "estudio", x: 52, y: 13, pose: "neutro", exp: "neutro", olha: -1 },
    { conversa: "delegada" },
    D("Polícia. Delegada Ramos. Eu moro aqui do lado, ouvi os gritos."),
    D("...Ele morreu. Pancada na cabeça. Isso não foi acidente.", "preocupado"),
    D("A estrada tá alagada. A perícia só chega de manhã. Ninguém sai desta casa.", "bravo", "apontar"),
    D("Quem matou o Jazzghost ainda está aqui dentro. É um de vocês.", "bravo"),
    X("A gente pode ajudar. A gente é bom em investigar esse tipo de coisa.", "superfeliz"),
    D("Ah, é? Dois youtubers brincando de detetive na minha cena do crime?", "bravo", "cruzados"),
    P("A gente só quer descobrir quem fez isso com o Jazz.", "preocupado"),
    { espera: 900 },
    D("...", "neutro", "cruzados"),
    D("Apenas não saiam da casa. E, se quiserem descobrir alguma coisa por conta própria, não toquem em nada sem luvas.", "neutro", "apontar"),
    D("Agora me deixem, que eu vou começar a escrever a papelada e analisar a vítima.", "neutro", "escrevendo"),
    { conversa: null },
    N("Cada um vai pra um canto da casa. A Giuliana diz que precisa de ar e vai pra cozinha. O Felipe Neto... fica rondando o estúdio."),
    CENA_INV,
    { capitulo: "inv1" },
    { titulo: "Quem matou o Jazzghost?", sub: "", ms: 2400 }
  ];

  /* ===================== OBJETOS — SALA ===================== */
  R.obj_kit = [
    N("Uma caixa com o logo da collab. Dentro, moletons extras e um cartãozinho."),
    { pista: "kit" },
    X("Cada convidado ganhou um moletom da collab e um chaveirinho de bicho. Que fofo.", "feliz", null),
    P("Eu não ganhei chaveiro nenhum.", "bravo", "cruzados"),
    X("A gente entrou na collab de última hora, lembra?", "neutro"),
    { ...P("A coruja ficou com o Felipe Neto. Faz sentido.", "neutro"), primeira: true }
  ];
  R.obj_pelucia = [
    N("Um bicho de pelúcia em forma de câmera. Tem um nome bordado: \"LENTINHO\"."),
    { ...P("Ele tá olhando pra mim."), primeira: true },
    { ...X("Tem um zíper nas costas. Tá emperrado."), primeira: true },
    { ...P("O Lentinho continua me julgando."), depois: true }
  ];
  R.obj_mochila = [
    N("A mochila do Jazz. Cabos, baterias... e um caderno aberto."),
    { pista: "caderno" },
    X("\"Sorteios falsos\"?! Alguém aqui tava enganando os fãs.", "assustado"),
    P("\"Justo quem eu mais confiava\"... era alguém próximo dele.", "preocupado"),
    { flag: "motivo" }
  ];
  R.obj_janela_sala = [
    N("Chuva forte. Lá fora, a rua virou um rio."),
    P("Ninguém entra, ninguém sai. Clássico.")
  ];
  R.obj_placas_parede = [
    N("Fotos do Jazz com placas e troféus. Quase nenhuma com outros youtubers. Ele sempre fez tudo sozinho."),
    { ...X("Por isso essa collab era tão especial. Todo mundo largou tudo pra vir.", "preocupado"), primeira: true }
  ];

  /* ===================== OBJETOS — ESTÚDIO ===================== */
  R.obj_corpo = [
    { ...N("O Jazz está estirado no chão do estúdio. Tem sangue perto da cabeça."), se: (S) => S.pos.leo.pose === "caido" },
    { ...N("A delegada cobriu o Jazz com um lençol."), se: (S) => S.pos.leo.pose !== "caido" },
    { ...X("Ele tava rindo com a gente dez minutos atrás...", "preocupado"), primeira: true },
    { ...P("O braço dele tá esticado. Como se tivesse tentado agarrar alguma coisa.", "preocupado"), primeira: true },
    { ...P("Melhor não mexer. A gente nem tá de luva."), depois: true }
  ];
  R.obj_placa = [
    N("A Placa de Prata do Jazz. A primeira de todas, de 100 mil inscritos. Ele guardava de lembrança."),
    { pista: "placa" },
    P("Tem sangue na ponta.", "preocupado"),
    { ...X("Usaram a própria placa dele... Que coisa horrível.", "preocupado"), primeira: true }
  ];
  R.obj_camera = [
    N("A câmera do Jazz, no tripé. A tampinha do cartão de memória tá aberta."),
    { pista: "camera" },
    { ...X("Cadê o cartão?", "preocupado"), primeira: true },
    { ...P("Ele falou \"ninguém mexe na minha câmera\"... e alguém mexeu.", "bravo"), primeira: true },
    { ...P("Continua sem cartão."), depois: true }
  ];
  R.obj_argola = [
    N("Uma argolinha de metal no chão, aberta e torta."),
    { pista: "argola" },
    P("De chaveiro? De brinco? De caderno?"),
    X("Pode ser de qualquer coisa. Mas tava bem do lado da mão dele.", "preocupado")
  ];
  R.obj_celular = [
    N("O celular do Jazz. Aberto no grupo da collab."),
    { pista: "celular" },
    X("Uma mensagem apagada às 21:01. E o Jazz respondeu: \"tá. vou agora. sozinho.\"", "preocupado"),
    P("Alguém chamou ele pro estúdio... e depois apagou a mensagem.", "bravo"),
    { ...X("Todo mundo tá nesse grupo. Pode ter sido qualquer um."), primeira: true }
  ];
  R.obj_janela_est = [
    N("A janela está trancada por dentro. O parapeito tá cheio de poeira, sem nenhuma marca."),
    { pista: "janela" },
    P("Ninguém entrou por aqui."),
    X("Então quem fez isso veio de dentro da casa.", "preocupado")
  ];
  R.obj_computador = [
    N("O computador do Jazz. Bloqueado com senha."),
    { ...P("Tenta \"123456\"."), primeira: true },
    { ...N("Não era."), primeira: true }
  ];
  R.obj_computador_depois = [
    N("A tela continua ligada. Janela de importação: \"PROVA_sorteios.mp4 — origem: cartão de memória — CARTÃO NÃO ENCONTRADO\".")
  ];
  R.obj_gaveta = [
    N("A gaveta da mesa do Jazz."),
    { ...P("Melhor não mexer. A delegada falou: nada sem luva."), primeira: true }
  ];
  R.obj_gaveta_depois = [
    { examinar: "gaveta" }, { som: "gaveta" },
    N("Vocês puxam a gaveta da mesa. Cartões de memória reserva espalhados. Todos vazios."),
    { ...X("Quem revirou isso tava atrás de UM cartão específico."), primeira: true }
  ];

  /* ===================== OBJETOS — COZINHA ===================== */
  R.obj_quadro = [
    N("O quadro de luz. A chave geral tá ligada agora."),
    { pista: "disjuntor" },
    { ...X("Não tinha nada ligado que derrubasse a energia. Nem forno, nem chuveiro.", "preocupado"), se: (S) => !tem(S, "teo") },
    { ...P("Então a luz não caiu sozinha...", "preocupado"), se: (S) => !tem(S, "teo") },
    { ...P("Foi aqui que o Mel ouviu o CLAC. Alguém desligou na mão.", "bravo"), se: (S) => tem(S, "teo") }
  ];
  R.obj_freezer = [
    N("A geladeira. O congelador tá lotado de potes de sorvete de chocolate."),
    X("Quem compra TANTO sorvete?")
  ];
  R.obj_freezer_depois = [N("A geladeira do Mel."), P("Agora a gente sabe de quem é o sorvete.", "feliz")];
  R.obj_despensa = [
    N("A despensa. Prateleiras, enlatados e um pacote de biscoito integral fechado."),
    { ...P("Tem espaço pra duas pessoas aqui dentro. Bom saber."), se: (S) => S.capitulo === "plano" || S.capitulo === "isca" }
  ];
  R.obj_pote = [
    N("O pote de biscoito... não tem biscoito. Tem cacos de vidro."),
    { pista: "lente" },
    X("Isso é uma lente de câmera quebrada! Lente cara!", "assustado"),
    P("Alguém quebrou coisa do Jazz e escondeu.", "preocupado")
  ];
  R.obj_lixo = [
    N("No lixo, uma garrafinha escrito \"SANGUE CENOGRÁFICO\". Quase vazia."),
    { pista: "sangue" },
    X("SANGUE?!", "assustado", "cabeca"),
    P("Cenográfico. Falso. ...Mas por que alguém traria sangue falso pra cá?", "preocupado")
  ];
  R.obj_porta_fundos = [
    { flag: "g_porta" },
    N("Porta dos fundos. Trancada, com a chave na fechadura do lado de dentro."),
    P("Mais uma prova de que ninguém veio de fora.")
  ];

  /* ===================== CONVERSAS ===================== */
  window.TOPICOS = {
    delegada: [
      { id: "papel", txt: "Delegada, descobriu alguma coisa?", seq: "delegada_papel" },
      { id: "acusar", txt: "A gente sabe quem foi.", se: (S) => S.capitulo === "pos" && (sabe(S) || (S.cont.nada || 0) >= 4), seq: "pre_acusacao" }
    ],
    teo: [
      { id: "onde", txt: "Onde você estava no apagão?", seq: "teo_onde" },
      { id: "leo", txt: "Como era o Jazz?", seq: "teo_leo" },
      { id: "ouviu", txt: "Repete o que você ouviu.", se: (S) => fl(S, "obs1ok"), seq: "teo_ouviu" }
    ],
    gabi: [
      { id: "onde", txt: "Onde você estava no apagão?", seq: "gabi_onde" },
      { id: "leo", txt: "Como era o Jazz?", seq: "gabi_leo" },
      { id: "banheiro", txt: "Mais alguém disse que tava no banheiro.", se: (S) => fl(S, "alibi_gabi") && (fl(S, "alibi_nina") || fl(S, "alibi_teo")), seq: "gabi_banheiro" }
    ],
    beto: [
      { id: "onde", txt: "Onde você estava no apagão?", seq: "beto_onde" },
      { id: "leo", txt: "Como era o Jazz?", seq: "beto_leo" },
      { id: "sangue", txt: "Sangue falso no lixo, Enaldinho?", se: (S) => tem(S, "sangue"), seq: "beto_sangue" }
    ],
    duda: [
      { id: "onde", txt: "Onde você estava no apagão?", seq: "duda_onde" },
      { id: "leo", txt: "Como era o Jazz?", seq: "duda_leo" },
      { id: "lente", txt: "A lente no pote de biscoito...", se: (S) => tem(S, "lente"), seq: "duda_lente" }
    ],
    caio: [
      { id: "estudio", txt: "O que você tá fazendo no estúdio?", se: (S) => S.pos.caio && S.pos.caio.sala === "estudio", seq: "caio_estudio" },
      { id: "onde", txt: "Onde você estava no apagão?", seq: "caio_onde" },
      { id: "leo", txt: "Como era o Jazz?", seq: "caio_leo" },
      { id: "sorteio", txt: "Você faz sorteio?", se: (S) => fl(S, "motivo"), seq: "caio_sorteio" },
      { id: "beto", txt: "O Enaldinho disse que tava na varanda.", se: (S) => fl(S, "alibi_beto") && !fl(S, "beto_ok"), seq: "caio_beto" }
    ],
    nina: [
      { id: "cozinha", txt: "O que você tá fazendo aqui na cozinha?", se: (S) => S.pos.nina && S.pos.nina.sala === "cozinha", seq: "nina_cozinha" },
      { id: "onde", txt: "Onde você estava no apagão?", seq: "nina_onde" },
      { id: "leo", txt: "Como era o Jazz?", seq: "nina_leo" },
      { id: "sorteio", txt: "Você faz sorteio?", se: (S) => fl(S, "motivo"), seq: "nina_sorteio" },
      { id: "gabi", txt: "A Bruna disse que ficou sozinha no banheiro.", se: (S) => fl(S, "contradicao"), seq: "nina_gabi" }
    ]
  };

  // --- Delegada: no começo só papelada; depois do Mel, revela o laudo ---
  R.delegada_papel = [
    { flag: "laudo_antes", se: (S) => tem(S, "laudo") },
    { ...D("Estou ainda preenchendo a papelada e vou olhar a vítima ainda.", "neutro", "escrevendo"), se: (S) => !fl(S, "obs1ok") },
    { ...D("Agora sim. Terminei de olhar a vítima.", "neutro", "escrevendo"), se: (S) => fl(S, "obs1ok") && !tem(S, "laudo") },
    { ...D("Ele morreu durante o apagão. Entre 21:06 e 21:10.", "neutro", "cruzados"), se: (S) => fl(S, "obs1ok") && !tem(S, "laudo") },
    { ...D("E tinha um fiapo de moletom preso na unha dele. Ele agarrou o bolso de quem fez isso.", "preocupado", "cruzados"), se: (S) => fl(S, "obs1ok") && !tem(S, "laudo") },
    { ...X("Fiapo de moletom... todo mundo aqui tá de moletom.", "preocupado"), se: (S) => fl(S, "obs1ok") && !tem(S, "laudo") },
    { ...P("Mas se ele agarrou o bolso... pode ter arrancado alguma coisa.", "preocupado", "cabeca"), se: (S) => fl(S, "obs1ok") && !tem(S, "laudo") },
    { pista: "laudo", se: (S) => fl(S, "obs1ok") },
    { ...D("Já falei o que sei. Agora me deixem trabalhar.", "neutro", "escrevendo"), se: (S) => fl(S, "laudo_antes") && S.capitulo !== "pos" },
    { ...D("Vocês acharam uma coisa caída hoje à noite. E uma argolinha no estúdio, lembram? Abram as pistas e liguem uma na outra.", "neutro", "cruzados"), se: (S) => S.capitulo === "pos" && !sabe(S) },
    { ...D("Se vocês já sabem, é só me dizer.", "neutro", "cruzados"), se: (S) => S.capitulo === "pos" && sabe(S) }
  ];

  // --- Mel (id teo) ---
  R.teo_onde = [
    { ...f("teo", "Eu? No banheiro. Fiquei lá o apagão inteiro.", "preocupado", "cruzados"), se: (S) => !fl(S, "obs1ok") },
    { ...X("Ué. Mas você não falou que ia pegar uma água?", "neutro"), se: (S) => !fl(S, "obs1ok") },
    { ...f("teo", "É... depois eu fui no banheiro. Uma coisa leva à outra, né? Água entra, água sai.", "preocupado", "cabeca"), se: (S) => !fl(S, "obs1ok") },
    { ...P("Hmm.", "neutro", "cruzados"), se: (S) => !fl(S, "obs1ok") },
    { ...f("teo", "...Na cozinha. Atrás da porta da geladeira. Com o sorvete. Vocês sabem.", "preocupado", "cabeca"), se: (S) => fl(S, "obs1ok") },
    { flag: "alibi_teo" }
  ];
  R.teo_leo = [f("teo", "O Jazz era gente boa demais. Me ensinou a jogar Minecraft. Eu ainda caio na lava, mas ele tentou.", "preocupado")];
  R.teo_ouviu = [
    f("teo", "Um CLAC ali no quadro de luz, do meu lado. Tudo apagou. E alguém passou rápido pro corredor do estúdio.", "preocupado"),
    f("teo", "Fazendo um barulhinho... tlim-tlim, tlim-tlim.", "preocupado"), { som: "tlim" }
  ];
  // --- Bruna (id gabi) ---
  R.gabi_onde = [f("gabi", "No banheiro. Tranquei a porta e fiquei lá até a luz voltar. Sozinha.", "neutro", "cruzados"), { flag: "alibi_gabi" }];
  R.gabi_leo = [
    { ...f("gabi", "Ele ia postar um vídeo meu na collab... Deixa pra lá.", "preocupado"), se: (S) => !fl(S, "gabi_ok") },
    { ...f("gabi", "Ele quase nunca chama ninguém pra gravar. Ser chamada foi um sonho... e ele gravou justo meu pior momento.", "preocupado"), se: (S) => fl(S, "gabi_ok") }
  ];
  R.gabi_banheiro = [
    f("gabi", "Impossível. Eu fiquei lá trancada o tempo TODO. Ninguém entrou.", "bravo", "cintura"),
    { flag: "contradicao" },
    X("Então alguém mentiu.", "preocupado")
  ];
  // --- Enaldinho (id beto) ---
  R.beto_onde = [
    { ...f("beto", "Na varanda, tomando um ar. De boa.", "feliz"), se: (S) => !fl(S, "beto_ok") },
    { ...f("beto", "Na área de serviço, todo melado de sangue falso. Já falei!", "preocupado"), se: (S) => fl(S, "beto_ok") },
    { flag: "alibi_beto" }
  ];
  R.beto_leo = [f("beto", "O Jazz era o único que topava TODOS os meus desafios. Até o de 100 camadas de gelatina.", "preocupado")];
  R.beto_sangue = [
    f("beto", "Ô! Não é o que parece!", "assustado", "cabeca"),
    f("beto", "Eu ia fazer uma pegadinha pro vídeo: me fingir de morto quando a luz apagasse.", "preocupado"),
    f("beto", "Fui na área de serviço me preparar... e apagou DE VERDADE. E aí... o Jazz...", "preocupado"),
    f("beto", "Joguei a garrafa fora na hora. Fiquei com medo de acharem que era eu.", "preocupado", "cruzados"),
    P("Então você não tava na varanda."),
    f("beto", "Não. Mas também não vi nada! Juro!", "preocupado"),
    { flag: "beto_ok" }
  ];
  // --- Jujubinha (id duda) ---
  R.duda_onde = [f("duda", "Lá em cima, com o Felipe, pegando os docinhos. E então... apagou tudo, e ele ficou reclamando no meu ouvido sem parar. Fim da história.", "neutro"), { flag: "alibi_duda" }];
  R.duda_leo = [f("duda", "Ele era MUITO cuidadoso com os equipamentos dele. Muito.", "preocupado")];
  R.duda_lente = [
    f("duda", "NÃO CONTA PRO JAZZ!", "assustado", "cabeca"),
    { espera: 900 },
    f("duda", "...ai. Desculpa. É o costume.", "preocupado"),
    f("duda", "Eu derrubei a lente dele de tarde. Escondi no pote porque ninguém come meu biscoito integral.", "preocupado"),
    { flag: "duda_ok" }
  ];
  // --- Felipe Neto (id caio) ---
  R.caio_estudio = [
    f("caio", "Eu? Nada! Só fiquei curioso e vim dar uma olhada.", "neutro", "cruzados"),
    P("Numa cena de crime?", "neutro"),
    f("caio", "Mataram o Jazz, gente. O JAZZ. Dentro de uma collab! Isso é um absurdo. Um ABSURDO!", "bravo", "apontar"),
    f("caio", "Eu não tô mexendo em nada. Só olhando. Com os olhos. Que é de graça.", "neutro", "cruzados"),
    { ...D("Ele não sai daqui por nada. Pelo menos não toca em nada.", "neutro", "escrevendo"), primeira: true }
  ];
  R.caio_onde = [f("caio", "Lá em cima com a Jujubinha. Reclamando do escuro, sim. Com toda a razão. Mas lá em cima.", "bravo", "cruzados"), { flag: "alibi_caio" }];
  R.caio_leo = [f("caio", "O maior gamer do Brasil, eu sempre falei. E o cara fazia tudo sozinho! Collab com o Jazz é evento. Todo mundo aqui largou tudo pra vir hoje.", "preocupado")];
  R.caio_sorteio = [
    f("caio", "Faço! Mas os meus são de verdade. Eu filmo até o ganhador recebendo.", "feliz"),
    f("caio", "Agora... tem gente aqui que faz sorteio e nunca mostra ganhador nenhum. Não vou falar quem.", "neutro", "cruzados")
  ];
  R.caio_beto = [
    f("caio", "Na varanda? Da janela lá de cima dá pra ver a varanda. Não tinha ninguém lá. Só chuva.", "neutro"),
    { flag: "beto_mentiu" },
    X("Então o Enaldinho mentiu.", "preocupado")
  ];
  // --- Giuliana Mafra (id nina) ---
  R.nina_cozinha = [
    f("nina", "Vim pegar um ar, amores. Lá na sala tava todo mundo se olhando torto.", "preocupado", "cruzados"),
    f("nina", "Eu tô assustada também, tá? Tem um assassino nessa casa!", "assustado", "cabeca"),
    f("nina", "E eu tenho uma teoria: e se foi alguém de fora? Pela porta dos fundos?", "neutro", "apontar"),
    { ...X("A porta dos fundos tá trancada por dentro...", "neutro"), se: (S) => fl(S, "g_porta") },
    { ...P("Vou dar uma olhada nessa porta depois.", "neutro"), se: (S) => !fl(S, "g_porta") }
  ];
  R.nina_onde = [f("nina", "Retocando a maquiagem no banheiro, amor. A luz apagou e eu fiquei lá esperando.", "neutro"), { flag: "alibi_nina" }];
  R.nina_leo = [f("nina", "O Jazz era... meu amigo. Meu melhor amigo nessa casa. Vocês sabiam que ele odiava creeper? Fato curioso.", "preocupado")];
  R.nina_sorteio = [
    f("nina", "Às vezes. Por quê?", "neutro"),
    { espera: 700 },
    f("nina", "Todo mundo faz sorteio, gente.", "neutro", "cruzados")
  ];
  R.nina_gabi = [
    f("nina", "Então a Bruna tá mentindo.", "bravo", "cruzados"),
    { espera: 800 },
    f("nina", "...Ou eu me confundi de banheiro. Essa casa é enorme.", "neutro")
  ];

  /* ===================== 1ª OBSERVAÇÃO — MEL =====================
     Acontece enquanto vocês conversam com alguém na sala. */
  R.obs1_inicio = [
    { espera: 500 },
    { anim: "teo", a: "olhar" }, { espera: 1300 },
    { pos: "teo", pose: "escondendo" },
    { mover: "teo", x: -6, ms: 3200 }, { sai: "teo" },
    { pos: "nina", sala: "sala", x: -6, vis: true, pose: "neutro", exp: "preocupado", olha: 1 },
    { mover: "nina", x: 60, ms: 2600 },
    f("nina", "Voltei, amores. Tá um frio lá na cozinha... e o Mel passou por mim correndo, todo estranho.", "preocupado", "cruzados"),
    X("Psiu... é verdade, olha o Mel. Saiu de fininho.", "preocupado"),
    P("Olhou pros lados antes. Foi pra cozinha.", "preocupado"),
    X("Vamos seguir ele e ver o que ele vai fazer.", "neutro"),
    { pos: "teo", sala: "cozinha", x: 31, vis: false },
    { capitulo: "obs1" }
  ];
  R.obs1_espiar = [
    { modo: "espiar" },
    { pos: "teo", sala: "cozinha", x: 31, vis: true, pose: "escondendo", exp: "preocupado", olha: -1 },
    { espera: 900 },
    X("Ele tá ali, na geladeira.", "preocupado"),
    P("Tá escondendo alguma coisa debaixo do moletom...", "preocupado"),
    { clique: { x: 13, y: 26, w: 26, h: 60, rotulo: "Chegar mais perto" } },
    { som: "passos" }, { anim: "teo", a: "olhar" }, { espera: 900 },
    f("teo", "...ninguém pode saber. Ninguém.", "preocupado", "escondendo"),
    { clique: { x: 13, y: 26, w: 26, h: 60, rotulo: "Espiar" } },
    { pos: "teo", pose: "pote", exp: "feliz" }, { espera: 800 },
    f("teo", "...chocolate com flocos. Ai ai, que delícia!", "feliz", "pote"),
    { escolha: [
      { txt: "Pular na frente dele", seq: "obs1_confronto" },
      { txt: "Continuar olhando", seq: "obs1_mais" }
    ] }
  ];
  R.obs1_mais = [
    f("teo", "Se a Dieta Zero descobre, eu perco o patrocínio... e o canal... e a dignidade.", "feliz", "pote"),
    { ir: "obs1_confronto" }
  ];
  R.obs1_confronto = [
    { modo: "" }, { som: "susto" }, { conversa: "teo" },
    X("MEL!", "bravo", "apontar"),
    { anim: "teo", a: "pular" },
    f("teo", "AAAH! Não é o que vocês tão pensando!", "assustado", "cabeca"),
    P("Você disse que tava no banheiro.", "bravo"),
    f("teo", "Eu sou patrocinado pela Dieta Zero. Se descobrem que eu como sorvete escondido...", "preocupado", "pote"),
    X("Então no apagão você tava...", "preocupado"),
    f("teo", "Aqui. Agachado atrás da porta da geladeira, comendo. Ninguém me via... e eu não via ninguém.", "preocupado", "neutro"),
    f("teo", "Mas eu ouvi uma coisa. Teve um CLAC ali no quadro de luz, do meu lado... e tudo apagou.", "preocupado"),
    f("teo", "Aí alguém passou rápido por aqui, indo pro corredor do estúdio.", "preocupado"),
    f("teo", "Fazendo um barulhinho... tlim-tlim. Tlim-tlim.", "assustado"), { som: "tlim" },
    P("Tlim-tlim?"),
    f("teo", "Tipo moeda no bolso, sei lá. Fiquei com medo. Depois fui no quadro...", "preocupado"),
    f("teo", "A chave geral tava ABAIXADA. Alguém desligou. Eu liguei de volta.", "preocupado", "apontar"),
    { pista: "teo" }, { pista: "disjuntor" },
    X("O apagão foi de propósito.", "assustado"),
    P("E quem fez isso passou do lado do Mel, indo pro estúdio.", "bravo"),
    f("teo", "Por favor... não conta do sorvete.", "preocupado", "cabeca"),
    { pos: "teo", pose: "neutro", olha: 1 },
    { flag: "obs1ok" }, { capitulo: "inv2" }
  ];

  /* ===================== 2ª OBSERVAÇÃO — BRUNA =====================
     Acontece enquanto vocês conversam com outra pessoa na sala. */
  R.obs2_inicio = [
    { pos: "delegada", sala: "sala", x: 102, y: 0, vis: true, pose: "neutro", olha: -1 },
    { mover: "delegada", x: 87, ms: 1400 },
    D("Vou lá fora, no rádio da viatura, pedir reforço. Dez minutos.", "neutro"),
    { pos: "caio", sala: "sala", x: 102, vis: true, pose: "neutro", exp: "bravo", olha: -1 },
    { mover: "caio", x: 82, ms: 1500 },
    D("Cobri o corpo. Ninguém entra no estúdio. Nem você, Felipe.", "bravo", "apontar"),
    f("caio", "Eu só tava OLHANDO. Isso é um absurdo.", "bravo", "cruzados"),
    { mover: "delegada", x: -6, ms: 4200 }, { sai: "delegada" }, { som: "porta" },
    { pos: "leo", pose: "coberto" },
    { espera: 1400 },
    { anim: "gabi", a: "olhar" }, { espera: 1300 },
    { mover: "gabi", x: 104, ms: 2000 }, { sai: "gabi" }, { som: "porta" },
    P("A Bruna... entrou no estúdio.", "preocupado"),
    X("A delegada ACABOU de falar pra ninguém entrar lá. Vamos seguir ela e ver o que ela vai aprontar.", "assustado"),
    { pos: "gabi", sala: "estudio", x: 80, vis: false },
    { capitulo: "obs2" }
  ];
  R.obs2_espiar = [
    { modo: "espiar" },
    { pos: "gabi", sala: "estudio", x: 80, vis: true, pose: "celular", exp: "preocupado", olha: 1 },
    { espera: 700 },
    { som: "clique" }, { flag: "pcLigado" }, { som: "notificacao" },
    { espera: 900 },
    X("Ela ligou o computador do Jazz.", "preocupado"),
    P("Ela sabia a senha...", "bravo"),
    { clique: { x: 72, y: 24, w: 20, h: 26, rotulo: "Olhar a tela" } },
    N("Na tela: \"Excluir bruna_rage_chorando.mp4?\" — o cursor dela tá em cima do SIM."),
    f("gabi", "Some... some, some, some...", "preocupado", "celular"),
    { som: "clique" }, { flag: "pcApagou" }, { espera: 600 },
    f("gabi", "Pronto. Agora um pendrive... deve ter na gaveta.", "neutro"),
    { som: "gaveta" }, { anim: "gabi", a: "recuar" },
    f("gabi", "Ué... quem fez essa bagunça?", "assustado", "cabeca"),
    { escolha: [{ txt: "Aparecer", seq: "obs2_confronto" }] }
  ];
  R.obs2_confronto = [
    { modo: "" }, { conversa: "gabi" },
    { anim: "gabi", a: "pular" },
    f("gabi", "Ei! O que vocês estão fazendo aqui?!", "bravo", "cintura"),
    X("Na real é você que precisa dizer por que está aqui!", "bravo", "apontar"),
    P("Você tá apagando provas?", "bravo"),
    f("gabi", "NÃO! Era um vídeo MEU. Eu perdi uma partida e chorei. Muito. Babando.", "preocupado"),
    f("gabi", "O Jazz ia pôr na collab. Eu morro de vergonha. Só isso. Eu juro.", "preocupado", "cabeca"),
    X("E essa gaveta?", "preocupado"),
    f("gabi", "Já tava assim! Alguém revirou tudo antes de mim.", "assustado", "apontar"),
    { som: "gaveta" }, { examinar: "gaveta" },
    f("gabi", "Olha os cartões reserva, todos jogados.", "assustado", "apontar"),
    { pista: "gaveta" }, { examinar: null },
    f("gabi", "E antes de eu apagar meu vídeo, tinha uma janela aberta no computador...", "preocupado"),
    N("\"PROVA_sorteios.mp4 — origem: cartão de memória — CARTÃO NÃO ENCONTRADO\"."),
    { pista: "computador" },
    f("gabi", "O Jazz ia passar esse vídeo pro computador. Mas o cartão nunca chegou aqui.", "preocupado"),
    { flag: "gabi_ok" },
    { ir: "ideia_isca" }
  ];
  R.ideia_isca = [
    { conversa: "gabi" },
    P("Pera. A câmera tá sem cartão.", "preocupado"),
    X("E o vídeo da prova tava no cartão.", "preocupado"),
    P("Alguém revirou essa gaveta atrás de cartão de memória.", "preocupado", "cabeca"),
    X("Se o assassino tivesse achado, não precisava revirar nada.", "assustado"),
    P("...Então ele ainda NÃO achou.", "assustado"),
    X("E ainda tá procurando.", "bravo"),
    P("E se ele achar que a GENTE achou?", "feliz", "apontar"),
    X("Ele vai tentar pegar. Hoje. Antes da polícia levar.", "superfeliz"),
    f("gabi", "Pega um desses cartões vazios. Ninguém vai saber a diferença.", "neutro", "cruzados"),
    { conversa: null },
    { som: "porta" },
    { pos: "delegada", sala: "estudio", x: -6, y: 13, vis: true, pose: "neutro", exp: "bravo", olha: 1 },
    { mover: "delegada", x: 52, ms: 2400 },
    D("Bruna?! Eu falei que ninguém entra aqui. Pra sala. Agora.", "bravo", "apontar"),
    { mover: "gabi", x: -6, ms: 2600 }, { sai: "gabi" },
    { pos: "gabi", sala: "sala", x: 70, vis: true, pose: "neutro", exp: "preocupado", olha: 1 },
    D("Reforço só de manhã. A estrada continua alagada.", "neutro", "escrevendo"),
    { capitulo: "plano" },
    P("Pega um cartão vazio da gaveta. Depois a gente conta pra todo mundo.", "neutro")
  ];
  R.pegar_cartao = [
    { examinar: "gaveta" }, { som: "gaveta" },
    N("Vocês puxam a gaveta de novo e pegam um cartão de memória vazio. Igualzinho ao do Jazz."),
    { examinar: null },
    { flag: "pegouCartao" }, { som: "pista" },
    X("Agora é juntar todo mundo na sala.", "superfeliz")
  ];

  /* ===================== ANÚNCIO + NOITE NA COZINHA ===================== */
  R.anuncio = [
    CENA_TODOS_SALA,
    { cena: { delegada: { sala: "sala", x: 87, y: 0, pose: "escrevendo" } } },
    P("Gente, junta todo mundo aqui. A gente precisa conversar.", "neutro", "apontar"),
    X("O que a gente sabe até agora: alguém mandou uma mensagem chamando o Jazz pro estúdio. E depois apagou.", "neutro"),
    P("A janela do estúdio tava trancada por dentro. Quem fez isso já tava aqui dentro da casa.", "neutro"),
    X("E o apagão não foi acidente. Alguém desligou a luz de propósito.", "bravo"),
    f("beto", "Então foi tudo planejado?!", "assustado", "cabeca"),
    f("caio", "Eu FALEI que tinha alguma coisa estranha nessa noite. Eu falei!", "bravo", "apontar"),
    f("duda", "Não é a casa, Felipe. É alguém daqui.", "preocupado"),
    { espera: 800 },
    P("E tem mais. O Jazz ia mostrar um vídeo hoje. Uma prova contra alguém que tá nessa sala.", "preocupado"),
    X("A prova tava num cartão de memória.", "neutro", "celular"),
    X("E a gente achou.", "neutro", "celular"),
    { som: "sting" },
    { cena: { teo: { exp: "assustado" }, nina: { exp: "assustado" }, beto: { exp: "assustado" }, duda: { exp: "assustado" }, caio: { exp: "assustado" }, gabi: { exp: "neutro" } } },
    { espera: 1200 },
    f("teo", "E o que tem no vídeo?!", "assustado"),
    P("Ainda não deu pra ver.", "neutro"),
    D("E nem vai dar. Isso é prova. Se alguém mexer nesse cartão, não vale mais nada no tribunal.", "bravo", "apontar"),
    D("Fica lacrado até a polícia levar, de manhã.", "neutro", "cruzados"),
    f("nina", "Que bom. Que bom mesmo. Ainda bem que tá seguro.", "feliz"),
    X("Então a gente fica de guarda. A gente vai dormir na cozinha, com o cartão.", "neutro"),
    f("teo", "Eu vou dormir de luz acesa.", "preocupado", "cruzados"),
    f("gabi", "Eu vou dormir de porta trancada.", "neutro", "cruzados"),
    f("beto", "Se precisarem de ajuda, me chamem. ...Mentira, não me chamem.", "preocupado"),
    P("Boa noite, gente.", "neutro"),
    { transicao: 1800, txt: "23:40" },
    { capitulo: "isca" },
    { sala: "cozinha" }, { luz: "normal" },
    { cena: { leo: { sala: "estudio", x: 53, pose: "coberto" } }, limpar: true },
    { flag: "cama" },
    N("Na cozinha, o Problems arruma dois cobertores e uns travesseiros no chão... com formato de gente."),
    X("Isso aí sou eu?", "neutro"),
    P("É você dormindo.", "feliz"),
    X("Eu não durmo assim.", "bravo", "cruzados"),
    P("Agora dorme.", "feliz"),
    P("O cartão fica na gaveta. A gente fica escondido na despensa, de olho.", "neutro"),
    { som: "clac" }, { luz: "isca" },
    N("Vocês apagam a luz e se escondem na despensa, com a porta entreaberta."),
    X("Shh. Celular na mão. Flash ligado.", "preocupado"),
    P("Se alguém entrar, a gente fotografa. Três fotos, no máximo, antes de perceberem.", "preocupado"),
    { espera: 2600 }, { som: "rangido" }, { espera: 1700 }, { som: "passos" },
    { minigame: "isca" },
    { som: "crash" }, { som: "tlim" },
    X("BATEU NA PRATELEIRA!", "assustado"),
    P("VAI, VAI! ATRÁS DELE!", "assustado", "apontar"),
    { som: "passos" },
    X("Ele foi pro corredor!", "assustado"),
    { som: "baque" },
    P("AI! Tropecei no cobertor!", "assustado", "cabeca"),
    { transicao: 700 },
    { sala: "sala" },
    X("Sumiu... Subiu a escada?", "bravo"),
    N("Lá em cima, um corredor cheio de portas fechadas. Pode ter entrado em qualquer quarto."),
    P("Perdemos ele.", "bravo"),
    { transicao: 700 },
    { sala: "cozinha" }, { som: "clac" }, { luz: "normal" },
    X("Acendi a luz. Bora ver se ficou alguma coisa pra trás.", "neutro"),
    { pista: "fotos" },
    P("Nas fotos só dá pra ver um moletom da collab, com o capuz. Aquele que veio no kit.", "preocupado"),
    X("Pera. Caiu alguma coisa ali no chão.", "preocupado", "apontar"),
    { flag: "chaveiroNoChao" }
  ];
  R.obj_chaveiro = [
    N("Um chaveirinho de raposa. A argolinha dele tá arrebentada."),
    { pista: "chaveiro" },
    X("Isso caiu do bolso de quem entrou aqui.", "assustado"),
    { ...P("Raposa... cada convidado ganhou um bichinho no kit de boas-vindas, lá na sala. Dá pra ver de quem era.", "preocupado", "cabeca"), se: (S) => !tem(S, "kit") },
    { transicao: 900 },
    { sala: "sala" }, { capitulo: "pos" },
    CENA_TODOS_SALA,
    { cena: { delegada: { sala: "sala", x: 87, y: 0, pose: "cruzados" } } },
    D("Que barulheira foi essa?!", "bravo"),
    f("caio", "Eu tava dormindo! Até essa barulheira me acordar. Que absurdo!", "bravo", "apontar"),
    f("beto", "Eu também!", "assustado"),
    f("duda", "Todo mundo tava!", "preocupado"),
    P("Alguém entrou na cozinha pra pegar o cartão. De moletom da collab, com capuz.", "bravo"),
    X("E todo mundo ganhou um desses no kit...", "preocupado"),
    D("A perícia chega em poucas horas. Se vocês sabem quem foi... é agora.", "neutro", "cruzados"),
    P("Pera. Esse chaveiro me lembra alguma coisa...", "preocupado", "cabeca"),
    X("Abre as pistas. Tenta LIGAR uma coisa na outra.", "neutro"),
    { flag: "ligarAberto" }
  ];

  /* ===================== LIGAR PISTAS ===================== */
  R.lig_argola = [
    { som: "sting2" },
    P("Pera aí...", "preocupado", "cabeca"),
    P("A argolinha do estúdio...", "assustado"),
    X("É A ARGOLINHA DESSE CHAVEIRO!", "superfeliz", "apontar"),
    P("Arrebentou quando o Jazz agarrou o bolso de quem tava com ele!", "assustado"),
    X("Então quem entrou na cozinha hoje à noite...", "assustado"),
    P("...é quem tava no estúdio quando o Jazz morreu.", "bravo"),
    { flag: "lig_argola" }
  ];
  R.lig_kit = [
    { som: "sting2" },
    X("Raposa... o kit de boas-vindas! Cada convidado ganhou um chaveirinho de bicho.", "assustado"),
    P("Mel, urso. Bruna, polvo. Enaldinho, sapo. Jujubinha, coelho. Felipe Neto, coruja...", "preocupado", "cabeca"),
    X("E a raposa... era da Giuliana Mafra.", "assustado", "apontar"),
    { ...P("A Giuliana disse que tava no banheiro no apagão... mas a Bruna ficou trancada sozinha lá o tempo todo.", "bravo"), se: (S) => fl(S, "contradicao") || fl(S, "alibi_nina") },
    { ...P("E esse chaveiro caiu do bolso de quem tentou pegar o cartão hoje à noite.", "bravo"), se: (S) => !(fl(S, "contradicao") || fl(S, "alibi_nina")) },
    { ...X("E a argolinha arrebentada do estúdio... é desse chaveiro!", "superfeliz", "apontar"), se: (S) => tem(S, "argola") },
    X("MEU DEUS.", "assustado", "cabeca"),
    { flag: "lig_kit" }
  ];
  R.lig_tlim = [
    P("Tlim-tlim... o Mel ouviu um barulhinho no apagão.", "preocupado"),
    X("Era o CHAVEIRO balançando no bolso!", "assustado", "apontar"),
    { flag: "lig_tlim" }
  ];
  R.lig_laudo = [
    P("A delegada disse que o Jazz agarrou o bolso de quem fez isso...", "preocupado", "cabeca"),
    X("E essa argolinha tava do lado da mão dele. Ele arrancou isso do assassino!", "assustado", "apontar")
  ];
  R.lig_cartao = [X("Câmera sem cartão, computador sem cartão. O cartão sumiu antes do Jazz copiar o vídeo.", "preocupado")];
  R.lig_prova = [P("O caderno fala da prova gravada... e o arquivo se chama PROVA_sorteios. É esse o motivo.", "bravo")];
  R.lig_luz = [X("O CLAC que o Mel ouviu foi alguém desligando a chave geral. O apagão foi planejado.", "bravo")];
  R.lig_nada = [{ ...X("Hmm... acho que uma coisa não tem a ver com a outra."), se: (S) => (S.cont.nada || 0) % 2 === 0 && !(S.capitulo === "pos" && (S.cont.nada || 0) >= 2) },
    { ...P("Não... não fecha."), se: (S) => (S.cont.nada || 0) % 2 === 1 && !(S.capitulo === "pos" && (S.cont.nada || 0) >= 2) },
    // depois de errar algumas vezes, uma dica (e a delegada já aceita a acusação)
    { ...X("Pera... e se a gente juntar o chaveiro com alguma coisa do estúdio? Ou com o kit de boas-vindas?", "preocupado", "cabeca"), se: (S) => S.capitulo === "pos" && (S.cont.nada || 0) >= 2 && !sabe(S) }];

  /* ===================== ACUSAÇÃO ===================== */
  R.pre_acusacao = [
    { conversa: "delegada" },
    D("Então digam. Quem foi, como foi, e qual prova vocês têm.", "neutro", "cruzados"),
    { conversa: null },
    { capitulo: "deducao" },
    { deducao: true }
  ];
  R.ded_erro_0 = [
    D("Tem certeza? Essa pessoa tem explicação pra tudo que fez hoje.", "bravo", "cruzados"),
    D("Pensem: de quem é o que caiu no chão hoje à noite?", "neutro"),
    { deducao: true }
  ];
  R.ded_erro_1 = [
    D("Isso não bate com o que vocês acharam.", "bravo", "cruzados"),
    D("Lembrem do quadro de luz, do que o Mel ouviu e da janela do estúdio.", "neutro"),
    { deducao: true }
  ];
  R.ded_erro_2 = [
    D("Essa pista sozinha não prova quem esteve no estúdio E na cozinha hoje à noite.", "bravo", "cruzados"),
    { deducao: true }
  ];

  window.DEDUCAO = [
    { pergunta: "Quem matou o Jazzghost?", tipo: "suspeito", correta: ["nina"] },
    { pergunta: "O que realmente aconteceu?", tipo: "opcoes", correta: ["b"], opcoes: [
      { id: "a", txt: "A luz caiu sozinha, e o assassino aproveitou o escuro." },
      { id: "b", txt: "O assassino desligou a luz no quadro, passou pelo corredor e atacou o Jazz no estúdio." },
      { id: "c", txt: "O assassino já estava escondido no estúdio antes do apagão." },
      { id: "d", txt: "Alguém de fora entrou pela janela do estúdio." }
    ] },
    { pergunta: "Qual pista entrega o culpado?", tipo: "pista", correta: ["chaveiro", "argola"] }
  ];

  /* ===================== RECONSTRUÇÃO ===================== */
  R.revelacao = [
    { capitulo: "revelacao" },
    { conversa: "nina" },
    D("...", "neutro", "cruzados"),
    D("Giuliana Mafra.", "bravo", "apontar"),
    { pos: "nina", exp: "assustado" }, { anim: "nina", a: "recuar" }, { som: "sting" },
    f("nina", "Vocês tão loucos. Eu tava no banheiro!", "bravo", "cruzados"),
    X("A Bruna ficou trancada sozinha no banheiro o apagão inteiro.", "bravo"),
    P("E o seu chaveiro de raposa tá aqui. Com a argola arrebentada... igual à que tava do lado do Jazz.", "bravo", "apontar"),
    { conversa: null },
    { titulo: "O QUE REALMENTE ACONTECEU", sub: "", ms: 2600 },

    { sala: "estudio" }, { luz: "normal" },
    { cena: { leo: { sala: "estudio", x: 62, exp: "bravo", pose: "celular" }, nina: { sala: "estudio", x: 40, exp: "preocupado", pose: "cabeca" } }, limpar: true },
    { relogio: "20:40", txt: "O Jazz mostra pra Giuliana o vídeo em que ela admite que os sorteios eram falsos. \"Ou você conta no vídeo de hoje, ou eu conto.\"" },

    { sala: "sala" },
    { cena: { leo: { sala: "sala", x: 56, exp: "preocupado", pose: "escondendo" } }, limpar: true },
    { relogio: "20:55", txt: "Com medo, o Jazz tira o cartão da câmera e esconde no lugar mais bobo da casa." },

    { cena: {
      teo: { sala: "sala", x: 15 }, gabi: { sala: "sala", x: 26 }, beto: { sala: "sala", x: 37 },
      leo: { sala: "sala", x: 50, pose: "celular", exp: "preocupado" }, duda: { sala: "sala", x: 62 },
      caio: { sala: "sala", x: 73 }, nina: { sala: "sala", x: 85, pose: "celular", exp: "neutro" }
    }, limpar: true },
    { relogio: "21:01", txt: "Depois da foto, a Giuliana manda no grupo: \"Jazz, me deixa explicar. Estúdio, agora.\" E apaga a mensagem." },

    { cena: {}, limpar: true },
    { relogio: "21:04", txt: "Um por um, todo mundo sai da sala. O Mel vai pro sorvete, a Bruna pro banheiro, o Enaldinho pro sangue falso, a Jujubinha e o Felipe sobem... e a Giuliana vai pra cozinha." },

    { sala: "cozinha" },
    { cena: { nina: { sala: "cozinha", x: 9, pose: "apontar", exp: "bravo", olha: -1 }, teo: { sala: "cozinha", x: 31, pose: "pote", exp: "feliz", olha: -1 } }, limpar: true },
    { relogio: "21:06", txt: "A Giuliana desliga a chave geral do quadro de luz. O Mel, agachado atrás da porta da geladeira, só ouve o CLAC." },
    { som: "clac" }, { luz: "apagada" },
    { som: "tlim" }, { mover: "nina", x: 104, ms: 2600 },
    { relogio: "21:07", txt: "Ela passa pelo corredor no escuro. O chaveiro balança no bolso: tlim-tlim." },

    { sala: "estudio" }, { luz: "normal" },
    { cena: { leo: { sala: "estudio", x: 60, exp: "bravo", pose: "apontar", olha: -1 }, nina: { sala: "estudio", x: 44, exp: "bravo", pose: "cintura" } }, limpar: true },
    { relogio: "21:08", txt: "\"Cadê o cartão, Jazz?\" — \"Já tá guardado. Hoje todo mundo vai saber.\"" },
    { som: "baque" }, { flash: true }, { pos: "leo", x: 53, pose: "caido" }, { pos: "nina", x: 76, exp: "assustado", pose: "cabeca" },
    { relogio: "21:08", txt: "A Placa de Prata. Na queda, o Jazz agarra o bolso dela — e a argolinha do chaveiro arrebenta." },
    { pos: "nina", x: 82, pose: "escondendo", exp: "preocupado" },
    { relogio: "21:09", txt: "Ela abre a câmera: vazia. Revira a gaveta: nada. O cartão não está em lugar nenhum." },
    { mover: "nina", x: -6, ms: 2800 }, { sai: "nina" },
    { relogio: "21:10", txt: "O Mel religa a luz. A Giuliana volta pra sala como se nada tivesse acontecido." },

    { sala: "cozinha" }, { luz: "isca" },
    { cena: { vulto: { sala: "cozinha", x: 52, pose: "escondendo" } }, limpar: true },
    { relogio: "23:45", txt: "Quando vocês dizem que o cartão tá na cozinha, ela vai buscar — com o moletom extra da collab e o capuz, pra ninguém reconhecer. O flash assusta, ela bate na prateleira... e o chaveiro cai do bolso." },
    { luz: "normal" },

    { sala: "sala" }, CENA_TODOS_SALA,
    { cena: { delegada: { sala: "sala", x: 87, y: 0, pose: "cruzados" }, nina: { exp: "preocupado", pose: "cabeca" } } },
    D("Só falta uma coisa. Onde o Jazz escondeu o cartão?", "neutro", "cruzados"),
    P("\"No lugar mais bobo da casa\"...", "preocupado", "cabeca"),
    { clique: { x: 54, y: 52, w: 10, h: 17, rotulo: "Lentinho" } },
    X("O LENTINHO! O zíper emperrado!", "superfeliz", "apontar"),
    { som: "pista" },
    N("Dentro do bicho de pelúcia, enrolado num paninho: um cartão de memória."),
    D("PROVA_sorteios.mp4. Tava aqui o tempo todo.", "neutro"),
    { conversa: "nina" },
    f("nina", "Eu só queria que ele apagasse... Eu ia perder tudo. Tudo.", "preocupado", "cabeca"),
    f("nina", "Eu não queria que fosse assim.", "assustado"),
    D("Giuliana Mafra, você está presa.", "bravo", "apontar"),
    { conversa: null },
    { sai: "nina" }, { espera: 1200 },
    f("teo", "...Alguém quer sorvete?", "preocupado"),
    { fim: true }
  ];

  /* ===================== GATILHOS =====================
     Testados depois de cada sequência e a cada troca de sala. Cada um roda uma vez.
     As duas espionagens acontecem ENQUANTO vocês conversam com alguém na sala
     (S.menu aberto), com um "plano B" por quantidade de ações. */
  const conversando = (S, exceto) => S.menu && S.menu.quem !== exceto && S.menu.quem !== "delegada";
  window.GATILHOS = [
    // 1ª espionagem (Mel). Jeitos de disparar, sempre com vocês na sala e o Mel lá:
    //  a) conversando com alguém da sala, depois de 2 pistas OU 4 ações (falas/cliques) — vale começar só conversando;
    //  b) plano B: 10 ações no total, ao terminar qualquer coisa na sala ou ao voltar pra sala.
    { id: "obs1", seq: "obs1_inicio",
      se: (S) => S.capitulo === "inv1" && S.sala === "sala" &&
        S.pos.teo && S.pos.teo.vis && S.pos.teo.sala === "sala" &&
        ((conversando(S, "teo") && (Object.keys(S.pistas).length >= 2 || (S.cont.inv1 || 0) >= 4)) || (S.cont.inv1 || 0) >= 10) },
    { id: "obs1b", seq: "obs1_espiar", se: (S) => S.capitulo === "obs1" && S.sala === "cozinha" },
    { id: "obs2", seq: "obs2_inicio",
      se: (S) => S.capitulo === "inv2" && S.sala === "sala" && S.pos.gabi && S.pos.gabi.vis && S.pos.gabi.sala === "sala" &&
        ((conversando(S, "gabi") && ((S.cont.inv2obj || 0) >= 2 || (S.cont.inv2 || 0) >= 4)) || (S.cont.inv2 || 0) >= 10) },
    { id: "obs2b", seq: "obs2_espiar", se: (S) => S.capitulo === "obs2" && S.sala === "estudio" },
    // se voltarem pra sala sem pegar o cartão na gaveta, o Xinglau já tinha pegado um
    { id: "cartao_auto", seq: "cartao_auto", se: (S) => S.capitulo === "plano" && !fl(S, "pegouCartao") && S.sala === "sala" },
    { id: "anuncio", seq: "anuncio", se: (S) => S.capitulo === "plano" && fl(S, "pegouCartao") && S.sala === "sala" },
    { id: "acusar", seq: "pre_acusacao_auto", se: (S) => S.capitulo === "pos" && sabe(S) }
  ];
  R.cartao_auto = [
    P("Pera... a gente esqueceu de pegar o cartão vazio na gaveta!", "preocupado", "cabeca"),
    X("Relaxa. Eu peguei um quando a gente saiu do estúdio.", "superfeliz", "celular"),
    { flag: "pegouCartao" }, { som: "pista" }
  ];
  R.pre_acusacao_auto = [
    D("E aí? Vocês sabem quem foi?", "neutro", "cruzados"),
    { escolha: [
      { txt: "ACUSAR", seq: "pre_acusacao" },
      { txt: "Investigar mais um pouco" }
    ] }
  ];

  /* ===================== ATALHOS (ADM → pular capítulo, para testes) ===================== */
  const todas = (lista) => lista.reduce((o, k) => (o[k] = { t: 0 }, o), {});
  window.ATALHOS = {
    inv1: { seq: null, cena: CENA_INV, sala: "estudio", pistas: [], flags: [] },
    inv2: { cena: CENA_INV2, sala: "sala", pistas: ["placa", "camera", "argola", "celular", "kit", "teo", "disjuntor"],
      flags: ["obs1ok", "g_obs1", "g_obs1b"] },
    plano: { cena: CENA_INV2, sala: "estudio", pistas: ["placa", "camera", "argola", "celular", "kit", "teo", "disjuntor", "caderno", "gaveta", "computador", "laudo"],
      flags: ["obs1ok", "g_obs1", "g_obs1b", "g_obs2", "g_obs2b", "motivo", "gabi_ok", "pcLigado", "pcApagou"], pos: { leo: { pose: "coberto" }, gabi: { sala: "sala", x: 70 }, caio: { sala: "sala", x: 82 } } },
    pos: { cena: CENA_TODOS_SALA, sala: "sala", pistas: ["placa", "camera", "argola", "celular", "kit", "teo", "disjuntor", "caderno", "gaveta", "computador", "laudo", "fotos", "chaveiro", "janela"],
      flags: ["obs1ok", "g_obs1", "g_obs1b", "g_obs2", "g_obs2b", "g_anuncio", "motivo", "gabi_ok", "pegouCartao", "chaveiroNoChao", "ligarAberto", "cama", "pcLigado", "pcApagou"],
      pos: { delegada: { sala: "sala", x: 87, y: 0, pose: "cruzados" } } }
  };
  window.ATALHOS._todas = todas;

  window.ROTEIRO = R;
})();
