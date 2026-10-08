/* =====================================================================
   DICAS RÁPIDAS (tutorial mínimo)
   ---------------------------------------------------------------------
   Cada dica aparece uma vez, só quando a condição "se" vale e ninguém está
   em diálogo, e some sozinha assim que "ate" vira verdade (ou depois de "ms").
   onde: "centro" | "pistas" (perto do botão de pistas) | "esq" | "dir" (setas das portas)
   ===================================================================== */
(function () {
  const sabe = (S) => fl(S, "lig_argola") || fl(S, "lig_kit") || fl(S, "lig_tlim");
  window.TUTORIAL = [
    { id: "explorar", onde: "centro", ms: 14000,
      txt: "Passe o mouse pelo cenário e clique no que parecer importante.",
      se: (S) => S.capitulo === "inv1" && !(S.cont.cliques > 0),
      ate: (S) => S.cont.cliques > 0 },
    { id: "pistas", onde: "pistas", ms: 9000,
      txt: "As pistas encontradas ficam guardadas aqui.",
      se: (S) => Object.keys(S.pistas).length >= 1,
      ate: (S, L) => L.abriuPainel || Object.keys(S.pistas).length >= 5 },
    { id: "portas", onde: "esq", ms: 12000,
      txt: "Use as setas nas laterais para ir para outro cômodo.",
      se: (S) => S.capitulo === "inv1" && (S.cont.cliques || 0) >= 3 && !S.vistos.sala_sala,
      ate: (S) => !!S.vistos.sala_sala },
    { id: "conversar", onde: "centro", ms: 12000,
      txt: "Clique em alguém para conversar.",
      se: (S) => S.sala === "sala" && S.capitulo === "inv1" && !S.vistos.conversou,
      ate: (S) => !!S.vistos.conversou || !!S.menu },
    { id: "seguir_mel", onde: "esq", ms: 14000,
      txt: "Siga o Mel: vá para a cozinha pela seta da esquerda.",
      se: (S) => S.capitulo === "obs1" && S.sala !== "cozinha",
      ate: (S) => S.capitulo !== "obs1" || S.sala === "cozinha" },
    { id: "seguir_bruna", onde: "dir", ms: 14000,
      txt: "Siga a Bruna: vá para o estúdio pela seta da direita.",
      se: (S) => S.capitulo === "obs2" && S.sala !== "estudio",
      ate: (S) => S.capitulo !== "obs2" || S.sala === "estudio" },
    { id: "cartao", onde: "centro", ms: 14000,
      txt: "Peguem um cartão vazio na gaveta da mesa do estúdio.",
      se: (S) => S.capitulo === "plano" && !fl(S, "pegouCartao") && S.sala === "estudio",
      ate: (S) => fl(S, "pegouCartao") || S.capitulo !== "plano" },
    { id: "ligar", onde: "pistas", ms: 16000,
      txt: "Abra as pistas e use 🔗 Ligar pistas para juntar duas que combinam.",
      se: (S) => fl(S, "ligarAberto") && !sabe(S),
      ate: (S, L) => sabe(S) || L.modoLigar }
  ];
})();
