let chatContainer = document.getElementById("chat-container");

fetch(window.location.href + "load").then((res) => {
  res.json().then((data) => {
    console.log(data);
    data.forEach((e) => {
      let newChat = document.createElement("div");
      newChat.innerHTML = e;
      chatContainer.appendChild(newChat);
    });
  });
});
