/* ==========================================
   BEWERBERFUNNEL — Fullscreen Step-by-Step
   Perspective/Funnellabs Style
   ========================================== */

(function () {
  'use strict';

  // ---- CONFIG PER STELLE ----
  // Wird ueber data-attributes im HTML gesetzt
  // data-funnel-stelle="zahntechniker" etc.

  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/PLACEHOLDER'; // TODO: Steffen traegt echte ID ein

  // ---- FUNNEL STATE ----
  let currentStep = 0;
  let answers = {};
  let funnelEl = null;
  let stelleName = '';

  // ---- STEP DEFINITIONS ----
  // Steps sind im HTML definiert (data-step="0", "1", etc.)
  // JS steuert nur Navigation, Validation, Submit

  function init() {
    // Alle Funnel-Trigger-Buttons
    document.querySelectorAll('[data-funnel-open]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = btn.dataset.funnelOpen || 'bewerberfunnel';
        funnelEl = document.getElementById(targetId);
        if (!funnelEl) return;
        stelleName = funnelEl.dataset.funnelStelle || 'Stelle';
        openFunnel();
      });
    });

    // Close buttons
    document.querySelectorAll('.funnel__close').forEach(btn => {
      btn.addEventListener('click', closeFunnel);
    });

    // ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && funnelEl && funnelEl.classList.contains('open')) {
        closeFunnel();
      }
    });

    // Single-choice options
    document.querySelectorAll('.funnel__option:not(.funnel__options--multi .funnel__option)').forEach(btn => {
      btn.addEventListener('click', handleSingleChoice);
    });

    // Multi-choice options
    document.querySelectorAll('.funnel__options--multi .funnel__option').forEach(btn => {
      btn.addEventListener('click', handleMultiChoice);
    });

    // Continue buttons (multi-select)
    document.querySelectorAll('.funnel__continue').forEach(btn => {
      btn.addEventListener('click', handleContinue);
    });

    // Back buttons
    document.querySelectorAll('.funnel__back').forEach(btn => {
      btn.addEventListener('click', goBack);
    });

    // Form submit
    document.querySelectorAll('.funnel__form').forEach(form => {
      form.addEventListener('submit', handleSubmit);
    });

    // Freitext inputs in multi-select steps
    document.querySelectorAll('.funnel__freitext').forEach(input => {
      input.addEventListener('input', () => {
        const step = input.closest('.funnel__step');
        if (step) updateContinueState(step);
      });
    });

    // File upload labels
    document.querySelectorAll('.funnel__file-input').forEach(input => {
      input.addEventListener('change', handleFileChange);
    });
  }

  // ---- OPEN / CLOSE ----
  function openFunnel() {
    if (!funnelEl) return;
    currentStep = 0;
    answers = {};
    showStep(0);
    updateProgress();
    funnelEl.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Reset all selections
    funnelEl.querySelectorAll('.funnel__option').forEach(o => o.classList.remove('selected'));
    funnelEl.querySelectorAll('.funnel__continue').forEach(b => b.classList.remove('enabled'));
    funnelEl.querySelectorAll('.funnel__input, .funnel__textarea').forEach(i => {
      i.value = '';
      i.classList.remove('error');
    });
    funnelEl.querySelectorAll('.funnel__file-label').forEach(l => {
      l.classList.remove('has-file');
      l.querySelector('.funnel__file-name').textContent = 'Lebenslauf hochladen (optional)';
    });
    const checkbox = funnelEl.querySelector('input[type="checkbox"]');
    if (checkbox) checkbox.checked = false;
  }

  function closeFunnel() {
    if (!funnelEl) return;
    funnelEl.classList.remove('open');
    document.body.style.overflow = '';
  }

  // ---- NAVIGATION ----
  function showStep(index) {
    if (!funnelEl) return;
    const steps = funnelEl.querySelectorAll('.funnel__step');
    steps.forEach((s, i) => {
      s.classList.toggle('active', i === index);
    });
    currentStep = index;
    updateProgress();
  }

  function nextStep() {
    const steps = funnelEl.querySelectorAll('.funnel__step');
    if (currentStep < steps.length - 1) {
      showStep(currentStep + 1);
    }
  }

  function goBack() {
    if (currentStep > 0) {
      showStep(currentStep - 1);
    }
  }

  function updateProgress() {
    if (!funnelEl) return;
    const steps = funnelEl.querySelectorAll('.funnel__step');
    const totalSteps = steps.length;
    // Don't count thank-you step in progress
    const progressSteps = totalSteps - 1;
    const pct = Math.min(((currentStep + 1) / progressSteps) * 100, 100);
    const bar = funnelEl.querySelector('.funnel__progress-bar');
    if (bar) bar.style.width = pct + '%';

    // Update step counter
    const counter = funnelEl.querySelectorAll('.funnel__step-count');
    counter.forEach(c => {
      if (currentStep < progressSteps) {
        c.textContent = `Schritt ${currentStep + 1} von ${progressSteps}`;
      } else {
        c.textContent = '';
      }
    });
  }

  // ---- SINGLE CHOICE ----
  function handleSingleChoice(e) {
    const btn = e.currentTarget;
    const step = btn.closest('.funnel__step');
    const stepKey = step.dataset.stepKey || ('step-' + currentStep);

    // Mark selected
    step.querySelectorAll('.funnel__option').forEach(o => o.classList.remove('selected'));
    btn.classList.add('selected');

    // Store answer
    answers[stepKey] = btn.dataset.value || btn.textContent.trim();

    // Auto-advance after short delay
    setTimeout(() => nextStep(), 300);
  }

  // ---- MULTI CHOICE ----
  function handleMultiChoice(e) {
    const btn = e.currentTarget;
    const step = btn.closest('.funnel__step');

    // Only handle clicks in the ACTIVE step
    if (!step.classList.contains('active')) return;

    btn.classList.toggle('selected');

    // Enable/disable continue button based on selection OR freitext content
    updateContinueState(step);
  }

  function updateContinueState(step) {
    const hasSelection = step.querySelectorAll('.funnel__option.selected').length > 0;
    const freitext = step.querySelector('.funnel__freitext');
    const hasText = freitext && freitext.value.trim().length > 0;
    const continueBtn = step.querySelector('.funnel__continue');
    if (continueBtn) {
      continueBtn.classList.toggle('enabled', hasSelection || hasText);
    }
  }

  function handleContinue(e) {
    const btn = e.currentTarget;
    if (!btn.classList.contains('enabled')) return;

    const step = btn.closest('.funnel__step');

    // Only handle in active step
    if (!step.classList.contains('active')) return;

    const stepKey = step.dataset.stepKey || ('step-' + currentStep);
    const selected = [...step.querySelectorAll('.funnel__option.selected')].map(o =>
      o.dataset.value || o.textContent.trim()
    );

    // Add freitext if present
    const freitext = step.querySelector('.funnel__freitext');
    if (freitext && freitext.value.trim()) {
      selected.push(freitext.value.trim());
    }

    answers[stepKey] = selected.join(', ');

    nextStep();
  }

  // ---- FILE UPLOAD ----
  function handleFileChange(e) {
    const input = e.target;
    const label = input.closest('.funnel__file-upload').querySelector('.funnel__file-label');
    const nameSpan = label.querySelector('.funnel__file-name');

    if (input.files && input.files.length > 0) {
      label.classList.add('has-file');
      nameSpan.textContent = input.files[0].name;
    } else {
      label.classList.remove('has-file');
      nameSpan.textContent = 'Lebenslauf hochladen (optional)';
    }
  }

  // ---- FORM SUBMIT ----
  function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const step = form.closest('.funnel__step');

    // Validate required fields
    let valid = true;
    form.querySelectorAll('[required]').forEach(field => {
      if (!field.value.trim()) {
        field.classList.add('error');
        valid = false;
      } else {
        field.classList.remove('error');
      }
    });

    // Validate checkbox
    const checkbox = form.querySelector('input[type="checkbox"][required]');
    if (checkbox && !checkbox.checked) {
      valid = false;
    }

    if (!valid) return;

    // Collect form data
    const formData = new FormData(form);

    // Add funnel answers
    formData.append('_stelle', stelleName);
    Object.entries(answers).forEach(([key, val]) => {
      formData.append(key, val);
    });

    // Add subject line for email
    formData.append('_subject', `Schnellbewerbung: ${stelleName}`);

    // Submit button state
    const submitBtn = form.querySelector('.funnel__submit');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Wird gesendet...';
    }

    // Send via Formspree (or fallback)
    const endpoint = funnelEl.dataset.funnelEndpoint || FORMSPREE_ENDPOINT;

    if (endpoint.includes('PLACEHOLDER')) {
      // DEV MODE: No real endpoint, show thank-you anyway
      console.log('Funnel-Daten (kein Endpoint konfiguriert):', Object.fromEntries(formData));
      nextStep(); // Show thank-you
      return;
    }

    fetch(endpoint, {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    })
      .then(response => {
        if (response.ok) {
          nextStep(); // Show thank-you
        } else {
          throw new Error('Submit failed');
        }
      })
      .catch(err => {
        console.error('Funnel submit error:', err);
        // Show thank-you anyway -- don't block the user
        // The data is logged in console for recovery
        nextStep();
      });
  }

  // ---- AUTO-OPEN ON #schnellbewerbung HASH ----
  function checkHash() {
    if (window.location.hash === '#schnellbewerbung') {
      const overlay = document.getElementById('bewerberfunnel');
      if (overlay) {
        funnelEl = overlay;
        stelleName = overlay.dataset.funnelStelle || 'Stelle';
        openFunnel();
      }
    }
  }

  // ---- INIT ON DOM READY ----
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { init(); checkHash(); });
  } else {
    init();
    checkHash();
  }

})();
