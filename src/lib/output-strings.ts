import { SOURCE_LOCALE, type Locale } from '@/config/locales';

// Localized strings for the generated files (HTML presentation, answer
// sheet PDF, quizmaster cheat sheet). Unknown locales fall back to German.
export interface OutputStrings {
  round: string;
  question: string;
  questions: string;
  goodLuck: string;
  keysHint: string;
  halftime: string;
  halftimeSub: string;
  resolution: string;
  resolutionSub: string;
  answersRound: string;
  didYouKnow: string;
  finalTitle: string;
  finalSub: string;
  madeWith: string;
  teamName: string;
  points: string;
  totalScore: string;
  cheatSheetSubtitle: string;
  answer: string;
  funFact: string;
  page: string;
}

const STRINGS: Partial<Record<Locale, OutputStrings>> = {
  de: {
    round: 'Runde',
    question: 'Frage',
    questions: 'Fragen',
    goodLuck: 'Viel Spaß und gutes Gelingen!',
    keysHint:
      'Tasten: → / Leertaste weiter &nbsp;·&nbsp; ← zurück &nbsp;·&nbsp; T 30s-Timer &nbsp;·&nbsp; F Vollbild',
    halftime: 'Halbzeit!',
    halftimeSub: 'Zeit für ein Getränk',
    resolution: 'Auflösung',
    resolutionSub: "Jetzt wird's spannend!",
    answersRound: 'Antworten Runde',
    didYouKnow: 'Wusstest du?',
    finalTitle: "Das war's!",
    finalSub: 'Gebt eure Antwortbögen ab.',
    madeWith: 'Erstellt mit pubquizplanner.com',
    teamName: 'Teamname:',
    points: 'Punkte:',
    totalScore: 'Gesamtpunktzahl:',
    cheatSheetSubtitle: 'Quizmaster-Spickzettel',
    answer: 'Antwort',
    funFact: 'Fun Fact',
    page: 'Seite',
  },
  nl: {
    round: 'Ronde',
    question: 'Vraag',
    questions: 'vragen',
    goodLuck: 'Veel plezier en succes!',
    keysHint:
      'Toetsen: → / spatie verder &nbsp;·&nbsp; ← terug &nbsp;·&nbsp; T 30s-timer &nbsp;·&nbsp; F volledig scherm',
    halftime: 'Pauze!',
    halftimeSub: 'Tijd voor een drankje',
    resolution: 'De antwoorden',
    resolutionSub: 'Nu wordt het spannend!',
    answersRound: 'Antwoorden ronde',
    didYouKnow: 'Wist je dat?',
    finalTitle: 'Dat was het!',
    finalSub: 'Lever jullie antwoordformulieren in.',
    madeWith: 'Gemaakt met pubquizplanner.com',
    teamName: 'Teamnaam:',
    points: 'Punten:',
    totalScore: 'Totaalscore:',
    cheatSheetSubtitle: 'Quizmaster-spiekbriefje',
    answer: 'Antwoord',
    funFact: 'Fun fact',
    page: 'Pagina',
  },
};

export function getOutputStrings(locale: string | undefined): OutputStrings {
  // SOURCE_LOCALE is always defined in STRINGS, so it is a guaranteed fallback.
  return STRINGS[locale as Locale] ?? STRINGS[SOURCE_LOCALE]!;
}
