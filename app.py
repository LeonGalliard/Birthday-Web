from flask import Flask, render_template, jsonify, send_from_directory
import json
import os

app = Flask(__name__)

# ─── Konfigurasi ─────────────────────────────────────────────────────────────
CONFIG = {
    "recipient_name": "Nisa",
    "sender_name": "Seseorang yang peduli",
    "birthday_date": "9 Juni",
}

# ─── Routes ──────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return render_template("index.html", config=CONFIG)


@app.route("/api/config")
def get_config():
    return jsonify(CONFIG)


@app.route("/api/letter")
def get_letter():
    letter_path = os.path.join(app.root_path, "data", "letter.json")
    with open(letter_path, "r", encoding="utf-8") as f:
        return jsonify(json.load(f))


@app.route("/api/timeline")
def get_timeline():
    timeline_path = os.path.join(app.root_path, "data", "timeline.json")
    with open(timeline_path, "r", encoding="utf-8") as f:
        return jsonify(json.load(f))


@app.route("/api/photos")
def get_photos():
    photos_path = os.path.join(app.root_path, "data", "photos.json")
    with open(photos_path, "r", encoding="utf-8") as f:
        return jsonify(json.load(f))


if __name__ == "__main__":
    app.run(debug=True, port=5000)
