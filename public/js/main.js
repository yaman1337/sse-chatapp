const MESSAGE_SELECTOR = "#message";
const BUTTON_SELECTOR = ".send-btn";
const MESSAGE_CONTAINER = ".messages";
const RESET_USERNAME_SELECTOR = "#reset_username";
const JOIN_ROOM_SELECTOR = "#join_room";
const TYPING_SELECTOR = "#typing";
let username;

const send_button = document.querySelector(BUTTON_SELECTOR);
const message_container = document.querySelector(MESSAGE_CONTAINER);
const reset_username_button = document.querySelector(RESET_USERNAME_SELECTOR);
const join_room_button = document.querySelector(JOIN_ROOM_SELECTOR);
const typing_container = document.querySelector(TYPING_SELECTOR);

const eventSource = new EventSource("/messages");

username = localStorage.getItem("username");

if (!username) {
  let username_input = prompt("Enter your username");
  localStorage.setItem("username", username_input);
  username = localStorage.getItem("username");
}

document.querySelector(MESSAGE_SELECTOR).addEventListener("focus", () => {
  console.log(111)
  fetch(`/typing?username=${username}`);
})

document.querySelector(MESSAGE_SELECTOR).addEventListener("focusout", () => {
  typing_container.innerText = "";
  typing_container.style.display = "none";
  fetch(`/not-typing?username=${username}`);
})


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

  if(data.event) {

    if(data.event === "not_typing") {

      typing_container.innerText = "";
      typing_container.style.display = none;
    
      return
    }

    typing_container.style.display = "block";
    typing_container.innerText = data.message;
    console.log(data.message);
    return
  }

  const li = document.createElement("li");
  li.textContent = `${data.username}: ${data.message}`;
  message_container.appendChild(li);
});
