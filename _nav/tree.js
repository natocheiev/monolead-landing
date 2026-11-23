/*
 * Дерево сторінок репо — єдине джерело для навігатора.
 * Шляхи — від кореня репо, без "./" на початку.
 *
 * Формат:
 *   { title: "Сторінка", path: "x.html", children: [ ...вкладені сторінки ] }
 *   { branch: "Гілка", pages: [ ...сторінки ] }
 *
 * Правило: у дереві лише сторінки, які вже існують.
 * Гілка з'являється разом зі своєю першою сторінкою.
 */
window.NAV_TREE = [
  { title: "Старт", path: "index.html" },
  {
    branch: "Сайт",
    pages: [
      { title: "Сайт (за Figma «5»)", path: "site/index.html" }
    ]
  },
  {
    branch: "Ресерч",
    pages: [
      {
        title: "Ресерч",
        path: "research/research.html",
        children: [
          { title: "Конкуренти", path: "research/notes/03-competitors.html" },
          { title: "Матриця", path: "research/notes/04-matrix.html" },
          { title: "Бенчмарк", path: "research/notes/05-benchmark.html" },
          { title: "UX-патерни", path: "research/notes/06-patterns.html" }
        ]
      }
    ]
  },
  {
    branch: "Прототипи",
    pages: [
      {
        title: "Планета (WebGL)",
        path: "prototypes/globe/globe.html",
        children: [
          { title: "Палітра Monolead", path: "prototypes/globe/globe-monolead.html" },
          { title: "Європа крупним планом", path: "prototypes/globe/globe-europe.html" },
          { title: "Редактор планети", path: "prototypes/globe/globe-editor.html" }
        ]
      }
    ]
  }
];
