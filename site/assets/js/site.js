// Monolead — дрібні взаємодії сайту.
(function () {
  // Переваги: пункт під курсором стає активним (білий, більший, зі стрілкою)
  var items = document.querySelectorAll('.adv__item');
  items.forEach(function (li) {
    li.addEventListener('pointerenter', function () {
      items.forEach(function (x) { x.classList.toggle('is-on', x === li); });
    });
  });

  // GEO: підпис країни під курсором отримує градієнт; без наведення — PL, як у макеті
  var geo = document.querySelectorAll('.geo__list button');
  geo.forEach(function (b) {
    b.addEventListener('pointerenter', function () { geo.forEach(function (x) { x.classList.toggle('is-on', x === b); }); });
    b.addEventListener('focus', function () { geo.forEach(function (x) { x.classList.toggle('is-on', x === b); }); });
  });
  var list = document.querySelector('.geo__list');
  if (list) list.addEventListener('pointerleave', function () { geo.forEach(function (x, i) { x.classList.toggle('is-on', i === 0); }); });

  // Коментарі: «+» розгортає картку, «×» згортає (тоді всі картки рівні)
  var cards = document.querySelectorAll('.cm');
  cards.forEach(function (c, i) {
    c.querySelector('.cm__btn').addEventListener('click', function () {
      var open = !c.classList.contains('is-open');
      cards.forEach(function (x, j) {
        var on = open && x === c;
        x.classList.toggle('is-open', on);
        var btn = x.querySelector('.cm__btn');
        btn.setAttribute('aria-expanded', on);
        btn.setAttribute('aria-label', (on ? 'Згорнути' : 'Відкрити') + ' коментар ' + (j + 1));
      });
    });
  });
})();
