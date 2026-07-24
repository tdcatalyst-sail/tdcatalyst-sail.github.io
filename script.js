// Cloudflare Web Analytics — inject the beacon on every page that loads this script
// (privacy-friendly, cookieless; token is public by design). Redirect stubs don't
// load script.js and bounce instantly, so they're intentionally untracked.
(function () {
  var s = document.createElement('script');
  s.defer = true;
  s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  s.setAttribute('data-cf-beacon', '{"token": "ea193c24f5b84666b3740d4b39e64260"}');
  document.head.appendChild(s);
})();

// Show confirmation banner after form submit (?sent=1)
(function () {
  if (new URLSearchParams(window.location.search).get('sent') !== '1') return;
  var banner = document.getElementById('sent-banner');
  if (!banner) return;
  banner.style.display = 'block';
  banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
})();

// Practice-switcher dropdown: close on outside click, Escape, or scroll-away
function closeBrandMenu() {
  var b = document.querySelector('.nav-brand.open');
  if (!b) return;
  b.classList.remove('open');
  var btn = b.querySelector('.brand-switch');
  if (btn) btn.setAttribute('aria-expanded', 'false');
}
(function () {
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav-brand')) closeBrandMenu();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeBrandMenu();
  });
})();

// Auto-hide nav on scroll down, reveal on scroll up
(function () {
  var nav = document.querySelector('nav');
  if (!nav) return;
  var lastY = window.scrollY;
  var threshold = 8; // ignore micro scrolls
  var topBuffer = 80; // always show near top
  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    var delta = y - lastY;
    if (Math.abs(delta) < threshold) return;
    if (y < topBuffer) {
      nav.classList.remove('nav--hidden');
    } else if (delta > 0) {
      nav.classList.add('nav--hidden');
      // also close the mobile menu and brand dropdown if open
      var inner = document.getElementById('nav');
      if (inner) inner.classList.remove('open');
      closeBrandMenu();
    } else {
      nav.classList.remove('nav--hidden');
    }
    lastY = y;
  }, { passive: true });
})();

// ===== Brand reshape 2026-07: terrain device + scroll reveals =====

// Gate for reveal styles (content stays visible when JS is off)
document.documentElement.classList.add('js');

