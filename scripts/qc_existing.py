#!/usr/bin/env python3
"""QC check and build final file for existing science-technology translations."""

import json
import os

BASE = os.path.join(os.path.dirname(__file__), "..", "data")
FILTERED = os.path.join(BASE, "opentriviaqa_filtered")
QC_DIR = os.path.join(BASE, "pipeline", "3-qc-checked")
FINAL_DIR = os.path.join(BASE, "pipeline", "4-final")

# QC results per batch: index -> {status, issue, ...}
# Only listing non-"ok" entries; everything else is "ok"
QC_RESULTS = {
    "batch1": {
        0: {
            "status": "wrong",
            "my_answer": "Afrika hat die Qattara-Depression, Antarktika hat Land unter dem Meeresspiegel unter dem Eis",
            "issue": "Die Antwort sagt Antarktika, aber der eigene Fun Fact widerspricht: 'Unter dem Eis verbirgt sich Land, das teilweise unter dem Meeresspiegel liegt'. Die Frage ist faktisch falsch.",
        },
    },
    "batch2": {
        # All ok
    },
    "batch3": {
        11: {
            "status": "wrong",
            "my_answer": "Die Vorsilbe 'octo' steckt nicht im Namen 'August', sondern in 'Oktober'. August war der sechste Monat (Sextilis), nicht der achte.",
            "issue": "Die Frage verwechselt August mit Oktober. 'Octo' steckt in Oktober, nicht in August. August hieß urspruenglich Sextilis (der sechste).",
        },
        33: {
            "status": "wrong",
            "my_answer": "Fangschreckenkrebse (Mantis Shrimp) mit 16 Farbrezeptoren",
            "issue": "Batch 5 enthaelt eine Frage, die besagt, Fangschreckenkrebse haetten 16 Farbrezeptor-Typen vs. 3 beim Menschen. Schmetterlinge haben ~15. Widerspruch innerhalb des Datensatzes.",
        },
        45: {
            "status": "broken",
            "my_answer": "Photorezeptoren (Staebchen und Zapfen)",
            "issue": "Tautologische Frage: fragt 'Welche Netzhautschicht' und antwortet mit 'Retina (Netzhaut)'. Die Netzhaut kann nicht eine Schicht der Netzhaut sein.",
        },
        46: {
            "status": "broken",
            "my_answer": "Gelb",
            "issue": "Grammatisch kaputt: 'Welche roten Mischfarben ergeben sich...' ist unsinnig. Die Antwort ist Gelb, nicht rot.",
        },
    },
    "batch4": {
        3: {
            "status": "ambiguous",
            "my_answer": "Quarks und Leptonen sind die kleinsten bekannten Teilchen",
            "issue": "'Grundteilchen' bedeutet im Deutschen 'Elementarteilchen' (Quarks, Leptonen). Die Antwort 'Atom' ist veraltet und der Fun Fact widerspricht der eigenen Antwort.",
        },
        15: {
            "status": "check",
            "my_answer": "Rockefeller gruendete Standard Oil",
            "issue": "'stiftete' ist das falsche Verb - er gruendete (founded), nicht stiftete (donated/endowed) das Unternehmen.",
            "fix_text_de": "Wer gr\u00fcndete 1863 das Unternehmen Standard Oil und wurde zum reichsten Amerikaner aller Zeiten?",
        },
        26: {
            "status": "ambiguous",
            "my_answer": "Auf dem Mars wurden moegliche Spuren gefunden, aber das ist wissenschaftlich umstritten",
            "issue": "Die Frage praestiert unbestaetigte/umstrittene Befunde als Tatsache. ALH84001-Strukturen sind NICHT als Mikrobenfossilien bestätigt.",
        },
        36: {
            "status": "broken",
            "my_answer": "Zeus",
            "issue": "Unverstaendlicher Fragetext: 'Welche griechischen Gluehwuermchen glaubten die alten Griechen' ist Kauderwelsch.",
            "fix_text_de": "Welchem griechischen Gott schrieben die alten Griechen die Blitze als Waffe zu?",
        },
        59: {
            "status": "broken",
            "my_answer": "Indonesien",
            "issue": "Tautologische Frage: 'Welches indonesische Land ist der weltgroesste Exporteur von Korallen?' - Die Antwort steckt schon in der Frage.",
            "fix_text_de": "Welches Land ist der weltgr\u00f6\u00dfte Exporteur von Korallen?",
        },
    },
    "batch5": {
        25: {
            "status": "check",
            "my_answer": "Polio",
            "issue": "'schlimmste Epidemie in der Geschichte des Landes bis dahin' ist uebertrieben - die Spanische Grippe 1918 war schlimmer. Sollte 'schlimmste Polio-Epidemie' heissen.",
            "fix_text_de": "Welche Seuche verursachte 1952 die schlimmste Polio-Epidemie in der Geschichte der USA?",
        },
        35: {
            "status": "ambiguous",
            "my_answer": "Venus (die Goettin)",
            "issue": "Zirkulaere Frage: 'Nach welcher Goettin ist Venus benannt?' - Die Antwort ist Venus selbst. Die gegebene Antwort umschreibt die Goettin, aber das ist keine gute Quizfrage.",
        },
        38: {
            "status": "broken",
            "my_answer": "Markusdom in Venedig",
            "issue": "Die Frage verraet die Antwort: 'Welche Markusbasilika...' → Markusdom. Keine echte Quizfrage.",
        },
        39: {
            "status": "broken",
            "my_answer": "Straussenei",
            "issue": "Unsinniger Fragetext: 'Welches ist das groesste Lebewesen mit der groessten einzelnen Zelle?' - Der Strauss ist nicht das groesste Lebewesen. Gemeint ist die groesste einzelne Zelle.",
        },
    },
    "batch6": {
        17: {
            "status": "wrong",
            "my_answer": "Aristarch von Samos",
            "issue": "Duplikat: Identische Frage wie Batch 5, Index 32 (Aristarch heliozentrisches Weltbild). Entfernen.",
        },
        24: {
            "status": "check",
            "my_answer": "Von arabisch al-kimiya, moeglicherweise von griechisch chemeia (Metallguss)",
            "issue": "'Die Kunst der Verwandlung' ist eher eine funktionale Beschreibung als eine woertliche Uebersetzung. Akzeptabel fuer ein Pub Quiz.",
        },
    },
    "batch7": {
        11: {
            "status": "wrong",
            "my_answer": "Unteilbar",
            "issue": "Duplikat: Sehr aehnlich wie Batch 4, Index 3 (Atom als kleinstes Grundteilchen). Entfernen.",
        },
        14: {
            "status": "broken",
            "my_answer": "Cassini-Huygens",
            "issue": "Die Frage verraet die Antwort: 'Welche Cassini-Sonde umkreiste Saturn...' → Cassini-Huygens. Keine echte Quizfrage.",
        },
    },
}

