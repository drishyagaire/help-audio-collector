from flask import Flask, render_template, request, jsonify
import cloudinary
import cloudinary.uploader
import os
from datetime import datetime

app = Flask(__name__)

# ✅ Cloudinary config (use Render environment variables)
cloudinary.config(
    cloud_name=os.getenv("CLOUD_NAME"),
    api_key=os.getenv("API_KEY"),
    api_secret=os.getenv("API_SECRET")
)

# ✅ 7 emotion categories
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

        # ✅ Upload to Cloudinary
        result = cloudinary.uploader.upload(
            audio,
            resource_type="video",  # IMPORTANT for audio
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
    app.run()
