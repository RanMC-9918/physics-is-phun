let chatContainer = document.getElementById("chat-container");

fetch(window.location.href + "load").then((res) => {
  res.json().then((data) => {
    console.log(data);
    data.forEach((e) => {
      let newChat = document.createElement("div");
      newChat.innerHTML = `
      <div class="card">
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
          <p class="author">-Ms.Ruda</p>
          <a class="replies">
            <button>See Replies</button>
          </a>
        </div>
      </div>`;
      chatContainer.appendChild(newChat);
    });
  });
});


function formatDate(e){
  e = e.posted_at.substring(0, e.posted_at.indexOf('T'));
  let year = e.substring(0,e.indexOf('-'))
  e = e.substring(e.indexOf('-')+1);
  let month = e.substring(0, e.indexOf('-'));
  e = e.substring(e.indexOf('-')+1);
  let day = e
  return month + ' / ' + day + ' / ' + year;
}