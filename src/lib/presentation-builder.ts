import { getOutputStrings } from './output-strings';
import { getQuizMode } from './quiz-modes';
import { SOURCE_LOCALE } from '@/config/locales';
import { defaultSlideTheme, renderThemeCss, type SlideTheme } from './slide-theme';
import { CATEGORY_BACKGROUNDS } from './category-backgrounds';
import type { AssembledQuiz } from '@/types/quiz';

// The generated deck is a standalone HTML file that may be opened offline or
// on another machine, so background images need an absolute URL.
const BASE_URL = 'https://pubquizplanner.com';

// The brand's "?" roundel (wordmark motif) as an inline SVG — no emoji, no
// external asset, works offline.
function roundelSvg(size: number): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 48 48" style="color: var(--slide-accent);" aria-hidden="true">
    <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" stroke-width="2.5"/>
    <circle cx="24" cy="24" r="16.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="0.5 3.4" stroke-linecap="round"/>
    <text x="24" y="33" font-family="Archivo, sans-serif" font-weight="800" font-size="24" text-anchor="middle" fill="currentColor">?</text>
  </svg>`;
}

// Green check coin used on the answer reveal.
const CHECK_SVG = `<span class="answer-check" aria-hidden="true"><svg width="60%" height="60%" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 6" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;

export function buildPresentation(
  quiz: AssembledQuiz,
  theme: SlideTheme = defaultSlideTheme
): string {
  const { config, rounds } = quiz;
  const s = getOutputStrings(config.locale);
  const slides: string[] = [];

  // Per-question countdown. Opt-in: only the vetted durations enable it, so a
  // stray value can never inject an arbitrary number into the deck. When off,
  // no timer markup, CSS behaviour or key hint is emitted (see below) and the
  // deck is unchanged from a timer-less build.
  const timerSeconds = [30, 45, 60, 90].includes(Number(config.timerSeconds))
    ? Number(config.timerSeconds)
    : 0;
  const timerEnabled = timerSeconds > 0;
  const timerSoundDefault = config.timerSound !== false;
  const keysHint = timerEnabled
    ? `${s.keysHint} &nbsp;·&nbsp; ${s.timerKeyHint}`
    : s.keysHint;

  // The warm quiz-card head row: number chip + category pill + progress.
  const cardHead = (
    num: number,
    total: number,
    categoryName: string,
    neutral: boolean
  ) => `
      <div class="card-head">
        <span class="card-chip${neutral ? ' neutral' : ''}">${String(num).padStart(2, '0')}</span>
        <span class="card-pill">${escapeHtml(categoryName)}</span>
        <span class="card-progress">${s.question} ${num} / ${total}</span>
      </div>`;

  // Title slide
  slides.push(buildSlide('title', `
    <div class="title-slide">
      <div class="title-icon">${roundelSvg(96)}</div>
      <h1>${escapeHtml(config.title)}</h1>
      ${config.date ? `<p class="date">${escapeHtml(config.date)}</p>` : ''}
      ${config.venue ? `<p class="venue">${escapeHtml(config.venue)}</p>` : ''}
      <p class="subtitle">${s.goodLuck}</p>
      <p class="keys-hint">${keysHint}</p>
    </div>
  `, 'glow'));

  const halfwayRound = Math.ceil(rounds.length / 2);
  const allAnswersAtEnd = getQuizMode(config.mode).answerPlacement === 'all_at_end';

  rounds.forEach((round, roundIndex) => {
    const roundNum = roundIndex + 1;
    const catClass = categoryClass(round.config.categorySlug);
    const qTotal = round.questions.length;

    // Round intro: full-art divider, category lockup low-left.
    slides.push(buildSlide('round-title', `
      <div class="round-title-slide">
        <div class="round-number">${s.round} ${roundNum}</div>
        <h2>${escapeHtml(round.config.categoryName)}</h2>
        <p class="round-info">${qTotal} ${s.questions}</p>
      </div>
    `, catClass));

    // Question slides — quiz-card on the night backdrop, art bleeding in from
    // the right. No answer here: answers come later as their own round.
    round.questions.forEach((q, qIndex) => {
      const isEstimation = q.question_type === 'estimation';
      const estimationBadge = isEstimation
        ? `<div class="estimation-badge">${s.estimationHint}</div>`
        : '';

      slides.push(buildSlide('question', `
        <div class="quiz-card">
          ${cardHead(qIndex + 1, qTotal, round.config.categoryName, false)}
          <h2 class="question-text">${escapeHtml(q.text_de)}</h2>
          ${estimationBadge}
        </div>
      `, catClass));

      // Answer slide (if showing after each round)
      if (!allAnswersAtEnd) {
        slides.push(buildSlide('answer', buildAnswerCard(q, qIndex + 1, qTotal, round.config.categoryName, s), catClass));
      }
    });

    // Halftime slide
    if (roundNum === halfwayRound && rounds.length > 2) {
      slides.push(buildSlide('halftime', `
        <div class="halftime-slide">
          <div class="section-kicker">${s.round} ${roundNum} / ${rounds.length}</div>
          <h2>${s.halftime}</h2>
          <p>${s.halftimeSub}</p>
        </div>
      `, 'glow'));
    }
  });

  // Answer section (if all at end)
  if (allAnswersAtEnd) {
    slides.push(buildSlide('section-title', `
      <div class="section-title-slide">
        <h2>${s.resolution}</h2>
        <p>${s.resolutionSub}</p>
      </div>
    `, 'glow'));

    rounds.forEach((round, roundIndex) => {
      const roundNum = roundIndex + 1;
      const catClass = categoryClass(round.config.categorySlug);
      const qTotal = round.questions.length;

      slides.push(buildSlide('round-title', `
        <div class="round-title-slide">
          <div class="round-number">${s.answersRound} ${roundNum}</div>
          <h2>${escapeHtml(round.config.categoryName)}</h2>
        </div>
      `, catClass));

      round.questions.forEach((q, qIndex) => {
        slides.push(buildSlide('answer', buildAnswerCard(q, qIndex + 1, qTotal, round.config.categoryName, s), catClass));
      });
    });
  }

  // Final slide
  slides.push(buildSlide('final', `
    <div class="final-slide">
      <div class="title-icon">${roundelSvg(72)}</div>
      <h2>${s.finalTitle}</h2>
      <p>${s.finalSub}</p>
      <p class="branding">${s.madeWith}</p>
    </div>
  `, 'glow'));

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
  background-color: var(--slide-bg);
}

