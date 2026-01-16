from flask import Flask, render_template, request
import cloudinary
import cloudinary.uploader
from datetime import datetime

app = Flask(__name__)

# 🔐 Cloudinary config
cloudinary.config(
    cloud_name="df4nrz3qo",
    api_key="198141117528798",
    api_secret="2OplNhrRyiyVjLS62b7D3Wni07s"
)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/upload", methods=["POST"])
def upload_audio():
    audio = request.files["audio"]
    category = request.form["category"]

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
    filename = f"{category}_{timestamp}"

    cloudinary.uploader.upload(
        audio,
        resource_type="video",   # audio is treated as media
        folder=f"help_dataset/{category}",
        public_id=filename
    )

    return "Uploaded successfully"
