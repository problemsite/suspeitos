/* =====================================================================
   PERSONAGENS
   ---------------------------------------------------------------------
   Para trocar o rosto placeholder por PNG, preencha "rosto" com o caminho
   de cada expressão, por exemplo:
     rosto: { neutro: "img/personagens/mel_neutro.webp", feliz: "img/personagens/mel_feliz.webp", ... }
   Expressões usadas pelo jogo: neutro, feliz, preocupado, assustado, bravo (+ "morto" só pra vítima).
   Se faltar alguma, o jogo usa a "neutro"; se não houver PNG, desenha o placeholder.

   O corpo é desenhado pelo jogo. "roupa" é a cor do moletom e "cor" é o detalhe
   (forro do capuz e cordões). Poses disponíveis: neutro, cruzados, cintura,
   cabeca, coca, alto, apontar, celular, escondendo, pote, escrevendo, caido, coberto.
   ===================================================================== */
window.PERSONAGENS = {
  // ---------- jogáveis ----------
  problems: {
    nome: "Problems", cor: "#25d8e8", pele: "#eea26f", cabelo: null, tipo: "hex",
    rosto: { neutro: "img/personagens/problems_neutro.webp", feliz: "img/personagens/problems_feliz.webp",
      preocupado: "img/personagens/problems_preocupado.webp", assustado: "img/personagens/problems_assustado.webp",
      bravo: "img/personagens/problems_bravo.webp" }
  },
  xinglau: {
    nome: "Xinglau", cor: "#ff9f1c", pele: "#f0ad8e", cabelo: "#2b1d16", tipo: "humano",
    oculos: true,
    // "superfeliz" é marca registrada do Xinglau: usada só em momentos de empolgação
    rosto: { neutro: "img/personagens/xinglau_neutro.webp", feliz: "img/personagens/xinglau_feliz.webp",
      preocupado: "img/personagens/xinglau_preocupado.webp", assustado: "img/personagens/xinglau_assustado.webp",
      bravo: "img/personagens/xinglau_bravo.webp", superfeliz: "img/personagens/xinglau_superfeliz.webp" }
  },

  // ---------- autoridade ----------
  delegada: {
    nome: "Delegada Ramos", cor: "#7d9cff", pele: "#e3a07c", tipo: "humano",
    roupa: "#1d2a44", quepe: true,
    rosto: { neutro: "img/personagens/delegada_neutro.webp", feliz: "img/personagens/delegada_feliz.webp",
      preocupado: "img/personagens/delegada_preocupado.webp", assustado: "img/personagens/delegada_assustado.webp",
      bravo: "img/personagens/delegada_bravo.webp" }
  },

  // ---------- vítima ----------
  // "morto" = rosto do corpo caído. Coloque img/personagens/jazzghost_morto.webp (olhos fechados/X) que o jogo usa sozinho.
  leo: {
    nome: "Jazzghost", curto: "Jazz", cor: "#ffd6dc", roupa: "#c8323f", pele: "#eeb08f", tipo: "humano",
    canal: "Minecraft", auto: "img/personagens/jazzghost",
    rosto: { neutro: "img/personagens/jazzghost_neutro.webp", feliz: "img/personagens/jazzghost_feliz.webp", preocupado: "img/personagens/jazzghost_preocupado.webp", assustado: "img/personagens/jazzghost_assustado.webp", bravo: "img/personagens/jazzghost_bravo.webp" }
  },

  // ---------- suspeitos ----------
  // roupa = cor do moletom · cor = detalhe (forro do capuz, cordões)
  // rostoCanvas: rostos com cabelo comprido usam uma imagem maior (820x860) — o cabelo cai por cima do moletom.
  teo: {
    nome: "Mel", cor: "#fff3c4", roupa: "#e8b923", pele: "#eaa080", tipo: "humano",
    canal: "treino e dieta", bicho: "urso", emoji: "🐻",
    rosto: { neutro: "img/personagens/mel_neutro.webp", feliz: "img/personagens/mel_feliz.webp", preocupado: "img/personagens/mel_preocupado.webp", assustado: "img/personagens/mel_assustado.webp", bravo: "img/personagens/mel_bravo.webp" }
  },
  gabi: {
    nome: "Bruna", cor: "#ffe1c2", roupa: "#e8731f", pele: "#eeb28e", tipo: "humano",
    canal: "jogos", bicho: "polvo", emoji: "🐙", rostoCanvas: [820, 860],
    rosto: { neutro: "img/personagens/bruna_neutro.webp", feliz: "img/personagens/bruna_feliz.webp", preocupado: "img/personagens/bruna_preocupado.webp", assustado: "img/personagens/bruna_assustado.webp", bravo: "img/personagens/bruna_bravo.webp" }
  },
  beto: {
    nome: "Enaldinho", cor: "#d8f5d0", roupa: "#2f9a45", pele: "#eeb296", tipo: "humano",
    canal: "desafios e pegadinhas", bicho: "sapo", emoji: "🐸",
    rosto: { neutro: "img/personagens/enaldinho_neutro.webp", feliz: "img/personagens/enaldinho_feliz.webp", preocupado: "img/personagens/enaldinho_preocupado.webp", assustado: "img/personagens/enaldinho_assustado.webp", bravo: "img/personagens/enaldinho_bravo.webp" }
  },
  duda: {
    nome: "Jujubinha", cor: "#ffe0ef", roupa: "#e8559a", pele: "#eeae8a", tipo: "humano",
    canal: "histórias e docinhos", bicho: "coelho", emoji: "🐰", rostoCanvas: [820, 860],
    rosto: { neutro: "img/personagens/jujubinha_neutro.webp", feliz: "img/personagens/jujubinha_feliz.webp", preocupado: "img/personagens/jujubinha_preocupado.webp", assustado: "img/personagens/jujubinha_assustado.webp", bravo: "img/personagens/jujubinha_bravo.webp" }
  },
  caio: {
    nome: "Felipe Neto", cor: "#d6e6ff", roupa: "#2b62c9", pele: "#ecaa8a", tipo: "humano",
    canal: "de tudo um pouco", bicho: "coruja", emoji: "🦉",
    rosto: { neutro: "img/personagens/felipe_neto_neutro.webp", feliz: "img/personagens/felipe_neto_feliz.webp", preocupado: "img/personagens/felipe_neto_preocupado.webp", assustado: "img/personagens/felipe_neto_assustado.webp", bravo: "img/personagens/felipe_neto_bravo.webp" }
  },
  nina: {
    nome: "Giuliana Mafra", cor: "#ead9ff", roupa: "#7b3fc8", pele: "#eeb288", tipo: "humano",
    canal: "teorias e sorteios", bicho: "raposa", emoji: "🦊", rostoCanvas: [820, 860],
    rosto: { neutro: "img/personagens/giuliana_neutro.webp", feliz: "img/personagens/giuliana_feliz.webp", preocupado: "img/personagens/giuliana_preocupado.webp", assustado: "img/personagens/giuliana_assustado.webp", bravo: "img/personagens/giuliana_bravo.webp" }
  },

  // ---------- silhueta da tentativa final ----------
  vulto: { nome: "???", cor: "#3b2f63", pele: "#000", tipo: "vulto", rosto: {} }
};

// Suspeitos que aparecem na pergunta "Quem foi?" (ordem da tela)
window.SUSPEITOS = ["teo", "gabi", "beto", "duda", "caio", "nina"];

// Moletom da collab (todo mundo veste) — cor base
window.MOLETOM = "#3b2f63";
