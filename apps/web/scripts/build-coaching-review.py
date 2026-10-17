"""Build apps/web/src/lib/coaching-review-data.json from the synthetic coaching CSVs.

Usage: python3 apps/web/scripts/build-coaching-review.py <csv-dir>
The CSV directory may contain the files directly or in subfolders.
"""
import glob
import json
import os
import sys

import pandas as pd

SRC = sys.argv[1] if len(sys.argv) > 1 else "."
OUT = os.path.join(os.path.dirname(__file__), "..", "src", "lib", "coaching-review-data.json")


def load(name):
    paths = glob.glob(os.path.join(SRC, "**", f"{name}.csv"), recursive=True)
    if not paths:
        sys.exit(f"Missing {name}.csv under {SRC}")
    return pd.read_csv(paths[0], low_memory=False)


def r(x, n=3):
    return None if pd.isna(x) else round(float(x), n)


participants = load("synthetic_participants")
coaches = load("synthetic_coaches")
calls = load("synthetic_calls")
goals = load("synthetic_weekly_goals")
ratings = load("synthetic_supervisor_ratings")
lines = load("synthetic_call_transcripts")
texts = load("synthetic_text_messages")
annomi = load("coaching_sessions_annomi")

GOAL_SCORE = {"yes": 1, "partly": 0.5, "no": 0}
goals["score"] = goals.goal_met.map(GOAL_SCORE)
max_call = calls.groupby("participant_id").call_number.max()
total_calls = int(calls.call_number.max())
p = participants.set_index("participant_id")
p["completed"] = max_call.reindex(p.index).eq(total_calls)
p["goal_score"] = goals.groupby("participant_id").score.mean()
p["goal_yes"] = goals.assign(y=goals.goal_met.eq("yes")).groupby("participant_id").y.mean()
replies = texts[texts.sender == "participant"].groupby("participant_id").size()
p["replies"] = replies.reindex(p.index).fillna(0)

# Motivational-interviewing metrics from the labelled call subset.
lines = lines.merge(calls[["call_id", "coach_id", "participant_id", "language", "labelled", "date"]], on="call_id")
lab = lines[lines.labelled == "yes"]
moves = lab[lab.speaker == "coach"].groupby("coach_id").coach_move.value_counts().unstack(fill_value=0)
talk = lab[lab.speaker == "participant"].groupby("coach_id").participant_talk.value_counts(normalize=True).unstack(fill_value=0)
questions = moves["open question"] + moves["closed question"]
reflections = moves["complex reflection"] + moves["simple reflection"]
coded = moves.drop(columns=["other"]).sum(axis=1)

checklist = ["set_agenda", "checked_feelings", "reviewed_last_goal", "set_new_goal", "planned_for_barriers", "summarized", "set_next_contact"]
rt = ratings.merge(calls[["call_id", "coach_id"]], on="call_id")
for c in checklist:
    rt[c] = rt[c].eq("yes")
sup = rt.groupby("coach_id")[["empathy_1_to_5", "partnership_1_to_5", "overall_1_to_5"] + checklist].mean()

# AnnoMI benchmark (real expert-annotated MI sessions).
bench = {}
for quality, d in annomi.groupby("session_quality"):
    c = d[d.speaker == "counsellor"]
    q = c.question_type.notna().sum()
    rf = c.reflection_type.notna().sum()
    ct = d[d.speaker == "client"].client_talk.value_counts(normalize=True)
    bench[quality] = {
        "sessions": int(d.session_id.nunique()),
        "reflectionToQuestion": r(rf / q, 2),
        "openQuestionShare": r((c.question_type == "open").sum() / q, 2),
        "complexReflectionShare": r((c.reflection_type == "complex").sum() / rf, 2),
        "changeTalkShare": r(ct.get("change", 0), 2),
        "sustainTalkShare": r(ct.get("sustain", 0), 2),
    }


def tier(rq, overall, missed_share):
    if rq < 0.5 or overall < 2.5:
        return "Support suggested"
    if rq < 0.65 or overall < 3.1 or missed_share >= 0.4:
        return "Monitor"
    return "On track"


# Safety disclosures: every participant statement matching a risk pattern, labelled or not.
CATEGORIES = [
    ("Possible blood clot", r"swollen|hinchada"),
    ("Chest pain or tightness", r"chest|pecho"),
    ("Breathlessness", r"out of breath|falta el aire"),
    ("Fever during chemo", r"fever|fiebre"),
    ("Dehydration risk", r"diarrhea|diarrea|throwing up|vomit"),
    ("Fall or dizziness", r"dizzy|almost fell|mareé"),
    ("Low mood", r"point of any|para qué todo|sentido a nada"),
    ("Food insecurity", r"enough food|comida en la casa|out of food|no tenemos comida"),
]
RISK = "|".join(p for _, p in CATEGORIES)
ESCALATION = r"nurse|911|\bER\b|care team|social worker|enfermer|trabajador|emergencia|sala de emergencias|pantry|despensa|banco de comida|equipo médico"


