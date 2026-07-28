import Lenis from "https://cdn.jsdelivr.net/npm/lenis@1.1.18/+esm";

/* ---------------- adaptive rem grid (scale up above 1920) ---------------- */
function adaptiveFont(){
  const FONT_BASE = 16, BASE_W = 1920, COEF = 0.6666;
  const reduction = ((BASE_W - window.innerWidth) / BASE_W) * 100 * COEF;
  const size = FONT_BASE - (FONT_BASE * reduction) / 100;
  const html = document.documentElement;
  if (size > FONT_BASE) html.style.fontSize = size + "px";
  else html.style.removeProperty("font-size");
}
adaptiveFont();
window.addEventListener("resize", adaptiveFont);

/* ---------------- Lenis smooth scroll ---------------- */
const lenis = new Lenis({ smoothWheel: true });
function raf(t){ lenis.raf(t); requestAnimationFrame(raf); }
requestAnimationFrame(raf);
window.Baseline = window.Baseline || {};
window.Baseline.lenis = lenis;

function lock(){ document.documentElement.classList.add("lock"); lenis.stop(); }
function unlock(){ document.documentElement.classList.remove("lock"); lenis.start(); }
window.Baseline.lock = lock;
window.Baseline.unlock = unlock;

window.scrollTo(0,0);

/* ---------------- smooth-scroll same-page anchors ---------------- */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener("click",(e)=>{
    const id = a.getAttribute("href").slice(1);
    const target = document.getElementById(id);
    if (target){
      e.preventDefault();
      lenis.scrollTo(target, { offset: -20 });
    }
  });
});

/* ---------------- reveal on scroll (IntersectionObserver) ---------------- */
const revealables = document.querySelectorAll(".clip, .word-wrap, .inview");
const io = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if (entry.isIntersecting){
      const el = entry.target;
      const delay = parseInt(el.dataset.delay || "0", 10);
      setTimeout(()=> el.classList.add("in"), delay);
      io.unobserve(el);
    }
  });
}, { threshold: 0.2 });
revealables.forEach(el=> io.observe(el));

/* wrap text helper: split into words, each in overflow-hidden span */
function wrapWords(el, cls){
  const text = el.textContent.trim();
  el.textContent = "";
  text.split(/\s+/).forEach((word,i)=>{
    const outer = document.createElement("span");
    outer.className = cls || "word-wrap";
    if (i>0) el.appendChild(document.createTextNode(" "));
    const inner = document.createElement("span");
    inner.textContent = word;
    outer.appendChild(inner);
    el.appendChild(outer);
  });
}
window.Baseline.wrapWords = wrapWords;

/* auto-wrap all [data-stack] lines and [data-fadewords] paragraphs on load */
document.querySelectorAll("[data-stack]").forEach(el=>{
  const lines = el.querySelectorAll(".stack-line");
  lines.forEach((line,i)=>{
    line.classList.add("clip");
    line.dataset.delay = i*120;
    const span = document.createElement("span");
    span.textContent = line.textContent;
    line.textContent = "";
    line.appendChild(span);
  });
});
document.querySelectorAll("[data-fadewords]").forEach(el=>{
  wrapWords(el);
  el.querySelectorAll(".word-wrap").forEach((w,i)=>{
    w.dataset.delay = 250 + i*28;
    io.observe(w);
  });
});

/* ---------------- header state (transparent on hero pages) ---------------- */
const header = document.querySelector(".site-header");

/* ---------------- burger / fullscreen menu ---------------- */
const menuOverlay = document.querySelector(".menu-overlay");
const burgers = document.querySelectorAll("[data-open-menu]");
const menuClose = document.querySelector("[data-close-menu]");

function openMenu(){
  if (!menuOverlay) return;
  menuOverlay.classList.add("open");
  lock();
}
function closeMenu(){
  if (!menuOverlay) return;
  menuOverlay.classList.remove("open");
  unlock();
}
burgers.forEach(b=> b.addEventListener("click", openMenu));
if (menuClose) menuClose.addEventListener("click", closeMenu);
if (menuOverlay){
  menuOverlay.querySelector(".backdrop").addEventListener("click", closeMenu);
  menuOverlay.querySelectorAll(".menu-nav a").forEach(a=> a.addEventListener("click", closeMenu));
}
window.addEventListener("keydown",(e)=>{
  if (e.key === "Escape"){
    if (menuOverlay && menuOverlay.classList.contains("open")) closeMenu();
  }
});

/* ---------------- current page highlight ---------------- */
(function highlightCurrent(){
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("[data-nav-link]").forEach(a=>{
    const href = a.getAttribute("href");
    if (href === path) a.classList.add("current-page");
  });
})();
