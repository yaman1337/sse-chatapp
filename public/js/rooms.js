const MESSAGE_SELECTOR = "#message";
const BUTTON_SELECTOR = ".send-btn";
const MESSAGE_CONTAINER = ".messages";
const RESET_USERNAME_SELECTOR = "#reset_username";
let username;

let room = window.location.search.split("name=")[1];

const send_button = document.querySelector(BUTTON_SELECTOR);
const message_container = document.querySelector(MESSAGE_CONTAINER);
const reset_username_button = document.querySelector(RESET_USERNAME_SELECTOR);

const eventSource = new EventSource(`/room-messages?room=${room}`);

username = localStorage.getItem("username");

if (!username) {
  let username_input = prompt("Enter your username");
  localStorage.setItem("username", username_input);
  username = localStorage.getItem("username");
}

reset_username_button.addEventListener("click", () => {

  let username_input = prompt("Enter new username");
  localStorage.setItem("username", username_input);
  username = localStorage.getItem("username");

});


send_button.addEventListener("click", () => {
  let message = document.querySelector(MESSAGE_SELECTOR);

  if (message.value === "") return;

  fetch("/send-private", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ username, message: message.value, room }),
  });

  message.value = "";
});

eventSource.addEventListener("message", (event) => {
  let data = JSON.parse(event.data);
  const li = document.createElement("li");
  li.textContent = `${data.username}: ${data.message}`;
  message_container.appendChild(li);
});
