// Show confirmation banner after form submit (?sent=1)
(function () {
  if (new URLSearchParams(window.location.search).get('sent') !== '1') return;
  var banner = document.getElementById('sent-banner');
  if (!banner) return;
  banner.style.display = 'block';
  banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
      // also close the mobile menu if open
      var inner = document.getElementById('nav');
      if (inner) inner.classList.remove('open');
    } else {
      nav.classList.remove('nav--hidden');
    }
    lastY = y;
  }, { passive: true });
})();
