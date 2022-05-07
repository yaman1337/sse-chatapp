const MESSAGE_SELECTOR = "#message";
const BUTTON_SELECTOR = ".send-btn";
const MESSAGE_CONTAINER = ".messages";
let username;

const send_button = document.querySelector(BUTTON_SELECTOR);
const message_container = document.querySelector(MESSAGE_CONTAINER);

// listens to the message streams without closing the tcp connection
const eventSource = new EventSource("/messages");

username = localStorage.getItem("username");

if (!username) {
  let username_input = prompt("Enter your username");
  localStorage.setItem("username", username_input);
  username = localStorage.getItem("username");
}

send_button.addEventListener("click", () => {
  let message = document.querySelector(MESSAGE_SELECTOR);

  if (message.value === "") return;

  fetch("/send", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ username, message: message.value }),
  });

  message.value = "";
});

eventSource.addEventListener("message", (event) => {
  let data = JSON.parse(event.data);
  const li = document.createElement("li");
  li.textContent = `${data.username}: ${data.message}`;
  message_container.appendChild(li);
});
