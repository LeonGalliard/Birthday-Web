/* =========================================================
   MEMORY BOOK: THE LAST LETTER
   Main JavaScript – all interactivity
   ========================================================= */

"use strict";

// ─── State ────────────────────────────────────────────────
const State = {
  currentSection: 0,
  sections: [],
  musicPlaying: false,
  audioContext: null,
  audioBuffer: null,
  sourceNode: null,
  gainNode: null,
  galleryIndex: 0,
  photos: [],
  letterOpened: false,
};

// ─── Sections list (for progress dots) ───────────────────
const SECTION_IDS = [
  'cover', 'chapter1', 'chapter2', 'chapter3',
  'chapter4', 'chapter5', 'chapter6', 'chapter7', 'chapter8'
];

// ─── Init ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  initStars();
  initLoading();
  await loadData();
  initGallery();
  initTimeline();
  initProgress();
  initEnvelope();
  initScrollObserver();
  initTyped();
  AOS.init({ duration: 800, once: true, offset: 80 });
});

// ─── Loading Screen ───────────────────────────────────────
function initLoading() {
  setTimeout(() => {
    const ls = document.getElementById('loading-screen');
    ls.classList.add('hidden');
    document.getElementById('cover').style.display = 'flex';
    initProgress();
    initMusicPlayer();
  }, 2200);
}

