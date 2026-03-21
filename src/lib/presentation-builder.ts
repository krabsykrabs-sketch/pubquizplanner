import type { AssembledQuiz } from '@/types/quiz';

export function buildPresentation(quiz: AssembledQuiz): string {
  const { config, rounds } = quiz;
  const slides: string[] = [];

  // Title slide
  slides.push(buildSlide('title', `
    <div class="title-slide">
      <div class="title-icon">🧠</div>
      <h1>${escapeHtml(config.title)}</h1>
      ${config.date ? `<p class="date">${escapeHtml(config.date)}</p>` : ''}
      ${config.venue ? `<p class="venue">${escapeHtml(config.venue)}</p>` : ''}
      <p class="subtitle">Viel Spaß und gutes Gelingen!</p>
    </div>
  `));

  const halfwayRound = Math.ceil(rounds.length / 2);
  const allAnswersAtEnd = config.answerPlacement === 'all_at_end';

  rounds.forEach((round, roundIndex) => {
    const roundNum = roundIndex + 1;

    // Round title slide
    slides.push(buildSlide('round-title', `
      <div class="round-title-slide">
        <div class="round-number">Runde ${roundNum}</div>
        <div class="round-icon">${escapeHtml(round.config.categoryIcon)}</div>
        <h2>${escapeHtml(round.config.categoryName)}</h2>
        <p class="round-info">${round.questions.length} Fragen${round.config.difficulty !== 'mixed' ? ` · Schwierigkeit ${'⭐'.repeat(round.config.difficulty as number)}` : ' · Gemischte Schwierigkeit'}</p>
      </div>
    `));

    // Question slides
    round.questions.forEach((q, qIndex) => {
      slides.push(buildSlide('question', `
        <div class="question-slide">
          <div class="question-meta">Runde ${roundNum} · Frage ${qIndex + 1}</div>
          <h2 class="question-text">${escapeHtml(q.text_de)}</h2>
          <div class="difficulty">${'⭐'.repeat(q.difficulty)}</div>
        </div>
      `));

      // Answer slides (if showing after each round)
      if (!allAnswersAtEnd) {
        slides.push(buildSlide('answer', `
          <div class="answer-slide">
            <div class="question-meta">Runde ${roundNum} · Frage ${qIndex + 1}</div>
            <p class="answer-question">${escapeHtml(q.text_de)}</p>
            <div class="answer-text">${escapeHtml(q.answer_de)}</div>
            ${q.fun_fact_de ? `<div class="fun-fact"><span class="fun-fact-label">💡 Wusstest du?</span> ${escapeHtml(q.fun_fact_de)}</div>` : ''}
          </div>
        `));
      }
    });

    // Halftime slide
    if (roundNum === halfwayRound && rounds.length > 2) {
      slides.push(buildSlide('halftime', `
        <div class="halftime-slide">
          <div class="halftime-icon">🍺</div>
          <h2>Halbzeit!</h2>
          <p>Zeit für ein Getränk</p>
        </div>
      `));
    }
  });

  // Answer section (if all at end)
  if (allAnswersAtEnd) {
    slides.push(buildSlide('section-title', `
      <div class="section-title-slide">
        <h2>Auflösung</h2>
        <p>Jetzt wird's spannend!</p>
      </div>
    `));

    rounds.forEach((round, roundIndex) => {
      const roundNum = roundIndex + 1;

      slides.push(buildSlide('round-title', `
        <div class="round-title-slide">
          <div class="round-number">Antworten Runde ${roundNum}</div>
          <div class="round-icon">${escapeHtml(round.config.categoryIcon)}</div>
          <h2>${escapeHtml(round.config.categoryName)}</h2>
        </div>
      `));

      round.questions.forEach((q, qIndex) => {
        slides.push(buildSlide('answer', `
          <div class="answer-slide">
            <div class="question-meta">Runde ${roundNum} · Frage ${qIndex + 1}</div>
            <p class="answer-question">${escapeHtml(q.text_de)}</p>
            <div class="answer-text">${escapeHtml(q.answer_de)}</div>
            ${q.fun_fact_de ? `<div class="fun-fact"><span class="fun-fact-label">💡 Wusstest du?</span> ${escapeHtml(q.fun_fact_de)}</div>` : ''}
          </div>
        `));
      });
    });
  }

  // Final slide
  slides.push(buildSlide('final', `
    <div class="final-slide">
      <div class="final-icon">🏆</div>
      <h2>Das war's!</h2>
      <p>Gebt eure Antwortbögen ab.</p>
      <p class="branding">Erstellt mit pubquizplanner.com</p>
    </div>
  `));

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(config.title)}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  background: #0a0a0f;
  color: #e8e4dc;
  font-family: 'DM Sans', sans-serif;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
}

.slide {
  display: none;
  width: 100vw;
  height: 100vh;
  justify-content: center;
  align-items: center;
  padding: 60px;
  position: relative;
}

.slide.active { display: flex; }

h1, h2 {
  font-family: 'Playfair Display', serif;
  font-weight: 900;
}

