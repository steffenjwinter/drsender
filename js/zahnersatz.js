/* ==========================================
   ZAHNERSATZ LANDINGPAGE — Kosten-Quiz
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

  const kostenData = {};

  document.querySelectorAll('.kosten-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const step = btn.closest('.zuschuss-quiz__step');
      const currentStep = step.getAttribute('data-kstep');
      const nextStep = btn.getAttribute('data-knext');
      const value = btn.getAttribute('data-kvalue');

      if (currentStep === '1') kostenData.art = value;
      if (currentStep === '2') kostenData.material = value;

      step.classList.remove('active');
      const next = document.querySelector(`[data-kstep="${nextStep}"]`);
      if (next) next.classList.add('active');

      if (nextStep === '3') {
        showKostenResult();
      }
    });
  });

  function showKostenResult() {
    const result = document.getElementById('kosten-result');
    if (!result) return;

    const costs = {
      krone: {
        premium: { range: '800 – 1.200 €', desc: 'Vollkeramik-/Zirkonkrone' },
        standard: { range: '500 – 800 €', desc: 'Metallkeramik-Krone (Verblendkrone)' },
        basis: { range: '300 – 500 €', desc: 'Metallkrone (Regelversorgung)' },
        beratung: { range: '300 – 1.200 €', desc: 'je nach Material und Befund' }
      },
      bruecke: {
        premium: { range: '1.500 – 2.500 €', desc: 'Vollkeramik-/Zirkon-Brücke' },
        standard: { range: '1.000 – 1.800 €', desc: 'Metallkeramik-Brücke' },
        basis: { range: '500 – 1.000 €', desc: 'Brücke als Regelversorgung' },
        beratung: { range: '500 – 2.500 €', desc: 'je nach Umfang und Material' }
      },
      implantat: {
        premium: { range: '2.500 – 3.500 €', desc: 'Implantat mit Vollkeramik-Krone' },
        standard: { range: '1.800 – 2.800 €', desc: 'Implantat mit Metallkeramik-Krone' },
        basis: { range: '1.800 – 2.500 €', desc: 'Implantat (Standardversorgung)' },
        beratung: { range: '1.800 – 3.500 €', desc: 'je nach Befund und Knochenangebot' }
      },
      prothese: {
        premium: { range: '3.000 – 5.000 €', desc: 'Teleskopprothese / implantatgetragen' },
        standard: { range: '1.500 – 3.000 €', desc: 'Modellgussprothese' },
        basis: { range: '500 – 1.500 €', desc: 'Prothese als Regelversorgung' },
        beratung: { range: '500 – 5.000 €', desc: 'je nach Art und Umfang' }
      },
      unsicher: {
        premium: { range: '', desc: '' },
        standard: { range: '', desc: '' },
        basis: { range: '', desc: '' },
        beratung: { range: '', desc: '' }
      }
    };

    const art = kostenData.art || 'unsicher';
    const material = kostenData.material || 'beratung';

    if (art === 'unsicher' || material === 'beratung') {
      result.innerHTML = `
        <h4>Individuelle Beratung empfohlen</h4>
        <p>Für eine verlässliche Kosteneinschätzung empfehlen wir ein persönliches Beratungsgespräch. Wir untersuchen Ihre Zähne, besprechen die Optionen und erstellen Ihnen einen <strong>individuellen Heil- und Kostenplan</strong> — transparent und unverbindlich.</p>
        <p>Den Kostenplan können Sie vor Behandlungsbeginn bei Ihrer Krankenkasse einreichen, um den genauen Zuschuss zu erfahren.</p>
        <p><strong>Tipp:</strong> Bringen Sie Ihr Bonusheft zum Termin mit — es kann Ihren Zuschuss deutlich erhöhen.</p>
      `;
    } else {
      const info = costs[art][material];
      result.innerHTML = `
        <h4>Geschätzte Gesamtkosten</h4>
        <p class="highlight">${info.range}</p>
        <p><strong>${info.desc}</strong></p>
        <p>Diese Schätzung ist ein Richtwert. Der tatsächliche Eigenanteil hängt von Ihrem individuellen Befund, Ihrem Bonusheft und Ihrer Versicherung ab.</p>
        <p><strong>Nächster Schritt:</strong> Vereinbaren Sie ein Beratungsgespräch — wir erstellen Ihnen einen verbindlichen Heil- und Kostenplan, den Sie vor Behandlungsbeginn bei Ihrer Kasse einreichen können.</p>
        <p style="font-size: var(--fs-sm); color: var(--color-text-grey);"><em>Hinweis: Der Festzuschuss Ihrer Krankenkasse wird vom Gesamtpreis abgezogen. Mit Bonusheft (10+ Jahre) erhalten Sie bis zu 75% Zuschuss auf die Regelversorgung.</em></p>
      `;
    }
  }

});

function resetKostenQuiz() {
  document.querySelectorAll('#kosten-quiz .zuschuss-quiz__step').forEach(s => s.classList.remove('active'));
  const first = document.querySelector('[data-kstep="1"]');
  if (first) first.classList.add('active');
}
