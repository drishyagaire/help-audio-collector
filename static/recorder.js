let recorder;
let audioBlob;
let category = "";
let count = { fearful: 0, normal: 0 };
const minCount = 10;

function setCategory(type) {
  category = type;
  document.getElementById("status").innerText =
    "Selected category: " + type.toUpperCase() + 
    ` (Recorded ${count[type]} times so far)`;
  document.getElementById("message").innerText = "";
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

    message.innerText = "🎙 Recording... Speak now";
    message.style.color = "blue";

    startBtn.disabled = true;
    stopBtn.disabled = false;
  } catch (err) {
    message.innerText =
      "⚠ Microphone access failed. Please check browser permissions!";
    message.style.color = "red";
    console.error(err);
  }
};

stopBtn.onclick = () => {
  if (recorder) recorder.stop();
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

  try {
    await fetch("/upload", { method: "POST", body: formData });

    count[category]++;
    message.innerText = `✅ Audio uploaded successfully! Total recordings for ${category}: ${count[category]}`;
    message.style.color = "green";

    document.getElementById("status").innerText =
      "Selected category: " + category.toUpperCase() +
      ` (Recorded ${count[category]} times so far)`;

    audioBlob = null;

    // Suggest minimum if not reached
    if (count[category] < minCount) {
      message.innerText += `\n⚠ Please record at least ${minCount} times.`;
    }

  } catch (err) {
    message.innerText = "⚠ Upload failed. Please try again!";
    message.style.color = "red";
    console.error(err);
  }
};


