const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (prefersReducedMotion) {
  document.documentElement.classList.add('reduced-motion');
}

/* ---------- Mobile nav toggle ---------- */
function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.mobile-menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---------- Split hero headline into per-word spans ---------- */
function splitHeroWords() {
  document.querySelectorAll('[data-split-words]').forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words
      .map((w) => `<span class="split-word"><span>${w}</span></span>`)
      .join(' ');
  });
}

/* ---------- Custom cursor glow ---------- */
function initCursor() {
  if (!isFinePointer || prefersReducedMotion) return;
  const dot = document.createElement('div');
  dot.className = 'cursor-glow';
  dot.setAttribute('aria-hidden', 'true');
  document.body.appendChild(dot);

  const moveTo = window.gsap
    ? { x: gsap.quickTo(dot, 'x', { duration: 0.35, ease: 'power3.out' }), y: gsap.quickTo(dot, 'y', { duration: 0.35, ease: 'power3.out' }) }
    : null;

  window.addEventListener('mousemove', (e) => {
    dot.classList.add('is-active');
    if (moveTo) {
      moveTo.x(e.clientX);
      moveTo.y(e.clientY);
    } else {
      dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    }
  });

  document.querySelectorAll('a, button, .magnetic').forEach((el) => {
    el.addEventListener('mouseenter', () => dot.classList.add('is-hovering'));
    el.addEventListener('mouseleave', () => dot.classList.remove('is-hovering'));
  });
}

/* ---------- Magnetic buttons ---------- */
function initMagnetic() {
  if (!isFinePointer || prefersReducedMotion || !window.gsap) return;
  document.querySelectorAll('.magnetic').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'elastic.out(1,0.4)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'elastic.out(1,0.4)' });

    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * 0.3);
      yTo((e.clientY - r.top - r.height / 2) * 0.3);
    });
    el.addEventListener('mouseleave', () => {
      xTo(0);
      yTo(0);
    });
  });
}

/* ---------- Animated stat counters ---------- */
function initCounters() {
  const counters = document.querySelectorAll('[data-count-to]');
  if (!counters.length) return;

  counters.forEach((el) => {
    const target = parseFloat(el.dataset.countTo);
    const suffix = el.dataset.countSuffix || '';
    const run = () => {
      if (prefersReducedMotion || !window.gsap) {
        el.textContent = target + suffix;
        return;
      }
      const obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: 1.4,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent = Math.round(obj.val) + suffix;
        },
      });
    };

    if (window.ScrollTrigger) {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        once: true,
        onEnter: run,
      });
    } else {
      run();
    }
  });
}

/* ---------- GSAP scroll reveals + hero intro ---------- */
function initMotion() {
  if (prefersReducedMotion || !window.gsap) return;
  gsap.registerPlugin(ScrollTrigger);

  const heroTl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  heroTl
    .to('.hero .split-word > span', { yPercent: -115, duration: 0.9, stagger: 0.06 })
    .from('.hero .eyebrow', { opacity: 0, y: 12, duration: 0.5 }, '-=0.6')
    .from('.hero-sub', { opacity: 0, y: 16, duration: 0.6 }, '-=0.5')
    .from('.hero-actions', { opacity: 0, y: 16, duration: 0.6 }, '-=0.45');

  document.querySelectorAll('.page-hero [data-split-words]').forEach((el) => {
    gsap.to(el.querySelectorAll('.split-word > span'), {
      yPercent: -115,
      duration: 0.9,
      stagger: 0.06,
      ease: 'expo.out',
      delay: 0.1,
    });
  });
  gsap.from('.page-hero .eyebrow', { opacity: 0, y: 12, duration: 0.5, delay: 0.15 });
  gsap.from('.page-hero .hero-sub', { opacity: 0, y: 16, duration: 0.6, delay: 0.35 });

  document.querySelectorAll('[data-reveal]').forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none',
        once: true,
      },
    });
  });

  document.querySelectorAll('.reveal-group').forEach((group) => {
    gsap.to(group.children, {
      opacity: 1,
      x: 0,
      duration: 0.7,
      stagger: 0.2,
      ease: 'power1.out',
      scrollTrigger: {
        trigger: group,
        start: 'top 85%',
        toggleActions: 'play none none none',
        once: true,
      },
    });
  });

  /* Subtle horizontal scroll-linked parallax on the hero's decorative
     shapes (matches a translateX "motion effect" scroll technique). */
  gsap.to('.blob-a', {
    xPercent: -6,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });
  gsap.to('.blob-b', {
    xPercent: 8,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  splitHeroWords();
  initCursor();
  initMagnetic();
  initCounters();
  initMotion();
});