// ─── Stars Canvas ─────────────────────────────────────────
function initStars() {
  const canvas = document.getElementById('stars-canvas');
  const ctx = canvas.getContext('2d');

  let stars = [];
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    createStars();
  }

  function createStars() {
    stars = [];
    const count = Math.floor((W * H) / 3000);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.2 + 0.2,
        alpha: Math.random(),
        speed: Math.random() * 0.005 + 0.001,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    stars.forEach(s => {
      s.alpha = 0.3 + 0.7 * Math.abs(Math.sin(t * s.speed + s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(draw);
}

// ─── Music Player ─────────────────────────────────────────
function initMusicPlayer() {
  const player = document.getElementById('music-player');
  const btn    = document.getElementById('music-btn');
  const eq     = document.querySelector('.music-eq');

  // Show player after a short delay
  setTimeout(() => player.classList.add('visible'), 1000);

  btn.addEventListener('click', toggleMusic);
}

function toggleMusic() {
  if (!State.audioContext) {
    initAudio();
    return;
  }
  if (State.musicPlaying) {
    State.gainNode.gain.setTargetAtTime(0, State.audioContext.currentTime, 0.5);
    setTimeout(() => {
      State.sourceNode?.stop();
      State.musicPlaying = false;
      updateMusicUI(false);
    }, 600);
  } else {
    startAudio();
  }
}

function initAudio() {
  try {
    State.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    State.gainNode = State.audioContext.createGain();
    State.gainNode.gain.value = 0;
    State.gainNode.connect(State.audioContext.destination);
    startAudio();
  } catch(e) {
    console.warn('Web Audio not supported', e);
  }
}

function startAudio() {
  if (!State.audioContext) return;

  // Generate a gentle piano-like tone using oscillators (no external file needed)
  generateAmbientMusic();
  State.musicPlaying = true;
  updateMusicUI(true);
}

function generateAmbientMusic() {
  const ctx = State.audioContext;
  const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // C major scale
  let time = ctx.currentTime + 0.1;

  function playChord(freq, duration, delay) {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(State.gainNode);

    osc.type = 'sine';
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0, time + delay);
    gain.gain.linearRampToValueAtTime(0.08, time + delay + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, time + delay + duration);

    osc.start(time + delay);
    osc.stop(time + delay + duration + 0.1);
  }

  // Gentle arpeggio pattern
  const pattern = [0, 2, 4, 2, 1, 3, 5, 3];
  let totalDelay = 0;

  function schedulePattern() {
    pattern.forEach((noteIdx, i) => {
      playChord(notes[noteIdx], 2.5, totalDelay + i * 0.8);
      // Add harmony an octave up softly
      playChord(notes[noteIdx] * 2, 2.5, totalDelay + i * 0.8 + 0.2);
    });
    totalDelay += pattern.length * 0.8;

    if (State.musicPlaying && totalDelay < 999) {
      setTimeout(() => {
        if (State.musicPlaying) schedulePattern();
      }, (pattern.length * 0.8 - 1) * 1000);
    }
  }

  State.gainNode.gain.setTargetAtTime(0.35, ctx.currentTime, 1.5);
  schedulePattern();
}

function updateMusicUI(playing) {
  const btn = document.getElementById('music-btn');
  const eq  = document.querySelector('.music-eq');
  btn.innerHTML = playing ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-music"></i>';
  if (playing) eq.classList.remove('paused');
  else eq.classList.add('paused');
}

// ─── Data Loading ─────────────────────────────────────────
async function loadData() {
  try {
    const [photosRes, letterRes, timelineRes] = await Promise.all([
      fetch('/api/photos'),
      fetch('/api/letter'),
      fetch('/api/timeline'),
    ]);
    State.photos   = await photosRes.json();
    State.letter   = await letterRes.json();
    State.timeline = await timelineRes.json();
  } catch(e) {
    console.error('Failed to load data', e);
    State.photos   = [];
    State.letter   = { paragraphs: [] };
    State.timeline = [];
  }
}

// ─── Gallery ──────────────────────────────────────────────
function initGallery() {
  const track = document.querySelector('.gallery-track');
  const dotsEl = document.querySelector('.gallery-dots');
  if (!track) return;

  State.photos.forEach((photo, i) => {
    // Slide
    const slide = document.createElement('div');
    slide.className = 'gallery-slide';
    slide.innerHTML = `
      <img src="${photo.placeholder}" alt="${photo.caption}" loading="lazy">
      <div class="gallery-caption">
        <h3>${photo.caption}</h3>
        <p>${photo.note}</p>
      </div>`;
    slide.querySelector('img').addEventListener('click', () => openLightbox(photo.placeholder));
    track.appendChild(slide);

    // Dot
    const dot = document.createElement('button');
    dot.className = 'gallery-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Foto ${i + 1}`);
    dot.addEventListener('click', () => goToSlide(i));
    dotsEl.appendChild(dot);
  });

  document.querySelector('.gallery-btn.prev')?.addEventListener('click', () => {
    const newIdx = (State.galleryIndex - 1 + State.photos.length) % State.photos.length;
    goToSlide(newIdx);
  });

  document.querySelector('.gallery-btn.next')?.addEventListener('click', () => {
    const newIdx = (State.galleryIndex + 1) % State.photos.length;
    goToSlide(newIdx);
  });

  // Auto-advance
  setInterval(() => {
    if (State.photos.length > 0) {
      const newIdx = (State.galleryIndex + 1) % State.photos.length;
      goToSlide(newIdx);
    }
  }, 5000);
}

function goToSlide(idx) {
  State.galleryIndex = idx;
  const track = document.querySelector('.gallery-track');
  if (!track) return;
  track.style.transform = `translateX(-${idx * 100}%)`;

  document.querySelectorAll('.gallery-dot').forEach((d, i) => {
    d.classList.toggle('active', i === idx);
  });
}

// ─── Lightbox ─────────────────────────────────────────────
function openLightbox(src) {
  const lb  = document.getElementById('lightbox');
  const img = lb.querySelector('.lightbox-img');
  img.src   = src;
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

document.addEventListener('click', e => {
  if (e.target.id === 'lightbox' || e.target.classList.contains('lightbox-close')) {
    document.getElementById('lightbox').classList.remove('open');
    document.body.style.overflow = '';
  }
});

// ─── Timeline ─────────────────────────────────────────────
function initTimeline() {
  const container = document.querySelector('.timeline');
  if (!container || !State.timeline) return;

  State.timeline.forEach(item => {
    const el = document.createElement('div');
    el.className = 'timeline-item';
    el.innerHTML = `
      <div class="timeline-dot"></div>
      <div class="timeline-month">${item.month}</div>
      <div class="timeline-title">${item.title}</div>
      <div class="timeline-text">${item.text}</div>`;
    container.appendChild(el);
  });
}

// ─── Envelope / Letter ────────────────────────────────────
function initEnvelope() {
  const envelope    = document.querySelector('.envelope');
  const letterEl    = document.querySelector('.letter-content');
  const letterBody  = document.querySelector('.letter-body');

  if (!envelope) return;

  envelope.addEventListener('click', () => {
    if (State.letterOpened) return;
    State.letterOpened = true;

    envelope.classList.add('opened');

    // Build letter content after envelope opens
    setTimeout(() => {
      if (State.letter?.paragraphs) {
        const greeting = document.querySelector('.letter-greeting');
        if (greeting) greeting.textContent = `Untuk ${window.__CONFIG?.recipient_name || 'Kamu'},`;

        letterBody.innerHTML = State.letter.paragraphs
          .map(p => `<p>${p}</p>`).join('');

        const sign = document.querySelector('.letter-sign');
        if (sign) sign.textContent = `— ${window.__CONFIG?.sender_name || 'Seseorang yang peduli'}`;
      }

      letterEl.style.display = 'block';
      setTimeout(() => letterEl.classList.add('visible'), 50);
    }, 900);
  });
}

// ─── Book Open ────────────────────────────────────────────
window.openBook = function() {
  const book = document.querySelector('.book');
  book.classList.add('open');

  setTimeout(() => {
    pageTransition(() => {
      scrollToSection('chapter1');
    });
  }, 1200);
};

// ─── Page Transition ──────────────────────────────────────
function pageTransition(callback) {
  const overlay = document.getElementById('page-transition');
  overlay.classList.add('active');
  setTimeout(() => {
    callback();
    setTimeout(() => overlay.classList.remove('active'), 600);
  }, 600);
}

// ─── Scroll To Section ────────────────────────────────────
window.scrollToSection = function(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
};

// ─── Progress Dots ────────────────────────────────────────
function initProgress() {
  const container = document.getElementById('page-progress');
  if (!container) return;

  SECTION_IDS.forEach((id, i) => {
    const dot = document.createElement('div');
    dot.className = 'progress-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('data-section', id);
    dot.setAttribute('title', `Halaman ${i + 1}`);
    dot.addEventListener('click', () => {
      pageTransition(() => scrollToSection(id));
    });
    container.appendChild(dot);
  });

  container.classList.add('visible');
}

function updateProgress(id) {
  document.querySelectorAll('.progress-dot').forEach(dot => {
    dot.classList.toggle('active', dot.dataset.section === id);
  });
}

// ─── Scroll Observer ──────────────────────────────────────
function initScrollObserver() {
  // Observe sections for progress
  const sectionObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) updateProgress(entry.target.id);
    });
  }, { threshold: 0.4 });

  SECTION_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) sectionObs.observe(el);
  });

  // Observe animated elements
  const animObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll(
    '.memory-item, .timeline-item, .wish-item, .missing-intro, .closing-text'
  ).forEach(el => animObs.observe(el));
}