.slide.active { display: flex; }

/* Warm amber glow for the "plain night" slides (title, halftime, final). */
.slide.glow {
  background-image: radial-gradient(70% 90% at 78% 6%, rgba(217, 110, 42, 0.26), transparent 58%);
}

/* Category background artwork (see src/lib/category-backgrounds.ts) */
${renderCategoryBackgroundCss()}

h1, h2 {
  font-family: var(--slide-font-display);
  font-weight: 800;
  letter-spacing: -0.02em;
}

/* ---------- The warm quiz-card (question & answer slides) ---------- */
.slide.question, .slide.answer {
  justify-content: flex-start;
  padding: 0 0 0 5.5vw;
}
.quiz-card {
  width: min(58vw, 860px);
  background: var(--card-bg);
  border-radius: 22px;
  padding: clamp(28px, 4vw, 56px) clamp(26px, 3.6vw, 52px);
  box-shadow: 0 22px 50px rgba(0, 0, 0, 0.45);
  transform: rotate(-1.1deg);
}
.card-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: clamp(20px, 3vw, 42px);
}
.card-chip {
  font-family: var(--slide-font-mono);
  font-weight: 600;
  font-size: clamp(1rem, 1.8vw, 1.5rem);
  color: #fff;
  background: var(--chip-bg);
  width: clamp(44px, 4.6vw, 64px);
  height: clamp(44px, 4.6vw, 64px);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 0 var(--chip-lip);
  flex: none;
}
.card-chip.neutral { background: var(--chip-neutral); box-shadow: none; }
.card-pill {
  font-family: var(--slide-font-mono);
  font-size: clamp(0.62rem, 0.95vw, 0.85rem);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--chip-lip);
  background: var(--pill-bg);
  padding: 8px 14px;
  border-radius: 999px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.card-progress {
  margin-left: auto;
  font-family: var(--slide-font-mono);
  font-size: clamp(0.6rem, 0.9vw, 0.8rem);
  color: var(--card-faint);
  white-space: nowrap;
}
.question-text {
  font-size: clamp(1.6rem, 3.2vw, 3.25rem);
  line-height: 1.12;
  color: var(--card-ink);
  text-wrap: balance;
}
.estimation-badge {
  margin-top: clamp(20px, 3vw, 40px);
  display: inline-block;
  background: var(--pill-bg);
  border-radius: 999px;
  padding: 10px 20px;
  font-family: var(--slide-font-mono);
  font-size: clamp(0.7rem, 1.1vw, 0.95rem);
  color: var(--chip-lip);
}

