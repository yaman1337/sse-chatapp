const MESSAGE_SELECTOR = "#message";
const BUTTON_SELECTOR = ".send-btn";
const MESSAGE_CONTAINER = ".messages";
const RESET_USERNAME_SELECTOR = "#reset_username";
const JOIN_ROOM_SELECTOR = "#join_room";
let username;

const send_button = document.querySelector(BUTTON_SELECTOR);
const message_container = document.querySelector(MESSAGE_CONTAINER);
const reset_username_button = document.querySelector(RESET_USERNAME_SELECTOR);
const join_room_button = document.querySelector(JOIN_ROOM_SELECTOR);

const eventSource = new EventSource("/messages");

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

join_room_button.addEventListener("click", () => {
  
  let room_name = prompt("Enter room name");
  if(!room_name) return;
  window.location.assign(`/room.html?name=${room_name}`);

});

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
