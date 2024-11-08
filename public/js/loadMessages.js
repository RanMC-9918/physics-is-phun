let chatContainer = document.getElementById("chat-container");

// console.log(
//    window.location
// );

chatContainer.innerHTML = "Loading...";
fetch(window.location.origin + "/chat/load").then((res) => {
  res.json().then((data) => {
    chatContainer.innerHTML = null;
    //console.log(data);
    let counter = 0;
    data.forEach((e) => {
      counter++;
      let newCard = document.createElement('div');
      newCard.classList.add("card");
      newCard.style = `opacity: 0;animation: fade-in 0.7s ${counter / 9}s forwards`;
      newCard.innerHTML = `
        <div class="header">
          <h2>${e.title}</h2>
          <div class="line"></div>
          <h2 class="date">${formatDate(e)}</h2>
        </div>
        <br/>
        <div class="body">
          <p>${e.body}</p>
        </div>
        <br />
        <div class="footer">
          <p class="author">-${e.author}</p>
          <a class="replies" href="${window.location.origin + '/replies/?id='+
              e.id}
            ">
            <button>See Replies</button>
          </a>
        </div>`;
    chatContainer.appendChild(newCard);
    });
  });
});

function formatDate(e) {
  e = e.posted_at.substring(0, e.posted_at.indexOf("T"));
  let year = e.substring(0, e.indexOf("-"));
  e = e.substring(e.indexOf("-") + 1);
  let month = e.substring(0, e.indexOf("-"));
  e = e.substring(e.indexOf("-") + 1);
  let day = parseInt(e);
  day--;

  return month + " / " + day + " / " + year;
}