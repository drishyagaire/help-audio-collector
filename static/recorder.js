let recorder;
let audioBlob;
let category = "";

function setCategory(type) {
  category = type;
  document.getElementById("status").innerText =
    "Selected category: " + type.toUpperCase();
}

const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");
const audio = document.getElementById("audio");
const uploadBtn = document.getElementById("upload");
const message = document.getElementById("message");

startBtn.onclick = async () => {
  if (!category) {
    message.innerText = "⚠ Please select Fearful or Normal first!";
    message.style.color = "red";
    return;
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  recorder = new MediaRecorder(stream);
  recorder.start();

  let chunks = [];
  recorder.ondataavailable = e => chunks.push(e.data);
  recorder.onstop = () => {
    audioBlob = new Blob(chunks, { type: "audio/wav" });
    audio.src = URL.createObjectURL(audioBlob);
  };

  message.innerText = "🎙 Recording... Speak now";
  message.style.color = "blue";

  startBtn.disabled = true;
  stopBtn.disabled = false;
};

stopBtn.onclick = () => {
  recorder.stop();
  startBtn.disabled = false;
  stopBtn.disabled = true;

  message.innerText = "🎧 Recording stopped. You can upload now.";
  message.style.color = "green";
};

uploadBtn.onclick = async () => {
  if (!audioBlob) {
    message.innerText = "⚠ Please record audio first!";
    message.style.color = "red";
    return;
  }

  const formData = new FormData();
  formData.append("audio", audioBlob);
  formData.append("category", category);

  message.innerText = "⏳ Uploading audio...";
  message.style.color = "blue";

  await fetch("/upload", {
    method: "POST",
    body: formData
  });

  message.innerText = "✅ Audio uploaded successfully! Thank you 🙏";
  message.style.color = "green";

  audioBlob = null;
};
