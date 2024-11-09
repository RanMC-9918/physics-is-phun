let replyContainer = document.getElementById('replyContainer');
//const queryParam = req.query.id;

let url = window.location.href;

console.log(window.location.origin + "/replies/load" + url.substring(url.indexOf("?")))



replyContainer.innerHTML = "Loading...";


fetch(
  window.location.origin + "/replies/load" + url.substring(url.indexOf("?"))
).then((res) => {
  replyContainer.innerHTML = "";
  res.json().then((data) => {
    //console.log(data);
    data.forEach((e) => {
      console.log(e);
      if (e == 0) {
        replyContainer.innerHTML =
          '<h3 style="text-align: left;margin-left: 20px; font-weight: normal;">No replies found. Maybe you can be the first :)</h3>';
        return;
      }
      replyContainer.innerHTML += `
    <div class="card">
        <div class="header">
        <h2>Reply</h2>
        <div class="line"></div>
        <h2 class="date">${formatDate(e.posted_at)}</h2>
        </div>
        <br/>
        <div class="body">
        <p>${e.body}</p>
        </div>
        <br />
        <div class="footer">
        <p class="author">-${e.author}</p>
        
        </div>
    </div>`;
    });
  });
});


function formatDate(e){
    e = new Date(e);
    let year = e.getFullYear();
    let month = e.getMonth();
    let day = e.getDay();

    return month + ' / ' + day + ' / ' + year;
}
