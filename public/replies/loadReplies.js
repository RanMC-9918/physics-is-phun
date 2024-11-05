let replyContainer = document.getElementById('replyContainer');


fetch(window.location.origin + "/reply?id=-102863077").then((res) => {
    res.json().then((data) => {
      //console.log(data);
      data.forEach((e) => {
        replyContainer.innerHTML += `
        <div class="card">
          <div class="header">
            <h2>Reply</h2>
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
            <a class="replies">
              <button>See Replies</button>
            </a>
          </div>
        </div>`;
      });
    });
  });
  
  
  function formatDate(e){
    e = e.posted_at.substring(0, e.posted_at.indexOf('T'));
    let year = e.substring(0,e.indexOf('-'))
    e = e.substring(e.indexOf('-')+1);
    let month = e.substring(0, e.indexOf('-'));
    e = e.substring(e.indexOf('-')+1);
    let day = parseInt(e);
    day --;
  
    return month + ' / ' + day + ' / ' + year;
  }
  