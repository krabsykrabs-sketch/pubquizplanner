# Question Authoring Guide

House style for writing new German pub quiz questions. Every question must
survive the review rubric (RUBRIC.md) — write to that bar from the start.

## The taste

- Fragen, die am Tisch für Diskussion sorgen — Teams grübeln gemeinsam und
  rufen am Ende "Ach, natürlich!" oder "Das hätte ich nie gedacht!"
- Die besten Fragen verbinden zwei unerwartete Bereiche oder enthalten den
  Lösungsweg versteckt in sich (herleitbar statt nur wissbar).
- Ein guter Fun Fact ist eine zweite Pointe, keine Wikipedia-Zusammenfassung.

## Die Richtung der Frage (Owner-Feedback, wichtig!)

**Die Pointe gehört in die ANTWORT, nicht in die Frage.** Wenn der spannende
Twist schon im Fragetext steht und nur noch ein Name abgefragt wird, ist die
Frage langweilig — Namen sind selten der Spaß.

- ❌ "Welcher Rennfahrer wurde 1970 als einziger posthum Formel-1-Weltmeister?"
  (Twist verschenkt, Name unwissbar)
- ✅ "Was ist das Besondere am Formel-1-Weltmeistertitel von 1970?"
  → "Er wurde posthum verliehen" (die Antwort IST die Überraschung)

Faustregel: Frag nach dem überraschenden WAS/WARUM/WIE, nicht nach dem WER —
außer der Name selbst ist die Pointe.

Außerdem abgelehnt wird der berühmte Kanon: Rätselbuch-Klassiker
(17 Schafe, Geburtstagsparadoxon, Äquator-Seil) und tausendmal gehörte
Anekdoten (Hand Gottes, Barfuß-Marathon, Mona-Lisa-Diebstahl als Namensfrage).
Frisches Material schlägt berühmtes Material.

## Hard rules

1. GENAU EINE richtige Antwort — keine Mehrdeutigkeit, keine "je nach
   Zählweise"-Fallen. Wenn zwei Antworten vertretbar sind: umformulieren
   oder streichen.
2. Antwort kurz (1–5 Wörter), sauber formatiert: Großschreibung, kein
   Schlusspunkt, keine Aufzählung, wo ein Wort erwartet wird.
3. Natürliches, vorlesbares Deutsch. Keine übersetzten Satzmuster.
4. Keine reinen Jahreszahl-Fragen (höchstens vereinzelt, und nur wenn die
   Zahl selbst die Pointe ist).
5. Nichts trivial Googlebares oder Schulbuch-Triviales ("Was ist ein
   Synonym?"), nichts Unherleitbares (reine Obskurität).
6. Kein US/UK-Insiderwissen (College Sports, Cricket-Regeln, US-TV-Institutionen).
   DACH-Bezug ist erwünscht: grob 30% der Fragen.
7. FAKTENTREUE: Nur Fragen aufnehmen, bei deren Antwort UND Fun Fact du dir
   vollständig sicher bist. Bei geringstem Zweifel: per Websuche verifizieren
   oder die Frage verwerfen. Lieber weniger, dafür wasserdicht.
8. Keine Dubletten — weder wörtlich noch dem Geist nach — zu den bestehenden
   Fragen der Kategorie (Liste wird beim Schreiben mitgeliefert).

## Output format

JSON array, one object per question:

```json
{
  "text_de": "…?",
  "answer_de": "…",
  "fun_fact_de": "…",
  "difficulty": 2,
  "tags": ["…", "…"]
}
```

difficulty: 1 = die meisten wissen es, 2 = Teams kriegen es mit Nachdenken
hin, 3 = trennt die Spreu vom Weizen. Mischung anstreben (ca. 25/50/25).
