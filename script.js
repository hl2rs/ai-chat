const input = document.getElementById("user-input");
const mirror = document.getElementById("mirror-text");
const prediction = document.getElementById("prediction-text");
const wrapper = document.getElementById("input-mirror-wrapper");
const csvInput = document.getElementById("csv-input");
const micBtn = document.getElementById("mic-btn");
let userType = null;

let currentSmartPrediction = "";
let predictionController = null;
let fetchedTxtContent = "";
let systemBehaviorContent = "";
let attachedCSV = null;
let selectedVoice = null;
let recognizing = false;
let recognition;
let transcriptAccumulated = "";
let silenceTimeout = null;

const txtFileUrl = "./system information/rag.txt";
const systembehaviorUrl = "./system information/system-behavior.txt";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

async function fetchTxtFile() {
  try {
    const response = await fetch(txtFileUrl);
    if (!response.ok) throw new Error("Failed to load .txt file");
    fetchedTxtContent = await response.text();
  } catch (error) {
    console.error("Error fetching .txt file:", error);
  }
}

async function fetchTxtFileTwo() {
  try {
    const response = await fetch(systembehaviorUrl);
    if (!response.ok) throw new Error("Failed to load .txt file");
    systemBehaviorContent = await response.text();
  } catch (error) {
    console.error("Error fetching .txt file:", error);
  }
}

csvInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file && file.name.endsWith(".csv")) {
    const reader = new FileReader();
    reader.onload = (e) => {
      attachedCSV = e.target.result;
    };
    reader.readAsText(file);
  }
});

async function speakText(text) {
  try {
    const response = await fetch("http://localhost:3000/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      console.error("TTS fetch failed. Status:", response.status);
      return;
    }

    const audioBlob = await response.blob();
    console.log("✅ Got audio blob:", audioBlob);

    const audioUrl = URL.createObjectURL(audioBlob);
    console.log("🎧 Playing from:", audioUrl);

    const audio = new Audio(audioUrl);
    audio.play().catch((err) => {
      console.error("🔇 Audio play failed:", err);
    });
  } catch (error) {
    console.error("❌ TTS request error:", error);
  }
}


function formatText(text) {
  const firstSentenceEnd =
    text.indexOf(".") !== -1 ? text.indexOf(".") + 1 : text.length;
  const title = text.slice(0, firstSentenceEnd).trim();
  const body = text.slice(firstSentenceEnd).trim();

  let formatted = `<div class="bot-response-title">${title}</div>` + body;
  formatted = formatted.replace(/\n{2,}/g, "<br><br>").replace(/\n/g, "<br>");
  formatted = formatted.replace(
    /^### (.*$)/gim,
    '<h3 class="bot-subheading">$1</h3>'
  );
  formatted = formatted.replace(
    /^## (.*$)/gim,
    '<h2 class="bot-heading">$1</h2>'
  );
  formatted = formatted.replace(/^# (.*$)/gim, '<h1 class="bot-title">$1</h1>');
  formatted = formatted.replace(
    /\*\*(.*?)\*\*/g,
    '<span class="gradient-text">$1</span>'
  );
  formatted = formatted.replace(
    /\*(.*?)\*/g,
    '<span class="gradient-text">$1</span>'
  );
  formatted = formatted.replace(/(^|\n)[*-]\s(.*?)/g, "$1• $2");
  return formatted;
}

function addMessage(htmlString, className) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", className, "fade-in"); // <-- add fade-in class
  messageDiv.innerHTML = htmlString;
  document.getElementById("messages").appendChild(messageDiv);
  document.getElementById("chatbox").scrollTop = document.getElementById("chatbox").scrollHeight;
}

let conversationHistory = [];

let systemMessage = {
  role: "system",
  content: systembehaviorUrl,
};

document.getElementById("send-btn").addEventListener("click", sendMessage);
document
  .getElementById("user-input")
  .addEventListener("keypress", function (event) {
    if (event.key === "Enter") sendMessage();
  });

