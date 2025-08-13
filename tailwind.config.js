module.exports = {
  content: ["./*.html", "./**/*.js"],
  theme: {
    extend: {
      colors: {
        brand: "#F28C28",     // laranja principal
        ink: "#1C1C1C",       // texto principal
        paper: "#F5F5F5",     // fundo suave / blocos
        mid: "#808080",       // separadores/linhas
        accent: "#1D4ED8"     // azul para destaques ocasionais
      },
      fontFamily: {
        sans: ['League Spartan', 'Montserrat'],
      },
    },
  },
  plugins: [],
};