/* Answer reveal: same card, question echoed small, answer behind a green check. */
.answer-question {
  font-family: var(--slide-font-body);
  font-size: clamp(0.95rem, 1.6vw, 1.4rem);
  line-height: 1.35;
  color: var(--card-muted);
  margin-bottom: clamp(14px, 2vw, 26px);
}
.answer-kicker {
  font-family: var(--slide-font-mono);
  font-size: clamp(0.6rem, 0.95vw, 0.82rem);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--card-faint);
  margin-bottom: clamp(12px, 1.6vw, 22px);
}
.answer-row {
  display: flex;
  align-items: center;
  gap: clamp(12px, 1.4vw, 20px);
}
.answer-check {
  width: clamp(40px, 3.6vw, 56px);
  height: clamp(40px, 3.6vw, 56px);
  border-radius: 999px;
  background: var(--slide-correct);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
}
.answer-text {
  font-family: var(--slide-font-display);
  font-weight: 800;
  font-size: clamp(1.7rem, 3.2vw, 3.25rem);
  line-height: 1.05;
  letter-spacing: -0.03em;
  color: var(--chip-lip);
}
.fun-fact {
  margin-top: clamp(18px, 2.4vw, 32px);
  padding-top: clamp(14px, 1.8vw, 22px);
  border-top: 1px solid var(--card-border);
  font-size: clamp(0.85rem, 1.3vw, 1.15rem);
  color: var(--card-muted);
  line-height: 1.5;
}
.fun-fact .fun-fact-label {
  display: block;
  font-family: var(--slide-font-mono);
  font-size: clamp(0.58rem, 0.85vw, 0.75rem);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--chip-lip);
  margin-bottom: 6px;
}

/* ---------- Title slide ---------- */
.title-slide { text-align: center; max-width: 1000px; }
.title-slide .title-icon { margin-bottom: 34px; }
.title-slide h1 {
  font-size: clamp(3rem, 6.5vw, 5.5rem);
  color: var(--slide-text);
  margin-bottom: 26px;
  line-height: 1.02;
  letter-spacing: -0.03em;
}
.title-slide .date, .title-slide .venue {
  font-family: var(--slide-font-mono);
  font-size: clamp(1rem, 1.6vw, 1.4rem);
  color: var(--slide-muted);
  margin-bottom: 8px;
}
.title-slide .subtitle { margin-top: 22px; font-size: clamp(1.05rem, 1.7vw, 1.4rem); color: var(--slide-muted); }
.title-slide .keys-hint {
  margin-top: 54px;
  font-family: var(--slide-font-mono);
  font-size: 14px;
  color: var(--slide-faint);
}

/* ---------- Round intro: full-art divider, lockup low-left ---------- */
.slide.round-title { justify-content: flex-start; align-items: flex-end; padding: 6vh 6vw; }
.round-title-slide { text-align: left; max-width: 62vw; }
.round-title-slide .round-number {
  font-family: var(--slide-font-mono);
  font-size: clamp(0.85rem, 1.3vw, 1.2rem);
  color: var(--slide-accent-light);
  text-transform: uppercase;
  letter-spacing: 0.2em;
  margin-bottom: 16px;
}
.round-title-slide h2 {
  font-size: clamp(3rem, 6.5vw, 5.75rem);
  color: #fff;
  margin-bottom: 14px;
  line-height: 1.02;
  letter-spacing: -0.03em;
}
.round-title-slide .round-info {
  font-family: var(--slide-font-mono);
  font-size: clamp(0.9rem, 1.3vw, 1.2rem);
  color: var(--slide-muted);
}

