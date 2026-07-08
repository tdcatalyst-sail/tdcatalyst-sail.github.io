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
