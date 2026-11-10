# Monolead — Landing Page

**Репо:** https://github.com/natocheiev/monolead-landing · **Сайт (GitHub Pages):** https://natocheiev.github.io/monolead-landing/

Новий SEO-орієнтований лендінг для **Monolead**. Це CPA-мережа з вертикалями Nutra та E-com, яка працює з GEO HU, SK, RO, PL та CZ.

- **Аудиторія:** арбітражники та медіабаєри, вебмайстри, рекламодавці.
- **Мета:** щоб відвідувач написав про співпрацю в Telegram або залишив заявку через форму (вона теж приходить у Telegram).
- **Мови:** UA / EN (`/ua/`, `/en/`, hreflang).
- **Стиль:** темний преміум-тех або гранж/брутал, багато анімацій без втрати швидкості. Desktop-first, потім адаптив.
- **Стек:** HTML + CSS + JS. Репо публікується на GitHub Pages; хостинг самого лендінгу — Vercel.

Повний бриф, правила репо та список відкритих питань — у [CLAUDE.md](./CLAUDE.md).

**Статус:** бриф готовий, репо і навігатор заведено. Дизайн і розробка продукту ще не почалися.

## Індекс артефактів

| Артефакт | Що це |
|---|---|
| [CLAUDE.md](./CLAUDE.md) | Бриф продукту, правила репо (навігатор, імена), відкриті питання |
| [index.html](./index.html) · [на Pages](https://natocheiev.github.io/monolead-landing/) | Стартова сторінка репо з навігатором |
| [_nav/tree.js](./_nav/tree.js) | Дерево сторінок, реєстр сторінок для навігатора |
| [_nav/nav.js](./_nav/nav.js) · [_nav/nav.css](./_nav/nav.css) | Скрипт і стилі бокового меню |
| [research/](./research/) | Дослідження |
| [research/screens/](./research/screens/) | Скріни публічних сторінок конкурентів (Playwright, 1440×900): `<компанія>-NN-<що>.png` |
| [research/notes/03-competitors.md](./research/notes/03-competitors.md) | Конкуренти: хард / софт / аспіраційні, що вивчити, що відкрито без логіну |
| [research/notes/04-matrix.md](./research/notes/04-matrix.md) | Матриця 5 конкурентів за осями продукту + патерни, відмінності, питання до PM |