(function () {
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Topographic contour renderer (marching squares over value noise) ---
  function makeNoise(seed) {
    function hash(x, y) {
      var h = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
      return h - Math.floor(h);
    }
    function smooth(t) { return t * t * (3 - 2 * t); }
    function noise(x, y) {
      var xi = Math.floor(x), yi = Math.floor(y);
      var xf = x - xi, yf = y - yi;
      var a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
      var u = smooth(xf), v = smooth(yf);
      return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
    }
    return function (x, y) {
      var val = 0, amp = 0.5, f = 1;
      for (var i = 0; i < 4; i++) { val += amp * noise(x * f, y * f); f *= 2; amp *= 0.5; }
      return val;
    };
  }

  // t drifts the noise field slowly — the terrain "breathes"
  function drawTerrain(canvas, t) {
    var d = canvas.dataset;
    var seed = parseFloat(d.seed || '1');
    var alpha = parseFloat(d.alpha || '0.15');
    var indexAlpha = parseFloat(d.indexAlpha || alpha * 2);
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    if (canvas.width !== Math.round(w * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    var fbm = makeNoise(seed);
    var cell = 6, scale = parseFloat(d.scale || '210');
    var cols = Math.ceil(w / cell) + 1, rows = Math.ceil(h / cell) + 1;
    var field = [];
    for (var j = 0; j < rows; j++) {
      field[j] = [];
      for (var i = 0; i < cols; i++) field[j][i] = fbm(i * cell / scale + t, j * cell / scale + t * 0.4);
    }
    var levels = 14;
    for (var li = 0; li < levels; li++) {
      var iso = 0.18 + (li / (levels - 1)) * 0.62;
      var isIndex = li % 5 === 0;
      ctx.strokeStyle = isIndex ? (d.index || '#E8B003') : (d.line || '#1F3A5F');
      ctx.lineWidth = isIndex ? 1.4 : 0.6;
      ctx.globalAlpha = isIndex ? indexAlpha : alpha;
      ctx.beginPath();
      for (j = 0; j < rows - 1; j++) {
        for (i = 0; i < cols - 1; i++) {
          var tl = field[j][i], tr = field[j][i + 1], br = field[j + 1][i + 1], bl = field[j + 1][i];
          var c = 0;
          if (tl > iso) c |= 8;
          if (tr > iso) c |= 4;
          if (br > iso) c |= 2;
          if (bl > iso) c |= 1;
          if (c === 0 || c === 15) continue;
          var x = i * cell, y = j * cell;
          var top = [x + cell * (iso - tl) / (tr - tl), y];
          var right = [x + cell, y + cell * (iso - tr) / (br - tr)];
          var bottom = [x + cell * (iso - bl) / (br - bl), y + cell];
          var left = [x, y + cell * (iso - tl) / (bl - tl)];
          function seg(p, q) { ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); }
          switch (c) {
            case 1: case 14: seg(left, bottom); break;
            case 2: case 13: seg(bottom, right); break;
            case 3: case 12: seg(left, right); break;
            case 4: case 11: seg(top, right); break;
            case 6: case 9: seg(top, bottom); break;
            case 7: case 8: seg(left, top); break;
            case 5: seg(left, top); seg(bottom, right); break;
            case 10: seg(top, right); seg(left, bottom); break;
          }
        }
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    if (d.fade === 'left' || d.fade === 'top') {
      var g = d.fade === 'left' ? ctx.createLinearGradient(w, 0, 0, 0) : ctx.createLinearGradient(0, h, 0, 0);
      g.addColorStop(0, 'rgba(' + d.fadeColor + ',0)');
      g.addColorStop(1, 'rgba(' + d.fadeColor + ',0.92)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }
  }

  var canvases = document.querySelectorAll('canvas.terrain, canvas.card-terrain');
  if (canvases.length) {
    var renderAll = function () { canvases.forEach(function (c) { drawTerrain(c, 0); }); };
    var raf = null;
    window.addEventListener('resize', function () {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(renderAll);
    });
    renderAll();

    // Slow drift on [data-animate] canvases — paused offscreen, off under reduced motion
    var heroCanvas = document.querySelector('canvas.terrain[data-animate]');
    if (heroCanvas && !reducedMotion && window.matchMedia('(min-width: 700px)').matches) {
      var driftT = 0, heroVisible = true, lastFrame = 0;
      new IntersectionObserver(function (entries) {
        heroVisible = entries[0].isIntersecting;
      }).observe(heroCanvas);
      var tick = function (now) {
        if (heroVisible && !document.hidden && now - lastFrame > 50) { // ~20fps is plenty for a drift
          lastFrame = now;
          driftT += 0.0018;
          drawTerrain(heroCanvas, driftT);
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  }

  // --- Scroll reveals ---
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    if (reducedMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        });
      }, { threshold: 0.12 });
      revealEls.forEach(function (el) { io.observe(el); });
    }
  }
})();

// ===== Terrain hero stage: a dashed trail climbs the ambient contour field and
//       docks at named "peaks", one per practice, each a link to its home.
//       Geometry / timing are canonical (see design_handoff_terrain_hero). The
//       field's own contours come from canvas.terrain — this overlay adds only
//       trail, peaks, labels, fog and coords, so the two never compete. =====
(function () {
  var mount = document.querySelector('[data-terrain-stage]');
  if (!mount) return;
  var cfgEl = document.querySelector('[data-terrain-config]');
  var cfg = {};
  try { cfg = JSON.parse(cfgEl.textContent); } catch (e) { return; }
  var pains = cfg.pains || [];
  if (!pains.length) return;
  var coords = cfg.coords || '';
  var DUR = cfg.durMs || 6000;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function win(t, a, b) { return clamp((t - a) / (b - a), 0, 1); }
  function eoc(t) { return 1 - Math.pow(1 - t, 3); }
  function eob(t) { var c = 2.2; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); }
  function crPath(pts) {
    if (pts.length < 2) return '';
    var d = 'M ' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || pts[i + 1];
      d += ' C ' + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + ' ' + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)
        + ' ' + (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + ' ' + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)
        + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
    }
    return d;
  }
  var TRAIL = [[92, 612], [135, 545], [225, 444], [258, 449], [315, 281], [344, 288], [398, 126]];
  function markerPts(n) {
    var all = { low: [225, 444], mid: [315, 281], high: [398, 126], xlow: [160, 527] };
    if (n <= 2) return [all.high, all.low];
    if (n >= 4) return [all.high, all.mid, all.low, all.xlow];
    return [all.high, all.mid, all.low];
  }
  function arrivals(n) {
    if (n <= 2) return [0.80, 0.344];
    if (n >= 4) return [0.80, 0.574, 0.344, 0.2];
    return [0.80, 0.574, 0.344];
  }
  function sampleTrail(f) {
    var p = TRAIL, seg = [], total = 0, i, d;
    for (i = 0; i < p.length - 1; i++) { d = Math.hypot(p[i + 1][0] - p[i][0], p[i + 1][1] - p[i][1]); seg.push(d); total += d; }
    var target = f * total;
    for (i = 0; i < seg.length; i++) {
      if (target <= seg[i] || i === seg.length - 1) {
        var r = seg[i] ? target / seg[i] : 0;
        return [p[i][0] + (p[i + 1][0] - p[i][0]) * r, p[i][1] + (p[i + 1][1] - p[i][1]) * r];
      }
      target -= seg[i];
    }
    return p[p.length - 1];
  }
  var SVGNS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs) {
    var e = document.createElementNS(SVGNS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  var n = clamp(pains.length, 2, 4);
  var pts = markerPts(n), arr = arrivals(n);
  var uid = 'tp' + Math.floor(Math.random() * 1e6);

  var svg = svgEl('svg', { viewBox: '0 0 500 640', class: 'tp-svg', 'aria-hidden': 'true', focusable: 'false' });
  mount.appendChild(svg);

  // defs: fog gradient + trail reveal mask
  var defs = svgEl('defs', {});
  var fogG = svgEl('radialGradient', { id: uid + '-fog', cx: '50%', cy: '50%', r: '50%' });
  fogG.appendChild(svgEl('stop', { offset: '0%', 'stop-color': '#fff', 'stop-opacity': '0.55' }));
  fogG.appendChild(svgEl('stop', { offset: '100%', 'stop-color': '#fff', 'stop-opacity': '0' }));
  defs.appendChild(fogG);
  var trailD = crPath(TRAIL);
  var mask = svgEl('mask', { id: uid + '-tm' });
  var maskPath = svgEl('path', { d: trailD, pathLength: '1', class: 'tp-maskpath' });
  mask.appendChild(maskPath);
  defs.appendChild(mask);
  svg.appendChild(defs);

  var fog = svgEl('ellipse', { cx: 300, cy: 360, rx: 250, ry: 240, fill: 'url(#' + uid + '-fog)', class: 'tp-fog' });
  svg.appendChild(fog);

  var trail = svgEl('path', { d: trailD, mask: 'url(#' + uid + '-tm)', class: 'tp-trail' });
  svg.appendChild(trail);
  var head = svgEl('circle', { r: 3.5, cx: TRAIL[0][0], cy: TRAIL[0][1], class: 'tp-head' });
  svg.appendChild(head);

  // markers: leaders under, then dot groups
  var M = pts.map(function (p, k) {
    var isSummit = k === 0;
    var dotR = isSummit ? 6.5 : 5.5, bgR = dotR + 3.5;
    var leader = svgEl('path', { d: 'M 196 ' + p[1] + ' L ' + (p[0] - bgR - 2).toFixed(1) + ' ' + p[1], pathLength: '1', class: 'tp-leader' });
    svg.appendChild(leader);
    return { k: k, cx: p[0], cy: p[1], mc: pains[k].c || 'var(--navy)', isSummit: isSummit, dotR: dotR, bgR: bgR, leader: leader };
  });
  M.forEach(function (m) {
    var g = svgEl('g', { class: 'tp-marker' });
    g.style.transform = 'translate(' + m.cx + 'px,' + m.cy + 'px) scale(0)';
    var ping = svgEl('circle', { r: m.dotR, class: 'tp-ping' });
    ping.style.stroke = m.mc;
    g.appendChild(ping);
    if (m.isSummit) {
      var pulse = svgEl('circle', { r: m.dotR, class: 'tp-pulse' });
      pulse.style.stroke = m.mc;
      g.appendChild(pulse);
    }
    var halo = svgEl('circle', { r: m.dotR + 5, class: 'tp-halo' });
    halo.style.stroke = m.mc;
    g.appendChild(halo);
    var bg = svgEl('circle', { r: m.bgR, class: 'tp-dotbg' });
    g.appendChild(bg);
    var dot = svgEl('circle', { r: m.dotR, class: 'tp-dot' });
    if (m.isSummit) { dot.style.fill = m.mc; dot.style.stroke = 'var(--offwhite)'; dot.style.strokeWidth = '1.5'; }
    else { dot.style.fill = 'var(--offwhite)'; dot.style.stroke = m.mc; }
    g.appendChild(dot);
    svg.appendChild(g);
    m.g = g; m.ping = ping; m.halo = halo;
  });

  // HTML overlays: each pain is a real link/row carrying the visible text
  M.forEach(function (m, k) {
    var p = pains[k];
    var row = document.createElement(p.href ? 'a' : 'div');
    row.className = 'tp-row' + (m.isSummit ? ' tp-row--summit' : '');
    row.style.top = m.cy + 'px';
    if (p.href) { row.href = p.href; row.setAttribute('aria-label', p.t + (p.d ? '. ' + p.d : '') + ' — explore this practice.'); }
    var label = document.createElement('span');
    label.className = 'tp-label';
    var title = document.createElement('span');
    title.className = 'tp-title';
    title.textContent = p.t;
    if (p.ct) title.style.setProperty('--tp-accent', p.ct); else title.style.setProperty('--tp-accent', m.mc);
    label.appendChild(title);
    if (p.d) {
      var det = document.createElement('span');
      det.className = 'tp-detail';
      det.textContent = p.d;
      label.appendChild(det);
      m.det = det;
    }
    row.appendChild(label);
    mount.appendChild(row);
    m.row = row; m.title = title;
    row.addEventListener('mouseenter', function () { if (state.done) { state.hover = k; render(1); } });
    row.addEventListener('mouseleave', function () { if (state.done) { state.hover = null; render(1); } });
    row.addEventListener('focus', function () { if (state.done) { state.hover = k; render(1); } });
    row.addEventListener('blur', function () { if (state.done) { state.hover = null; render(1); } });
  });

  var coordsEl = document.createElement('div');
  coordsEl.className = 'tp-coords';
  coordsEl.textContent = coords;
  mount.appendChild(coordsEl);
  var hint = document.createElement('div');
  hint.className = 'tp-hint';
  hint.textContent = 'HOVER A PEAK TO BRING IT INTO FOCUS';
  mount.appendChild(hint);
  var replay = document.createElement('button');
  replay.type = 'button';
  replay.className = 'tp-replay';
  replay.setAttribute('aria-label', 'Replay animation');
  replay.textContent = '↻ REPLAY';
  mount.appendChild(replay);

  var state = { T: 0, done: false, hover: null, begun: false, playing: false, raf: 0 };

  function render(T) {
    state.T = T;
    var done = state.done, focus = done ? state.hover : null;
    var rawTp = win(T, 0.12, 0.80), tp = eoc(rawTp);
    maskPath.style.strokeDashoffset = (1 - tp).toFixed(4);
    var hp = sampleTrail(tp);
    head.setAttribute('cx', hp[0].toFixed(1)); head.setAttribute('cy', hp[1].toFixed(1));
    head.style.opacity = clamp(Math.min(rawTp * 8, (1 - rawTp) * 14), 0, 1).toFixed(3);
    var recover = win(T, 0.9, 0.97);
    M.forEach(function (m, k) {
      var start = arr[k];
      var mp = win(T, start, start + 0.08), mpp = eob(mp);
      var active = false, dimF = 1;
      if (!done) {
        var nextA = k > 0 ? arr[k - 1] : 0.9;
        active = T >= start && T < nextA;
        if (k > 0) { var dv = 1 - 0.72 * win(T, arr[k - 1], arr[k - 1] + 0.07); dimF = dv + (1 - dv) * recover; }
      } else if (focus != null) { active = focus === k; dimF = active ? 1 : 0.3; }
      var dim = dimF < 0.95;
      m.g.style.transition = done ? 'transform .38s cubic-bezier(.2,.7,.2,1),opacity .3s ease' : 'none';
      m.g.style.transform = 'translate(' + m.cx + 'px,' + m.cy + 'px) scale(' + (mpp * (done && active ? 1.16 : 1)).toFixed(3) + ')';
      m.g.style.opacity = (clamp(mp * 1.4, 0, 1) * dimF).toFixed(3);
      m.ping.style.transform = 'scale(' + (0.5 + mp * 2.4).toFixed(2) + ')';
      m.ping.style.opacity = (clamp(1 - mp, 0, 1) * 0.5).toFixed(3);
      m.halo.style.transition = done ? 'opacity .3s ease' : 'none';
      m.halo.style.opacity = done && active ? 0.35 : 0;
      var lp = eoc(win(T, start + 0.02, start + 0.14));
      var lop = lp * dimF;
      m.leader.style.transition = done ? 'opacity .3s ease,stroke .3s ease' : 'none';
      m.leader.style.strokeDashoffset = (1 - lp).toFixed(3);
      m.leader.style.opacity = (lop * 0.9).toFixed(3);
      m.leader.style.stroke = active ? m.mc : 'var(--tp-leader)';
      m.row.style.transition = done ? 'opacity .3s ease' : 'none';
      m.row.style.opacity = lop.toFixed(3);
      m.row.style.pointerEvents = (done && lop > 0.5) ? 'auto' : 'none';
      m.title.style.transition = done ? 'color .3s ease,border-color .3s ease' : 'none';
      m.title.classList.toggle('is-dim', dim);
      m.title.classList.toggle('is-active', !!active);
      if (m.det) m.det.classList.toggle('is-dim', dim);
    });
    coordsEl.style.opacity = win(T, 0.7, 1).toFixed(3);
    hint.style.display = (done && state.hover == null) ? 'block' : 'none';
    replay.style.display = done ? 'block' : 'none';
    mount.classList.toggle('is-live', !done);
  }

  function begin(force) {
    if (state.playing || (state.begun && !force)) return;
    state.begun = true;
    if (reduce && !force) { state.done = true; render(1); return; }
    state.playing = true; state.done = false; state.hover = null;
    var start = performance.now();
    function tick(now) {
      var t = Math.min(1, (now - start) / DUR);
      if (t >= 1) { state.playing = false; state.done = true; }
      render(t);
      if (t < 1) state.raf = requestAnimationFrame(tick);
    }
    state.raf = requestAnimationFrame(tick);
  }
  replay.addEventListener('click', function () { if (state.raf) cancelAnimationFrame(state.raf); state.playing = false; begin(true); });

  try {
    if ('IntersectionObserver' in window) {
      var io2 = new IntersectionObserver(function (es) {
        if (es.some(function (e) { return e.isIntersecting; })) { begin(false); io2.disconnect(); }
      }, { threshold: 0.25 });
      io2.observe(mount);
    } else begin(false);
  } catch (e) { begin(false); }
  setTimeout(function () { begin(false); }, 900);

  render(0);
})();
