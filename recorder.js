alert("JS LOADED");

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

startBtn.onclick = async () => {
  if (!category) {
    alert("Please select Fearful or Normal first!");
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

  startBtn.disabled = true;
  stopBtn.disabled = false;
};

stopBtn.onclick = () => {
  recorder.stop();
  startBtn.disabled = false;
  stopBtn.disabled = true;
};

uploadBtn.onclick = async () => {
  if (!audioBlob) {
    alert("Please record audio first!");
    return;
  }

  const formData = new FormData();
  formData.append("audio", audioBlob);
  formData.append("category", category);

  await fetch("/upload", {
    method: "POST",
    body: formData
  });

  alert("Audio uploaded successfully!");
};
       
