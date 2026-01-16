let recorder;
let audioBlob;
let category = "";
let count = { fearful: 0, normal: 0 };
const maxCount = 10;

function setCategory(type) {
  category = type;
  document.getElementById("status").innerText =
    "Selected category: " + type.toUpperCase() + 
    ` (Recording ${count[type]}/${maxCount})`;
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

  if (count[category] >= maxCount) {
    message.innerText = `✅ You have completed ${maxCount} recordings for ${category}`;
    message.style.color = "green";
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

    message.innerText = "✅ Audio uploaded successfully! Thank you 🙏";
    message.style.color = "green";

    // Update count
    count[category]++;
    document.getElementById("status").innerText =
      "Selected category: " +
      category.toUpperCase() +
      ` (Recording ${count[category]}/${maxCount})`;

    audioBlob = null;

    // Disable further upload if max reached
    if (count[category] >= maxCount) {
      message.innerText = `✅ You have completed ${maxCount} recordings for ${category}`;
      message.style.color = "green";
    }
  } catch (err) {
    message.innerText = "⚠ Upload failed. Please try again!";
    message.style.color = "red";
    console.error(err);
  }
};

