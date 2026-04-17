/* ==========================================
   ZAHNARZTPRAXIS DR. SENDER — Main JS
   ========================================== */

// === KURZCHECK ===
const kurzcheckData = {};
const recommendations = {
  schmerzen: 'Wir empfehlen eine <strong>Schmerzbehandlung & Diagnostik</strong>. Kommen Sie zeitnah vorbei — wir helfen Ihnen schnell und einfühlsam.',
  aesthetik: 'Für Ihr Traumlächeln empfehlen wir ein <strong>Beratungsgespräch für Ästhetische Zahnheilkunde</strong> — Bleaching, Veneers oder Aligner.',
  ersatz: 'Wir empfehlen eine <strong>Beratung zu Implantaten & Zahnersatz</strong>. Aus unserem Eigenlabor — perfekt auf Sie abgestimmt.',
  vorsorge: 'Perfekt! Buchen Sie eine <strong>Professionelle Zahnreinigung (PZR)</strong> und starten Sie unser Prophylaxe-Vorsorge-Programm.',
  angst: 'Wir verstehen Sie. Buchen Sie ein <strong>unverbindliches Kennenlerngespräch</strong> — in einer vertrauensvollen, angstfreien Atmosphäre.',
  kind: 'Vereinbaren Sie einen <strong>Kennenlern-Termin für Ihr Kind</strong> — liebevoll und spielerisch, damit der Zahnarztbesuch Spaß macht.'
};

function initKurzcheck() {
  document.querySelectorAll('.kurzcheck__option').forEach(btn => {
    btn.addEventListener('click', () => {
      const step = btn.closest('.kurzcheck__step');
      const nextStep = btn.dataset.next;
      const value = btn.dataset.value;

      if (step.dataset.step === '1') kurzcheckData.anliegen = value;
      if (step.dataset.step === '2') kurzcheckData.dringend = value;
      if (step.dataset.step === '3') kurzcheckData.patient = value;

      step.classList.remove('active');
      const next = document.querySelector(`[data-step="${nextStep}"]`);
      next.classList.add('active');

      const progress = { '2': '66%', '3': '85%', 'result': '100%' };
      document.getElementById('kurzcheck-progress').style.width = progress[nextStep] || '33%';

      if (nextStep === 'result') {
        document.getElementById('kurzcheck-result').innerHTML = recommendations[kurzcheckData.anliegen] || 'Vereinbaren Sie ein persönliches Beratungsgespräch mit uns.';
      }
    });
  });
}

function resetKurzcheck() {
  document.querySelectorAll('.kurzcheck__step').forEach(s => s.classList.remove('active'));
  document.querySelector('[data-step="1"]').classList.add('active');
  document.getElementById('kurzcheck-progress').style.width = '33%';
}

document.addEventListener('DOMContentLoaded', () => {
  initKurzcheck();

  // === HEADER SCROLL EFFECT + DOCTOLIB STICKY ===
  const header = document.getElementById('header');
  const doctolibSticky = document.querySelector('.doctolib-sticky');
  let lastScroll = 0;

  // Doctolib widget: hidden in ATF, visible permanently once user scrolls past it
  let doctolibShown = false;
  if (doctolibSticky) {
    doctolibSticky.classList.add('doctolib-sticky--hidden');
  }

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Once scrolled past the initial viewport height, show widget forever
    if (doctolibSticky && !doctolibShown && currentScroll > window.innerHeight * 0.6) {
      doctolibSticky.classList.remove('doctolib-sticky--hidden');
      doctolibShown = true;
    }

    lastScroll = currentScroll;
  }, { passive: true });

  // === MOBILE MENU ===
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      menuToggle.classList.toggle('active');
      menuToggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close menu on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // === SCROLL REVEAL ANIMATIONS ===
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .stagger');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // === ANIMATED COUNTERS ===
  const counters = document.querySelectorAll('[data-count]');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const countTo = parseInt(target.getAttribute('data-count'));
        const duration = 2000;
        const start = performance.now();

        const animate = (now) => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(eased * countTo);
          target.textContent = current + (countTo >= 70 ? '+' : '');

          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };

        requestAnimationFrame(animate);
        counterObserver.unobserve(target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => counterObserver.observe(el));

  // === SMOOTH SCROLL FOR ANCHOR LINKS ===
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const headerOffset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // === ACTIVE NAV LINK ===
  const navLinks = document.querySelectorAll('.header__nav-link');
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  navLinks.forEach(link => {
    const href = link.getAttribute('href').split('/').pop();
    if (href === currentPage || (currentPage === '' && href === '/')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

});