/* Title slide */
.title-slide { text-align: center; }
.title-slide .title-icon { font-size: 72px; margin-bottom: 30px; }
.title-slide h1 { font-size: 72px; color: #d4a843; margin-bottom: 20px; line-height: 1.1; }
.title-slide .date { font-size: 24px; color: #a09888; margin-bottom: 8px; }
.title-slide .venue { font-size: 24px; color: #a09888; margin-bottom: 30px; }
.title-slide .subtitle { font-size: 20px; color: #706858; font-style: italic; }

/* Round title */
.round-title-slide { text-align: center; }
.round-title-slide .round-number {
  font-family: 'JetBrains Mono', monospace;
  font-size: 18px;
  color: #d4a843;
  text-transform: uppercase;
  letter-spacing: 4px;
  margin-bottom: 20px;
}
.round-title-slide .round-icon { font-size: 80px; margin-bottom: 20px; }
.round-title-slide h2 { font-size: 56px; color: #e8e4dc; margin-bottom: 15px; }
.round-title-slide .round-info { font-size: 20px; color: #a09888; }

/* Question */
.question-slide { text-align: center; max-width: 900px; }
.question-slide .question-meta {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  color: #d4a843;
  letter-spacing: 2px;
  margin-bottom: 40px;
}
.question-slide .question-text { font-size: 44px; line-height: 1.3; margin-bottom: 30px; color: #e8e4dc; }
.question-slide .difficulty { font-size: 24px; }

/* Answer */
.answer-slide { text-align: center; max-width: 900px; }
.answer-slide .question-meta {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  color: #d4a843;
  letter-spacing: 2px;
  margin-bottom: 30px;
}
.answer-slide .answer-question { font-size: 24px; color: #a09888; margin-bottom: 30px; font-style: italic; }
.answer-slide .answer-text { font-size: 52px; color: #4ade80; font-family: 'Playfair Display', serif; font-weight: 700; margin-bottom: 30px; }
.answer-slide .fun-fact {
  background: rgba(212, 168, 67, 0.1);
  border: 1px solid rgba(212, 168, 67, 0.3);
  border-radius: 12px;
  padding: 20px 30px;
  font-size: 18px;
  color: #c8b888;
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.5;
}
.answer-slide .fun-fact .fun-fact-label { font-weight: 700; color: #d4a843; }

/* Halftime */
.halftime-slide { text-align: center; }
.halftime-slide .halftime-icon { font-size: 100px; margin-bottom: 30px; }
.halftime-slide h2 { font-size: 64px; color: #d4a843; margin-bottom: 15px; }
.halftime-slide p { font-size: 28px; color: #a09888; }

/* Section title */
.section-title-slide { text-align: center; }
.section-title-slide h2 { font-size: 64px; color: #d4a843; margin-bottom: 15px; }
.section-title-slide p { font-size: 24px; color: #a09888; }

/* Final */
.final-slide { text-align: center; }
.final-slide .final-icon { font-size: 100px; margin-bottom: 30px; }
.final-slide h2 { font-size: 64px; color: #d4a843; margin-bottom: 15px; }
.final-slide p { font-size: 28px; color: #a09888; margin-bottom: 10px; }
.final-slide .branding {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  color: #504838;
  margin-top: 40px;
}

/* Progress bar */
#progress {
  position: fixed;
  bottom: 0;
  left: 0;
  height: 4px;
  background: linear-gradient(90deg, #d4a843, #e8c468);
  transition: width 0.3s ease;
  z-index: 100;
}

/* Slide counter */
#counter {
  position: fixed;
  bottom: 20px;
  right: 30px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  color: #504838;
  z-index: 100;
}

/* Timer */
#timer {
  display: none;
  position: fixed;
  top: 30px;
  right: 30px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 48px;
  color: #d4a843;
  z-index: 100;
}
#timer.warning { color: #ef4444; }
#timer.active { display: block; }
</style>
</head>
<body>

${slides.join('\n')}

<div id="progress"></div>
<div id="counter"></div>
<div id="timer"></div>

<script>
(function() {
  const slides = document.querySelectorAll('.slide');
  const total = slides.length;
  let current = 0;
  let timerInterval = null;
  let timerSeconds = 30;

  function showSlide(index) {
    if (index < 0 || index >= total) return;
    slides[current].classList.remove('active');
    current = index;
    slides[current].classList.add('active');
    document.getElementById('progress').style.width = ((current + 1) / total * 100) + '%';
    document.getElementById('counter').textContent = (current + 1) + ' / ' + total;
  }

  function startTimer() {
    const timerEl = document.getElementById('timer');
    if (timerInterval) {
      clearInterval(timerInterval);
      timerEl.classList.remove('active', 'warning');
      timerInterval = null;
      return;
    }
    timerSeconds = 30;
    timerEl.textContent = timerSeconds;
    timerEl.classList.add('active');
    timerEl.classList.remove('warning');
    timerInterval = setInterval(function() {
      timerSeconds--;
      timerEl.textContent = timerSeconds;
      if (timerSeconds <= 5) timerEl.classList.add('warning');
      if (timerSeconds <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        setTimeout(function() { timerEl.classList.remove('active', 'warning'); }, 2000);
      }
    }, 1000);
  }

  showSlide(0);

  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); showSlide(current + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); showSlide(current - 1); }
    if (e.key === 't' || e.key === 'T') startTimer();
    if (e.key === 'f' || e.key === 'F') {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen();
      else document.exitFullscreen();
    }
  });

  document.addEventListener('click', function(e) {
    if (e.clientX > window.innerWidth / 2) showSlide(current + 1);
    else showSlide(current - 1);
  });

  let touchStartX = 0;
  document.addEventListener('touchstart', function(e) { touchStartX = e.touches[0].clientX; });
  document.addEventListener('touchend', function(e) {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) showSlide(current + 1);
      else showSlide(current - 1);
    }
  });
})();
</script>
</body>
</html>`;
}

function buildSlide(type: string, content: string): string {
  return `<div class="slide ${type}">${content}</div>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
