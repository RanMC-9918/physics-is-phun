let question = document.getElementById('question');
question.innerHTML = "Loading...";

let id = window.location.href.substring(window.location.href.indexOf("?"))
fetch(window.location.origin + `/question/load` + id).then((res) => {
    if (res.status == 404) {
        question.innerHTML = 404;
        console.log("404 question not found");
    }
    else{
        res.json().then((data) => {
            console.log(data);
            question.innerHTML = `
            <div class="card">
                <div class="header">
                    <h2>${data.title}</h2>
                <div class="line"></div>
                    <h2 class="date">${formatDate(data.posted_at)}</h2>
                </div>
                <br/>
                <div class="body">
                    <p>${data.body}</p>
                </div>
                <br />
                <div class="footer">
                    <p class="author">-${data.author}</p>
                </div>
            </div>`;
        })
    }
})


function formatDate(e){
    e = new Date(e);
    console.log(typeof(e));
    let year = e.getFullYear();
    let month = e.getMonth();
    let day = e.getDay();
    return month + ' / ' + day + ' / ' + year;
  }
  