/* ---------- Interlude slides (halftime, resolution, final) ---------- */
.halftime-slide, .section-title-slide, .final-slide { text-align: center; }
.section-kicker {
  font-family: var(--slide-font-mono);
  font-size: clamp(0.8rem, 1.2vw, 1.1rem);
  color: var(--slide-accent);
  text-transform: uppercase;
  letter-spacing: 0.2em;
  margin-bottom: 24px;
}
.halftime-slide h2, .section-title-slide h2, .final-slide h2 {
  font-size: clamp(3rem, 5.5vw, 4.75rem);
  color: var(--slide-text);
  margin-bottom: 18px;
  letter-spacing: -0.03em;
}
.halftime-slide p, .section-title-slide p, .final-slide p {
  font-size: clamp(1.2rem, 2vw, 1.75rem);
  color: var(--slide-muted);
}
.final-slide .title-icon { margin-bottom: 28px; }
.final-slide .branding {
  font-family: var(--slide-font-mono);
  font-size: 14px;
  color: var(--slide-faint);
  margin-top: 44px;
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

/* Question countdown timer (host-controlled; only on question slides) */
#qtimer {
  display: none;
  position: fixed;
  top: 28px;
  right: 30px;
  z-index: 100;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
#qtimer.visible { display: flex; }
#qtimer-time {
  font-family: var(--slide-font-mono);
  font-size: 72px;
  font-weight: 500;
  line-height: 1;
  color: var(--slide-accent);
  font-variant-numeric: tabular-nums;
  min-width: 2ch;
  text-align: center;
}
#qtimer.warning #qtimer-time { color: var(--slide-warning); }
#qtimer.done #qtimer-time {
  color: var(--slide-warning);
  animation: qtimer-flash 0.5s steps(1) 3;
}
@keyframes qtimer-flash { 50% { opacity: 0.2; } }
#qtimer-controls { display: flex; gap: 6px; }
#qtimer-controls button {
  font-family: var(--slide-font-mono);
  font-size: 14px;
  color: var(--slide-muted);
  background: rgba(22, 17, 13, 0.6);
  border: 1px solid var(--slide-panel-border);
  border-radius: 8px;
  padding: 6px 10px;
  cursor: pointer;
  line-height: 1;
  transition: color 0.15s ease, border-color 0.15s ease;
}
#qtimer-controls button svg { display: block; }
#qtimer-controls button:hover {
  color: var(--slide-accent);
  border-color: var(--slide-accent);
}
</style>
</head>
<body>

${slides.join('\n')}

<div id="progress"></div>
<div id="counter"></div>
${timerEnabled ? `<div id="qtimer">
  <div id="qtimer-time"></div>
  <div id="qtimer-controls">
    <button id="qtimer-toggle" type="button" aria-label="Start / Pause">▶</button>
    <button id="qtimer-add" type="button" aria-label="+15s">+15s</button>
    <button id="qtimer-reset" type="button" aria-label="Reset">↺</button>
    <button id="qtimer-mute" type="button" aria-label="Mute"></button>
  </div>
</div>` : ''}

