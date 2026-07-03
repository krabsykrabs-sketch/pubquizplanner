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
