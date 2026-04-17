/* ==========================================
   IMPLANTATE LANDINGPAGE — Scroll Animation + Quiz
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

  // === IMPLANTAT SCROLL ANIMATION ===
  const steps = document.querySelectorAll('.implant-step');
  const layers = document.querySelectorAll('.implant-layer');

  if (steps.length && layers.length) {
    // Activate layers based on which step is in view
    const activateStep = (stepNum) => {
      // Update step cards
      steps.forEach(s => {
        const num = parseInt(s.getAttribute('data-anim-step'));
        s.classList.toggle('active', num <= stepNum);
      });

      // Update SVG layers
      layers.forEach(l => {
        const num = parseInt(l.getAttribute('data-step'));
        if (num <= stepNum) {
          l.classList.add('active');
        } else {
          l.classList.remove('active');
        }
      });
    };

    // Start with step 1
    activateStep(1);

    // IntersectionObserver for each step
    const stepObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const stepNum = parseInt(entry.target.getAttribute('data-anim-step'));
          activateStep(stepNum);
        }
      });
    }, {
      threshold: 0.6,
      rootMargin: '-10% 0px -10% 0px'
    });

    steps.forEach(s => stepObserver.observe(s));
  }

  // === ZUSCHUSS QUIZ ===
  const quizData = {};

  document.querySelectorAll('.zuschuss-quiz__option').forEach(btn => {
    btn.addEventListener('click', () => {
      const step = btn.closest('.zuschuss-quiz__step');
      const currentStep = step.getAttribute('data-zstep');
      const nextStep = btn.getAttribute('data-znext');
      const value = btn.getAttribute('data-zvalue');

      // Store answer
      if (currentStep === '1') quizData.kasse = value;
      if (currentStep === '2') quizData.bonus = value;
      if (currentStep === '3') quizData.zaehne = value;

      // Transition
      step.classList.remove('active');
      const next = document.querySelector(`[data-zstep="${nextStep}"]`);
      if (next) {
        next.classList.add('active');

        // Update progress bar in next step
        const progressBar = next.querySelector('.zuschuss-quiz__progress-bar');
        if (progressBar) {
          const widths = { '2': '50%', '3': '75%', '4': '100%' };
          progressBar.style.width = widths[nextStep] || '25%';
        }
      }

      // Show result
      if (nextStep === '4') {
        showZuschussResult();
      }
    });
  });

  function showZuschussResult() {
    const result = document.getElementById('zuschuss-result');
    if (!result) return;

    let zuschussText = '';
    let prozent = 60;
    let bonusInfo = '';

    // Calculate Zuschuss
    if (quizData.bonus === 'bonus10') {
      prozent = 75;
      bonusInfo = 'Ihr Bonusheft über 10 Jahre erhöht den Festzuschuss auf <strong>75%</strong> der Regelversorgung.';
    } else if (quizData.bonus === 'bonus5') {
      prozent = 70;
      bonusInfo = 'Ihr Bonusheft über 5 Jahre erhöht den Festzuschuss auf <strong>70%</strong> der Regelversorgung.';
    } else {
      prozent = 60;
      bonusInfo = 'Ohne Bonusheft erhalten Sie den Basiszuschuss von <strong>60%</strong> der Regelversorgung. <em>Tipp: Beginnen Sie jetzt mit regelmäßigen Kontrollen!</em>';
    }

    if (quizData.kasse === 'pkv') {
      zuschussText = `
        <h4>Private Krankenversicherung</h4>
        <p>Als Privatversicherter hängt die Kostenübernahme von Ihrem individuellen Tarif ab. Viele PKV-Tarife übernehmen <strong>50% bis 90%</strong> der Implantatkosten.</p>
        <p>Wir empfehlen: Reichen Sie unseren Heil- und Kostenplan vor Behandlungsbeginn bei Ihrer Versicherung ein — so wissen Sie vorab, welchen Anteil Ihre PKV übernimmt.</p>
        <p><strong>Nächster Schritt:</strong> Vereinbaren Sie ein Beratungsgespräch, wir erstellen Ihnen einen detaillierten Kostenplan.</p>
      `;
    } else if (quizData.kasse === 'zusatz') {
      zuschussText = `
        <h4>GKV + Zahnzusatzversicherung</h4>
        <p>${bonusInfo}</p>
        <p>Zusätzlich übernimmt Ihre <strong>Zahnzusatzversicherung</strong> je nach Tarif einen weiteren Anteil — häufig bleiben Ihnen nur <strong>10% bis 30%</strong> Eigenanteil.</p>
        <p>Wichtig: Reichen Sie den Heil- und Kostenplan <strong>vor</strong> Behandlungsbeginn bei Ihrer Zusatzversicherung ein.</p>
        <p><strong>Nächster Schritt:</strong> Wir erstellen Ihnen gerne einen Kostenplan, den Sie direkt bei Ihrer Versicherung einreichen können.</p>
      `;
    } else {
      // GKV
      let kostenrahmen = '';
      if (quizData.zaehne === '1') {
        kostenrahmen = 'Für ein einzelnes Implantat liegt Ihr geschätzter Eigenanteil bei <strong>ca. 1.000 – 2.200 €</strong>.';
      } else if (quizData.zaehne === '2-3') {
        kostenrahmen = 'Für 2–3 Implantate liegt Ihr geschätzter Eigenanteil bei <strong>ca. 2.500 – 6.000 €</strong>.';
      } else if (quizData.zaehne === '4+') {
        kostenrahmen = 'Bei größeren Versorgungen erstellen wir Ihnen einen individuellen Kostenplan. Auch Ratenzahlung ist möglich.';
      } else {
        kostenrahmen = 'Den genauen Umfang klären wir gerne im persönlichen Beratungsgespräch.';
      }

      zuschussText = `
        <h4>Gesetzliche Krankenversicherung — Festzuschuss: ${prozent}%</h4>
        <p>${bonusInfo}</p>
        <p>${kostenrahmen}</p>
        <p><strong>Nächster Schritt:</strong> Im persönlichen Beratungsgespräch erstellen wir Ihnen einen verbindlichen Heil- und Kostenplan — transparent und nachvollziehbar.</p>
      `;
    }

    result.innerHTML = zuschussText;
  }

});

// Global function for quiz reset
function resetZuschussQuiz() {
  document.querySelectorAll('.zuschuss-quiz__step').forEach(s => s.classList.remove('active'));
  const first = document.querySelector('[data-zstep="1"]');
  if (first) first.classList.add('active');
}