def load_batch(n):
    path = os.path.join(FILTERED, f"science-technology-batch{n}-de.json")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_qc(batch_name, questions, qc):
    """Save QC results for a batch."""
    results = []
    for i in range(len(questions)):
        if i in qc:
            entry = {"index": i, **qc[i]}
        else:
            entry = {"index": i, "status": "ok"}
        results.append(entry)
    path = os.path.join(QC_DIR, f"science-technology-{batch_name}-qc.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    return results


def build_final():
    """Build the final import-ready file."""
    all_questions = []
    stats = {"total": 0, "ok": 0, "fixed": 0, "removed": 0}

    for n in range(1, 8):
        batch_name = f"batch{n}"
        questions = load_batch(n)
        qc = QC_RESULTS.get(batch_name, {})

        # Save QC results
        save_qc(batch_name, questions, qc)

        for i, q in enumerate(questions):
            stats["total"] += 1
            qc_entry = qc.get(i, {"status": "ok"})
            status = qc_entry["status"]

            if status in ("wrong", "broken"):
                stats["removed"] += 1
                continue

            if status == "ambiguous":
                stats["removed"] += 1
                continue

            # Apply fixes for "check" status
            if status == "check":
                if "fix_text_de" in qc_entry:
                    q["text_de"] = qc_entry["fix_text_de"]
                    stats["fixed"] += 1
                elif "fix_answer_de" in qc_entry:
                    q["answer_de"] = qc_entry["fix_answer_de"]
                    stats["fixed"] += 1
                else:
                    stats["ok"] += 1
            else:
                stats["ok"] += 1

            # Build final schema
            final_q = {
                "text_de": q["text_de"],
                "text_de_open": q["text_de"],
                "answer_de": q["answer_de"],
                "wrong_answers_de": q.get("wrong_answers_de", []),
                "fun_fact_de": q["fun_fact_de"],
                "difficulty": q["difficulty"],
                "tags": q["tags"],
            }
            all_questions.append(final_q)

    # Deduplicate by answer_de
    seen_answers = {}
    deduped = []
    dupes_removed = 0
    for q in all_questions:
        key = q["answer_de"].lower().strip()
        if key in seen_answers:
            # Keep the one with more detail (longer question)
            existing = seen_answers[key]
            if len(q["text_de"]) > len(existing["text_de"]):
                deduped.remove(existing)
                deduped.append(q)
                seen_answers[key] = q
            dupes_removed += 1
        else:
            seen_answers[key] = q
            deduped.append(q)

    stats["removed"] += dupes_removed

    # Save final file
    path = os.path.join(FINAL_DIR, "wissenschaft.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(deduped, f, ensure_ascii=False, indent=2)

    print(f"Category: science-technology → wissenschaft")
    print(f"  Source files: 7 batches")
    print(f"  Total questions: {stats['total']}")
    print(f"  QC: {stats['ok']} ok, {stats['fixed']} fixed, {stats['removed']} removed")
    print(f"  Duplicates removed: {dupes_removed}")
    print(f"  Final: {len(deduped)} import-ready questions")

    return deduped


if __name__ == "__main__":
    build_final()
