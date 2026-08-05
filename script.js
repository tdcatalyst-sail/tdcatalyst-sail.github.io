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

// ===== Conversion instrumentation =====
// GoatCounter counts pageviews out of the box, which tells us what gets read and
// nothing about what gets acted on. This layer adds named events for the handful
// of actions that actually precede a conversation: scheduling clicks, contact
// forms, and the two tools. Events record the ACTION only — no identifiers, no
// field values — so nothing here changes what the privacy page promises.
//
// Event names follow `cta-<practice>-<zone>` for buttons and flat names for the
// rest (calendar-click, contact-form-start, contact-form-submit, and the
// tool events fired from the simulation and diagnostic pages themselves).
// window.tdTrack(name, title) is the shared entry point for those pages.
(function () {
  var pending = [];
  var tries = 0;

  function flush() {
    if (!(window.goatcounter && window.goatcounter.count)) return false;
    while (pending.length) {
      try { window.goatcounter.count(pending.shift()); } catch (err) { /* best effort */ }
    }
    return true;
  }

  // count.js is async, so early clicks queue until it lands (~10s ceiling,
  // after which we stop waiting rather than leak a timer).
  function drain() {
    if (flush() || tries++ > 100) return;
    setTimeout(drain, 100);
  }

  function track(name, title) {
    if (!name) return;
    pending.push({ path: name, title: title || name, event: true });
    drain();
  }
  window.tdTrack = track;

  // Which sub-site the click happened on, for `cta-<practice>-<zone>`.
  function practice() {
    var c = document.body.className || '';
    if (c.indexOf('brand-grow') > -1) return 'grow';
    if (c.indexOf('brand-sail') > -1) return 'sail';
    if (c.indexOf('brand-advise') > -1) return 'advise';
    return 'hub';
  }

  // Zone = the id of the enclosing section, so a button moving between sections
  // renames itself instead of silently reporting the wrong origin.
  function zone(node) {
    var sec = node.closest('section');
    if (!sec) return 'page';
    // Walk out to the nearest section that names itself; unnamed wrappers
    // would otherwise collapse every button into one anonymous bucket.
    while (sec && !sec.id) sec = sec.parentElement && sec.parentElement.closest('section');
    if (!sec) return 'page';
    return sec.id === 'main-content' ? 'hero' : sec.id;
  }

  var where = location.pathname;

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a, button');
    if (!a) return;

    // Explicit override wins over the derived name.
    var named = a.getAttribute('data-gc');
    if (named) { track(named, named + ' · ' + where); return; }

    var href = a.getAttribute('href') || '';
    if (href.indexOf('cal.com') > -1) {
      track('calendar-click', 'Scheduling click · ' + where);
      return;
    }
    if (a.classList.contains('btn') || a.classList.contains('nav-cta')) {
      var name = 'cta-' + practice() + '-' + zone(a);
      track(name, (a.textContent || '').trim().slice(0, 60) + ' · ' + where);
    }
  }, true);

  // Forms: one `-start` on the first field touched, one `-submit` on send.
  // data-gc-form renames the pair for tool forms (the simulation briefing).
  Array.prototype.forEach.call(document.querySelectorAll('form'), function (form) {
    var base = form.getAttribute('data-gc-form') || 'contact-form';
    var started = false;
    form.addEventListener('focusin', function () {
      if (started) return;
      started = true;
      track(base + '-start', base + ' started · ' + where);
    });
    form.addEventListener('submit', function () {
      track(base + '-submit', base + ' sent · ' + where);
    });
  });
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

