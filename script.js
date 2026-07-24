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