async function sendMessage() {
  const userInput = document.getElementById("user-input").value.trim();
  if (!userInput) return;
  addMessage(userInput, "user-message");
  document.getElementById("user-input").value = "";
  conversationHistory.push({ role: "user", content: userInput });

  const loadingMessage = document.createElement("div");
  loadingMessage.classList.add("message", "bot-message", "loading-message");
  document.getElementById("messages").appendChild(loadingMessage);

  let dotCount = 1;
  const typingInterval = setInterval(() => {
    dotCount = (dotCount + 1) % 100;
    loadingMessage.innerHTML = `Thinking${".".repeat(dotCount)}`;
  }, 70);

  try {
    const fullPrompt =
      userInput +
      (attachedCSV
        ? `\n\nHere is the uploaded CSV data:\n\n${attachedCSV}`
        : "");
const systemPromptContent =
  `User Type: ${userType}\n\n` + 
  systemMessage.content +
  (attachedCSV ? `\n\nCSV data:\n\n${attachedCSV}` : "") +
  (fetchedTxtContent ? `\n\nTXT data:\n\n${fetchedTxtContent}` : "");


  //add your groq API key here
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer API_KEY_HERE", // Replace with your Groq API key
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: [
            { role: "system", content: systemPromptContent },
            ...conversationHistory.slice(-10),
            { role: "user", content: fullPrompt },
          ],
        }),
      }
    );    
    const data = await response.json();
    const botReplyRaw = data.choices[0].message.content;
    speakText(botReplyRaw);
    const formattedReply = formatText(botReplyRaw);
    clearInterval(typingInterval);
    loadingMessage.remove();

    if (data.choices && data.choices.length > 0) {
      setTimeout(() => {
        addMessage(formattedReply, "bot-message");
        conversationHistory.push({ role: "assistant", content: botReplyRaw });
      }, 1200);
    } else {
      addMessage("Sorry, I couldn't understand that.", "bot-message");
    }

    attachedCSV = null;
    csvInput.value = "";
  } catch (error) {
    clearInterval(typingInterval);
    loadingMessage.remove();
    console.error("Error fetching response:", error);
    addMessage("An error occurred while fetching the response.", "bot-message");
  }
}

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  recognition.onresult = (event) => {
    let interimTranscript = "";
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const result = event.results[i];
      if (result.isFinal) {
        transcriptAccumulated += result[0].transcript + " ";
      } else {
        interimTranscript += result[0].transcript;
      }
    }
    const finalText = (transcriptAccumulated + interimTranscript).trim();
    input.value = finalText;

    clearTimeout(silenceTimeout);
    if (finalText) {
      silenceTimeout = setTimeout(() => {
        recognition.stop();
        document.getElementById("send-btn").click();
      }, 2000);
    }
  };

  recognition.onstart = () => {
    recognizing = true;
    micBtn.style.backgroundColor = "#00e1ff";
    transcriptAccumulated = "";
  };

  recognition.onend = () => {
    recognizing = false;
    micBtn.style.backgroundColor = "";
    clearTimeout(silenceTimeout);
  };

  recognition.onerror = (event) => {
    recognizing = false;
    micBtn.style.backgroundColor = "";
    clearTimeout(silenceTimeout);
    console.error("Recognition error:", event.error);
  };

  micBtn.addEventListener("click", async () => {
    if (recognizing) {
      recognition.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      recognition.start();
    } catch (err) {
      console.error("Mic permission denied:", err);
      alert(
        "Microphone access is required. Please check your browser settings."
      );
    }
  });
} else {
  micBtn.disabled = true;
  micBtn.title = "Speech recognition not supported on this browser.";
  alert("Speech Recognition is not supported on your device.");
}

window.addEventListener("DOMContentLoaded", async () => {
  await fetchTxtFile();
  await fetchTxtFileTwo();
  systemMessage = { role: "system", content: systemBehaviorContent };

  addMessage(
    `
    <div class="bot-response-title">Hello!</div>
    `,
    "bot-message"
  );

  speakText("Hello!");
});