// ─── Typed.js Prolog ──────────────────────────────────────
function initTyped() {
  const el = document.getElementById('typed-prolog');
  if (!el || typeof Typed === 'undefined') return;

  new Typed('#typed-prolog', {
    strings: [
      'Aku sempat berpikir untuk menulis ucapan yang biasa saja.^1500',
      'Aku sempat berpikir untuk menulis ucapan yang biasa saja.^500 Tapi rasanya ada terlalu banyak hal yang ingin kukatakan.',
    ],
    typeSpeed: 40,
    backSpeed: 0,
    backDelay: 0,
    loop: false,
    showCursor: true,
    cursorChar: '|',
    onComplete: (self) => {
      self.cursor.style.display = 'none';
    }
  });
}

// ─── Final Page Sequence ──────────────────────────────────
window.triggerFinal = function() {
  pageTransition(() => {
    document.getElementById('chapter8').style.display = 'none';
    const finalPage = document.getElementById('final-page');
    finalPage.classList.add('active');

    const lines = finalPage.querySelectorAll('.final-line');
    const name  = finalPage.querySelector('.final-name');

    lines.forEach((line, i) => {
      setTimeout(() => line.classList.add('visible'), i * 1200 + 400);
    });

    const nameDelay = lines.length * 1200 + 800;

    setTimeout(() => {
      name.classList.add('visible');
      launchConfetti();
      floatBalloons();
    }, nameDelay);
  });
};

function launchConfetti() {
  if (typeof confetti === 'undefined') return;

  const colors = ['#c9a84c', '#e8d28a', '#ffffff', '#f5f0e8', '#1a2340'];

  confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors });

  setTimeout(() => confetti({ particleCount: 60, angle: 60,  spread: 55, origin: { x: 0 }, colors }), 600);
  setTimeout(() => confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1 }, colors }), 900);
}

function floatBalloons() {
  const container = document.querySelector('.balloons');
  if (!container) return;
  container.innerHTML = '🎈🎈🎉🎈🎈';
  container.querySelectorAll('*').forEach((el, i) => {
    el.classList.add('balloon');
    el.style.animationDelay = `${i * 0.3}s`;
  });
}

window.triggerEnding = function() {
  pageTransition(() => {
    document.getElementById('final-page').classList.remove('active');
    document.getElementById('final-page').style.display = 'none';
    const ending = document.getElementById('ending');
    ending.classList.add('active');
  });
};
