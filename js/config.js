/* =====================================================================
   SUSPEITOS — configuração da partida
   ---------------------------------------------------------------------
   FIREBASE: usa o Firebase único "jogos-github". A configuração vem da
   trava do site principal (problemsite.github.io/trava.js), carregada no
   index.html. Os dados ficam em sites/suspeitos/sala.
   Aberto direto do PC (sem a trava) o jogo roda em MODO LOCAL:
   abra duas abas do mesmo navegador, cada aba vira um jogador.
   ===================================================================== */
window.CONFIG = {
  site: "suspeitos",          // nome do repositório / pasta no Firebase
  caminho: "sala",           // pasta gravável (sites/suspeitos/sala)

  // Os dois personagens jogáveis. A chave é o id do personagem em personagens.js
  jogaveis: ["problems", "xinglau"],
  coresJogador: { problems: "#36e0ff", xinglau: "#ffb02e" },

  // Ritmo
  tempoMinimoFala: 350,      // ms antes de poder pular uma fala
  velocidadeTexto: 24,       // ms por letra
  avisoTempoAlvoMin: 20,     // só informativo (tela final)

  // Áudio
  volume: 0.55,

  // Mostra o link "testar sozinho" pequeno no lobby
  permitirTesteSozinho: true
};
