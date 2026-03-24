from flask import Flask, render_template, request, jsonify
import cloudinary
import cloudinary.uploader
from datetime import datetime
import os

app = Flask(__name__)

# ===================== CLOUDINARY CONFIG =====================
cloudinary.config(
    cloud_name="df4nrz3qo",
    api_key="198141117528798",
    api_secret="2OplNhrRyiyVjLS62b7D3Wni07s"
)

# ===================== AUDIO CATEGORIES =====================
CATEGORIES = ["angry", "disgust", "fear", "happy", "sad", "neutral", "surprise"]

# ===================== ROUTES =====================
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

        # ======= Generate filename =======
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{category}_help_{timestamp}"

        # ======= Upload directly to Cloudinary =======
        result = cloudinary.uploader.upload(
            audio,
            resource_type="video",                # needed for audio
            folder=f"assets/{category}",          # assets/category folder
            public_id=filename
        )

        return jsonify({
            "message": "Uploaded successfully",
            "url": result.get("secure_url")
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ===================== RUN APP =====================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
