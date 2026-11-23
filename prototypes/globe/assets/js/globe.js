/*
 * Globe — інтерактивна WebGL-планета без залежностей.
 *
 * Розмітка:
 *   <div class="globe" data-globe data-theme="light|dark|monolead">
 *     <canvas></canvas>
 *     <button class="globe__marker" data-lat="50.45" data-lon="30.52">+</button>
 *   </div>
 * Потрібен assets/js/globe-land.js (window.GLOBE_LAND) перед цим файлом.
 */
(function () {
  'use strict';

  // Нові можливості (за замовчуванням вимкнені, тож старі сторінки виглядають як раніше):
  //   dotDensity — у скільки разів густіші точки суші; countries — коди з GLOBE_COUNTRIES (щільна заливка + кордони);
  //   hlColor / borderColor — колір підсвіченої країни та її кордону; highlightEase — плавність загорання;
  //   highlightIdle — легке жевріння всіх країн у спокої (0..1);
  //   swayAmp / swayTilt (°) і swayPeriod (с) — повільне погойдування кулі; hoverGrow — «лінза» під курсором.
  //   dotSoftness — розмиття країв точок: 0 = чітка крапка (згладжено ~1px), 1 = м'яка пляма, як раніше.
  //   roll (°) — поворот кадру навколо осі погляду (проти годинникової), як поворот картинки у Figma.
  var DEFAULTS = {
    offsetX: 0, offsetY: 0, dotDensity: 1, countries: [], countryStep: 0.12,
    hlColor: '#ff5a1f', borderColor: '#ffdca6', highlightEase: 6, highlightIdle: 0,
    swayAmp: 0, swayTilt: 0, swayPeriod: 14, hoverGrow: 0.6, roll: 0, dotSoftness: 0
  };
  // Усі параметри планети. Тема задає базу, data-settings='{...}' — перевизначення.
  var THEMES = {
    light: {
      lit: '#f5f7ff', shade: '#78a3fa', cloud: '#d9e6ff', rim: '#ffffff', dot: '#ffffff',
      dotOpacity: 0.85, dotSize: 1, dotLift: 0.035, dotJitter: 0.9, twinkle: 0.35,
      lightAngle: 165, lightFront: 0.22, terminator: 0.42, softness: 0.6,
      cloudScale: 1.6, cloudAmount: 0.38, cloudDetail: 0.1, cloudTint: 0.22, cloudSpeed: 1,
      rimStrength: 0.55, rimPower: 2.5,
      size: 0.9, offsetX: 0, offsetY: 0, spinSpeed: 0.1, tilt: 18, startLon: 20,
      hoverRadius: 0.22, hoverDrag: 0.12, hoverPush: 0.05, hoverScatter: 0.35, hoverGlow: 0.8, hoverEase: 4
    },
    dark: {
      lit: '#ededed', shade: '#080808', cloud: '#8c8c8c', rim: '#ffffff', dot: '#ffffff',
      dotOpacity: 0.9, dotSize: 1, dotLift: 0.035, dotJitter: 0.9, twinkle: 0.35,
      lightAngle: 165, lightFront: 0.22, terminator: 0.42, softness: 0.6,
      cloudScale: 1.6, cloudAmount: 0.38, cloudDetail: 0.1, cloudTint: 0.22, cloudSpeed: 1,
      rimStrength: 0.55, rimPower: 2.5,
      size: 0.9, offsetX: 0, offsetY: 0, spinSpeed: 0.1, tilt: 18, startLon: 20,
      hoverRadius: 0.22, hoverDrag: 0.12, hoverPush: 0.05, hoverScatter: 0.35, hoverGlow: 0.8, hoverEase: 4
    },
    // Палітра сайту Monolead (Figma, кадр «5»): фон #0c0c0c, вогняний градієнт #ff2f00 → #f27f24 → #ffdca6.
    // Нічний бік зливається з фоном, освітлений серп горить помаранчевим, точки і обідок — кремові.
    monolead: {
      lit: '#f27f24', shade: '#0c0c0c', cloud: '#ff2f00', rim: '#ffdca6', dot: '#ffdca6',
      dotOpacity: 0.9, dotSize: 1, dotLift: 0.035, dotJitter: 0.9, twinkle: 0.4,
      lightAngle: 150, lightFront: 0.1, terminator: 0.5, softness: 0.55,
      cloudScale: 1.6, cloudAmount: 0.4, cloudDetail: 0.12, cloudTint: 0.45, cloudSpeed: 1,
      rimStrength: 0.75, rimPower: 2.2,
      size: 0.9, offsetX: 0, offsetY: 0, spinSpeed: 0.08, tilt: 30, startLon: 18,
      hoverRadius: 0.22, hoverDrag: 0.12, hoverPush: 0.05, hoverScatter: 0.35, hoverGlow: 1.1, hoverEase: 4
    }
  };

  function hex(c) {
    var n = parseInt(String(c).replace('#', ''), 16);
    return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
  }

  var NOISE = [
    'vec3 hash3(vec3 p){p=fract(p*vec3(.1031,.1030,.0973));p+=dot(p,p.yxz+33.33);return fract((p.xxy+p.yxx)*p.zyx)*2.-1.;}',
    'float gnoise(vec3 p){vec3 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);',
    ' return mix(mix(mix(dot(hash3(i),f),dot(hash3(i+vec3(1,0,0)),f-vec3(1,0,0)),u.x),',
    '  mix(dot(hash3(i+vec3(0,1,0)),f-vec3(0,1,0)),dot(hash3(i+vec3(1,1,0)),f-vec3(1,1,0)),u.x),u.y),',
    ' mix(mix(dot(hash3(i+vec3(0,0,1)),f-vec3(0,0,1)),dot(hash3(i+vec3(1,0,1)),f-vec3(1,0,1)),u.x),',
    '  mix(dot(hash3(i+vec3(0,1,1)),f-vec3(0,1,1)),dot(hash3(i+vec3(1,1,1)),f-vec3(1,1,1)),u.x),u.y),u.z);}',
    'float fbm(vec3 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*gnoise(p);p=p*2.03+vec3(1.7,9.2,3.1);a*=.5;}return s;}'
  ].join('\n');

  // Сфера: повноекранний квад, перетин променя зі сферою у фрагментному шейдері.
  var SPHERE_VS = '#version 300 es\nin vec2 a;out vec2 v;void main(){v=a;gl_Position=vec4(a,0,1);}';
  var SPHERE_FS = [
    '#version 300 es',
    'precision highp float;',
    'in vec2 v;out vec4 o;',
    'uniform vec2 uAspect,uOff;uniform float uR,uPx,uT;uniform mat3 uRot;',
    'uniform vec3 uLit,uShade,uCloud,uRim,uL;',
    'uniform float uCScale,uCAmt,uCDet,uCTint,uCT,uTerm,uSoft,uRimS,uRimP;',
    NOISE,
    'void main(){',
    ' vec2 q=(v-uOff)*uAspect/uR;float r=length(q);',
    ' float aa=uPx*1.5;',
    ' if(r>1.+aa){o=vec4(0);return;}',
    ' vec3 n=vec3(q,sqrt(max(1.-r*r,0.)));',
    ' vec3 p=transpose(uRot)*n;',               // координати на поверхні планети
    ' float c=fbm(p*uCScale+vec3(0.,uCT*.015,0.));',
    ' float c2=fbm(p*uCScale*2.-vec3(uCT*.01));',
    ' vec3 L=normalize(uL);',
    ' float d=dot(n,L)*.5+.5;',
    ' float k=smoothstep(uTerm,uTerm+uSoft,d+c*uCAmt+c2*uCDet);',
    ' vec3 col=mix(uShade,uLit,k);',
    ' col=mix(col,uCloud,smoothstep(.0,.4,c)*uCTint*(1.-k*.6));',
    ' float fr=pow(1.-n.z,uRimP);',
    ' col=mix(col,uRim,clamp(fr*uRimS*(.4+.6*d),0.,1.));',
    ' float edge=smoothstep(1.,1.-aa,r);',
    ' o=vec4(col*edge,edge);',
    '}'
  ].join('\n');

  // Точки континентів: трохи над поверхнею, з розкидом по висоті — дає «пил» по краю.
  var DOT_VS = [
    '#version 300 es',
    'in vec3 aPos;in float aSeed;in vec2 aCB;',
    'uniform vec2 uAspect,uOff;uniform float uR,uSize,uT,uTw;uniform mat3 uRot;',
    // Миша: позиція й швидкість (в радіусах планети), сила наведення 0..1.
    'uniform vec2 uM,uMV;uniform float uMS,uHRad,uHDrag,uHPush,uHScat,uHGlow,uHGrow;',
    // Підсвітка країн: інтенсивність 0..1 для кожної країни зі settings.countries.
    'uniform float uHL[8];',
    'out float vA;out float vK;out float vB;out float vPs;',
    'void main(){',
    ' vec3 p=uRot*aPos;',
    ' float rr=length(p.xy);',
    ' float front=smoothstep(-.05,.25,p.z);',
    ' float rim=p.z<0.?smoothstep(1.,1.012,rr):0.;',  // видно із-за краю
    ' float tw=1.-uTw+uTw*sin(uT*1.7+aSeed*40.);',
    ' vec2 xy=p.xy;',
    ' vec2 dm=xy-uM;float dist=length(dm);',
    ' float f=exp(-dist*dist/(uHRad*uHRad))*uMS*front;',
    ' int ci=int(aCB.x+.5)-1;float k=ci>=0?uHL[ci]:0.;float bd=aCB.y;',
    ' vK=k*front;vB=bd>.5?aSeed:0.;',
    ' float sp=min(length(uMV),4.);',
    ' vec2 rnd=vec2(cos(aSeed*91.7),sin(aSeed*91.7));',
    // тягнуться за рухом миші + розступаються від курсора + хаотичний розліт при русі
    ' xy+=uMV*uHDrag*f*(.6+aSeed*.8);',
    ' xy+=(dist>1e-4?dm/dist:vec2(0))*uHPush*f;',
    ' xy+=rnd*uHScat*f*sp*.05;',
    ' vA=max(front*(.55+.45*p.z),rim*.8)*tw;',
    ' vA=min(1.,vA*(1.+uHGlow*f));',
    ' if(ci>=0)vA*=bd>.5?k:mix(1.,1.15,k);',  // щільні точки країни з'являються лише при підсвітці
    ' gl_Position=vec4(xy*uR/uAspect+uOff,0,1);',
    ' gl_PointSize=uSize*(.7+aSeed*.6)*(.75+.25*max(p.z,0.))*(1.+uHGrow*f*(bd>.5?.2:1.))*(bd>.5?.6+.5*k:1.)*(1.+k*.15);vPs=gl_PointSize;',  // при підсвітці щільні точки ростуть — рій густішає
    '}'
  ].join('\n');
  var DOT_FS = [
    '#version 300 es',
    'precision mediump float;in float vA;in float vK;in float vB;in float vPs;out vec4 o;uniform vec3 uDot,uHlc,uBdc;uniform float uA,uSoft;',
    // край точки: при uSoft=0 — згладження рівно ~1 піксель (чітка крапка), при 1 — м'яка пляма
    'void main(){vec2 c=gl_PointCoord-.5;float d=length(c);if(d>.5)discard;',
    ' float e=mix(1./max(vPs,1.),.3,clamp(uSoft,0.,1.));',
    ' float a=smoothstep(.5,.5-e,d)*min(1.,vA*uA*(1.+vK*.3));',
    ' vec3 col=mix(uDot,mix(uHlc,uBdc,vB*.45),vK);o=vec4(col*a,a);}'
  ].join('\n');

  function shader(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  function program(gl, vs, fs) {
    var p = gl.createProgram();
    gl.attachShader(p, shader(gl, gl.VERTEX_SHADER, vs));
    gl.attachShader(p, shader(gl, gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    var u = {};
    for (var i = 0, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); i < n; i++) {
      var name = gl.getActiveUniform(p, i).name;
      // масиви WebGL повертає як «uHL[0]» — зберігаємо під іменем без індексу
      u[name.replace(/\[0\]$/, '')] = gl.getUniformLocation(p, name);
    }
    return { p: p, u: u };
  }

  function toXYZ(lat, lon) {
    var la = lat * Math.PI / 180, lo = lon * Math.PI / 180;
    return [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)];
  }

  // Детермінований псевдовипадок, щоб точки не «стрибали» між завантаженнями.
  function rng(seed) {
    return function () {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  }

  // Точка в багатокутнику (лон/лат), промінь вправо.
  function inPoly(lo, la, poly) {
    var inside = false;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      var xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
      if ((yi > la) !== (yj > la) && lo < (xj - xi) * (la - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  // Кілька кілець (острови, анклави): правило even-odd — точка всередині, якщо в непарній кількості кілець.
  function inRings(lo, la, rings) {
    var n = 0;
    for (var i = 0; i < rings.length; i++) if (inPoly(lo, la, rings[i])) n++;
    return n % 2 === 1;
  }
  function bbox(rings) {
    var b = [180, 90, -180, -90];
    rings.forEach(function (poly) { poly.forEach(function (v) { b[0] = Math.min(b[0], v[0]); b[1] = Math.min(b[1], v[1]); b[2] = Math.max(b[2], v[0]); b[3] = Math.max(b[3], v[1]); }); });
    return b;
  }

  // Точки суші (+ густіші копії) і, якщо задано countries, щільна заливка та кордони цих країн.
  // aCB: x = номер країни (1..n, 0 — не країна), y = 1 для «щільних» точок країни (видно лише при підсвітці).
  function landData(jitter, lift, density, codes, step) {
    var bin = atob(window.GLOBE_LAND || '');
    var src = bin.length / 4, r = rng(7);
    var pos = [], seed = [], cb = [];
    var C = window.GLOBE_COUNTRIES || {};
    var polys = (codes || []).map(function (c) {
      var rings = C[c] && (C[c].rings || (C[c].poly && [C[c].poly]));
      return rings ? { rings: rings, box: bbox(rings) } : null;
    });
    function country(lo, la) {
      for (var k = 0; k < polys.length; k++) {
        var q = polys[k]; if (!q) continue;
        if (lo < q.box[0] || lo > q.box[2] || la < q.box[1] || la > q.box[3]) continue;
        if (inRings(lo, la, q.rings)) return k + 1;
      }
      return 0;
    }
    function push(la, lo, h, ci, bd) {
      var p = toXYZ(la, lo);
      pos.push(p[0] * h, p[1] * h, p[2] * h); seed.push(r()); cb.push(ci, bd);
    }
    var dens = Math.max(1, Math.round(density || 1));
    for (var i = 0; i < src; i++) {
      var b = i * 4;
      var la0 = ((bin.charCodeAt(b) | bin.charCodeAt(b + 1) << 8) << 16 >> 16) / 100;
      var lo0 = ((bin.charCodeAt(b + 2) | bin.charCodeAt(b + 3) << 8) << 16 >> 16) / 100;
      for (var d = 0; d < dens; d++) {
        // перша копія — як раніше; додаткові заповнюють проміжки між вихідними точками (~0.9°)
        var spread = d === 0 ? jitter : Math.max(jitter, 0.9);
        var la = la0 + (r() - 0.5) * spread;
        var lo = lo0 + (r() - 0.5) * spread / Math.max(Math.cos(la * Math.PI / 180), 0.2);
        push(la, lo, 1.006 + Math.pow(r(), 3) * lift, polys.length ? country(lo, la) : 0, 0);
      }
    }
    // Щільна сітка всередині країн (крок step°, з розкидом): невидима в спокої, проявляється при підсвітці.
    polys.forEach(function (q, k) {
      if (!q) return;
      for (var la = q.box[1]; la <= q.box[3]; la += step) {
        var ls = step / Math.max(Math.cos(la * Math.PI / 180), 0.2);
        for (var lo = q.box[0]; lo <= q.box[2]; lo += ls) {
          var jl = la + (r() - 0.5) * step * 0.8, jo = lo + (r() - 0.5) * ls * 0.8;
          if (inRings(jo, jl, q.rings)) push(jl, jo, 1.005 + Math.pow(r(), 4) * lift * 0.3, k + 1, 1);
        }
      }
    });
    return { pos: new Float32Array(pos), seed: new Float32Array(seed), cb: new Float32Array(cb), n: seed.length };
  }

  // R = Rx(tilt) · Ry(spin), у column-major для WebGL.
  function rotation(spin, tilt) {
    var cy = Math.cos(spin), sy = Math.sin(spin), cx = Math.cos(tilt), sx = Math.sin(tilt);
    return new Float32Array([
      cy, sx * sy, -cx * sy,
      0, cx, sx,
      sy, -sx * cy, cx * cy
    ]);
  }
  // Rz(roll) · R — поворот усього кадру в площині екрана (column-major).
  function withRoll(m, roll) {
    if (!roll) return m;
    var c = Math.cos(roll), s = Math.sin(roll), o = new Float32Array(9);
    for (var j = 0; j < 3; j++) {
      var x = m[j * 3], y = m[j * 3 + 1];
      o[j * 3] = c * x - s * y; o[j * 3 + 1] = s * x + c * y; o[j * 3 + 2] = m[j * 3 + 2];
    }
    return o;
  }
  function apply(m, p) {
    return [
      m[0] * p[0] + m[3] * p[1] + m[6] * p[2],
      m[1] * p[0] + m[4] * p[1] + m[7] * p[2],
      m[2] * p[0] + m[5] * p[1] + m[8] * p[2]
    ];
  }

  function Globe(root) {
    var canvas = root.querySelector('canvas');
    var gl = canvas.getContext('webgl2', { premultipliedAlpha: true, antialias: true, alpha: true });
    if (!gl) { root.classList.add('globe--fallback'); return; }

    var cfg = Object.assign({}, DEFAULTS, THEMES[root.dataset.theme] || THEMES.light);
    if (root.dataset.startLon) cfg.startLon = +root.dataset.startLon;
    if (root.dataset.settings) Object.assign(cfg, JSON.parse(root.dataset.settings));

    var sphere = program(gl, SPHERE_VS, SPHERE_FS);
    var dots = program(gl, DOT_VS, DOT_FS);

    var quadVao = gl.createVertexArray();
    gl.bindVertexArray(quadVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var la = gl.getAttribLocation(sphere.p, 'a');
    gl.enableVertexAttribArray(la);
    gl.vertexAttribPointer(la, 2, gl.FLOAT, false, 0, 0);

    var dotVao = gl.createVertexArray(), posBuf = gl.createBuffer(), seedBuf = gl.createBuffer();
    gl.bindVertexArray(dotVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    var lp = gl.getAttribLocation(dots.p, 'aPos');
    gl.enableVertexAttribArray(lp);
    gl.vertexAttribPointer(lp, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, seedBuf);
    var ls = gl.getAttribLocation(dots.p, 'aSeed');
    gl.enableVertexAttribArray(ls);
    gl.vertexAttribPointer(ls, 1, gl.FLOAT, false, 0, 0);
    var cbBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cbBuf);
    var lc = gl.getAttribLocation(dots.p, 'aCB');
    gl.enableVertexAttribArray(lc);
    gl.vertexAttribPointer(lc, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    var landN = 0, landKey = '';
    function buildLand() {
      var key = [cfg.dotJitter, cfg.dotLift, cfg.dotDensity, (cfg.countries || []).join(','), cfg.countryStep].join('|');
      if (key === landKey) return;
      landKey = key;
      var land = landData(+cfg.dotJitter, +cfg.dotLift, +cfg.dotDensity, cfg.countries, Math.max(0.04, +cfg.countryStep || 0.12));
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
      gl.bufferData(gl.ARRAY_BUFFER, land.pos, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, seedBuf);
      gl.bufferData(gl.ARRAY_BUFFER, land.seed, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, cbBuf);
      gl.bufferData(gl.ARRAY_BUFFER, land.cb, gl.STATIC_DRAW);
      landN = land.n;
    }
    buildLand();

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    // Підсвітка країн: ціль (0/1) і поточне значення, що плавно її наздоганяє.
    var hlCur = new Float32Array(8), hlTgt = new Float32Array(8);
    // Джерела підсвітки: елемент сторінки (чип / мітка) має пріоритет над країною під курсором на карті.
    var uiCode = null, mapCode = null;
    function setTargets(code) {
      var list = cfg.countries || [], idle = +cfg.highlightIdle || 0;
      // наведено на країну — вона розгоряється, решта пригасає; без наведення всі ледь жевріють (або тихі)
      for (var i = 0; i < 8; i++) hlTgt[i] = !list[i] ? 0 : code ? (list[i] === code ? 1 : idle * 0.4) : idle;
    }
    function highlight(code) { uiCode = code || null; setTargets(uiCode || mapCode); }
    function setMapCode(code) {
      if (code === mapCode) return;
      mapCode = code; setTargets(uiCode || mapCode);
      root.classList.toggle('is-country-hover', !!code);
    }
    setTargets(null);

    // Яка країна під курсором: точка на екрані (в радіусах) → поверхня кулі → назад у широту/довготу (R^T).
    function countryAt(mx, my) {
      var rr = mx * mx + my * my;
      if (rr >= 1 || !curR) return null;
      var sz = Math.sqrt(1 - rr), m = curR;
      var qx = m[0] * mx + m[1] * my + m[2] * sz, qy = m[3] * mx + m[4] * my + m[5] * sz, qz = m[6] * mx + m[7] * my + m[8] * sz;
      var la = Math.asin(Math.max(-1, Math.min(1, qy))) * 180 / Math.PI, lo = Math.atan2(qx, qz) * 180 / Math.PI;
      var C = window.GLOBE_COUNTRIES || {}, list = cfg.countries || [];
      for (var i = 0; i < list.length; i++) {
        var c = C[list[i]]; if (!c) continue;
        var rings = c.rings || (c.poly && [c.poly]);
        var b = c._box || (c._box = bbox(rings));
        if (lo < b[0] || lo > b[2] || la < b[1] || la > b[3]) continue;
        if (inRings(lo, la, rings)) return list[i];
      }
      return null;
    }

    var markers = [];
    function readMarkers() {
      markers = [].map.call(root.querySelectorAll('[data-lat]'), function (el) {
        return { el: el, p: toXYZ(+el.dataset.lat, +el.dataset.lon) };
      });
    }
    readMarkers();

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var spin = cfg.startLon * -Math.PI / 180;
    var tiltOffset = 0, vel = 0, last = performance.now();
    var drag = null, w = 0, h = 0, dpr = 1, visible = true, t0 = last, cloudT = 0, curR = rotation(spin, 0);

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = root.clientWidth; h = root.clientHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    function radiusPx() { return Math.min(w, h) / 2 * cfg.size; }
    // Центр планети в px. offsetX/offsetY — зсув у частках полотна (-1..1), щоб показати лише край кулі крупним планом.
    function cx() { return w / 2 * (1 + (+cfg.offsetX || 0)); }
    function cy() { return h / 2 * (1 - (+cfg.offsetY || 0)); }

    function frame(now) {
      if (!visible) return;
      var dt = Math.min((now - last) / 1000, 0.05); last = now;
      // Згладжена миша: позиція наздоганяє курсор, швидкість плавно згасає — точки пружно повертаються.
      var ease = 1 - Math.exp(-dt * cfg.hoverEase * 3);
      var px = mouse.x, py = mouse.y;
      mouse.x += (mouse.tx - mouse.x) * ease; mouse.y += (mouse.ty - mouse.y) * ease;
      if (dt > 0) {
        var k = 1 - Math.exp(-dt * cfg.hoverEase);
        mouse.vx += ((mouse.x - px) / dt - mouse.vx) * k; mouse.vy += ((mouse.y - py) / dt - mouse.vy) * k;
      }
      mouse.s += ((mouse.inside ? 1 : 0) - mouse.s) * (1 - Math.exp(-dt * 5));
      var t = (now - t0) / 1000;
      cloudT += dt * cfg.cloudSpeed;
      var auto = reduced ? 0 : cfg.spinSpeed;
      if (!drag) {
        vel += (auto - vel) * Math.min(1, dt * 2);  // інерція після перетягування
        spin += vel * dt;
      }
      var tilt = Math.max(-1.2, Math.min(1.2, cfg.tilt * Math.PI / 180 + tiltOffset));
      // Погойдування: повільно туди-назад навколо стартового ракурсу — видно, що куля жива, але кадр не губиться.
      var per = Math.max(2, +cfg.swayPeriod || 14), swOn = reduced ? 0 : 1;
      var sw = swOn * (+cfg.swayAmp || 0) * Math.PI / 180 * Math.sin(t * 2 * Math.PI / per);
      var swT = swOn * (+cfg.swayTilt || 0) * Math.PI / 180 * Math.sin(t * 2 * Math.PI / (per * 1.37) + 1);
      var hk = 1 - Math.exp(-dt * (+cfg.highlightEase || 6));
      for (var hi = 0; hi < 8; hi++) hlCur[hi] += (hlTgt[hi] - hlCur[hi]) * hk;
      var R = curR = withRoll(rotation(spin + sw, tilt + swT), (+cfg.roll || 0) * Math.PI / 180);
      // наведення на саму країну на карті (перевіряємо щокадру — куля погойдується під курсором)
      if (mouse.inside && (cfg.countries || []).length) setMapCode(countryAt(mouse.tx, mouse.ty));
      var radius = radiusPx();
      var aspect = w > h ? [w / h, 1] : [1, h / w];
      var rN = cfg.size;
      var ang = (cfg.lightAngle + (+cfg.roll || 0)) * Math.PI / 180;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      var u = sphere.u;
      gl.useProgram(sphere.p);
      gl.uniform2fv(u.uAspect, aspect);
      gl.uniform2f(u.uOff, +cfg.offsetX || 0, +cfg.offsetY || 0);
      gl.uniform1f(u.uR, rN);
      gl.uniform1f(u.uPx, 1 / (radius * dpr));
      gl.uniform1f(u.uT, t);
      gl.uniform1f(u.uCT, cloudT);
      gl.uniformMatrix3fv(u.uRot, false, R);
      gl.uniform3fv(u.uLit, hex(cfg.lit));
      gl.uniform3fv(u.uShade, hex(cfg.shade));
      gl.uniform3fv(u.uCloud, hex(cfg.cloud));
      gl.uniform3fv(u.uRim, hex(cfg.rim));
      gl.uniform3f(u.uL, Math.cos(ang), Math.sin(ang) * 0.3, cfg.lightFront);
      gl.uniform1f(u.uCScale, cfg.cloudScale);
      gl.uniform1f(u.uCAmt, cfg.cloudAmount);
      gl.uniform1f(u.uCDet, cfg.cloudDetail);
      gl.uniform1f(u.uCTint, cfg.cloudTint);
      gl.uniform1f(u.uTerm, cfg.terminator);
      gl.uniform1f(u.uSoft, Math.max(0.01, cfg.softness));
      gl.uniform1f(u.uRimS, cfg.rimStrength);
      gl.uniform1f(u.uRimP, cfg.rimPower);
      gl.bindVertexArray(quadVao);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      if (cfg.dotOpacity > 0) {
        u = dots.u;
        gl.useProgram(dots.p);
        gl.uniform2fv(u.uAspect, aspect);
        gl.uniform2f(u.uOff, +cfg.offsetX || 0, +cfg.offsetY || 0);
        gl.uniform1f(u.uR, rN);
        // розмір точки росте з радіусом, але не більше ~4px — щоб на крупному плані не роздувалися
        gl.uniform1f(u.uSize, Math.max(1.2, Math.min(radius / 135, 4)) * cfg.dotSize * dpr);
        gl.uniform1f(u.uT, t);
        gl.uniform1f(u.uTw, cfg.twinkle);
        gl.uniform2f(u.uM, mouse.x, mouse.y);
        gl.uniform2f(u.uMV, mouse.vx, mouse.vy);
        gl.uniform1f(u.uMS, reduced ? 0 : mouse.s);
        gl.uniform1f(u.uHRad, Math.max(0.01, cfg.hoverRadius));
        gl.uniform1f(u.uHDrag, cfg.hoverDrag);
        gl.uniform1f(u.uHPush, cfg.hoverPush);
        gl.uniform1f(u.uHScat, cfg.hoverScatter);
        gl.uniform1f(u.uHGlow, cfg.hoverGlow);
        gl.uniform1f(u.uHGrow, +cfg.hoverGrow || 0);
        gl.uniform1fv(u.uHL, hlCur);
        gl.uniform3fv(u.uHlc, hex(cfg.hlColor));
        gl.uniform3fv(u.uBdc, hex(cfg.borderColor));
        gl.uniformMatrix3fv(u.uRot, false, R);
        gl.uniform3fv(u.uDot, hex(cfg.dot));
        gl.uniform1f(u.uA, cfg.dotOpacity); gl.uniform1f(u.uSoft, +cfg.dotSoftness || 0);
        gl.bindVertexArray(dotVao);
        gl.drawArrays(gl.POINTS, 0, landN);
      }

      for (var i = 0; i < markers.length; i++) {
        var m = markers[i], p = apply(R, m.p);
        var a = Math.max(0, Math.min(1, (p[2] + 0.05) / 0.3));
        m.el.style.transform = 'translate(' + (cx() + p[0] * radius * 1.01) + 'px,' +
          (cy() - p[1] * radius * 1.01) + 'px) translate(-50%,-50%) scale(' + (0.7 + 0.3 * a) + ')';
        m.el.style.opacity = a;
        m.el.style.pointerEvents = a > 0.5 ? 'auto' : 'none';
        m.el.tabIndex = a > 0.5 ? 0 : -1;
      }
      requestAnimationFrame(frame);
    }

    canvas.addEventListener('pointerdown', function (e) {
      drag = { y: e.clientY, x: e.clientX, t: performance.now() };
      canvas.setPointerCapture(e.pointerId);
      root.classList.add('is-dragging');
    });
    // Наведення: координати курсора в радіусах планети, відносно її центру.
    var mouse = { x: 0, y: 0, tx: 0, ty: 0, vx: 0, vy: 0, s: 0, inside: false };
    root.addEventListener('pointermove', function (e) {
      var rect = root.getBoundingClientRect(), r = radiusPx();
      mouse.tx = (e.clientX - rect.left - cx()) / r;
      mouse.ty = -(e.clientY - rect.top - cy()) / r;
      if (!mouse.inside) { mouse.x = mouse.tx; mouse.y = mouse.ty; mouse.vx = mouse.vy = 0; }
      mouse.inside = e.pointerType === 'mouse' || !!drag;
    });
    root.addEventListener('pointerleave', function () { mouse.inside = false; setMapCode(null); });
    canvas.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var r = radiusPx(), now = performance.now();
      var dx = (e.clientX - drag.x) / r;
      spin += dx;
      vel = dx / Math.max((now - drag.t) / 1000, 0.008);
      tiltOffset += (e.clientY - drag.y) / r * 0.5;
      drag.x = e.clientX; drag.y = e.clientY; drag.t = now;
    });
    function end() { drag = null; root.classList.remove('is-dragging'); }
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);

    new ResizeObserver(resize).observe(root);
    resize();

    // Не рендеримо, поки планета поза екраном.
    new IntersectionObserver(function (es) {
      var v = es[0].isIntersecting;
      if (v && !visible) { visible = true; last = performance.now(); requestAnimationFrame(frame); }
      visible = v;
    }).observe(root);
    requestAnimationFrame(frame);

    // API для редактора: root.globe.set({...}), root.globe.settings, root.globe.refreshMarkers().
    root.globe = {
      settings: cfg,
      set: function (o) {
        Object.assign(cfg, o);
        if ('startLon' in o) { spin = cfg.startLon * -Math.PI / 180; }
        if ('tilt' in o) tiltOffset = 0;
        buildLand();
        if ('highlightIdle' in o || 'countries' in o) setTargets(uiCode || mapCode);
      },
      refreshMarkers: readMarkers,
      matrix: function () { return curR; },
      // Підсвітити країну за кодом (напр. 'PL') або зняти підсвітку (null).
      highlight: highlight
    };

    // Автоприв'язка: мітки з data-country у планеті й будь-які елементи сторінки з data-globe-country
    // (чипи, назви країн) підсвічують країну при наведенні / фокусі.
    var hosts = [].slice.call(root.querySelectorAll('[data-country]')).concat([].slice.call(document.querySelectorAll('[data-globe-country]')));
    hosts.forEach(function (el) {
      var code = el.dataset.country || el.dataset.globeCountry;
      if ((cfg.countries || []).indexOf(code) < 0) return;
      var on = function () { highlight(code); }, off = function () { highlight(null); };
      el.addEventListener('pointerenter', on); el.addEventListener('pointerleave', off);
      el.addEventListener('focus', on); el.addEventListener('blur', off);
    });
  }

  function init() {
    [].forEach.call(document.querySelectorAll('[data-globe]'), function (el) {
      try { Globe(el); } catch (err) { el.classList.add('globe--fallback'); console.error(err); }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
