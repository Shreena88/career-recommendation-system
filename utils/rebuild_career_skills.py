"""
Rebuilds data/processed/career_skills.json from career_training.csv.

For each career in the training data, collects every unique skill
that appears in any row with that career label, then writes out
the mapping as JSON.

Run from the AI-Career-Recommendation directory:
    python utils/rebuild_career_skills.py
"""

import json
import os
import pandas as pd
from collections import defaultdict

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(BASE, "data", "processed", "career_training.csv")
OUT_PATH = os.path.join(BASE, "data", "processed", "career_skills.json")


def rebuild():
    df = pd.read_csv(CSV_PATH)
    print(f"Loaded {len(df)} rows, careers: {df['Recommended Career'].nunique()}")

    career_skills = defaultdict(set)
    for _, row in df.iterrows():
        career = row["Recommended Career"].strip()
        skills_raw = str(row["Skills"])
        skills = [s.strip() for s in skills_raw.split(";") if s.strip()]
        career_skills[career].update(skills)

    # Convert sets to sorted lists
    result = {career: sorted(skills) for career, skills in sorted(career_skills.items())}

    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print(f"Written {len(result)} careers to {OUT_PATH}")
    for career, skills in result.items():
        print(f"  {career}: {len(skills)} skills")


if __name__ == "__main__":
    rebuild()
