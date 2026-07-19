#!/usr/bin/env python3
import json

# Read the processed questions file
with open('/home/jan/PubQuiz/pubquizplanner/processed_batch_12.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

# Take exactly 77 questions
questions_77 = questions[:77]

# Write to output file
with open('/home/jan/PubQuiz/pubquizplanner/final_77_questions.json', 'w', encoding='utf-8') as f:
    json.dump(questions_77, f, indent=2, ensure_ascii=False)

print(f"Extracted {len(questions_77)} questions from {len(questions)} total questions")
print("Output written to: final_77_questions.json")