<script>
(function() {
  const slides = document.querySelectorAll('.slide');
  const total = slides.length;
  let current = 0;

  // --- Countdown timer (config-injected; see presentation-builder.ts) ---
  const TIMER_ENABLED = ${timerEnabled};
  const TIMER_DURATION = ${timerSeconds};
  let soundEnabled = ${timerSoundDefault};

  // Inline speaker icons (no emoji, works offline).
  const ICON_SOUND_ON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>';
  const ICON_SOUND_OFF = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>';

  const qtimer = document.getElementById('qtimer');
  const qtimerTime = document.getElementById('qtimer-time');
  const qtimerToggle = document.getElementById('qtimer-toggle');
  const qtimerMute = document.getElementById('qtimer-mute');
  let remaining = TIMER_DURATION;
  let running = false;
  let tickInterval = null;
  let audioCtx = null;

  // Web Audio tones — generated in-page so the deck needs no audio files and
  // works fully offline. The context is created lazily on the first host
  // interaction to satisfy browser autoplay policies.
  function ensureAudio() {
    if (!audioCtx) {
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { audioCtx = null; }
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  }
  function tone(freq, durationMs, peak) {
    if (!soundEnabled || !audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(peak, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + durationMs / 1000 + 0.02);
    } catch (e) {}
  }
  function playTick() { tone(880, 110, 0.12); }
  function playEnd() { tone(523, 200, 0.2); setTimeout(function() { tone(392, 400, 0.2); }, 180); }

  function renderTimer() {
    if (!TIMER_ENABLED) return;
    qtimerTime.textContent = remaining;
    qtimer.classList.toggle('warning', remaining <= 5 && remaining > 0);
    qtimer.classList.toggle('done', remaining <= 0);
    qtimerToggle.textContent = running ? '⏸' : '▶';
  }
  function stopTick() {
    if (tickInterval) { clearInterval(tickInterval); tickInterval = null; }
    running = false;
  }
  function onTick() {
    remaining--;
    if (remaining > 0 && remaining <= 5) playTick();
    if (remaining <= 0) { remaining = 0; stopTick(); playEnd(); }
    renderTimer();
  }
  function startTimer() {
    if (!TIMER_ENABLED || running || remaining <= 0) return;
    ensureAudio();
    running = true;
    tickInterval = setInterval(onTick, 1000);
    renderTimer();
  }
  function toggleTimer() {
    if (!TIMER_ENABLED) return;
    ensureAudio();
    if (running) { stopTick(); renderTimer(); } else { startTimer(); }
  }
  function addTime() {
    if (!TIMER_ENABLED) return;
    ensureAudio();
    remaining += 15;
    renderTimer();
  }
  function resetTimer() {
    if (!TIMER_ENABLED) return;
    stopTick();
    remaining = TIMER_DURATION;
    renderTimer();
  }
  function toggleMute() {
    soundEnabled = !soundEnabled;
    if (soundEnabled) ensureAudio();
    qtimerMute.innerHTML = soundEnabled ? ICON_SOUND_ON : ICON_SOUND_OFF;
  }
  // The timer resets to the chosen duration (paused) each time a question
  // slide opens, and hides on every other slide type. It never auto-starts —
  // the host presses ▶ — and never advances slides.
  function updateTimerForSlide() {
    if (!TIMER_ENABLED) return;
    stopTick();
    if (slides[current].classList.contains('question')) {
      remaining = TIMER_DURATION;
      qtimer.classList.add('visible');
      renderTimer();
    } else {
      qtimer.classList.remove('visible', 'warning', 'done');
    }
  }

  function showSlide(index) {
    if (index < 0 || index >= total) return;
    slides[current].classList.remove('active');
    current = index;
    slides[current].classList.add('active');
    document.getElementById('progress').style.width = ((current + 1) / total * 100) + '%';
    document.getElementById('counter').textContent = (current + 1) + ' / ' + total;
    updateTimerForSlide();
  }

  if (TIMER_ENABLED) {
    qtimerToggle.addEventListener('click', toggleTimer);
    qtimerMute.addEventListener('click', toggleMute);
    document.getElementById('qtimer-add').addEventListener('click', addTime);
    document.getElementById('qtimer-reset').addEventListener('click', resetTimer);
    qtimerMute.innerHTML = soundEnabled ? ICON_SOUND_ON : ICON_SOUND_OFF;
  }

  showSlide(0);

  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); showSlide(current + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); showSlide(current - 1); }
    if (e.key === 't' || e.key === 'T') toggleTimer();
    if (e.key === 'f' || e.key === 'F') {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen();
      else document.exitFullscreen();
    }
  });

  // Clicks on the timer widget control the timer, not slide navigation.
  document.addEventListener('click', function(e) {
    if (e.target.closest('#qtimer')) return;
    if (e.clientX > window.innerWidth / 2) showSlide(current + 1);
    else showSlide(current - 1);
  });

  let touchStartX = null;
  document.addEventListener('touchstart', function(e) {
    if (e.target.closest('#qtimer')) { touchStartX = null; return; }
    touchStartX = e.touches[0].clientX;
  });
  document.addEventListener('touchend', function(e) {
    if (touchStartX === null) return;
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

  // Answer reveal card: same quiz-card, neutral chip, question echoed small,
  // localized kicker, answer in deep amber behind a muted-green check.
  function buildAnswerCard(
    q: { text_de: string; answer_de: string; fun_fact_de?: string | null },
    num: number,
    total: number,
    categoryName: string,
    strings: ReturnType<typeof getOutputStrings>
  ): string {
    return `
        <div class="quiz-card">
          ${cardHead(num, total, categoryName, true)}
          <p class="answer-question">${escapeHtml(q.text_de)}</p>
          <div class="answer-kicker">${strings.resolution}</div>
          <div class="answer-row">
            ${CHECK_SVG}
            <div class="answer-text">${escapeHtml(q.answer_de)}</div>
          </div>
          ${q.fun_fact_de ? `<div class="fun-fact"><span class="fun-fact-label">${strings.didYouKnow}</span> ${escapeHtml(q.fun_fact_de)}</div>` : ''}
        </div>`;
  }
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

// Emits the CSS rules per registered category artwork. Two treatments:
// - Round intros are full-art dividers: the image owns the slide, a bottom
//   vignette keeps the low-left category lockup legible.
// - Question/answer slides let the art bleed in from the right under a
//   left-heavy veil, keeping the card side deep and the subject visible
//   (the art's subject sits right-of-center by composition rule).
function renderCategoryBackgroundCss(): string {
  return Object.entries(CATEGORY_BACKGROUNDS)
    .filter((entry): entry is [string, string] => Boolean(entry[1]))
    .map(
      ([slug, path]) => `.slide.round-title.cat-${slug} {
  background-image: linear-gradient(180deg, rgba(22,17,13,0.12) 30%, rgba(22,17,13,0.82) 100%), url('${BASE_URL}${path}');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
.slide.question.cat-${slug}, .slide.answer.cat-${slug} {
  background-image: linear-gradient(90deg, rgba(22,17,13,0.92) 42%, rgba(22,17,13,0.38) 72%, rgba(22,17,13,0.08) 100%), url('${BASE_URL}${path}');
  background-size: cover;
  background-position: right center;
  background-repeat: no-repeat;
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
