import os
from datetime import datetime, timezone

from flask import Flask, jsonify, request
from flask_cors import CORS
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

from db import client, predictions

app = Flask(__name__)
CORS(app, origins=os.getenv("FRONTEND_ORIGIN", "http://localhost:5173").split(","))
analyzer = SentimentIntensityAnalyzer()
LABELS = ["positive", "neutral", "negative"]


def to_label(compound):
    if compound >= 0.05:
        return "positive"
    if compound <= -0.05:
        return "negative"
    return "neutral"


@app.get("/api/health")
def health():
    try:
        client.admin.command("ping")
        database = "connected"
    except Exception:
        database = "unreachable"
    return jsonify({"app": "JsentiAI", "status": "ok", "database": database})


@app.post("/api/sentiment")
def sentiment():
    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()
    if not text:
        return jsonify({"error": "text is required"}), 400
    if len(text) > 2000:
        return jsonify({"error": "text must be 2000 characters or fewer"}), 400

    scores = analyzer.polarity_scores(text)
    result = {
        "text": text,
        "label": to_label(scores["compound"]),
        "score": round(scores["compound"], 3),
        "breakdown": {k: scores[k] for k in ("pos", "neu", "neg")},
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    try:
        predictions.insert_one(dict(result))  # copy: insert_one adds _id
        result["saved"] = True
    except Exception:
        result["saved"] = False
    return jsonify(result)


@app.get("/api/predictions")
def list_predictions():
    limit = min(request.args.get("limit", 20, type=int), 100)
    items = predictions.find({}, {"_id": 0}).sort("created_at", -1).limit(limit)
    return jsonify(list(items))


@app.get("/api/stats")
def stats():
    grouped = predictions.aggregate([{"$group": {"_id": "$label", "n": {"$sum": 1}}}])
    counts = {g["_id"]: g["n"] for g in grouped}
    recent = predictions.find({}, {"_id": 0, "score": 1}).sort("created_at", -1).limit(10)
    return jsonify({
        "labels": LABELS,
        "counts": [counts.get(label, 0) for label in LABELS],
        "total": sum(counts.values()),
        "recent_scores": [r["score"] for r in reversed(list(recent))],
    })


@app.errorhandler(Exception)
def handle_error(e):
    code = getattr(e, "code", 500)
    message = getattr(e, "name", "Server error") if code != 500 else "Server error"
    return jsonify({"error": message}), code


if __name__ == "__main__":
    app.run(debug=True, port=5000)
