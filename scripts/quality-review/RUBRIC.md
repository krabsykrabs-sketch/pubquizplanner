# Question Quality Review — Rubric

Judge whether each question is a GOOD German pub quiz question. Taste and
quality only. Verdict per question: **KEEP** or **FLAG**.

## This is NOT

- **NOT fact-checking.** Assume every answer is factually correct. Never flag
  because you doubt the fact.
- **NOT translation review.** The German is the final text; only flag language
  when the phrasing itself is awkward or unnatural.

## FLAG when (use exactly these reason codes)

| code | meaning |
|------|---------|
| `trivial` | Boring, no challenge or interest ("Welche Farbe hat Gras?") |
| `ambiguous` | Unclear what's being asked, or multiple defensibly correct answers |
| `awkward_german` | Stilted, translated-sounding, or unnatural German phrasing |
| `missing_context` | Only made sense as multiple choice, or references options/context that isn't there |
| `answer_mismatch` | Answer doesn't actually answer the question, or is oddly formatted (full sentence where a word is expected, leftover artifacts, trailing junk) |
| `too_obscure` | Not "hard in a fun way" — just unknowable; no path to the answer for a German pub audience |
| `cultural_mismatch` | Assumes US/UK-specific knowledge a German pub audience wouldn't have (US sports trivia, UK TV panel shows, US school curriculum facts) |
| `duplicate_spirit` | Same knowledge as a far more common/classic quiz question, adds nothing |
| `miscategorized` | Clearly belongs in a different category (e.g. a literature question filed under science) |

## Do NOT flag

- **Genuinely hard questions.** Hard ≠ bad; a good quiz needs difficulty-3 questions.
- **Questions without a fun fact.** That's fine.
- **Niche-but-fair questions** — a reasonable team can reason its way to the answer or feel rewarded hearing it.
- International (non-German) topics per se — only flag culture when the framing
  presumes insider knowledge of another country's everyday culture.

Calibration: most questions are good. Expect a minority flag rate. When torn,
KEEP — flag only when you'd genuinely cut or fix the question as a quizmaster.

## Per flag, produce

- `reason`: one of the codes above (pick the dominant problem)
- `note`: ONE line, German or English, saying what's wrong
- `action`: `reword` | `recategorize` | `delete`
- `fix` (optional): if the fix is obvious, a one-line suggestion (e.g. the
  reworded question, the right category, or the cleaned-up answer)

## Output format (strict)

Write a JSON file:

```json
{
  "category": "<slug>",
  "reviewed": <count of questions you judged>,
  "flagged": [
    {
      "id": 123,
      "text_de": "...",
      "answer_de": "...",
      "reason": "cultural_mismatch",
      "note": "Setzt Detailwissen über US-College-Football voraus",
      "action": "delete"
    }
  ]
}
```

Questions you KEEP do not appear in the output — only count them in `reviewed`.
