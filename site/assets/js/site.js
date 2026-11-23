// Monolead — дрібні взаємодії сайту.
(function () {
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

// ---------- Переваги: Folio (скінченна версія) ----------
// Одна дробова позиція pos (0 … N−1) веде і список заголовків (їде вгору), і стрічку фото (їде вниз);
// вони сходяться на активному пункті. pos береться з прокрутки сторінки: секція «прилипає» на N кроків,
// плавно доганяє ціль (lerp 0.14) і після паузи доводиться до найближчого пункту. Клік — плавний під'їзд і FLIP у деталь.
(function () {
  var sec = document.querySelector('.folio');
  if (!sec) return;
  var data = JSON.parse(document.getElementById('folio-data').textContent);
  var N = data.length;
  var stick = sec.querySelector('.folio__stick');
  var tWrap = sec.querySelector('.folio__titles'), iWrap = sec.querySelector('.folio__images');
  var tStrip = sec.querySelector('.folio__tstrip'), iStrip = sec.querySelector('.folio__istrip');
  var rows = [].slice.call(sec.querySelectorAll('.folio__row'));
  var slots = [].slice.call(sec.querySelectorAll('.folio__slot'));
  var imgs = [].slice.call(sec.querySelectorAll('.folio__img'));
  var arrows = rows.map(function (r) { return r.querySelector('.folio__arrow'); });
  var h3s = rows.map(function (r) { return r.querySelector('h3'); });
  var numEl = sec.querySelector('.folio__num'), ring = sec.querySelector('.folio__ring');
  var detail = sec.querySelector('.folio__detail'), dTitle = detail.querySelector('.folio__dtitle'), dImg = detail.querySelector('.folio__dimg');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var DESKTOP = { titleMidVh: 40, titleSlotVh: 80 / 6, fontMax: 4.45, fontMin: 4.0,
    imgTopVh: 0, imgMidVh: 50, imgHVh: 66, pitchVh: 72, offsetPx: 0 };
  var MOBILE = { titleMidVh: 45, titleSlotVh: 10, fontMax: 2.6, fontMin: 2.5,
    imgTopVh: 50, imgMidVh: 69, imgHVh: 38, pitchVh: 42, offsetPx: 20 };
  var mq = window.matchMedia('(max-width: 767px)'), L;
  function applyLayout() {
    L = mq.matches ? MOBILE : DESKTOP;
    rows.forEach(function (r) { r.style.height = L.titleSlotVh + 'dvh'; });
    iStrip.style.height = N * L.pitchVh + 'dvh';
    slots.forEach(function (sl, i) { sl.style.top = (N - 1 - i) * L.pitchVh + 'dvh'; sl.style.height = L.pitchVh + 'dvh'; });
    imgs.forEach(function (im) { im.style.height = L.imgHVh + 'dvh'; });
  }
  applyLayout();
  mq.addEventListener('change', applyLayout);

  var SMOOTH = 0.14, pos = 0, target = 0, active = -1, lastScroll = 0, snapLock = 0;
  var hovered = null, hoverP = rows.map(function () { return 0; });
  var phase = 'idle', pendingOpen = null, hidIdx = null, srcImg = null, srcTitle = null, lifts = [];
  var ringPos = { x: 0, y: 0 }, mouse = { x: 0, y: 0, on: false, overImg: false };

  function step() { return window.innerHeight * 0.45; }
  function progress() { return -sec.getBoundingClientRect().top / step(); }
  window.addEventListener('scroll', function () { lastScroll = performance.now(); }, { passive: true });

  function tick(now) {
    if (phase === 'idle') {
      target = Math.max(0, Math.min(N - 1, progress()));
      // пауза в прокрутці → доводимо до найближчого пункту (лише всередині «липкої» зони)
      var p = progress();
      if (pendingOpen === null && p > 0.02 && p < N - 1.02 && now - lastScroll > 140 && now > snapLock) {
        var d = Math.round(p) - p;
        if (Math.abs(d) > 0.01) { snapLock = now + 700; window.scrollTo({ top: window.scrollY + d * step(), behavior: reduced ? 'auto' : 'smooth' }); }
      }
    }
    pos = Math.abs(target - pos) < 0.0005 ? target : pos + (target - pos) * (reduced ? 1 : SMOOTH);
    var vh = window.innerHeight / 100;

    tStrip.style.transform = 'translate3d(0,' + ((L.titleMidVh - (pos + 0.5) * L.titleSlotVh) * vh).toFixed(2) + 'px,0)';
    iStrip.style.transform = 'translate3d(0,' + ((L.imgMidVh - L.imgTopVh - L.pitchVh / 2 - (N - 1) * L.pitchVh + pos * L.pitchVh) * vh + L.offsetPx).toFixed(2) + 'px,0)';

    for (var i = 0; i < N; i++) {
      var dist = Math.abs(i - pos), op, sc, t;
      if (dist < 1) { t = 1 - dist; op = 0.78 + 0.22 * t; sc = 0.93 + 0.07 * t; }
      else if (dist < 2) { t = 2 - dist; op = 0.18 + 0.6 * t; sc = 0.84 + 0.09 * t; }
      else { op = 0.18; sc = 0.84; }
      imgs[i].style.opacity = op.toFixed(3);
      imgs[i].style.transform = 'scale(' + sc.toFixed(4) + ')';

      var tColor = Math.max(0, 1 - dist * 2), tType = Math.max(0, 1 - dist * 0.55);
      hoverP[i] += ((hovered === i ? 1 : 0) - hoverP[i]) * 0.18;
      rows[i].style.opacity = (0.3 + 0.7 * tColor).toFixed(3);   // як у макеті: неактивні 30%
      var w = 420 + 200 * tType + hoverP[i] * 80;
      h3s[i].style.fontVariationSettings = '"wght" ' + w.toFixed(0);
      h3s[i].style.fontWeight = Math.round(w);
      h3s[i].style.fontSize = (L.fontMin + (L.fontMax - L.fontMin) * tType).toFixed(2) + 'dvh';
      var ta = Math.max(0, 1 - dist * 2.8);
      arrows[i].style.opacity = ta.toFixed(3);
      var off = Math.pow(1 - ta, 1.6) * 48;   // з правого нижнього кута рамки → на місце
      arrows[i].style.transform = 'translate(' + off.toFixed(2) + 'px,' + off.toFixed(2) + 'px)';
    }
    var r = Math.round(pos);
    if (r !== active) { active = r; numEl.textContent = String(r + 1).padStart(2, '0'); }

    if (pendingOpen !== null && Math.abs(pos - pendingOpen) < 0.01 && now - lastScroll > 80) { var k = pendingOpen; pendingOpen = null; openDetail(k); }

    var vis = mouse.on && mouse.overImg && phase === 'idle';
    var lerp = vis ? 0.22 : 1;
    ringPos.x += (mouse.x - ringPos.x) * lerp; ringPos.y += (mouse.y - ringPos.y) * lerp;
    ring.style.transform = 'translate3d(' + ringPos.x.toFixed(2) + 'px,' + ringPos.y.toFixed(2) + 'px,0)';
    ring.style.opacity = vis ? '1' : '0';
    requestAnimationFrame(tick);
  }

  // Наведення / курсор-кільце
  stick.addEventListener('pointermove', function (e) { var b = stick.getBoundingClientRect(); mouse.x = e.clientX - b.left; mouse.y = e.clientY - b.top; mouse.on = true; });
  stick.addEventListener('pointerleave', function () { mouse.on = false; });
  imgs.forEach(function (im, i) {
    im.addEventListener('pointerenter', function () { mouse.overImg = true; });
    im.addEventListener('pointerleave', function () { mouse.overImg = false; });
    im.addEventListener('click', function () { navigate(i); });
  });
  rows.forEach(function (rw, i) {
    rw.addEventListener('pointerenter', function () { hovered = i; });
    rw.addEventListener('pointerleave', function () { if (hovered === i) hovered = null; });
    rw.addEventListener('click', function () { navigate(i); });
  });

  // Клік: під'їзд прокруткою до пункту, потім деталь
  function navigate(i) {
    if (phase !== 'idle') return;
    if (i === active && Math.abs(pos - i) < 0.02) { openDetail(i); return; }
    var top = window.scrollY + sec.getBoundingClientRect().top + i * step();
    pendingOpen = i; snapLock = performance.now() + 1500;
    window.scrollTo({ top: top, behavior: reduced ? 'auto' : 'smooth' });
  }

  var OPEN = { duration: 950, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' };
  var CLOSE = { duration: 850, delay: 50, easing: 'cubic-bezier(.77,0,.175,1)', fill: 'both' };
  function flipFrom(src, el, uniform) {
    var tg = el.getBoundingClientRect();
    var sx = src.width / tg.width, sy = uniform ? src.height / tg.height : src.height / tg.height;
    if (uniform) sx = sy;
    return 'translate(' + (src.left - tg.left) + 'px,' + (src.top - tg.top) + 'px) scale(' + sx + ',' + sy + ')';
  }

  function openDetail(i) {
    if (phase !== 'idle') return;
    phase = 'opening'; hidIdx = i;
    srcImg = imgs[i].getBoundingClientRect(); srcTitle = h3s[i].getBoundingClientRect();
    imgs[i].style.visibility = 'hidden'; h3s[i].style.visibility = 'hidden';
    dTitle.textContent = data[i].title;
    detail.querySelector('.folio__dtext').textContent = data[i].text;
    detail.querySelector('.folio__dtag').textContent = data[i].tag;
    detail.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    dImg.style.visibility = 'visible'; dTitle.style.visibility = 'visible';
    detail.querySelector('[data-scrim]').animate([{ opacity: 0 }, { opacity: 1 }], { duration: 450, easing: 'ease-out', fill: 'both' });
    dImg.animate([{ transform: flipFrom(srcImg, dImg, false) }, { transform: 'none' }], OPEN);
    var tA = dTitle.animate([{ transform: flipFrom(srcTitle, dTitle, true) }, { transform: 'none' }], OPEN);
    tA.onfinish = function () { phase = 'detail'; };
    // рядки над активним піднімаються разом із ним
    var lift = srcTitle.top - dTitle.getBoundingClientRect().top;
    lifts = rows.slice(0, i).map(function (rw) { return rw.animate([{ transform: 'none' }, { transform: 'translateY(' + (-lift) + 'px)' }], OPEN); });
    [].forEach.call(detail.querySelectorAll('[data-reveal]'), function (el, k) {
      el.animate([{ transform: 'translateY(24px)', opacity: 0, filter: 'blur(8px)' }, { transform: 'none', opacity: 1, filter: 'blur(0)' }],
        { duration: 900, delay: 250 + k * 50, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' });
    });
  }

  function close() {
    if (phase === 'idle' || phase === 'closing') return;
    phase = 'closing';
    [].forEach.call(detail.querySelectorAll('[data-reveal]'), function (el, k) {
      el.animate([{ opacity: 1, transform: 'none', filter: 'blur(0)' }, { opacity: 0, transform: 'translateY(14px)', filter: 'blur(6px)' }], { duration: 350, delay: k * 30, easing: 'ease-in', fill: 'both' });
    });
    detail.querySelector('[data-scrim]').animate([{ opacity: 1 }, { opacity: 0 }], { duration: 550, delay: 250, easing: 'ease-in', fill: 'both' });
    dImg.animate([{ transform: 'none' }, { transform: flipFrom(srcImg, dImg, false) }], CLOSE);
    var lift = srcTitle.top - dTitle.getBoundingClientRect().top;
    lifts.forEach(function (a) { a.cancel(); });
    lifts = rows.slice(0, hidIdx).map(function (rw) { return rw.animate([{ transform: 'translateY(' + (-lift) + 'px)' }, { transform: 'none' }], CLOSE); });
    var tA = dTitle.animate([{ transform: 'none' }, { transform: flipFrom(srcTitle, dTitle, true) }], CLOSE);
    tA.onfinish = function () {
      imgs[hidIdx].style.visibility = ''; h3s[hidIdx].style.visibility = '';
      lifts.forEach(function (a) { a.cancel(); }); lifts = [];
      detail.hidden = true; dImg.style.visibility = 'hidden'; dTitle.style.visibility = 'hidden';
      dImg.getAnimations().concat(dTitle.getAnimations()).forEach(function (a) { a.cancel(); });
      document.documentElement.style.overflow = '';
      hidIdx = null; phase = 'idle'; lastScroll = performance.now();
    };
  }
  detail.querySelector('.folio__close').addEventListener('click', close);
  detail.querySelector('.folio__back').addEventListener('click', close);
  detail.addEventListener('click', function (e) { if (e.target === detail || e.target.hasAttribute('data-scrim')) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

  // Поява, коли секція вперше заходить в екран: стрічки з розмиття, лічильник трохи згодом
  var io = new IntersectionObserver(function (en) {
    if (!en[0].isIntersecting) return;
    io.disconnect(); sec.classList.add('is-in');
    if (reduced) return;
    [tWrap, iWrap].forEach(function (el, k) {
      el.animate([{ opacity: 0, transform: 'translateY(28px) scale(1.04)', filter: 'blur(14px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }],
        { duration: 900, delay: k * 60, easing: 'cubic-bezier(.16,1,.3,1)' });
    });
    sec.querySelector('.folio__count').animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: 500, easing: 'cubic-bezier(.33,1,.68,1)', fill: 'backwards' });
  }, { threshold: 0.2 });
  io.observe(stick);

  requestAnimationFrame(tick);
})();

// ---------- Плашки аудиторій ----------
(function () {
  var cards = [].slice.call(document.querySelectorAll('.who__cards .card'));
  if (!cards.length) return;
  var titles = cards.map(function (c) { return c.querySelector('.card__title'); });

  // 1. Назва на всю ширину плашки: міряємо при 100px і масштабуємо під ширину контенту
  function fit() {
    titles.forEach(function (t) {
      var card = t.parentNode, cs = getComputedStyle(card);
      var w = card.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      t.style.fontSize = '100px';
      var tw = t.getBoundingClientRect().width;
      if (tw) t.style.fontSize = (100 * w / tw).toFixed(2) + 'px';
    });
  }
  fit();
  window.addEventListener('resize', fit);
  if (document.fonts) document.fonts.ready.then(fit);

  // 2. Активна лише одна плашка. Пауза після перемикання — щоб плашки, які їдуть під нерухомим курсором, не перехоплювали стан.
  var lockUntil = 0;
  function activate(c) {
    if (c.classList.contains('is-on')) return;
    cards.forEach(function (x) { x.classList.toggle('is-on', x === c); });
    lockUntil = performance.now() + 450;
  }
  cards.forEach(function (c) {
    c.addEventListener('pointerenter', function () { if (performance.now() > lockUntil) activate(c); });
    c.addEventListener('pointermove', function () { if (performance.now() > lockUntil) activate(c); });
    c.addEventListener('focus', function () { activate(c); });
    c.addEventListener('click', function () { activate(c); });
  });
})();
