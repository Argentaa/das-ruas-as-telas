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
  const sections = [...document.querySelectorAll('#abertura, #audio, #ruas, #golpes, #cyberbullying, #dados, #instagram')];
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
  const audioEl = document.getElementById('audioFile');
  const audioStatusEl = document.getElementById('audioStatus');
  const audioTimeEl = document.getElementById('audioTime');
  const audioBarEl = document.querySelector('.audio-bar span');
  const AUDIO_PLAY_D = 'M8 5.5v13l10-6.5z';
  const AUDIO_PAUSE_D = 'M7.5 5.5h3.4v13H7.5zM13.1 5.5h3.4v13h-3.4z';
  const fmtTime = (s) => {
    if (!isFinite(s)) s = 0;
    const m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
  };
  const setPlaying = (playing) => {
    if (audioBtn) {
      audioBtn.setAttribute('aria-label', playing ? 'Pausar a versão em áudio da reportagem' : 'Reproduzir a versão em áudio da reportagem');
      const p = audioBtn.querySelector('path');
      if (p) p.setAttribute('d', playing ? AUDIO_PAUSE_D : AUDIO_PLAY_D);
    }
    if (audioStatusEl) audioStatusEl.textContent = playing ? 'Tocando' : 'Disponível';
  };
  if (audioBtn && audioEl) {
    audioBtn.addEventListener('click', () => {
      if (audioEl.paused) {
        audioEl.play().catch(() => toast('Não foi possível iniciar o áudio. Abra o arquivo no Google Drive.'));
      } else {
        audioEl.pause();
      }
    });
    audioEl.addEventListener('play', () => setPlaying(true));
    audioEl.addEventListener('pause', () => setPlaying(false));
    audioEl.addEventListener('timeupdate', () => {
      if (audioTimeEl) audioTimeEl.textContent = fmtTime(audioEl.currentTime);
      if (audioBarEl) audioBarEl.style.width =
        (audioEl.duration ? (audioEl.currentTime / audioEl.duration) * 100 : 0).toFixed(2) + '%';
    });
    audioEl.addEventListener('ended', () => {
      if (audioTimeEl) audioTimeEl.textContent = '00:00';
      if (audioBarEl) audioBarEl.style.width = '0%';
      setPlaying(false);
    });
    audioEl.addEventListener('error', () => toast('Não foi possível carregar o áudio. Tente abrir o arquivo no Google Drive.'));
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