def category(text):
    for name, pat in CATEGORIES:
        if pd.Series([text]).str.contains(pat, case=False).iloc[0]:
            return name
    return "Other"


handled = ratings[ratings.safety_issue_handled.notna()].groupby("call_id").safety_issue_handled.agg(lambda s: "yes" if (s == "yes").all() else "no")
queue = []
risk_lines = lines[(lines.speaker == "participant") & lines.text.str.contains(RISK, case=False, na=False)]
for i, row in risk_lines.iterrows():
    call = lines[lines.call_id == row.call_id]
    after = call[call.line_number > row.line_number]
    reply = after[after.speaker == "coach"].head(3)
    context = call[(call.line_number >= row.line_number - 2) & (call.line_number <= row.line_number + 4)]
    queue.append({
        "id": f"{row.call_id}-L{row.line_number}",
        "channel": "Call",
        "source": row.call_id,
        "participantId": row.participant_id,
        "coachId": row.coach_id,
        "date": row.date,
        "language": row.language,
        "category": category(row.text),
        "text": row.text,
        "coachReply": reply.text.iloc[0] if len(reply) else "",
        "escalated": bool(reply.text.str.contains(ESCALATION, case=False).any()),
        "labelled": row.needs_human == "yes",
        "supervisorHandled": handled.get(row.call_id),
        "context": [{"speaker": s, "text": t, "flag": bool(n == row.line_number)} for s, t, n in zip(context.speaker, context.text, context.line_number)],
    })
texts["sent"] = pd.to_datetime(texts.sent_at)
risk_texts = texts[(texts.sender == "participant") & texts.text.str.contains(RISK, case=False, na=False)]
for i, row in risk_texts.iterrows():
    thread = texts[texts.participant_id == row.participant_id]
    later = thread[(thread.sent > row.sent) & (thread.sent <= row.sent + pd.Timedelta(hours=72))]
    reply = later[later.sender == "coach"].head(1)
    context = pd.concat([thread[thread.sent < row.sent].tail(2), thread.loc[[i]], later.head(3)])
    queue.append({
        "id": row.message_id,
        "channel": "Text",
        "source": row.message_id,
        "participantId": row.participant_id,
        "coachId": row.coach_id,
        "date": row.sent_at[:10],
        "language": participants.set_index("participant_id").call_language.get(row.participant_id),
        "category": category(row.text),
        "text": row.text,
        "coachReply": reply.text.iloc[0] if len(reply) else "",
        "replyHours": r((reply.sent.iloc[0] - row.sent).total_seconds() / 3600, 1) if len(reply) else None,
        "escalated": bool(reply.text.str.contains(ESCALATION, case=False).any()),
        "labelled": row.needs_human == "yes",
        "supervisorHandled": None,
        "context": [{"speaker": s, "text": t, "flag": bool(m == row.message_id)} for s, t, m in zip(context.sender, context.text, context.message_id)],
    })
queue.sort(key=lambda q: (q["escalated"], not q["labelled"], q["date"]))

unescalated = pd.Series([q["coachId"] for q in queue if not q["escalated"]]).value_counts()
disclosures = pd.Series([q["coachId"] for q in queue]).value_counts()

coach_rows = []
for c in coaches.itertuples():
    mine = p[p.coach_id == c.coach_id]
    if c.coach_id not in moves.index:
        continue
    rq = reflections[c.coach_id] / questions[c.coach_id]
    overall = sup.overall_1_to_5.get(c.coach_id)
    coach_rows.append({
        "id": c.coach_id,
        "name": c.first_name,
        "role": c.role,
        "languages": c.languages,
        "yearsExperience": int(c.years_experience),
        "participants": int(len(mine)),
        "calls": int((calls.coach_id == c.coach_id).sum()),
        "avgCallMinutes": r(calls[calls.coach_id == c.coach_id].duration_min.mean(), 1),
        "reflectionToQuestion": r(rq, 2),
        "openQuestionShare": r(moves.loc[c.coach_id, "open question"] / questions[c.coach_id], 2),
        "complexReflectionShare": r(moves.loc[c.coach_id, "complex reflection"] / reflections[c.coach_id], 2),
        "persuadeConfrontShare": r((moves.loc[c.coach_id, "persuade"] + moves.loc[c.coach_id, "confront"]) / coded[c.coach_id], 3),
        "changeTalkShare": r(talk.loc[c.coach_id, "change"], 2),
        "sustainTalkShare": r(talk.loc[c.coach_id, "sustain"], 2),
        "supervisorEmpathy": r(sup.empathy_1_to_5.get(c.coach_id), 2),
        "supervisorPartnership": r(sup.partnership_1_to_5.get(c.coach_id), 2),
        "supervisorOverall": r(overall, 2),
        "plannedForBarriers": r(sup.planned_for_barriers.get(c.coach_id), 2),
        "summarized": r(sup.summarized.get(c.coach_id), 2),
        "completionRate": r(mine.completed.mean()),
        "goalScore": r(mine.goal_score.mean()),
        "safetyDisclosures": int(disclosures.get(c.coach_id, 0)),
        "safetyNotEscalated": int(unescalated.get(c.coach_id, 0)),
        "tier": tier(rq, overall, unescalated.get(c.coach_id, 0) / max(1, disclosures.get(c.coach_id, 0))),
    })
