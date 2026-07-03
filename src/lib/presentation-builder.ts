import { getOutputStrings } from './output-strings';
import { SOURCE_LOCALE } from '@/config/locales';
import { defaultSlideTheme, renderThemeCss, type SlideTheme } from './slide-theme';
import { CATEGORY_BACKGROUNDS } from './category-backgrounds';
import type { AssembledQuiz } from '@/types/quiz';

// The generated deck is a standalone HTML file that may be opened offline or
// on another machine, so background images need an absolute URL.
const BASE_URL = 'https://pubquizplanner.com';

export function buildPresentation(
  quiz: AssembledQuiz,
  theme: SlideTheme = defaultSlideTheme
): string {
  const { config, rounds } = quiz;
  const s = getOutputStrings(config.locale);
  const slides: string[] = [];

  // Title slide
  slides.push(buildSlide('title', `
    <div class="title-slide">
      <div class="title-icon">🧠</div>
      <h1>${escapeHtml(config.title)}</h1>
      ${config.date ? `<p class="date">${escapeHtml(config.date)}</p>` : ''}
      ${config.venue ? `<p class="venue">${escapeHtml(config.venue)}</p>` : ''}
      <p class="subtitle">${s.goodLuck}</p>
      <p class="keys-hint">${s.keysHint}</p>
    </div>
  `));

  const halfwayRound = Math.ceil(rounds.length / 2);
  const allAnswersAtEnd = config.answerPlacement === 'all_at_end';

  rounds.forEach((round, roundIndex) => {
    const roundNum = roundIndex + 1;
    const catClass = categoryClass(round.config.categorySlug);

    // Round title slide
    slides.push(buildSlide('round-title', `
      <div class="round-title-slide">
        <div class="round-number">${s.round} ${roundNum}</div>
        <div class="round-icon">${escapeHtml(round.config.categoryIcon)}</div>
        <h2>${escapeHtml(round.config.categoryName)}</h2>
        <p class="round-info">${round.questions.length} ${s.questions}</p>
      </div>
    `, catClass));

    // Question slides
    round.questions.forEach((q, qIndex) => {
      const meta = `${s.round} ${roundNum} · ${s.question} ${qIndex + 1}`;
      const isEstimation = q.question_type === 'estimation';
      const estimationBadge = isEstimation
        ? `<div class="estimation-badge">📊 ${s.estimationHint}</div>`
        : '';

      slides.push(buildSlide('question', `
        <div class="question-slide">
          <div class="question-meta">${meta}</div>
          <h2 class="question-text">${escapeHtml(q.text_de)}</h2>
          ${estimationBadge}
        </div>
      `, catClass));

      // Answer slide (if showing after each round)
      if (!allAnswersAtEnd) {
        slides.push(buildSlide('answer', `
          <div class="answer-slide">
            <div class="question-meta">${meta}</div>
            <p class="answer-question">${escapeHtml(q.text_de)}</p>
            <div class="answer-text">${escapeHtml(q.answer_de)}</div>
            ${q.fun_fact_de ? `<div class="fun-fact"><span class="fun-fact-label">💡 ${s.didYouKnow}</span> ${escapeHtml(q.fun_fact_de)}</div>` : ''}
          </div>
        `, catClass));
      }
    });

    // Halftime slide
    if (roundNum === halfwayRound && rounds.length > 2) {
      slides.push(buildSlide('halftime', `
        <div class="halftime-slide">
          <div class="halftime-icon">🍺</div>
          <h2>${s.halftime}</h2>
          <p>${s.halftimeSub}</p>
        </div>
      `));
    }
  });

  // Answer section (if all at end)
  if (allAnswersAtEnd) {
    slides.push(buildSlide('section-title', `
      <div class="section-title-slide">
        <h2>${s.resolution}</h2>
        <p>${s.resolutionSub}</p>
      </div>
    `));

    rounds.forEach((round, roundIndex) => {
      const roundNum = roundIndex + 1;
      const catClass = categoryClass(round.config.categorySlug);

      slides.push(buildSlide('round-title', `
        <div class="round-title-slide">
          <div class="round-number">${s.answersRound} ${roundNum}</div>
          <div class="round-icon">${escapeHtml(round.config.categoryIcon)}</div>
          <h2>${escapeHtml(round.config.categoryName)}</h2>
        </div>
      `, catClass));

      round.questions.forEach((q, qIndex) => {
        const meta = `${s.round} ${roundNum} · ${s.question} ${qIndex + 1}`;

        slides.push(buildSlide('answer', `
          <div class="answer-slide">
            <div class="question-meta">${meta}</div>
            <p class="answer-question">${escapeHtml(q.text_de)}</p>
            <div class="answer-text">${escapeHtml(q.answer_de)}</div>
            ${q.fun_fact_de ? `<div class="fun-fact"><span class="fun-fact-label">💡 ${s.didYouKnow}</span> ${escapeHtml(q.fun_fact_de)}</div>` : ''}
          </div>
        `, catClass));
      });
    });
  }

  // Final slide
  slides.push(buildSlide('final', `
    <div class="final-slide">
      <div class="final-icon">🏆</div>
      <h2>${s.finalTitle}</h2>
      <p>${s.finalSub}</p>
      <p class="branding">${s.madeWith}</p>
    </div>
  `));

  return `<!DOCTYPE html>
<html lang="${config.locale || SOURCE_LOCALE}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(config.title)}</title>
<style>
${renderThemeCss(theme)}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  background: var(--slide-bg);
  color: var(--slide-text);
  font-family: var(--slide-font-body);
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

/* Category background artwork (see src/lib/category-backgrounds.ts) */
${renderCategoryBackgroundCss()}

h1, h2 {
  font-family: var(--slide-font-display);
  font-weight: 900;
}

/* Title slide */
.title-slide { text-align: center; }
.title-slide .title-icon { font-size: 72px; margin-bottom: 30px; }
.title-slide h1 { font-size: 72px; color: var(--slide-accent); margin-bottom: 20px; line-height: 1.1; }
.title-slide .date { font-size: 24px; color: var(--slide-muted); margin-bottom: 8px; }
.title-slide .venue { font-size: 24px; color: var(--slide-muted); margin-bottom: 30px; }
.title-slide .subtitle { font-size: 20px; color: var(--slide-subtle); font-style: italic; }
.title-slide .keys-hint {
  margin-top: 50px;
  font-family: var(--slide-font-mono);
  font-size: 14px;
  color: var(--slide-faint);
}

/* Round title */
.round-title-slide { text-align: center; }
.round-title-slide .round-number {
  font-family: var(--slide-font-mono);
  font-size: 18px;
  color: var(--slide-accent);
  text-transform: uppercase;
  letter-spacing: 4px;
  margin-bottom: 20px;
}
.round-title-slide .round-icon { font-size: 80px; margin-bottom: 20px; }
.round-title-slide h2 { font-size: 56px; color: var(--slide-text); margin-bottom: 15px; }
.round-title-slide .round-info { font-size: 20px; color: var(--slide-muted); }

/* Question */
.question-slide { text-align: center; max-width: 900px; }
.question-slide .question-meta {
  font-family: var(--slide-font-mono);
  font-size: 14px;
  color: var(--slide-accent);
  letter-spacing: 2px;
  margin-bottom: 40px;
}
.question-slide .question-text { font-size: 44px; line-height: 1.3; color: var(--slide-text); }
.question-slide .estimation-badge {
  margin-top: 40px;
  display: inline-block;
  background: var(--slide-panel-bg);
  border: 1px solid var(--slide-panel-border);
  border-radius: 999px;
  padding: 10px 24px;
  font-family: var(--slide-font-mono);
  font-size: 18px;
  color: var(--slide-accent);
}

/* Answer */
.answer-slide { text-align: center; max-width: 900px; }
.answer-slide .question-meta {
  font-family: var(--slide-font-mono);
  font-size: 14px;
  color: var(--slide-accent);
  letter-spacing: 2px;
  margin-bottom: 30px;
}
.answer-slide .answer-question { font-size: 24px; color: var(--slide-muted); margin-bottom: 30px; font-style: italic; }
.answer-slide .answer-text { font-size: 52px; color: var(--slide-correct); font-family: var(--slide-font-display); font-weight: 700; margin-bottom: 30px; }
.answer-slide .fun-fact {
  background: var(--slide-panel-bg);
  border: 1px solid var(--slide-panel-border);
  border-radius: 12px;
  padding: 20px 30px;
  font-size: 18px;
  color: var(--slide-panel-text);
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.5;
}
.answer-slide .fun-fact .fun-fact-label { font-weight: 700; color: var(--slide-accent); }

/* Halftime */
.halftime-slide { text-align: center; }
.halftime-slide .halftime-icon { font-size: 100px; margin-bottom: 30px; }
.halftime-slide h2 { font-size: 64px; color: var(--slide-accent); margin-bottom: 15px; }
.halftime-slide p { font-size: 28px; color: var(--slide-muted); }

/* Section title */
.section-title-slide { text-align: center; }
.section-title-slide h2 { font-size: 64px; color: var(--slide-accent); margin-bottom: 15px; }
.section-title-slide p { font-size: 24px; color: var(--slide-muted); }

/* Final */
.final-slide { text-align: center; }
.final-slide .final-icon { font-size: 100px; margin-bottom: 30px; }
.final-slide h2 { font-size: 64px; color: var(--slide-accent); margin-bottom: 15px; }
.final-slide p { font-size: 28px; color: var(--slide-muted); margin-bottom: 10px; }
.final-slide .branding {
  font-family: var(--slide-font-mono);
  font-size: 14px;
  color: var(--slide-faint);
  margin-top: 40px;
}

/* Progress bar */
#progress {
  position: fixed;
  bottom: 0;
  left: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--slide-accent), var(--slide-accent-light));
  transition: width 0.3s ease;
  z-index: 100;
}

/* Slide counter */
#counter {
  position: fixed;
  bottom: 20px;
  right: 30px;
  font-family: var(--slide-font-mono);
  font-size: 14px;
  color: var(--slide-faint);
  z-index: 100;
}

/* Timer */
#timer {
  display: none;
  position: fixed;
  top: 30px;
  right: 30px;
  font-family: var(--slide-font-mono);
  font-size: 48px;
  color: var(--slide-accent);
  z-index: 100;
}
#timer.warning { color: var(--slide-warning); }
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

function buildSlide(type: string, content: string, extraClass?: string): string {
  const cls = extraClass ? `${type} ${extraClass}` : type;
  return `<div class="slide ${cls}">${content}</div>`;
}

// Returns a 'cat-<slug>' class for round-scoped slides. The class is always
// applied (cheap, harmless); only slugs present in CATEGORY_BACKGROUNDS get a
// matching CSS rule, so this is a no-op until artwork exists for that category.
function categoryClass(slug: string): string {
  return `cat-${slug}`;
}

// Emits one CSS rule per registered category background: the artwork plus a
// dark overlay for legibility (so the source images don't need to guarantee
// contrast themselves — see SLIDE_DESIGN_PROMPTS.md).
function renderCategoryBackgroundCss(): string {
  return Object.entries(CATEGORY_BACKGROUNDS)
    .filter((entry): entry is [string, string] => Boolean(entry[1]))
    .map(
      ([slug, path]) => `.slide.cat-${slug} {
  background: linear-gradient(rgba(6, 6, 10, 0.72), rgba(6, 6, 10, 0.72)), url('${BASE_URL}${path}') center/cover no-repeat;
}`
    )
    .join('\n');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
