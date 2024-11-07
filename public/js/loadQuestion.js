let question = document.getElementById('question');

let url = window.location.href.substring(window.location.href.indexOf("?"))
fetch(window.location.origin + `/question/load` + url).then((res) => {
    if (res.status == 404) {
        question.innerHTML = 404;
        console.log("404 question not found");
    }
    else{
        res.json().then((data) => {
            question.innerHTML = `
            <div class="card">
                <div class="header">
                    <h2>${data.title}</h2>
                <div class="line"></div>
                    <h2 class="date">${formatDate(data)}</h2>
                </div>
                <br/>
                <div class="body">
                    <p>${data.body}</p>
                </div>
                <br />
                <div class="footer">
                    <p class="author">-${data.author}</p>
                </div>
            </div>`
        })
    }
})


function formatDate(e){
    console.log(e)
    e = e.posted_at.substring(0, e.posted_at.indexOf('T'));
    let year = e.substring(0,e.indexOf('-'))
    e = e.substring(e.indexOf('-')+1);
    let month = e.substring(0, e.indexOf('-'));
    e = e.substring(e.indexOf('-')+1);
    let day = parseInt(e);
    day --;
    console.log(e)
    return month + ' / ' + day + ' / ' + year;
  }
  