// Value-noise field behind every terrain canvas. Hoisted to file scope so the
// hero-peaks overlay can sample the SAME field the contours are drawn from.
function tdTerrainNoise(seed) {
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

(function () {
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var makeNoise = tdTerrainNoise;

  // --- Topographic contour renderer (marching squares over value noise) ---
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
    if (d.fade === 'left' || d.fade === 'top' || d.fade === 'bottom') {
      var g = d.fade === 'left' ? ctx.createLinearGradient(w, 0, 0, 0)
        : d.fade === 'top' ? ctx.createLinearGradient(0, h, 0, 0)
        : ctx.createLinearGradient(0, 0, 0, h);   // 'bottom': dissolve downward
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

// ===== Hero peaks =========================================================
// A survey trail drawn over the hero's OWN terrain. We sample the same seeded
// noise field the canvas contours come from, find the real summits in the space
// left of the copy, and route between them with a least-cost path that penalises
// crossing contours — so the line traverses and switchbacks like a real route
// instead of cutting straight across. It enters from the top and finishes on the
// highest summit. Each peak names a pain and links to the practice that owns it;
// elevation encodes how acute it is. Desktop only; the hero markup is untouched.
(function () {
  var hero = document.querySelector('.hero--peaks');
  if (!hero) return;
  var canvas = hero.querySelector('canvas.terrain');
  var cfgEl = hero.querySelector('[data-peaks-config]');
  if (!canvas || !cfgEl) return;
  var cfg;
  try { cfg = JSON.parse(cfgEl.textContent); } catch (e) { return; }
  var PAINS = cfg.pains || [];
  if (PAINS.length < 2) return;
  // Two presentations of the same peak map:
  //   'flags' — the pains are planted on the peaks as small pennant flags in a
  //             quick sequence; no trail. (The hub: a surveyed map.)
  //   'walk'  — a dashed trail is routed over the field and docks at each peak
  //             in turn. (Sail: the walk is the product.)
  var MODE = cfg.mode === 'walk' ? 'walk' : 'flags';

  // --- tuning ---------------------------------------------------------------
  var GUTTER = 56;        // clear space between the copy and the label column
  var TRAVEL_MS = 3600;   // total time the head spends moving (~1.2s a leg)
  var HOLD_MS = 800;      // brief dwell at each peak; hover brings it back later
  var ALL_MS = 2200;      // final chord: all three pains lit together
  var FADE_MS = 900;      // then the piece settles…
  var REST_OP = 1;        // …but the labels stay put, both modes (Tom: don't
                          // dim the text away, it can stay). Hovering a marker
                          // still brings its own line forward.
  var TRAIL_REST = 0.32;  // the dashes fall back to a much lighter presence
  var CLIMB_W = 2.2;      // how hard the router avoids crossing contours —
                          // the original tuning: skirts non-destination peaks,
                          // takes the gentlest line into the ones it must climb
  var GRID = 9;           // routing grid step, px
  var FRAME_W = 760;      // the whole walk stays inside this right-hand frame —
                          // it never wanders out over the headline (Tom)
  var BELOW_W = 240;      // width of a label placed under its dot — wide enough
                          // for the full-size type (labels share one type size)
  var PROM_MIN = 0.035;   // a dot must sit inside a closed contour ring to read
                          // as a peak: that needs real prominence, not just a
                          // local maximum on an invisible bump.

  var SVGNS = 'http://www.w3.org/2000/svg';
  // Tom's call (2026-07): the walk plays for everyone, including under OS
  // reduced-motion — it is a single 6s pass with no flashing and no loop, and
  // it carries content. It remains skippable in effect: the settled map is the
  // end state either way.
  var reduce = false;
  var seed = parseFloat(canvas.dataset.seed || '1');
  var scale = parseFloat(canvas.dataset.scale || '210');
  var fbm = tdTerrainNoise(seed);
  function elev(x, y) { return fbm(x / scale, y / scale); }

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function smoothstep(t) { return t * t * (3 - 2 * t); }
  function eob(t) { var c = 2.0; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); }
  function svgEl(tag, attrs) {
    var e = document.createElementNS(SVGNS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
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
  function chaikin(pts, passes) {
    for (var n = 0; n < passes; n++) {
      var out = [pts[0]];
      for (var i = 0; i < pts.length - 1; i++) {
        var a = pts[i], b = pts[i + 1];
        out.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25]);
        out.push([a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
      }
      out.push(pts[pts.length - 1]);
      pts = out;
    }
    return pts;
  }

  // --- min-heap for the router ---------------------------------------------
  function Heap() { this.a = []; }
  Heap.prototype.push = function (n, p) {
    var a = this.a; a.push([p, n]);
    var i = a.length - 1;
    while (i > 0) { var q = (i - 1) >> 1; if (a[q][0] <= a[i][0]) break; var t = a[q]; a[q] = a[i]; a[i] = t; i = q; }
  };
  Heap.prototype.pop = function () {
    var a = this.a; if (!a.length) return null;
    var top = a[0], last = a.pop();
    if (a.length) {
      a[0] = last;
      for (var i = 0; ;) {
        var l = 2 * i + 1, r = l + 1, s = i;
        if (l < a.length && a[l][0] < a[s][0]) s = l;
        if (r < a.length && a[r][0] < a[s][0]) s = r;
        if (s === i) break;
        var t = a[s]; a[s] = a[i]; a[i] = t; i = s;
      }
    }
    return top;
  };

  var state = { built: false, played: false, raf: 0, done: false, hover: null, rows: [], t0: 0 };
  var layer = null;

  function destroy() {
    if (state.raf) cancelAnimationFrame(state.raf);
    state.raf = 0;
    if (state.rollStop) { state.rollStop(); state.rollStop = null; }
    if (layer && layer.parentNode) layer.parentNode.removeChild(layer);
    layer = null; state.rows = []; state.built = false;
  }

  var zeroRetries = 0;
  function build(animate) {
    destroy();
    // The flag map is no longer choreographed (Tom: the plant-in sequence added
    // little once the labels stopped retiring) — it renders settled, flags and
    // labels simply there. The walk keeps its animation.
    if (MODE === 'flags') animate = false;
    var W = hero.clientWidth, H = hero.clientHeight;
    // an uncomposited tab can measure 0×0 at load: retry until it has a size
    if ((!W || !H) && zeroRetries < 40) {
      zeroRetries++;
      setTimeout(function () { if (!state.built) build(animate); }, 250);
      return;
    }
    if (!W || !H || W < 1024) return;

    // Free space to the right of the copy is an L, not a column: above the
    // headline only the logo is in the way. So collect the copy's INK — text
    // measured line-by-line with a Range, leaves by their own rect — and ask how
    // far right it reaches AT A GIVEN HEIGHT. The peaks can then swing left as
    // they climb into the empty air above the headline.
    var heroRect = hero.getBoundingClientRect();
    var ink = [];
    function collectInk(node) {
      if (node.nodeType === 3) {
        if (!node.nodeValue || !node.nodeValue.trim()) return;
        var rg = document.createRange();
        rg.selectNodeContents(node);
        var rects = rg.getClientRects();
        for (var i = 0; i < rects.length; i++) {
          var r = rects[i];
          if (r.width) ink.push({ x1: r.right - heroRect.left, y0: r.top - heroRect.top, y1: r.bottom - heroRect.top });
        }
        return;
      }
      if (node.nodeType !== 1) return;
      if (node.tagName === 'IMG' || node.tagName === 'SVG' || !node.firstChild) {
        var b = node.getBoundingClientRect();
        if (b.width) ink.push({ x1: b.right - heroRect.left, y0: b.top - heroRect.top, y1: b.bottom - heroRect.top });
        return;
      }
      for (var c = node.firstChild; c; c = c.nextSibling) collectInk(c);
    }
    var wrapEl = hero.querySelector('.wrap');
    if (wrapEl) collectInk(wrapEl);
    function copyRightAt(y0, y1) {
      var m = 0;
      for (var i = 0; i < ink.length; i++) {
        var r = ink[i];
        if (r.y1 >= y0 && r.y0 <= y1) m = Math.max(m, r.x1);
      }
      return m;
    }

    var stageRight = W - 20;
    // wide enough that "The org chart no longer matches the work" breaks as
    // two lines, not three with an orphan
    var labelW = clamp(Math.min(252, (stageRight - copyRightAt(0, H) - GUTTER) - 110), 168, 252);
    if (stageRight - copyRightAt(0, H) - GUTTER < 300) return;
    var dotMinY = 84, dotMaxY = H - 132;   // bottom margin clears the coords line
    if (dotMaxY - dotMinY < 300) return;
    // Left edge available to a label centred at y. LABEL_H2 is half a label's
    // height: a label reaches well past its dot, so the limit has to consider
    // the copy above and below it, not just the line beside it.
    var LABEL_H2 = 82;
    function freeLeftAt(y) { return copyRightAt(y - LABEL_H2, y + LABEL_H2) + GUTTER; }
    function dotLoAt(y) { return freeLeftAt(y) + labelW + 32; }

    // --- pick a real summit inside each band --------------------------------
    // One band per pain, top to bottom, each with a preferred horizontal window
    // that walks left as it climbs. That lays the peaks on a rising diagonal —
    // a deliberate composition — while the exact spot is still a true local
    // maximum of the page's own noise field, so every dot sits on a real crest.
    // Prominence: how far a candidate stands above the ground around it. A dot
    // only reads as a peak when a closed contour ring encircles it, which needs
    // more than one contour interval of prominence.
    function prominence(x, y, r) {
      var e = elev(x, y), ring = -1;
      for (var a = 0; a < 14; a++) {
        var ang = a * Math.PI / 7;
        ring = Math.max(ring, elev(x + Math.cos(ang) * r, y + Math.sin(ang) * r));
      }
      return e - ring;
    }
    // Measured at RING_R, not a few px out: a dot has to sit inside a closed
    // contour big enough to see, otherwise it reads as a mark on open ground.
    var RING_R = 46;

    var want = Math.min(PAINS.length, 4);
    // Rank every ringed local maximum in the frame, then greedily take the most
    // peak-like ones subject to spacing. No horizontal bands: the field decides
    // where its peaks are, we only insist they are separated and labelable.
    // (On this field/frame that finds the three visible rings and nothing else.)
    // The scan samples the noise once into a grid and does the local-max test on
    // array lookups — ~9× fewer noise evaluations than testing each cell's
    // neighbourhood point-by-point, which is what made the page feel slow.
    var dotHi = stageRight - 26;
    var STEP = 7, SX = Math.max(40, W - FRAME_W), SY = dotMinY + 10;
    var nx = Math.max(2, Math.floor((dotHi - SX) / STEP) + 1);
    var ny = Math.max(2, Math.floor((dotMaxY - 10 - SY) / STEP) + 1);
    var EG = new Float32Array(nx * ny);
    for (var gj = 0; gj < ny; gj++)
      for (var gi = 0; gi < nx; gi++) EG[gj * nx + gi] = elev(SX + gi * STEP, SY + gj * STEP);
    var rowCopyR = new Float32Array(ny);
    for (var gj2 = 0; gj2 < ny; gj2++) {
      var ry2 = SY + gj2 * STEP;
      rowCopyR[gj2] = copyRightAt(ry2 - LABEL_H2, ry2 + LABEL_H2);
    }
    var cands = [];
    for (var j3 = 1; j3 < ny - 1; j3++) {
      for (var i3 = 1; i3 < nx - 1; i3++) {
        var e = EG[j3 * nx + i3];
        if (e <= EG[j3 * nx + i3 - 1] || e <= EG[j3 * nx + i3 + 1] ||
            e <= EG[(j3 - 1) * nx + i3] || e <= EG[(j3 + 1) * nx + i3] ||
            e <= EG[(j3 - 1) * nx + i3 - 1] || e <= EG[(j3 - 1) * nx + i3 + 1] ||
            e <= EG[(j3 + 1) * nx + i3 - 1] || e <= EG[(j3 + 1) * nx + i3 + 1]) continue;
        var x = SX + i3 * STEP, y = SY + j3 * STEP;
        // hill-climb to the true summit — a grid cell only approximates it, and
        // prominence measured a few px off a weak dome's crest under-scores it
        for (var hc = 0; hc < 6; hc++) {
          var bestE = elev(x, y), bx3 = x, by3 = y, moved = false;
          for (var a3 = 0; a3 < 8; a3++) {
            var an3 = a3 * Math.PI / 4;
            var tx3 = x + Math.cos(an3) * 4, ty3 = y + Math.sin(an3) * 4;
            var te3 = elev(tx3, ty3);
            if (te3 > bestE) { bestE = te3; bx3 = tx3; by3 = ty3; moved = true; }
          }
          if (!moved) break;
          x = bx3; y = by3;
        }
        if (y < SY || y > dotMaxY - 10) continue;
        var copyR = rowCopyR[Math.max(0, Math.min(ny - 1, Math.round((y - SY) / STEP)))];
        if (x < copyR + 40 || x > dotHi) continue;
        var leftOK = (x - 24 - labelW) >= copyR + 12;
        var rightOK = (x + 24 + labelW) <= stageRight;
        if (!leftOK && !rightOK) continue;
        // three radii so wide domes count as well as tight knolls
        var pr = Math.max(prominence(x, y, RING_R), prominence(x, y, 75), prominence(x, y, 110));
        if (pr < PROM_MIN) continue;
        cands.push({ x: x, y: y, e: elev(x, y), pr: pr, leftOK: leftOK, rightOK: rightOK });
      }
    }
    cands.sort(function (p, q) { return q.pr - p.pr; });
    var peaks = [];
    // On the flag map the middle flag has to sit BETWEEN the other two, not
    // against one of them (Tom). Among labelable summit triples with real
    // vertical coverage, take the most peak-like one whose middle peak splits
    // the span fairly; when the field offers none, fall back to the plain
    // prominence-greedy pick below.
    if (MODE === 'flags' && want === 3 && cands.length >= 3) {
      var C3 = cands.slice(0, 24), bestScore = -1, bestTriple = null;
      var minSpan = Math.min(340, (dotMaxY - dotMinY) * 0.6);
      for (var ia = 0; ia < C3.length; ia++)
        for (var ib = ia + 1; ib < C3.length; ib++)
          for (var ic = ib + 1; ic < C3.length; ic++) {
            var tri = [C3[ia], C3[ib], C3[ic]].sort(function (p, q) { return p.y - q.y; });
            var ok3 = true;
            for (var u = 0; u < 3 && ok3; u++)
              for (var v = u + 1; v < 3; v++)
                if (Math.abs(tri[u].y - tri[v].y) < 75 ||
                    Math.hypot(tri[u].x - tri[v].x, tri[u].y - tri[v].y) < 130) { ok3 = false; break; }
            if (!ok3) continue;
            var span3 = tri[2].y - tri[0].y;
            if (span3 < minSpan) continue;
            var g1 = tri[1].y - tri[0].y, g2 = span3 - g1;
            if (Math.min(g1, g2) < span3 * 0.3) continue;   // middle stays in the middle
            // prominence carries the choice; a light evenness term breaks ties
            // between comparable triples toward the balanced one
            var score = tri[0].pr + tri[1].pr + tri[2].pr
                      + (1 - Math.abs(g1 - g2) / span3) * 0.05;
            if (score > bestScore) { bestScore = score; bestTriple = tri; }
          }
      if (bestTriple) peaks = bestTriple;
    }
    if (!peaks.length) cands.forEach(function (c) {
      if (peaks.length >= want) return;
      for (var i = 0; i < peaks.length; i++) {
        if (Math.abs(c.y - peaks[i].y) < 75) return;                    // stacked too close
        if (Math.hypot(c.x - peaks[i].x, c.y - peaks[i].y) < 130) return;
      }
      peaks.push(c);
    });
    if (peaks.length < 2) return;
    peaks.sort(function (p, q) { return p.y - q.y; });
    // Bands run top to bottom, and height on screen is what a reader reads as
    // "how acute" — so the topmost peak carries the most acute pain.
    peaks.forEach(function (p, i) { p.pain = PAINS[i]; });

    // Label sides: left by preference; flip to the right when the left is
    // crowded, or when two neighbours would stack their labels on one side.
    // A pain can pin its side from the config ("side": "right") when the space
    // allows — Tom reads "AI adoption is stuck" after its flag, not before it.
    peaks.forEach(function (p) {
      if (p.pain.side === 'right' && p.rightOK) { p.side = 'right'; p.pinned = true; }
      else if (p.pain.side === 'left' && p.leftOK) { p.side = 'left'; p.pinned = true; }
      else p.side = p.leftOK ? 'left' : 'right';
    });
    for (var i = 1; i < peaks.length; i++) {
      var a2 = peaks[i - 1], b2 = peaks[i];
      if (b2.y - a2.y < 145 && a2.side === b2.side && !b2.pinned) {
        if (b2.side === 'left' && b2.rightOK) b2.side = 'right';
        else if (b2.side === 'right' && b2.leftOK) b2.side = 'left';
      }
    }
    // Middle peak: put its label UNDER the dot when that fits (Tom) — it
    // balances the three text boxes around the cluster instead of stacking
    // two on the right. Falls back to the side flip when the space isn't there.
    if (peaks.length === 3 && peaks[1].side === 'right' && !peaks[1].pinned) {
      var mid = peaks[1], low = peaks[2];
      var yTop2 = mid.y + 22, yBot2 = yTop2 + 132;
      var xLo2 = copyRightAt(yTop2, yBot2) + 14;
      var bx2 = Math.max(mid.x - BELOW_W / 2, xLo2);
      // the lower peak's own label box — on whichever side it sits — must stay
      // clear; try sliding the below-label, otherwise keep the side flip
      var lowBox = low.side === 'right'
        ? { x0: low.x + 14, x1: low.x + 34 + labelW }
        : { x0: low.x - 34 - labelW, x1: low.x - 14 };
      var yMeets = (low.y + 80 > yTop2) && (low.y - 80 < yBot2);
      function clearOf(x) {
        return !yMeets || x + BELOW_W + 8 <= lowBox.x0 || x - 8 >= lowBox.x1;
      }
      // A below-label has to actually sit under its flag: sliding it sideways
      // to dodge a neighbour detached it from the flag it names (Tom). Modest
      // offsets only — otherwise keep the side label, which hugs its flag.
      var ok2 = bx2 + BELOW_W <= stageRight && clearOf(bx2) &&
                Math.abs(bx2 + BELOW_W / 2 - mid.x) <= 44;
      if (ok2) { mid.side = 'below'; mid.belowX = bx2; }
    }

    peaks.forEach(function (p) { p.ft = Math.round((420 + (dotMaxY - p.y) * 1.15) / 10) * 10; });

    // Visit order: enter from the right, climb bottom-to-top, finish on the
    // summit — the most acute pain lands last and highest.
    var summit = peaks[0];
    var order = peaks.slice().sort(function (p, q) { return q.y - p.y; });
    var entry = [W + 34, clamp(order[0].y + 70, 60, H - 40)];

    // Label boxes, so the router can steer the trail around the type instead of
    // being confined to a narrow corridor beside it.
    var boxes = peaks.map(function (p) {
      if (p.side === 'below') {
        return { x0: p.belowX - 8, x1: p.belowX + BELOW_W + 8, y0: p.y + 16, y1: p.y + 152 };
      }
      if (p.side === 'right') {
        var left = p.x + 20;
        return { x0: left - 6, x1: left + labelW + 14, y0: p.y - 62, y1: p.y + 62 };
      }
      var right = p.x - 20;
      return { x0: right - labelW - 14, x1: right + 6, y0: p.y - 62, y1: p.y + 62 };
    });

    var d = null;
    if (MODE === 'walk') {
      // --- route: least-cost path that dislikes crossing contours -------------
      // fenced to the frame (with a small margin), so a detour can never swing
      // the trail out over the middle of the page
      var gx0 = Math.max(40, W - FRAME_W - 60), gx1 = W - 3, gy0 = -40, gy1 = H - 8;
      var cols = Math.max(2, Math.ceil((gx1 - gx0) / GRID)), rows = Math.max(2, Math.ceil((gy1 - gy0) / GRID));
      var E = new Float32Array(cols * rows);
      for (var j = 0; j < rows; j++)
        for (var i = 0; i < cols; i++) E[j * cols + i] = elev(gx0 + i * GRID, gy0 + j * GRID);
      var rowEdge = new Float32Array(rows);   // copy's right edge per grid row
      for (var j = 0; j < rows; j++) {
        var ry = gy0 + j * GRID;
        rowEdge[j] = copyRightAt(ry - 26, ry + 26) + 26;
      }
      function nodeAt(px, py) {
        return clamp(Math.round((py - gy0) / GRID), 0, rows - 1) * cols + clamp(Math.round((px - gx0) / GRID), 0, cols - 1);
      }
      function nodeXY(n) { return [gx0 + (n % cols) * GRID, gy0 + Math.floor(n / cols) * GRID]; }
      // 8 compass directions, ordered so index distance == turn angle / 45°
      var NB = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
      // Search over (cell, heading) rather than cell alone, so a turn can be
      // charged for. Without this the router zigzags between equal-cost cells and
      // the result reads like a circuit trace instead of a walked line.
      function route(from, to) {
        var NS = cols * rows * 8;
        var dist = new Float32Array(NS).fill(Infinity);
        var prev = new Int32Array(NS).fill(-1);
        var seen = new Uint8Array(NS);
        var h = new Heap(), s = nodeAt(from[0], from[1]), t = nodeAt(to[0], to[1]);
        // A*, not plain Dijkstra: in a flat "moat" every direction costs the
        // same, and without a pull toward the goal the expansion wanders along
        // grid axes and locks in boxy detours. The slightly greedy heuristic
        // (×1.02) keeps the line purposeful.
        var tx = gx0 + (t % cols) * GRID, ty = gy0 + Math.floor(t / cols) * GRID;
        function hst(b) {
          return 1.08 * Math.hypot(gx0 + (b % cols) * GRID - tx, gy0 + Math.floor(b / cols) * GRID - ty);
        }
        for (var d0 = 0; d0 < 8; d0++) { dist[s * 8 + d0] = 0; h.push(s * 8 + d0, hst(s)); }
        var endState = -1;
        while (true) {
          var top = h.pop(); if (!top) break;
          var st = top[1]; if (seen[st]) continue; seen[st] = 1;
          var n = st >> 3, dcur = st & 7;
          if (n === t) { endState = st; break; }
          var ni = n % cols, nj = Math.floor(n / cols);
          for (var k = 0; k < 8; k++) {
            var bi = ni + NB[k][0], bj = nj + NB[k][1];
            if (bi < 0 || bj < 0 || bi >= cols || bj >= rows) continue;
            var b = bj * cols + bi, bst = b * 8 + k;
            if (seen[bst]) continue;
            var step = (NB[k][0] && NB[k][1]) ? GRID * 1.4142 : GRID;
            var de = Math.abs(E[b] - E[n]);
            var c = step * (1 + CLIMB_W * de * 100);
            // deterministic micro-jitter from the field itself: in a dead-flat
            // moat every route costs the same, and ties resolve into long
            // axis-aligned runs — this makes the line meander like a walked trail
            c *= 1 + ((E[b] * 997) % 1) * 0.10;
            var turn = Math.abs(k - dcur); if (turn > 4) turn = 8 - turn;
            c += turn * GRID * 0.06;      // whisper of smoothing only — a real
                                          // turn cost makes the route boxy
            var bx = gx0 + bi * GRID, by = gy0 + bj * GRID;
            if (bx < rowEdge[bj]) c *= 9;                        // never cross the copy
            for (var z = 0; z < boxes.length; z++) {              // steer around the labels
              var bo = boxes[z];
              if (bx > bo.x0 && bx < bo.x1 && by > bo.y0 && by < bo.y1) { c *= 7; break; }
            }
            var nd = dist[st] + c;
            if (nd < dist[bst]) { dist[bst] = nd; prev[bst] = st; h.push(bst, nd + hst(b)); }
          }
        }
        if (endState < 0) {
          for (var q = 0, bestD = Infinity; q < 8; q++)
            if (dist[t * 8 + q] < bestD) { bestD = dist[t * 8 + q]; endState = t * 8 + q; }
        }
        var path = [], cur = endState, guard = 0;
        while (cur >= 0 && guard++ < 40000) {
          path.push(nodeXY(cur >> 3));
          if ((cur >> 3) === s) break;
          cur = prev[cur];
        }
        path.reverse();
        return path.length > 1 ? path : [from, to];
      }

      var poly = [entry], joins = [];
      var cursor = entry;
      order.forEach(function (p) {
        var seg = route(cursor, [p.x, p.y]);
        for (var i = 1; i < seg.length; i++) poly.push(seg[i]);
        poly.push([p.x, p.y]);
        joins.push(poly.length - 1);
        cursor = [p.x, p.y];
      });
      // A walked line is never straight: displace each point perpendicular to
      // the local direction by a slow noise wave. Grid-optimal routes contain
      // long axis-aligned runs (wide flat valleys really are cheapest in a
      // straight line) and this is what breaks them. Endpoints and the points
      // near each peak stay pinned so docks land exactly on the dots.
      var pinned = {};
      joins.forEach(function (idx) { for (var q = -2; q <= 2; q++) pinned[idx + q] = true; });
      for (var i = 1; i < poly.length - 1; i++) {
        if (pinned[i]) continue;
        var dx = poly[i + 1][0] - poly[i - 1][0], dy = poly[i + 1][1] - poly[i - 1][1];
        var len = Math.hypot(dx, dy) || 1;
        var wob = (fbm(poly[i][0] * 0.011 + 7.3, poly[i][1] * 0.011) - 0.5) * 26;
        poly[i] = [poly[i][0] - (dy / len) * wob, poly[i][1] + (dx / len) * wob];
      }
      // measure raw polyline so we know roughly where each peak falls
      var cum = [0], total = 0;
      for (var i = 1; i < poly.length; i++) { total += Math.hypot(poly[i][0] - poly[i - 1][0], poly[i][1] - poly[i - 1][1]); cum.push(total); }
      var roughF = joins.map(function (idx) { return total ? cum[idx] / total : 1; });
      d = crPath(chaikin(poly, 4));
    }

    // --- DOM ---------------------------------------------------------------
    layer = document.createElement('div');
    layer.className = 'hero-peaks' + (MODE === 'flags' ? ' hero-peaks--flags' : '');
    var svg = svgEl('svg', { class: 'hp-svg', viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: 'none', 'aria-hidden': 'true', focusable: 'false' });
    layer.appendChild(svg);
    var maskPath = null, trail = null, measure = null, head = null, LEN = 0, F = null;
    if (MODE === 'walk') {
      var uid = 'hp' + Math.floor(Math.random() * 1e6);
      var defs = svgEl('defs', {});
      var mask = svgEl('mask', { id: uid });
      maskPath = svgEl('path', { d: d, pathLength: '1', class: 'hp-mask' });
      mask.appendChild(maskPath); defs.appendChild(mask); svg.appendChild(defs);
      trail = svgEl('path', { d: d, class: 'hp-trail', mask: 'url(#' + uid + ')' });
      svg.appendChild(trail);
      measure = svgEl('path', { d: d });
      measure.style.display = 'none';
      svg.appendChild(measure);
      LEN = measure.getTotalLength ? measure.getTotalLength() : 0;

      // exact fraction of each peak along the smoothed path
      F = roughF.map(function (rf, k) {
        if (!LEN) return rf;
        var p = order[k], best = rf, bestD = Infinity;
        var lo = Math.max(0, rf - 0.12), hi = Math.min(1, rf + 0.12);
        for (var f = lo; f <= hi; f += 0.0015) {
          var pt = measure.getPointAtLength(f * LEN);
          var dd = Math.hypot(pt.x - p.x, pt.y - p.y);
          if (dd < bestD) { bestD = dd; best = f; }
        }
        return best;
      });
      F[F.length - 1] = 1;
      for (var k = 1; k < F.length; k++) if (F[k] <= F[k - 1]) F[k] = Math.min(1, F[k - 1] + 0.02);

      head = svgEl('circle', { class: 'hp-head', r: 3.4, cx: entry[0], cy: entry[1] });
      head.style.opacity = 0;
      svg.appendChild(head);
    }

    // markers + labels, in visit order
    var rows_ = order.map(function (p, k) {
      var pt = LEN ? measure.getPointAtLength(F[k] * LEN) : { x: p.x, y: p.y };
      var cx = pt.x, cy = pt.y;
      var dotR = 6, bgR = dotR + 3.5;   // all three dots share one format (Tom)
      var accent = p.pain.c || 'var(--navy)';

      var onRight = p.side === 'right', onBelow = p.side === 'below';
      var leader = svgEl('path', { class: 'hp-leader', pathLength: '1' });
      var labelLeft;   // where the label block starts
      if (onBelow) {
        // short drop from the dot to the label's top edge — aimed at the box
        // centre, so a slightly offset label still points at its own flag
        var bcx = p.belowX + BELOW_W / 2;
        leader.setAttribute('d', 'M ' + cx.toFixed(1) + ' ' + (cy + bgR + 3).toFixed(1) + ' L ' + bcx.toFixed(1) + ' ' + (cy + bgR + 16).toFixed(1));
        labelLeft = p.belowX;
      } else if (onRight) {
        var labelStart = cx + bgR + 26;
        leader.setAttribute('d', 'M ' + (cx + bgR + 3).toFixed(1) + ' ' + cy.toFixed(1) + ' L ' + (labelStart - 8).toFixed(1) + ' ' + cy.toFixed(1));
        labelLeft = labelStart;
      } else {
        var labelRight = cx - bgR - 12;
        leader.setAttribute('d', 'M ' + (cx - bgR - 3).toFixed(1) + ' ' + cy.toFixed(1) + ' L ' + (labelRight - 6).toFixed(1) + ' ' + cy.toFixed(1));
        labelLeft = labelRight - labelW;
      }
      leader.style.strokeDasharray = '1'; leader.style.strokeDashoffset = '1'; leader.style.opacity = 0;
      svg.appendChild(leader);

      var g = svgEl('g', { class: 'hp-marker' });
      g.style.transform = 'translate(' + cx + 'px,' + cy + 'px) scale(0)';
      var ping = svgEl('circle', { class: 'hp-ping', r: dotR });
      ping.style.stroke = accent; ping.style.opacity = 0;
      g.appendChild(ping);
      var halo = svgEl('circle', { class: 'hp-halo', r: dotR + 5 });
      halo.style.stroke = accent; halo.style.opacity = 0; halo.style.transform = 'scale(2)'; halo.style.transformOrigin = '0 0';
      g.appendChild(halo);
      if (MODE === 'flags') {
        // a survey flag planted on the crest: base dot, pole, pennant —
        // sized to be read as the marker, not squinted at (Tom)
        g.appendChild(svgEl('circle', { class: 'hp-dotbg', r: 8 }));
        var base = svgEl('circle', { class: 'hp-flagbase', r: 3.2 });
        base.style.fill = accent;
        g.appendChild(base);
        var pole = svgEl('path', { class: 'hp-flagpole', d: 'M 0 0 L 0 -26' });
        pole.style.stroke = 'var(--navy)';
        g.appendChild(pole);
        var pennant = svgEl('path', { class: 'hp-pennant', d: 'M 0 -26 L 17 -20.5 L 0 -15 Z' });
        pennant.style.fill = accent;
        g.appendChild(pennant);
      } else {
        g.appendChild(svgEl('circle', { class: 'hp-dotbg', r: bgR }));
        var dot = svgEl('circle', { class: 'hp-dot', r: dotR });
        dot.style.fill = 'var(--offwhite)'; dot.style.stroke = accent;
        g.appendChild(dot);
      }
      svg.appendChild(g);

      // The label is a link too (Tom): flag and text are one target, and either
      // lights the practice card it leads to.
      var row = document.createElement(p.pain.href ? 'a' : 'div');
      row.className = 'hp-row' + (onRight ? ' hp-row--right' : onBelow ? ' hp-row--below' : '');
      row.style.setProperty('--hp-accent', accent);
      // titles carry the flag's color; a pain can override the TEXT tone via
      // "tc" (gold reads as terracotta in type — the brand's own WCAG rule)
      row.style.setProperty('--hp-accent-text', p.pain.tc || accent);
      row.style.width = (onBelow ? BELOW_W : labelW) + 'px';
      row.style.left = labelLeft + 'px';
      if (p.pain.href) row.href = p.pain.href;
      var title = document.createElement('span');
      title.className = 'hp-title'; title.textContent = p.pain.t;
      row.appendChild(title);
      if (p.pain.d) {
        var det = document.createElement('span');
        det.className = 'hp-detail'; det.textContent = p.pain.d;
        row.appendChild(det);
      }
      layer.appendChild(row);

      // Hovering or focusing the flag (or the label) lifts its pain and lights
      // the matching practice card down the page; both follow through as links.
      var hit = document.createElement(p.pain.href ? 'a' : 'div');
      hit.className = 'hp-hit';
      hit.style.setProperty('--hp-accent', accent);
      hit.style.left = (cx - 28) + 'px';
      hit.style.top = (cy - 33) + 'px';   // reaches over the pole and pennant
      if (p.pain.href) { hit.href = p.pain.href; hit.setAttribute('aria-label', p.pain.t + '. ' + (p.pain.d || '')); }
      layer.appendChild(hit);

      function litCard(on) {
        var m = p.pain.href && /^\/(sail|grow|advise)\/?$/.exec(p.pain.href);
        var card = m && document.querySelector('.prac-card.' + m[1]);
        if (card) card.classList.toggle('prac-card--lit', on);
      }
      var idx = k;
      function over() {
        if (!state.done) return;
        if (state.rollStop) { state.rollStop(); state.rollStop = null; }  // pointer beats roll call
        state.hover = idx; state.paint(); litCard(true);
      }
      function out() { if (state.done) { state.hover = null; state.paint(); litCard(false); } }
      [hit, row].forEach(function (el) {
        el.addEventListener('mouseenter', over);
        el.addEventListener('mouseleave', out);
        el.addEventListener('focus', over);
        el.addEventListener('blur', out);
      });
      return { g: g, ping: ping, halo: halo, leader: leader, row: row, hit: hit,
               cx: cx, cy: cy, onRight: onRight, onBelow: onBelow, bgR: bgR, labelLeft: labelLeft };
    });

    var coords = document.createElement('div');
    coords.className = 'hp-coords';
    coords.textContent = cfg.coords || '';
    coords.style.left = Math.max(freeLeftAt(H - 40), W - 560) + 'px';
    coords.style.top = (H - 40) + 'px';
    layer.appendChild(coords);

    var replay = null;
    if (MODE === 'walk') {   // nothing to replay on the settled flag map
      replay = document.createElement('button');
      replay.type = 'button'; replay.className = 'hp-replay';
      replay.setAttribute('aria-label', 'Replay animation');
      replay.textContent = '↻ replay';
      replay.style.right = '22px'; replay.style.top = (H - 46) + 'px';
      replay.addEventListener('click', function () { play(); });
      layer.appendChild(replay);
    }

    hero.appendChild(layer);
    // (labels can only be measured once the layer is attached — offsetHeight of
    //  a detached element is 0, which silently top-anchored every label before)
    // Vertically centre each label on its dot, then resolve collisions: when two
    // same-side labels overlap (tight peak clusters), slide the lower one down
    // and let its leader run diagonally to the dot — standard map labelling.
    rows_.forEach(function (r) {
      r.row.style.top = r.onBelow ? (r.cy + r.bgR + 14) + 'px' : (r.cy - r.row.offsetHeight / 2) + 'px';
    });
    ['left-side', 'right-side'].forEach(function (_, sideIdx) {
      var group = rows_.filter(function (r) { return !r.onBelow && r.onRight === (sideIdx === 1); })
        .sort(function (a2, b2) { return a2.cy - b2.cy; });
      var prevBottom = -1e9;
      group.forEach(function (r) {
        var h = r.row.offsetHeight;
        var topY = r.cy - h / 2;
        if (topY < prevBottom + 12) topY = prevBottom + 12;
        r.row.style.top = topY + 'px';
        prevBottom = topY + h;
        var labelCY = topY + h / 2;
        if (Math.abs(labelCY - r.cy) > 2) {   // re-aim the leader diagonally
          var d2 = r.onRight
            ? 'M ' + (r.cx + r.bgR + 3).toFixed(1) + ' ' + r.cy.toFixed(1) + ' L ' + (r.labelLeft - 8).toFixed(1) + ' ' + labelCY.toFixed(1)
            : 'M ' + (r.cx - r.bgR - 3).toFixed(1) + ' ' + r.cy.toFixed(1) + ' L ' + (r.labelLeft + labelW - 6).toFixed(1) + ' ' + labelCY.toFixed(1);
          r.leader.setAttribute('d', d2);
        }
      });
    });
    state.built = true; state.rows = rows_;

    // --- timeline -----------------------------------------------------------
    var phases = [], arriveAt = [], prevF = 0, tAcc = 0;
    if (MODE === 'walk') {
      F.forEach(function (f, k) {
        var dur = Math.max(500, TRAVEL_MS * (f - prevF));
        phases.push({ from: prevF, to: f, dur: dur });
        tAcc += dur; arriveAt.push(tAcc);
        phases.push({ from: f, to: f, dur: HOLD_MS });
        tAcc += HOLD_MS; prevF = f;
      });
    } else {
      // flags plant in a quick sequence, lowest first, summit last
      order.forEach(function (_, k) { arriveAt.push(450 + k * 520); });
      tAcc = arriveAt[arriveAt.length - 1] + 520;
    }
    var ALL_AT = tAcc;               // everything placed: all pains lit together
    tAcc += ALL_MS;
    var FADE_AT = tAcc;              // then the labels dim to their rest state
    var TOTAL = tAcc + FADE_MS;

    function pAt(ms) {
      var t = 0;
      for (var i = 0; i < phases.length; i++) {
        var ph = phases[i];
        if (ms < t + ph.dur) {
          var lp = (ms - t) / ph.dur;
          return ph.from + (ph.to - ph.from) * smoothstep(lp);
        }
        t += ph.dur;
      }
      return 1;
    }

    function paint(ms) {
      if (ms === undefined) ms = state.done ? TOTAL : 0;
      if (MODE === 'walk') {
        var p = state.done ? 1 : pAt(ms);
        maskPath.style.strokeDashoffset = (1 - p).toFixed(4);
        if (LEN) {
          var hp = measure.getPointAtLength(p * LEN);
          head.setAttribute('cx', hp.x.toFixed(1)); head.setAttribute('cy', hp.y.toFixed(1));
        }
        head.style.opacity = state.done ? 0 : clamp(Math.min(ms / 260, (TOTAL - ms) / 500), 0, 1);
      }

      var lastArrived = -1;
      for (var i = 0; i < arriveAt.length; i++) if (ms >= arriveAt[i]) lastArrived = i;
      // after the final chord the piece settles: words dim to a whisper (still
      // slightly visible at rest), the trail falls back to a light presence
      var fadeP = state.done ? 1 : (ms >= FADE_AT ? smoothstep(clamp((ms - FADE_AT) / FADE_MS, 0, 1)) : 0);
      var labelGlobal = 1 - fadeP * (1 - REST_OP);
      var allLit = !state.done && ms >= ALL_AT;
      if (trail) trail.style.opacity = (0.95 - fadeP * (0.95 - TRAIL_REST)).toFixed(3);

      rows_.forEach(function (r, k) {
        var since = ms - arriveAt[k];
        var appear = clamp(since / 420, 0, 1);
        var active = state.done ? (state.hover === k) : (k === lastArrived && !allLit) || allLit;
        // Every station stays fully lit once the walk reaches it (Tom) — the
        // current one is distinguished by its accent underline, not by dimming
        // the ones already visited.
        var dimF = 1;
        if (state.done && state.hover != null) dimF = active ? 1 : 0.6;
        var labelOp = active && state.done ? 1 : appear * dimF * labelGlobal;

        var pop = eob(clamp(since / 430, 0, 1));
        r.g.style.transition = state.done ? 'transform .35s cubic-bezier(.2,.7,.2,1),opacity .3s ease' : 'none';
        r.g.style.transform = 'translate(' + r.cx + 'px,' + r.cy + 'px) scale(' + (pop * (state.done && active ? 1.18 : 1)).toFixed(3) + ')';
        r.g.style.opacity = (appear * dimF).toFixed(3);
        var pingP = clamp(since / 760, 0, 1);
        r.ping.style.transform = 'scale(' + (0.6 + pingP * 2.6).toFixed(2) + ')';
        r.ping.style.transformOrigin = '0 0';
        r.ping.style.opacity = (since >= 0 ? (1 - pingP) * 0.55 : 0).toFixed(3);
        r.halo.style.transition = 'opacity .3s ease';
        r.halo.style.opacity = (state.done && active) ? 0.35 : 0;
        var lp = clamp(since / 480, 0, 1);
        r.leader.style.strokeDashoffset = (1 - lp).toFixed(3);
        r.leader.style.opacity = (lp * 0.9 * labelOp).toFixed(3);
        r.leader.style.stroke = active ? r.row.style.getPropertyValue('--hp-accent') : 'var(--hp-leader)';
        r.row.style.transition = state.done ? 'opacity .32s ease' : 'none';
        r.row.style.opacity = labelOp.toFixed(3);
        r.row.classList.toggle('is-active', !!active && labelOp > 0.6);
        r.hit.style.pointerEvents = state.done ? 'auto' : 'none';
        r.row.style.pointerEvents = state.done && r.row.tagName === 'A' ? 'auto' : 'none';
      });
      coords.style.opacity = clamp((ms - TOTAL * 0.55) / 700, 0, 1).toFixed(3);
      if (replay) {
        replay.style.opacity = state.done ? 1 : 0;
        replay.style.pointerEvents = state.done ? 'auto' : 'none';
      }
    }

    function play() {
      if (state.raf) cancelAnimationFrame(state.raf);
      state.done = false; state.hover = null;
      var start = performance.now();
      (function tick(now) {
        var ms = now - start;
        if (ms >= TOTAL) { state.done = true; state.played = true; paint(TOTAL); return; }
        paint(ms);
        state.raf = requestAnimationFrame(tick);
      })(performance.now());
    }

    state.paint = paint; state.play = play; state.TOTAL = TOTAL;

    // Debug aid, permanent by design: ?hpat=<ms> freezes the sequence at that
    // moment so a frame can be inspected or screenshotted (?hpat=99999 = the
    // settled state). Inert without the parameter.
    var at = /[?&]hpat=(\d+)/.exec(location.search);
    if (at) {
      var atMs = Math.min(parseFloat(at[1]), TOTAL);
      state.done = parseFloat(at[1]) >= TOTAL;
      paint(atMs);
      return;
    }

    if (animate) {
      paint(0);
      var begun = false;
      var go = function () { if (begun) return; begun = true; play(); };
      try {
        if ('IntersectionObserver' in window) {
          var io = new IntersectionObserver(function (es) {
            if (es.some(function (e) { return e.isIntersecting; })) { go(); io.disconnect(); }
          }, { threshold: 0.2 });
          io.observe(hero);
        } else go();
      } catch (e) { go(); }
      setTimeout(go, 900);
    } else {
      state.done = true; paint(TOTAL);
      // One roll call when the map first scrolls into view (Tom): each flag
      // takes its hover state for a beat — yellow first, up through blue to
      // the summit — then the map settles. A real pointer cancels it.
      if (MODE === 'flags' && !state.played) {
        var roll = function () {
          if (state.played || state.rows !== rows_) return;
          state.played = true;
          var timers = rows_.map(function (_, k) {
            return setTimeout(function () { state.hover = k; paint(); }, 400 + k * 750);
          });
          timers.push(setTimeout(function () {
            state.hover = null; paint(); state.rollStop = null;
          }, 400 + rows_.length * 750));
          state.rollStop = function () { timers.forEach(clearTimeout); };
        };
        var begun2 = false;
        var go2 = function () { if (begun2) return; begun2 = true; roll(); };
        try {
          if ('IntersectionObserver' in window) {
            var io2 = new IntersectionObserver(function (es) {
              if (es.some(function (e) { return e.isIntersecting; })) { go2(); io2.disconnect(); }
            }, { threshold: 0.2 });
            io2.observe(hero);
          } else go2();
        } catch (e) { go2(); }
        setTimeout(go2, 900);
      }
    }
  }

  function paint() { if (state.paint) state.paint(state.done ? state.TOTAL : 0); }

  // Deferred until the WEBFONTS are in (raced against a short cap): the copy's
  // ink — and so the peak/label layout — is measured from rendered text, and
  // building on fallback-font metrics meant the fonts.ready rebuild below then
  // destroyed and RESTARTED a walk already in flight, which read as the
  // animation taking ages to start. Self-hosted fonts land well inside the
  // cap; the cap keeps the overlay from hanging if the font load stalls.
  // (Deferred at all so this never holds the page's first paint; setTimeout,
  // not requestAnimationFrame: rAF never fires in an unfocused / uncomposited
  // tab, which would leave the overlay unbuilt there.)
  var lastW = hero.clientWidth, lastH = hero.clientHeight;
  var builtOnce = false;
  function buildOnce() {
    if (builtOnce) return;
    builtOnce = true;
    lastW = hero.clientWidth; lastH = hero.clientHeight;
    build(!reduce);
    if (reduce) { state.done = true; }
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { setTimeout(buildOnce, 0); });
  }
  setTimeout(buildOnce, 600);

  var rt = null;
  function onResize() {
    if (Math.abs(hero.clientWidth - lastW) < 2 && Math.abs(hero.clientHeight - lastH) < 2) return;
    lastW = hero.clientWidth; lastH = hero.clientHeight;
    clearTimeout(rt);
    // don't let an incidental resize (scrollbar, font swap) settle a walk that
    // has not played yet
    rt = setTimeout(function () { build(!state.played && !reduce); }, 220);
  }
  window.addEventListener('resize', onResize);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      // Safety net for the 600ms-cap path only: if the overlay was built
      // before the fonts landed AND the swap really moved the hero geometry,
      // rebuild once. When buildOnce ran on fonts.ready this is a no-op.
      if (builtOnce &&
          (Math.abs(hero.clientWidth - lastW) > 10 || Math.abs(hero.clientHeight - lastH) > 10)) {
        lastW = hero.clientWidth; lastH = hero.clientHeight;
        build(!state.played && !reduce);
      }
    });
  }
})();
