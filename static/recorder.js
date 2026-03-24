alert("Recorder JS Loaded!"); // optional, you can remove later

let recorder;
let audioBlob;
let category = "";

// ====== Set category when a button is clicked ======
function setCategory(type) {
  category = type;
  document.getElementById("status").innerText =
    "Selected emotion: " + type.toUpperCase();
}

// ====== Get buttons and audio element ======
const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");
const audio = document.getElementById("audio");
const uploadBtn = document.getElementById("upload");

// ====== Start Recording ======
startBtn.onclick = async () => {
  if (!category) {
    alert("Please select an emotion first!");
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recorder = new MediaRecorder(stream);
    recorder.start();

    let chunks = [];
    recorder.ondataavailable = e => chunks.push(e.data);

    recorder.onstop = () => {
      audioBlob = new Blob(chunks, { type: "audio/wav" });
      audio.src = URL.createObjectURL(audioBlob);
    };

    startBtn.disabled = true;
    stopBtn.disabled = false;
    document.getElementById("status").innerText += " | Recording...";
  } catch (err) {
    alert("Error accessing microphone: " + err.message);
    console.error(err);
  }
};

// ====== Stop Recording ======
stopBtn.onclick = () => {
  if (recorder && recorder.state !== "inactive") {
    recorder.stop();
    startBtn.disabled = false;
    stopBtn.disabled = true;
    document.getElementById("status").innerText =
      "Selected emotion: " + category.toUpperCase() + " | Recording stopped";
  }
};

// ====== Upload Audio ======
uploadBtn.onclick = async () => {
  if (!audioBlob) {
    alert("Please record audio first!");
    return;
  }

  if (!category) {
    alert("Please select an emotion!");
    return;
  }

  const formData = new FormData();
  formData.append("audio", audioBlob);
  formData.append("category", category);

  try {
    const response = await fetch("/upload", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (data.error) {
      alert("Upload failed: " + data.error);
    } else {
      alert("Audio uploaded successfully!\nCloudinary URL:\n" + data.url);
      console.log("Cloudinary URL:", data.url);

      // Reset audio after upload
      audioBlob = null;
      audio.src = "";
      document.getElementById("status").innerText =
        "Selected emotion: " + category.toUpperCase();
    }
  } catch (err) {
    alert("Upload failed!");
    console.error(err);
  }
};