cdf = pd.DataFrame(coach_rows)


def group(col, frame=p):
    g = frame.groupby(col, observed=True).agg(n=("completed", "size"), completion=("completed", "mean"), goal=("goal_score", "mean"))
    return [{"group": str(k), "n": int(v.n), "completionRate": r(v.completion), "goalScore": r(v.goal)} for k, v in g.iterrows()]


p["ageBand"] = pd.cut(p.age, [0, 49, 59, 69, 120], labels=["Under 50", "50–59", "60–69", "70+"])
p["replyBand"] = pd.qcut(p.replies.rank(method="first"), 4, labels=["Lowest quarter", "Second quarter", "Third quarter", "Highest quarter"])
reply_bands = p.groupby("replyBand", observed=True).agg(n=("completed", "size"), replies=("replies", "mean"), completion=("completed", "mean"), goal=("goal_score", "mean"))

wide = ratings.pivot(index="call_id", columns="rater")
raters = sorted(ratings.rater.unique())
a, b = raters[0], raters[1]
scale_agreement = []
for c, label in [("empathy_1_to_5", "Empathy"), ("partnership_1_to_5", "Partnership"), ("overall_1_to_5", "Overall")]:
    x, y = wide[c][a], wide[c][b]
    scale_agreement.append({"item": label, "meanA": r(x.mean(), 2), "meanB": r(y.mean(), 2), "exact": r((x == y).mean(), 2), "withinOne": r(((x - y).abs() <= 1).mean(), 2)})
checklist_agreement = []
for c in checklist:
    x, y = wide[c][a], wide[c][b]
    po = (x == y).mean()
    pa, pb = (x == "yes").mean(), (y == "yes").mean()
    pe = pa * pb + (1 - pa) * (1 - pb)
    checklist_agreement.append({"item": c.replace("_", " "), "agreement": r(po, 2), "kappa": r((po - pe) / (1 - pe), 2)})

corr = cdf[["reflectionToQuestion", "supervisorOverall", "changeTalkShare", "avgCallMinutes", "goalScore", "completionRate"]].corr()

data = {
    "source": "Synthetic STARTS coaching program CSVs plus AnnoMI benchmark. Illustrative only; not real participants.",
    "overview": {
        "participants": int(len(p)),
        "coaches": int(len(coaches)),
        "activeCoaches": int(p.coach_id.nunique()),
        "calls": int(len(calls)),
        "labelledCalls": int((calls.labelled == "yes").sum()),
        "transcriptLines": int(len(lines)),
        "textMessages": int(len(texts)),
        "labelledTexts": int((texts.labelled == "yes").sum()),
        "supervisorRatedCalls": int(ratings.call_id.nunique()),
        "programWeeks": int(calls.program_week.max()),
        "callsPerParticipant": total_calls,
        "startDates": [participants.start_date.min(), participants.start_date.max()],
        "completionRate": r(p.completed.mean()),
        "goalScore": r(goals.score.mean()),
        "goalFullyMet": r(goals.goal_met.eq("yes").mean()),
        "spanishShare": r(participants.call_language.eq("Spanish").mean()),
        "languageMismatches": int(sum(row.call_language not in coaches.set_index("coach_id").languages[row.coach_id] for row in participants.itertuples())),
    },
    "correlations": {k: r(corr.loc[k, "goalScore"], 2) for k in ["reflectionToQuestion", "supervisorOverall", "changeTalkShare", "avgCallMinutes"]},
    "benchmark": bench,
    "coaches": coach_rows,
    "equity": {
        "Language": group("call_language"),
        "Race / ethnicity": group("race_ethnicity"),
        "Sex": group("sex"),
        "Age": group("ageBand"),
        "Cancer type": group("cancer_type"),
    },
    "engagement": [{"band": str(k), "n": int(v.n), "avgReplies": r(v.replies, 1), "completionRate": r(v.completion), "goalScore": r(v.goal)} for k, v in reply_bands.iterrows()],
    "goalTrend": [{"week": int(w), "fullyMet": r(g.goal_met.eq("yes").mean()), "partly": r(g.goal_met.eq("partly").mean()), "n": int(len(g))} for w, g in goals.groupby("week")],
    "topics": [{"topic": t.replace("_", " "), "goals": int(len(g)), "fullyMet": r(g.goal_met.eq("yes").mean())} for t, g in goals.groupby("topic")],
    "raters": {"names": [a, b], "scales": scale_agreement, "checklist": checklist_agreement},
    "safety": queue,
}
with open(OUT, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=1)
print(f"Wrote {os.path.relpath(OUT)}: {len(coach_rows)} coaches, {len(queue)} safety items, {sum(not q['escalated'] for q in queue)} not escalated")
