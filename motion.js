// Helm & Co — cinematic motion layer
(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', function () {
    initCurtain();
    initReveal();
    initParallax();
    initMarquee();
    initStickyProcess();
    initCountUp();
    initMagneticButtons();
    initGrain();
  });

  // ---------- 1. Page-load curtain ----------
  function initCurtain() {
    var curtain = document.querySelector('.curtain');
    if (!curtain) return;
    if (reduceMotion) { curtain.remove(); return; }
    window.requestAnimationFrame(function () {
      setTimeout(function () {
        curtain.classList.add('is-gone');
        setTimeout(function () { curtain.remove(); }, 1000);
      }, 220);
    });
  }

  // ---------- 2. Scroll reveal (auto-applied to known content blocks) ----------
  function initReveal() {
    var selectors = [
      '.card', '.case-card', '.blog-card', '.price-card', '.quote-block',
      '.cta-band', '.info-card', '.empathy-list li', '.value-row > div',
      'section .container > h2', 'section .container > .eyebrow',
      '.manifesto > div', '.footer-grid > div', 'article.post-body > *'
    ];
    var nodes = document.querySelectorAll(selectors.join(','));
    nodes.forEach(function (el, i) {
      if (el.closest('.process-steps')) return; // handled by sticky-process module
      el.classList.add('reveal');
      el.style.setProperty('--reveal-delay', (i % 4) * 70 + 'ms');
    });

    if (reduceMotion || !('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  }

  // ---------- 3. Hero parallax blobs ----------
  function initParallax() {
    var blobs = document.querySelectorAll('.parallax-blob');
    if (!blobs.length || reduceMotion) return;
    var ticking = false;

    function update() {
      var y = window.scrollY;
      blobs.forEach(function (b) {
        var speed = parseFloat(b.getAttribute('data-speed')) || 0.1;
        b.style.transform = 'translate3d(0,' + (y * speed).toFixed(1) + 'px,0)';
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  // ---------- 4. Marquee: duplicate track content for seamless loop ----------
  function initMarquee() {
    document.querySelectorAll('.marquee-track').forEach(function (track) {
      if (track.dataset.doubled) return;
      track.innerHTML = track.innerHTML + track.innerHTML;
      track.dataset.doubled = 'true';
    });
  }

  // ---------- 5. Sticky pinned "how it works" ----------
  function initStickyProcess() {
    var steps = document.querySelectorAll('.process-steps .step');
    if (!steps.length) return;
    var indicator = document.querySelector('.process-sticky .step-indicator');
    var needle = document.querySelector('.process-sticky .dial-needle-cinematic');
    var angles = [-64, -6, 58];

    function activate(i) {
      steps.forEach(function (s, idx) { s.classList.toggle('active', idx === i); });
      if (indicator) indicator.textContent = steps[i].dataset.label || ('Step ' + (i + 1));
      if (needle) needle.style.transform = 'rotate(' + (angles[i] || 0) + 'deg)';
    }
    activate(0);

    if (reduceMotion || !('IntersectionObserver' in window)) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var idx = Array.prototype.indexOf.call(steps, entry.target);
          activate(idx);
        }
      });
    }, { threshold: 0.6 });

    steps.forEach(function (s) { io.observe(s); });
  }

  // ---------- 6. Count-up numerals in .case-stats ----------
  function initCountUp() {
    var targets = document.querySelectorAll('.case-stats b');
    if (!targets.length) return;

    targets.forEach(function (el) {
      var raw = el.textContent.trim();
      var match = raw.match(/^([+-]?)(\d+(?:\.\d+)?)(.*)$/);
      if (!match) return; // non-numeric (e.g. "Self-run") — leave as static reveal
      el.dataset.prefix = match[1];
      el.dataset.value = match[2];
      el.dataset.suffix = match[3];
      el.textContent = match[1] + '0' + match[3];
    });

    if (reduceMotion || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) {
        if (el.dataset.value) el.textContent = el.dataset.prefix + el.dataset.value + el.dataset.suffix;
      });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        io.unobserve(el);
        if (!el.dataset.value) return;
        var target = parseFloat(el.dataset.value);
        var isDecimal = el.dataset.value.indexOf('.') !== -1;
        var start = null;
        var duration = 900;
        function step(ts) {
          if (!start) start = ts;
          var progress = Math.min((ts - start) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          var current = target * eased;
          el.textContent = el.dataset.prefix + (isDecimal ? current.toFixed(1) : Math.round(current)) + el.dataset.suffix;
          if (progress < 1) window.requestAnimationFrame(step);
        }
        window.requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });

    targets.forEach(function (el) { io.observe(el); });
  }

  // ---------- 7. Magnetic buttons (subtle pointer-follow) ----------
  function initMagneticButtons() {
    if (reduceMotion || matchMedia('(pointer: coarse)').matches) return;
    document.querySelectorAll('.btn').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = 'translate(' + (x * 0.12).toFixed(1) + 'px,' + (y * 0.28).toFixed(1) + 'px)';
      });
      btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
    });
  }

  // ---------- 8. Film grain overlay ----------
  function initGrain() {
    if (document.querySelector('.grain-overlay')) return;
    var div = document.createElement('div');
    div.className = 'grain-overlay';
    div.innerHTML = '<svg width="100%" height="100%"><filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#grain)"/></svg>';
    document.body.appendChild(div);
  }
})();
