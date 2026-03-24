from flask import Flask, render_template, request, jsonify
import cloudinary
import cloudinary.uploader
import os
from datetime import datetime

app = Flask(__name__)

# ======= CLOUDINARY CONFIG =======
cloudinary.config(
    cloud_name="df4nrz3qo",       # Replace with your Cloudinary cloud name
    api_key="198141117528798",    # Replace with your Cloudinary API key
    api_secret="2OplNhrRyiyVjLS62b7D3Wni07s"  # Replace with your Cloudinary API secret
)

# ======= AUDIO CATEGORIES =======
CATEGORIES = ["angry", "disgust", "fear", "happy", "sad", "neutral", "surprise"]

# ======= ROUTES =======
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

        # ======= GENERATE FILENAME =======
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{category}_help_{timestamp}"
        file_ext = os.path.splitext(audio.filename)[1] or ".wav"

        # ======= SAVE LOCALLY =======
        local_folder = os.path.join("assets", category)
        os.makedirs(local_folder, exist_ok=True)
        local_path = os.path.join(local_folder, filename + file_ext)
        audio.save(local_path)

        # ======= UPLOAD TO CLOUDINARY =======
        result = cloudinary.uploader.upload(
            local_path,  # Use the local saved file
            resource_type="video",
            folder=f"help_dataset/{category}",
            public_id=filename
        )

        return jsonify({
            "message": "Uploaded successfully",
            "local_path": local_path,
            "url": result.get("secure_url")
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ======= RUN APP =======
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)

