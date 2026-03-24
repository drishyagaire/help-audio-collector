from flask import Flask, render_template, request, jsonify
import cloudinary
import cloudinary.uploader
import os
from datetime import datetime

app = Flask(__name__)

cloudinary.config(
    cloud_name=os.getenv("df4nrz3qo"),
    api_key=os.getenv("198141117528798"),
    api_secret=os.getenv("2OplNhrRyiyVjLS62b7D3Wni07s")
)

CATEGORIES = ["angry", "disgust", "fear", "happy", "sad", "neutral", "surprise"]

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/upload", methods=["POST"])
def upload():
    try:
        audio = request.files.get("audio")
        category = request.form.get("category")

        if not audio:
            return jsonify({"error": "No audio file"}), 400
        if not category:
            return jsonify({"error": "No category selected"}), 400
        if category not in CATEGORIES:
            return jsonify({"error": "Invalid category"}), 400

        filename = f"{category}_help_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

        result = cloudinary.uploader.upload(
            audio,
            resource_type="video",
            folder=f"help_dataset/{category}",
            public_id=filename
        )

        return jsonify({
            "message": "Uploaded successfully",
            "url": result.get("secure_url")
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
