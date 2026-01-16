from flask import Flask, render_template, request
import os
from datetime import datetime

app = Flask(__name__)

BASE_DIR = "dataset"
FEARFUL_DIR = os.path.join(BASE_DIR, "fearful")
NORMAL_DIR = os.path.join(BASE_DIR, "normal")

os.makedirs(FEARFUL_DIR, exist_ok=True)
os.makedirs(NORMAL_DIR, exist_ok=True)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/upload", methods=["POST"])
def upload():
    audio = request.files["audio"]
    category = request.form["category"]

    folder = FEARFUL_DIR if category == "fearful" else NORMAL_DIR
    filename = f"help_{datetime.now().strftime('%Y%m%d_%H%M%S')}.wav"

    audio.save(os.path.join(folder, filename))
    return "Saved"

if __name__ == "__main__":
    app.run(debug=True)
