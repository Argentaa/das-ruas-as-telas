/* ==========================================================================
   DAS RUAS ÀS TELAS — comportamento da página
   1. Índice fixo (estado sólido + link ativo)
   2. Divisores de pixel animados no scroll
   3. Revelação de blocos
   4. Barra de progresso de leitura
   5. Placeholders (áudio / podcast / aviso de prévia)
   ========================================================================== */
(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nav = document.getElementById('siteNav');
  const hero = document.querySelector('.hero');
  const progressBar = document.querySelector('.read-progress span');
  const sections = [...document.querySelectorAll('#abertura, #audio, #ruas, #golpes, #cyberbullying, #dados, #podcast')];
  const navLinks = [...document.querySelectorAll('.nav-link')];

  /* ------------------------------ 1. divisores de pixel ------------------------------ */
  const dividers = [...document.querySelectorAll('.pixels')];

  const hash = (x, y, seed) => {
    const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
    return n - Math.floor(n);
  };

  function buildDivider(el, index) {
    const rows = parseInt(el.dataset.rows || '4', 10);
    const cellPx = parseFloat(getComputedStyle(el).getPropertyValue('--cell')) || 22;
    const cols = Math.max(12, Math.round(window.innerWidth / cellPx));

    el.style.setProperty('--cols', cols);
    el.style.setProperty('--rows', rows);
    el.innerHTML = '';

    const frag = document.createDocumentFragment();
    const cells = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = document.createElement('div');
        const rnd = hash(c, r, index + 1);
        const wave = (c / cols) * 0.42 + (Math.abs(r - (rows - 1) / 2) / rows) * 0.16;
        cell.className = 'pixel ' + (rnd < 0.42 ? '' : rnd < 0.72 ? 'p-c' : 'p-b');
        cell.dataset.t = Math.min(1, wave + rnd * 0.46).toFixed(3);
        cell.dataset.on = '0';
        frag.appendChild(cell);
        cells.push(cell);
      }
    }

    el.appendChild(frag);
    el.__cells = cells;
  }

  function paintDivider(el) {
    const cells = el.__cells;
    if (!cells) return;

    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    if (rect.top > vh + 40 || rect.bottom < -40) return;

    // 0 quando o divisor encosta na base da tela · 1 quando chega ao topo
    let p = (vh - rect.top) / (vh * 0.92);
    p = Math.max(0, Math.min(1, p));
    const eased = p * p * (3 - 2 * p);

    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      const shouldBeOn = parseFloat(cell.dataset.t) <= eased ? '1' : '0';
      if (cell.dataset.on !== shouldBeOn) {
        cell.dataset.on = shouldBeOn;
        cell.classList.toggle('on', shouldBeOn === '1');
      }
    }
  }

  let ticking = false;
  function onScrollFrame() {
    paintDividerAll();
    updateNavState();
    updateActiveLink();
    updateProgress();
    ticking = false;
  }
  function requestFrame() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScrollFrame);
    }
  }

  function paintDividerAll() {
    for (let i = 0; i < dividers.length; i++) paintDivider(dividers[i]);
  }

  function buildAll() {
    dividers.forEach((el, i) => buildDivider(el, i));
  }

  /* ------------------------------ 2. índice ------------------------------ */
  function updateNavState() {
    const threshold = (hero ? hero.offsetHeight : 0) - nav.offsetHeight - 24;
    nav.classList.toggle('is-solid', window.scrollY > threshold);
  }

  function updateActiveLink() {
    const line = window.scrollY + nav.offsetHeight + 60;
    let current = sections[0];

    for (const section of sections) {
      if (section.offsetTop <= line) current = section;
    }
    // fim da página força o último item
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 4) {
      current = sections[sections.length - 1];
    }

    navLinks.forEach((link) => {
      link.classList.toggle('is-active', link.getAttribute('href') === '#' + current.id);
    });
  }

  /* ------------------------------ 3. revelação ------------------------------ */
  function setupReveal() {
    const items = document.querySelectorAll('.reveal');
    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    items.forEach((el) => io.observe(el));
  }

  /* ------------------------------ 4. progresso ------------------------------ */
  function updateProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    progressBar.style.width = pct.toFixed(2) + '%';
  }

  /* ------------------------------ 5. placeholders ------------------------------ */
  const toastEl = document.getElementById('toast');
  let toastTimer;
  function toast(message) {
    toastEl.textContent = message;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 3400);
  }

  const audioBtn = document.getElementById('audioPlay');
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      toast('A versão em áudio ainda está em produção.');
    });
  }

  const previewClose = document.getElementById('previewClose');
  if (previewClose) {
    previewClose.addEventListener('click', () => {
      document.body.dataset.preview = 'off';
      try { sessionStorage.setItem('drat-preview', 'off'); } catch (e) {}
    });
    try {
      if (sessionStorage.getItem('drat-preview') === 'off') document.body.dataset.preview = 'off';
    } catch (e) {}
  }

  /* ------------------------------ init ------------------------------ */
  function init() {
    buildAll();
    setupReveal();
    onScrollFrame();
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      buildAll();
      onScrollFrame();
    }, 180);
  });

  window.addEventListener('scroll', requestFrame, { passive: true });
  window.addEventListener('load', () => {
    onScrollFrame();
    setTimeout(onScrollFrame, 240);
  });

  init();
})();
