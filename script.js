// Ryan Schmelter
// IS 5750
// Slack messaging application

const API = "https://slackclonebackendapi.onrender.com";
const MY_USER_ID = "3"; // the user we "are" when sending messages - Charlie

function changeChannel(e) {
  document.querySelector(".active").classList.remove("active");
  e.currentTarget.classList.add("active");
  populateMessages(e.currentTarget.getAttribute("data-channel"));
  document.querySelector("#channel-title").innerText =
    e.currentTarget.innerText;
}

// Clone the <template>, fill it in, and add it to the chat window
function addMessageToScreen(senderName, text, isSelf) {
  let template = document.querySelector("template");
  const clone = template.content.cloneNode(true);
  clone.querySelector(".sender").innerText = senderName + ":";
  clone.querySelector(".text").innerText = text;
  if (isSelf) {
    clone.querySelector(".message").classList.add("self");
  }
  document.querySelector("#chat-messages").append(clone);
}

async function populateMessages(chat) {
  document.querySelectorAll(".message").forEach((item) => item.remove());

  const res = await fetch(`${API}/messages?channelId=${chat}`);
  const messages = await res.json();

  // for loop so each await finishes before the next message, which keeps the messages in order
  for (const message of messages) {
    const userRes = await fetch(`${API}/users?id=${message.senderId}`);
    const users = await userRes.json(); // an ARRAY of matching users
    const name = users[0] ? users[0].name : "Unknown";

    addMessageToScreen(name, message.content, message.senderId === MY_USER_ID);
  }
}

async function sendMessage() {
  const input = document.querySelector("#message-input");
  const content = input.value.trim();
  if (content === "") return; // don't send empty messages

  const channelId = document
    .querySelector(".active")
    .getAttribute("data-channel");

  await fetch(`${API}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      channelId: channelId,
      senderId: MY_USER_ID,
      content: content,
      timestamp: new Date().toISOString(),
    }),
  });

  addMessageToScreen("You", content, true);
  input.value = "";
}

async function init() {
  const res = await fetch(`${API}/channels`);
  const channels = await res.json();

  for (const channel of channels) {
    const btn = document.createElement("button");
    btn.classList.add("channel");
    btn.setAttribute("data-channel", channel.id);
    btn.innerText = channel.name;
    document.querySelector(".channel-list").append(btn);
  }

  document
    .querySelectorAll(".channel")
    .forEach((item) => item.addEventListener("click", changeChannel));

  // Start on the first channel so .active exists before the first click
  const first = document.querySelector(".channel");
  first.classList.add("active");
  document.querySelector("#channel-title").innerText = first.innerText;
  populateMessages(first.getAttribute("data-channel"));

  // Sending messages
  document
    .querySelector("#chat-form button")
    .addEventListener("click", sendMessage);
  document.querySelector("#message-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });
}

init();
