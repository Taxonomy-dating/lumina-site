/* ============================================================
   LUMINA — landing interactions
   Vanilla JS, no build step.
   ============================================================ */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- bucket data (mirrors PLAN.md §3.1) ---------- */
  var BUCKETS = [
    { id: 'academics',  ic: '◎', who: 'Professors, PhDs, scientists',     anchor: 'IIT, IISc, TIFR, AIIMS', c: '#7C5CFF' },
    { id: 'arts',       ic: '✎', who: 'Designers, writers, musicians',     anchor: 'NID, FTII, classical arts', c: '#FF5C8A' },
    { id: 'builders',   ic: '⌘', who: 'SWEs, hackers, makers',              anchor: 'Startups, hackathons',      c: '#22E4FF' },
    { id: 'business',   ic: '◈', who: 'Founders, consultants, bankers',    anchor: 'IIM, ISB',                 c: '#C6FF3D' },
    { id: 'healthcare', ic: '✚', who: 'Doctors, nurses, researchers',      anchor: 'AIIMS, MBBS',              c: '#FF7A9C' },
    { id: 'legal',      ic: '§', who: 'Lawyers, judges, compliance',       anchor: 'NLSIU, Bar Council',       c: '#9B8CFF' },
    { id: 'civic',      ic: '✦', who: 'NGO, IAS/IPS, educators',           anchor: 'UPSC, Pratham',            c: '#5BE3B0' },
    { id: 'media',      ic: '◐', who: 'Journalists, PR, creators',         anchor: 'The Hindu, Scroll',        c: '#FFB020' },
    { id: 'sports',     ic: '⚡', who: 'Athletes, coaches, fitness',        anchor: 'Cricket, kabaddi, yoga',   c: '#4ADE80' },
    { id: 'other',      ic: '◇', who: 'Uncategorised / cross-domain',      anchor: '—',                       c: '#94A3B8' }
  ];

  /* ---------- render buckets ---------- */
  var grid = document.getElementById('bucketGrid');
  if (grid) {
    var frag = document.createDocumentFragment();
    BUCKETS.forEach(function (b, i) {
      var el = document.createElement('article');
      el.className = 'bucket';
      el.setAttribute('data-reveal', '');
      el.setAttribute('data-delay', String((i % 5) * 60));
      el.style.setProperty('--bc', b.c);
      el.innerHTML =
        '<div class="bucket-ic">' + b.ic + '</div>' +
        '<h3>' + b.id + '</h3>' +
        '<p>' + b.who + '</p>' +
        '<div class="who">' + b.anchor + '</div>';
      el.addEventListener('mousemove', function (e) {
        var r = this.getBoundingClientRect();
        this.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        this.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
      frag.appendChild(el);
    });
    grid.appendChild(frag);
  }

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if (reduced || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var d = parseInt(en.target.getAttribute('data-delay') || '0', 10);
        setTimeout(function () { en.target.classList.add('in'); }, d);
        io.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- nav: scroll state + mobile toggle ---------- */
  var nav = document.getElementById('nav');
  var navToggle = document.getElementById('navToggle');
  var progressBar = document.getElementById('progressBar');

  function onScroll() {
    var y = window.scrollY || 0;
    if (nav) nav.classList.toggle('scrolled', y > 24);
    if (progressBar) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a') && nav.classList.contains('open')) {
        nav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- custom cursor ---------- */
  var cursor = document.getElementById('cursor');
  if (cursor && !reduced && window.matchMedia('(hover:hover)').matches) {
    var dot = cursor.querySelector('.cursor-dot');
    var ring = cursor.querySelector('.cursor-ring');
    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var rx = mx, ry = my;

    window.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      if (dot) dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
      if (e.target.closest('a,button,[data-cursor]')) cursor.classList.add('is-link');
      else cursor.classList.remove('is-link');
    });
    window.addEventListener('mousedown', function () { cursor.classList.add('is-down'); });
    window.addEventListener('mouseup', function () { cursor.classList.remove('is-down'); });

    (function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      if (ring) ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- canvas particle field ---------- */
  var cv = document.getElementById('fx');
  if (cv && !reduced) {
    var ctx = cv.getContext('2d');
    var parts = [];
    var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      W = window.innerWidth; H = window.innerHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      cv.style.width = W + 'px'; cv.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.min(70, Math.round(W / 20));
      parts = [];
      for (var i = 0; i < count; i++) {
        parts.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          r: Math.random() * 1.5 + 0.5,
          a: Math.random() * 0.4 + 0.12
        });
      }
    }
    resize();
    window.addEventListener('resize', resize);

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(160,190,255,' + p.a + ')';
        ctx.fill();
      }
      for (var j = 0; j < parts.length; j++) {
        for (var k = j + 1; k < parts.length; k++) {
          var a = parts[j], b = parts[k];
          var dx = a.x - b.x, dy = a.y - b.y;
          var d2 = dx * dx + dy * dy;
          if (d2 < 15000) {
            var o = (1 - d2 / 15000) * 0.11;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = 'rgba(124,150,255,' + o + ')';
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ---------- 3D tilt on the hero card ---------- */
  var tiltCard = document.querySelector('[data-tilt]');
  if (tiltCard && !reduced && window.matchMedia('(hover:hover)').matches) {
    var heroVisual = tiltCard.closest('.hero-visual');
    heroVisual.addEventListener('mousemove', function (e) {
      var r = tiltCard.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      tiltCard.style.transform =
        'rotateY(' + (px * 13).toFixed(2) + 'deg) rotateX(' + (-py * 13).toFixed(2) + 'deg) translateY(-6px)';
    });
    heroVisual.addEventListener('mouseleave', function () {
      tiltCard.style.transform = '';
    });
  }

  /* ---------- card action feedback ---------- */
  var likeBtn = document.querySelector('.round.like');
  var skipBtn = document.querySelector('.round.skip');
  function pulse(btn, cls) {
    if (!btn) return;
    btn.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.35)' }, { transform: 'scale(1)' }],
      { duration: 420, easing: 'cubic-bezier(.22,1,.36,1)' }
    );
    btn.classList.add(cls);
    setTimeout(function () { btn.classList.remove(cls); }, 500);
  }
  if (likeBtn) likeBtn.addEventListener('click', function () { pulse(likeBtn, 'liked'); });
  if (skipBtn) skipBtn.addEventListener('click', function () { pulse(skipBtn, 'skipped'); });

  /* ---------- engine layer bars animate on scroll ---------- */
  var layers = document.querySelectorAll('.layer');
  if (layers.length && 'IntersectionObserver' in window) {
    var lio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.style.borderColor = 'rgba(124,92,255,.45)'; lio.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    layers.forEach(function (l) { lio.observe(l); });
  }

  /* ---------- CTA form (static site: local validation only) ---------- */
  var form = document.getElementById('ctaForm');
  var note = document.getElementById('ctaNote');
  if (form && note) {
    var original = note.textContent;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = document.getElementById('email');
      var val = (input.value || '').trim();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val);
      input.classList.toggle('err', !ok);
      if (!ok) {
        note.textContent = 'That email doesn’t look right — mind checking it?';
        note.className = 'cta-note bad';
        input.focus();
        return;
      }
      note.textContent = 'You’re on the list. We’ll email you when your city opens. ✦';
      note.className = 'cta-note ok';
      input.value = '';
      input.classList.remove('err');
      input.placeholder = 'you@company.com';
      setTimeout(function () {
        note.textContent = original;
        note.className = 'cta-note';
      }, 6000);
    });
  }

  /* ---------- smooth anchor offset for fixed nav ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    if (!id || id === '#') return;
    var target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    var top = target.getBoundingClientRect().top + window.scrollY - 76;
    window.scrollTo({ top: top, behavior: reduced ? 'auto' : 'smooth' });
  });

})();
