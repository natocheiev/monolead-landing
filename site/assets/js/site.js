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

// ---------- Liquid Type: хіро-заголовок ----------
// Кожна літера має пружинну вагу (300 → 850) і масштаб (1 → 1.12) залежно від відстані до курсора.
// Клік запускає хвилю, що прокочується літерами; без курсора — легке «дихання». Обгортка фіксованої ширини не дає тексту стрибати.
(function () {
  var h1 = document.querySelector('h1.liquid'), hero = h1 && h1.closest('.hero');
  if (!h1 || !hero) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var BASE_W = 300, MAX_W = 850, RADIUS = 180, SPRING = 0.035, DAMP = 0.92, SCALE_PEAK = 0.12;
  var GLOW = '245, 235, 210', TRAIL = '245, 235, 210', TRAIL_A = 0.055, RIPPLE = '200, 190, 170';

  // Розмітка: рядок → слово → обгортка літери (.lc) → літера (.li)
  var lines = h1.dataset.lines.split('|'), chars = [];
  h1.textContent = '';
  lines.forEach(function (line) {
    var ln = document.createElement('span'); ln.className = 'ln'; ln.setAttribute('aria-hidden', 'true');
    line.split(' ').forEach(function (word) {
      var w = document.createElement('span'); w.className = 'lw';
      word.split('').forEach(function (ch) {
        var wrap = document.createElement('span'); wrap.className = 'lc';
        var inner = document.createElement('span'); inner.className = 'li'; inner.textContent = ch;
        wrap.appendChild(inner); w.appendChild(wrap);
        chars.push({ wrap: wrap, el: inner, cx: 0, cy: 0, weight: BASE_W, wVel: 0, scale: 1, sVel: 0, ready: reduced });
      });
      ln.appendChild(w);
    });
    h1.appendChild(ln);
  });
  if (reduced) return;   // «менше руху»: статичний заголовок

  var canvas = hero.querySelector('.hero__canvas'), ctx = canvas.getContext('2d');
  var mouse = { x: -9999, y: -9999, inside: false, lastSpawn: 0, px: 0, py: 0 };
  var dots = [], ripples = [], idleMix = 1, locked = false, dpr = 1, W = 0, H = 0, t0 = performance.now();

  function heroRect() { return hero.getBoundingClientRect(); }
  function sizeCanvas() {
    var r = heroRect(); dpr = Math.min(window.devicePixelRatio || 1, 2); W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
  }
  // центри літер у координатах секції (за спокійним положенням)
  function measure() {
    var r = heroRect();
    chars.forEach(function (c) {
      var b = c.wrap.getBoundingClientRect();
      c.cx = b.left + b.width / 2 - r.left; c.cy = b.top + b.height / 2 - r.top;
    });
  }
  function lockWidths() {
    chars.forEach(function (c) { c.wrap.style.width = ''; c.el.style.fontVariationSettings = "'wght' " + BASE_W; });
    void h1.offsetHeight;
    var ws = chars.map(function (c) { return c.el.getBoundingClientRect().width; });
    chars.forEach(function (c, i) { c.wrap.style.width = ws[i] + 'px'; });
    locked = true; measure();
  }

  // Поява: кожна літера з розмиття знизу, з кроком 45 мс
  chars.forEach(function (c, i) {
    c.el.style.opacity = 0;
    var a = c.el.animate([
      { opacity: 0, transform: 'translateY(40px) scale(.85)', filter: 'blur(8px)' },
      { opacity: 1, transform: 'translateY(0) scale(1)', filter: 'blur(0px)' }
    ], { duration: 900, delay: 500 + i * 45, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' });
    a.onfinish = function () {
      c.el.style.opacity = 1; a.cancel(); c.ready = true;
      if (i === chars.length - 1) measure();
    };
  });

  hero.addEventListener('mousemove', function (e) {
    if (!locked) lockWidths();
    var r = heroRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.inside = true;
  });
  hero.addEventListener('mouseleave', function () { mouse.inside = false; mouse.x = mouse.y = -9999; });
  hero.addEventListener('click', function (e) {
    var r = heroRect();
    ripples.push({ x: e.clientX - r.left, y: e.clientY - r.top, r: 0, max: Math.max(window.innerWidth, window.innerHeight) * 0.6 });
  });
  window.addEventListener('resize', function () { sizeCanvas(); if (locked) lockWidths(); else measure(); });

  var visible = true, running = false;
  function start() { if (!running && visible) { running = true; requestAnimationFrame(frame); } }
  new IntersectionObserver(function (en) { visible = en[0].isIntersecting; start(); }).observe(hero);

  function frame(now) {
    if (!visible) { running = false; return; }
    var t = (now - t0) / 1000;
    idleMix += ((mouse.inside ? 0 : 1) - idleMix) * 0.05;

    // слід курсора
    if (mouse.inside && now - mouse.lastSpawn > 18) {
      var sp = Math.hypot(mouse.x - mouse.px, mouse.y - mouse.py) / Math.max(1, now - mouse.lastSpawn) * 16;
      dots.push({ x: mouse.x, y: mouse.y, size: Math.max(3, 12 - sp * 0.04), age: 0, max: 45 + Math.random() * 15 });
      mouse.px = mouse.x; mouse.py = mouse.y; mouse.lastSpawn = now;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    for (var d = dots.length - 1; d >= 0; d--) {
      var o = dots[d]; o.age++;
      var life = 1 - o.age / o.max;
      if (life <= 0) { dots.splice(d, 1); continue; }
      ctx.beginPath(); ctx.arc(o.x, o.y, o.size * (0.5 + life * 0.5), 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + TRAIL + ',' + (life * TRAIL_A) + ')'; ctx.fill();
    }
    // кільця від кліку + імпульс літерам
    for (var k = ripples.length - 1; k >= 0; k--) {
      var rp = ripples[k]; rp.r += 5;
      if (rp.r > rp.max) { ripples.splice(k, 1); continue; }
      var pr = rp.r / rp.max, al = (1 - pr) * (1 - pr), fade = 1 - pr;
      ctx.lineWidth = 2.5 * (1 - pr * 0.5); ctx.strokeStyle = 'rgba(' + RIPPLE + ',' + (al * 0.22) + ')';
      ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2); ctx.stroke();
      ctx.lineWidth = 8 * (1 - pr); ctx.strokeStyle = 'rgba(' + RIPPLE + ',' + (al * 0.1) + ')';
      ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.r * 0.92, 0, Math.PI * 2); ctx.stroke();
      chars.forEach(function (c) {
        if (!c.ready) return;
        var gap = Math.abs(Math.hypot(c.cx - rp.x, c.cy - rp.y) - rp.r);
        if (gap < 60) { var px = 1 - gap / 60; c.wVel += fade * px * 45; c.sVel += fade * px * 0.008; }
      });
    }

    // фізика літер
    chars.forEach(function (c, i) {
      if (!c.ready) return;
      var dist = Math.hypot(c.cx - mouse.x, c.cy - mouse.y);
      var inf = dist >= RADIUS ? 0 : Math.pow(1 - dist / RADIUS, 2);
      var tw = BASE_W + (MAX_W - BASE_W) * inf + (Math.sin(t * 0.8 + i * 0.5) * 0.5 + 0.5) * 20 * idleMix;
      var ts = 1 + SCALE_PEAK * inf;
      c.wVel = (c.wVel + (tw - c.weight) * SPRING) * DAMP; c.weight += c.wVel;
      c.sVel = (c.sVel + (ts - c.scale) * SPRING) * DAMP; c.scale += c.sVel;
      var wgt = Math.max(100, Math.min(900, Math.round(c.weight)));
      var glow = Math.max(0, (c.weight - BASE_W) / (MAX_W - BASE_W));
      c.el.style.fontVariationSettings = "'wght' " + wgt;
      c.el.style.transform = 'scale(' + c.scale.toFixed(4) + ')';
      c.el.style.textShadow = glow > 0.1 ? '0 0 ' + (30 * glow).toFixed(1) + 'px rgba(' + GLOW + ',' + (glow * 0.15).toFixed(3) + ')' : 'none';
    });
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(function () {
    sizeCanvas(); measure(); canvas.classList.add('is-on');
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(measure);
    start();
  });
})();
