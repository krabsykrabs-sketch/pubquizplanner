import { SOURCE_LOCALE, type Locale } from '@/config/locales';

// Localized strings for the generated files (HTML presentation, answer
// sheet PDF, quizmaster cheat sheet). Unknown locales fall back to German.
export interface OutputStrings {
  round: string;
  question: string;
  questions: string;
  goodLuck: string;
  keysHint: string;
  // Extra key hint appended to keysHint only when the countdown is enabled.
  timerKeyHint: string;
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
  // Estimation questions (Schätzfragen): full scoring hint + short line label.
  estimationHint: string;
  estimationLabel: string;
}

const STRINGS: Partial<Record<Locale, OutputStrings>> = {
  de: {
    round: 'Runde',
    question: 'Frage',
    questions: 'Fragen',
    goodLuck: 'Viel Spaß und gutes Gelingen!',
    keysHint:
      'Tasten: → / Leertaste weiter &nbsp;·&nbsp; ← zurück &nbsp;·&nbsp; F Vollbild',
    timerKeyHint: 'T Timer Start/Pause',
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
    estimationHint: 'Schätzfrage – die nächste Schätzung gewinnt',
    estimationLabel: 'Schätzfrage',
  },
  nl: {
    round: 'Ronde',
    question: 'Vraag',
    questions: 'vragen',
    goodLuck: 'Veel plezier en succes!',
    keysHint:
      'Toetsen: → / spatie verder &nbsp;·&nbsp; ← terug &nbsp;·&nbsp; F volledig scherm',
    timerKeyHint: 'T timer start/pauze',
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
    estimationHint: 'Schattingsvraag – de dichtste schatting wint',
    estimationLabel: 'Schattingsvraag',
  },
  pl: {
    round: 'Runda',
    question: 'Pytanie',
    questions: 'Pytań',
    goodLuck: 'Dobrej zabawy i powodzenia!',
    keysHint:
      'Klawisze: → / spacja dalej &nbsp;·&nbsp; ← wstecz &nbsp;·&nbsp; F pełny ekran',
    timerKeyHint: 'T start/pauza timera',
    halftime: 'Połowa za nami!',
    halftimeSub: 'Czas na coś do picia',
    resolution: 'Rozwiązanie',
    resolutionSub: 'Teraz zrobi się ciekawie!',
    answersRound: 'Odpowiedzi – runda',
    didYouKnow: 'Czy wiesz, że…?',
    finalTitle: 'To już wszystko!',
    finalSub: 'Oddajcie swoje karty odpowiedzi.',
    madeWith: 'Stworzone za pomocą pubquizplanner.com',
    teamName: 'Nazwa drużyny:',
    points: 'Punkty:',
    totalScore: 'Łączna liczba punktów:',
    cheatSheetSubtitle: 'Ściąga quizmastera',
    answer: 'Odpowiedź',
    funFact: 'Ciekawostka',
    page: 'Strona',
    estimationHint: 'Pytanie szacunkowe – wygrywa najbliższa odpowiedź',
    estimationLabel: 'Pytanie szacunkowe',
  },
  fr: {
    round: 'Manche',
    question: 'Question',
    questions: 'Questions',
    goodLuck: 'Amusez-vous bien et bonne chance !',
    keysHint:
      'Touches : → / espace suivant &nbsp;·&nbsp; ← retour &nbsp;·&nbsp; F plein écran',
    timerKeyHint: 'T démarrer/pause du minuteur',
    halftime: 'Mi-temps !',
    halftimeSub: "C'est l'heure d'un verre",
    resolution: 'Les réponses',
    resolutionSub: 'Ça devient sérieux !',
    answersRound: 'Réponses manche',
    didYouKnow: 'Le saviez-vous ?',
    finalTitle: "C'est fini !",
    finalSub: 'Rendez vos feuilles de réponses.',
    madeWith: 'Créé avec pubquizplanner.com',
    teamName: "Nom de l'équipe :",
    points: 'Points :',
    totalScore: 'Score total :',
    cheatSheetSubtitle: "Antisèche de l'animateur",
    answer: 'Réponse',
    funFact: 'Le saviez-vous',
    page: 'Page',
    estimationHint: "Question d'estimation – l'estimation la plus proche l'emporte",
    estimationLabel: "Question d'estimation",
  },
  es: {
    round: 'Ronda',
    question: 'Pregunta',
    questions: 'Preguntas',
    goodLuck: '¡Que os divirtáis y mucha suerte!',
    keysHint:
      'Teclas: → / espacio avanzar &nbsp;·&nbsp; ← atrás &nbsp;·&nbsp; F pantalla completa',
    timerKeyHint: 'T iniciar/pausar temporizador',
    halftime: '¡Descanso!',
    halftimeSub: 'Hora de una copa',
    resolution: 'Respuestas',
    resolutionSub: '¡Ahora viene lo bueno!',
    answersRound: 'Respuestas ronda',
    didYouKnow: '¿Lo sabías?',
    finalTitle: '¡Y esto es todo!',
    finalSub: 'Entregad vuestras hojas de respuestas.',
    madeWith: 'Creado con pubquizplanner.com',
    teamName: 'Nombre del equipo:',
    points: 'Puntos:',
    totalScore: 'Puntuación total:',
    cheatSheetSubtitle: 'Chuleta para el presentador',
    answer: 'Respuesta',
    funFact: 'Dato curioso',
    page: 'Página',
    estimationHint: 'Pregunta de estimación: gana la estimación más cercana',
    estimationLabel: 'Pregunta de estimación',
  },
  pt: {
    round: 'Ronda',
    question: 'Pergunta',
    questions: 'Perguntas',
    goodLuck: 'Divirtam-se e boa sorte!',
    keysHint:
      'Teclas: → / barra de espaço avançar &nbsp;·&nbsp; ← recuar &nbsp;·&nbsp; F ecrã inteiro',
    timerKeyHint: 'T iniciar/pausar temporizador',
    halftime: 'Intervalo!',
    halftimeSub: 'Hora de beber qualquer coisa',
    resolution: 'As respostas',
    resolutionSub: 'Agora fica interessante!',
    answersRound: 'Respostas ronda',
    didYouKnow: 'Sabias que?',
    finalTitle: 'Chegámos ao fim!',
    finalSub: 'Entreguem as vossas folhas de respostas.',
    madeWith: 'Criado com pubquizplanner.com',
    teamName: 'Nome da equipa:',
    points: 'Pontos:',
    totalScore: 'Pontuação total:',
    cheatSheetSubtitle: 'Cábula do apresentador',
    answer: 'Resposta',
    funFact: 'Curiosidade',
    page: 'Página',
    estimationHint: 'Pergunta de estimativa – ganha a estimativa mais próxima',
    estimationLabel: 'Pergunta de estimativa',
  },
  sv: {
    round: 'Runda',
    question: 'Fråga',
    questions: 'Frågor',
    goodLuck: 'Lycka till och ha så kul!',
    keysHint:
      'Tangenter: → / mellanslag nästa &nbsp;·&nbsp; ← tillbaka &nbsp;·&nbsp; F helskärm',
    timerKeyHint: 'T timer start/paus',
    halftime: 'Halvlek!',
    halftimeSub: 'Dags att hämta något att dricka',
    resolution: 'Facit',
    resolutionSub: 'Nu blir det spännande!',
    answersRound: 'Svar runda',
    didYouKnow: 'Visste du?',
    finalTitle: 'Det var allt!',
    finalSub: 'Lämna in era svarsblanketter.',
    madeWith: 'Skapat med pubquizplanner.com',
    teamName: 'Lagnamn:',
    points: 'Poäng:',
    totalScore: 'Totalpoäng:',
    cheatSheetSubtitle: 'Quizmasterns fusklapp',
    answer: 'Svar',
    funFact: 'Kul fakta',
    page: 'Sida',
    estimationHint: 'Gissningsfråga – närmaste gissning vinner',
    estimationLabel: 'Gissningsfråga',
  },
};

export function getOutputStrings(locale: string | undefined): OutputStrings {
  // SOURCE_LOCALE is always defined in STRINGS, so it is a guaranteed fallback.
  return STRINGS[locale as Locale] ?? STRINGS[SOURCE_LOCALE]!;
}
