import type { Locale } from '@/config/locales';

// SEO intro paragraphs for the category pages, per locale. Optional per locale:
// a locale (or a single category) without an entry falls back to the templated
// fragen.categoryFallbackIntro message.
export const CATEGORY_INTROS: Partial<Record<Locale, Record<string, string>>> = {
  de: {
    wissenschaft:
      'Von Physik über Biologie bis Chemie — diese Wissenschafts-Quizfragen bringen garantiert Diskussionen an den Kneipentisch. Perfekt für jedes Pub Quiz, bei dem auch die Nerds im Team glänzen dürfen.',
    geschichte:
      'Antike, Mittelalter oder Zeitgeschichte — mit diesen Geschichte-Quizfragen wird dein Kneipenquiz zum historischen Abenteuer. Überraschende Fakten inklusive.',
    geographie:
      'Hauptstädte, Flüsse, Berge und Kurioses aus aller Welt — diese Geographie-Quizfragen sind ideal für dein nächstes Pub Quiz. Von leicht bis knifflig ist alles dabei.',
    literatur:
      'Klassiker, Bestseller und literarische Kuriositäten — diese Literatur-Quizfragen testen das Wissen der Bücherwürmer in deinem Kneipenquiz.',
    allgemeinwissen:
      'Die Königsdisziplin im Pub Quiz: Allgemeinwissen-Fragen quer durch alle Themen. Von leicht bis schwer — hier kann jedes Team punkten.',
    'film-tv':
      'Blockbuster, Serien-Hits und Filmklassiker — diese Film & TV Quizfragen sind ein Muss für jeden Kneipenquiz-Abend. Popcorn nicht vergessen!',
    musik:
      'Von Klassik über Rock bis Pop — diese Musik-Quizfragen bringen Stimmung in jedes Pub Quiz. Teste, wer in deiner Runde den besten Musikgeschmack hat.',
    sport:
      'Fußball, Olympia und Rekorde — diese Sport-Quizfragen sorgen für Wettkampfstimmung beim Kneipenquiz. Für Fans und Gelegenheitszuschauer gleichermaßen.',
    'essen-trinken':
      'Kulinarische Kuriositäten und Genusswissen — diese Essen & Trinken Quizfragen würzen dein Pub Quiz mit überraschenden Fakten.',
    'kunst-kultur':
      'Gemälde, Architektur und kulturelle Meilensteine — diese Kunst & Kultur Quizfragen bereichern jedes Kneipenquiz mit einer Prise Hochkultur.',
    technik:
      'Erfindungen, Gadgets und digitale Meilensteine — diese Technik-Quizfragen sind perfekt für das nächste Pub Quiz mit Tech-Begeisterten.',
    popkultur:
      'Memes, Trends und Pop-Phänomene — diese Popkultur-Quizfragen bringen Zeitgeist in dein Kneipenquiz.',
    sprache:
      'Etymologie, Redewendungen und sprachliche Kuriositäten — diese Sprach-Quizfragen fordern die Wortakrobaten in deinem Pub Quiz heraus.',
    'logik-mathe':
      'Zahlen, Rätsel und logisches Denken — diese Logik & Mathe Quizfragen sind die ultimative Herausforderung für jedes Kneipenquiz.',
  },
  fr: {
    wissenschaft:
      "De la physique à la chimie en passant par la biologie — ces questions de quiz sur les sciences font toujours débattre autour de la table. Parfaites pour toute soirée quiz où les esprits curieux de l'équipe peuvent enfin briller.",
    geschichte:
      "Antiquité, Moyen Âge ou histoire contemporaine — avec ces questions de quiz sur l'histoire, ta soirée quiz vire à l'aventure historique. Faits surprenants garantis.",
    geographie:
      'Capitales, fleuves, montagnes et curiosités du monde entier — ces questions de quiz sur la géographie sont idéales pour ta prochaine soirée quiz. Du plus facile au plus retors, il y en a pour tous.',
    literatur:
      'Classiques, best-sellers et curiosités littéraires — ces questions de quiz sur la littérature mettent à l\'épreuve les rats de bibliothèque de ta soirée quiz.',
    allgemeinwissen:
      'La discipline reine de la soirée quiz : des questions de culture générale qui balaient tous les sujets. Du plus simple au plus corsé — ici, chaque équipe peut marquer.',
    'film-tv':
      "Blockbusters, séries cultes et grands classiques du cinéma — ces questions de quiz sur le cinéma et la télé sont incontournables pour toute soirée quiz. N'oublie pas le pop-corn !",
    musik:
      'Du classique au pop en passant par le rock — ces questions de quiz sur la musique donnent le ton à n\'importe quelle soirée quiz. Vois qui a les meilleures oreilles de la bande.',
    sport:
      'Football, Jeux olympiques et records — ces questions de quiz sur le sport font monter l\'esprit de compétition à la soirée quiz. Pour les mordus comme pour les spectateurs du dimanche.',
    'essen-trinken':
      'Curiosités culinaires et savoir gourmand — ces questions de quiz sur la cuisine et les boissons relèvent ta soirée quiz de faits inattendus.',
    'kunst-kultur':
      "Tableaux, architecture et grands jalons culturels — ces questions de quiz sur l'art et la culture apportent une touche de raffinement à toute soirée quiz.",
    technik:
      'Inventions, gadgets et grandes étapes du numérique — ces questions de quiz sur la technologie sont parfaites pour la prochaine soirée quiz entre passionnés de tech.',
    popkultur:
      "Mèmes, tendances et phénomènes pop — ces questions de quiz sur la pop culture insufflent l'air du temps dans ta soirée quiz.",
    sprache:
      'Étymologie, expressions et curiosités de la langue — ces questions de quiz sur les mots mettent au défi les as du langage de ta soirée quiz.',
    'logik-mathe':
      'Chiffres, énigmes et raisonnement logique — ces questions de quiz sur la logique et les maths sont le défi ultime de toute soirée quiz.',
  },
  es: {
    wissenschaft:
      'De la física a la biología pasando por la química: estas preguntas de ciencia dan para debate en la mesa del bar. Perfectas para cualquier quiz de bar en el que también los más frikis del equipo puedan lucirse.',
    geschichte:
      'Antigüedad, Edad Media o historia reciente: con estas preguntas de historia, tu quiz de bar se convierte en una aventura por el pasado. Con datos que sorprenden.',
    geographie:
      'Capitales, ríos, montañas y curiosidades de todo el mundo: estas preguntas de geografía son ideales para tu próximo quiz de bar. De lo fácil a lo complicado, aquí hay de todo.',
    literatur:
      'Clásicos, superventas y curiosidades literarias: estas preguntas de literatura ponen a prueba a los ratones de biblioteca de tu quiz de bar.',
    allgemeinwissen:
      'La disciplina reina del quiz de bar: preguntas de cultura general que cruzan todos los temas. De lo fácil a lo difícil, aquí puede puntuar cualquier equipo.',
    'film-tv':
      'Taquillazos, series de éxito y clásicos del cine: estas preguntas de cine y TV son imprescindibles en cualquier noche de quiz de bar. ¡No olvides las palomitas!',
    musik:
      'Del clásico al rock y al pop: estas preguntas de música animan cualquier quiz de bar. Comprueba quién tiene el mejor gusto musical de la mesa.',
    sport:
      'Fútbol, Juegos Olímpicos y récords: estas preguntas de deportes traen espíritu competitivo al quiz de bar. Para forofos y espectadores ocasionales por igual.',
    'essen-trinken':
      'Curiosidades culinarias y saber gastronómico: estas preguntas de comida y bebida le dan sabor a tu quiz de bar con datos que sorprenden.',
    'kunst-kultur':
      'Cuadros, arquitectura e hitos culturales: estas preguntas de arte y cultura enriquecen cualquier quiz de bar con una pizca de alta cultura.',
    technik:
      'Inventos, gadgets e hitos digitales: estas preguntas de tecnología son perfectas para el próximo quiz de bar con entusiastas de la técnica.',
    popkultur:
      'Memes, tendencias y fenómenos pop: estas preguntas de cultura pop traen el espíritu del momento a tu quiz de bar.',
    sprache:
      'Etimología, refranes y curiosidades del idioma: estas preguntas de lengua desafían a los malabaristas de las palabras de tu quiz de bar.',
    'logik-mathe':
      'Números, acertijos y pensamiento lógico: estas preguntas de lógica y matemáticas son el reto definitivo para cualquier quiz de bar.',
  },
  pt: {
    wissenschaft:
      'Da física à biologia e à química — estas perguntas de quiz de ciência garantem discussão à mesa do bar. Perfeitas para qualquer quiz de bar em que os cromos da equipa também podem brilhar.',
    geschichte:
      'Antiguidade, Idade Média ou história recente — com estas perguntas de quiz de história a tua noite de quiz de bar torna-se uma aventura histórica. Com factos surpreendentes à mistura.',
    geographie:
      'Capitais, rios, montanhas e curiosidades de todo o mundo — estas perguntas de quiz de geografia são ideais para o teu próximo quiz de bar. Do fácil ao complicado, há de tudo.',
    literatur:
      'Clássicos, best-sellers e curiosidades literárias — estas perguntas de quiz de literatura põem à prova o saber dos ratos de biblioteca no teu quiz de bar.',
    allgemeinwissen:
      'A disciplina rainha do quiz de bar: perguntas de cultura geral por todos os temas. Do fácil ao difícil — aqui qualquer equipa pode pontuar.',
    'film-tv':
      'Êxitos de bilheteira, séries de sucesso e clássicos do cinema — estas perguntas de quiz de cinema e TV são obrigatórias em qualquer noite de quiz de bar. Não te esqueças das pipocas!',
    musik:
      'Do clássico ao rock e ao pop — estas perguntas de quiz de música animam qualquer quiz de bar. Testa quem no teu grupo tem o melhor gosto musical.',
    sport:
      'Futebol, Jogos Olímpicos e recordes — estas perguntas de quiz de desporto trazem espírito de competição à noite de quiz de bar. Para adeptos e espectadores ocasionais por igual.',
    'essen-trinken':
      'Curiosidades culinárias e saber gastronómico — estas perguntas de quiz de comida e bebida temperam o teu quiz de bar com factos surpreendentes.',
    'kunst-kultur':
      'Pinturas, arquitetura e marcos culturais — estas perguntas de quiz de arte e cultura enriquecem qualquer quiz de bar com uma pitada de alta cultura.',
    technik:
      'Invenções, gadgets e marcos digitais — estas perguntas de quiz de tecnologia são perfeitas para o próximo quiz de bar com entusiastas da tecnologia.',
    popkultur:
      'Memes, tendências e fenómenos pop — estas perguntas de quiz de cultura pop trazem o espírito do momento ao teu quiz de bar.',
    sprache:
      'Etimologia, expressões e curiosidades linguísticas — estas perguntas de quiz de língua desafiam os acrobatas das palavras no teu quiz de bar.',
    'logik-mathe':
      'Números, enigmas e raciocínio lógico — estas perguntas de quiz de lógica e matemática são o desafio supremo para qualquer quiz de bar.',
  },
  nl: {
    wissenschaft:
      'Van natuurkunde via biologie tot scheikunde — deze wetenschapsquizvragen zorgen gegarandeerd voor discussie aan de cafétafel. Perfect voor elke pubquiz waarin ook de nerds in het team mogen schitteren.',
    geschichte:
      'Oudheid, middeleeuwen of recente geschiedenis — met deze geschiedenisquizvragen wordt je pubquiz een historisch avontuur. Verrassende feiten inbegrepen.',
    geographie:
      'Hoofdsteden, rivieren, bergen en curiosa uit de hele wereld — deze geografiequizvragen zijn ideaal voor je volgende pubquiz. Van makkelijk tot pittig, alles zit erbij.',
    literatur:
      'Klassiekers, bestsellers en literaire curiositeiten — deze literatuurquizvragen testen de kennis van de boekenwurmen in je pubquiz.',
    allgemeinwissen:
      'De koningsdiscipline van de pubquiz: vragen algemene kennis over alle onderwerpen heen. Van makkelijk tot moeilijk — hier kan elk team scoren.',
    'film-tv':
      'Blockbusters, serie-hits en filmklassiekers — deze film & tv-quizvragen zijn een must voor elke pubquizavond. Popcorn niet vergeten!',
    musik:
      'Van klassiek via rock tot pop — deze muziekquizvragen brengen sfeer in elke pubquiz. Test wie in jouw gezelschap de beste muzieksmaak heeft.',
    sport:
      'Voetbal, de Olympische Spelen en records — deze sportquizvragen zorgen voor wedstrijdspanning tijdens de pubquiz. Voor fans en gelegenheidskijkers.',
    'essen-trinken':
      'Culinaire curiosa en kennis over lekker eten — deze eten & drinken-quizvragen kruiden je pubquiz met verrassende feiten.',
    'kunst-kultur':
      'Schilderijen, architectuur en culturele mijlpalen — deze kunst & cultuur-quizvragen verrijken elke pubquiz met een vleugje hoge cultuur.',
    technik:
      'Uitvindingen, gadgets en digitale mijlpalen — deze techniekquizvragen zijn perfect voor de volgende pubquiz met techliefhebbers.',
    popkultur:
      'Memes, trends en popfenomenen — deze popcultuurquizvragen brengen tijdgeest in je pubquiz.',
    sprache:
      'Etymologie, uitdrukkingen en taalkundige curiositeiten — deze taalquizvragen dagen de woordkunstenaars in je pubquiz uit.',
    'logik-mathe':
      'Getallen, raadsels en logisch denken — deze logica & wiskunde-quizvragen zijn de ultieme uitdaging voor elke pubquiz.',
  },
};

export function getCategoryIntro(locale: string, slug: string): string | null {
  return CATEGORY_INTROS[locale as Locale]?.[slug] ?? null;
}
