let replyContainer = document.getElementById('replyContainer');
//const queryParam = req.query.id;
console.log(window.location.origin + `/replies/load?id=120`)
let url = window.location.href;
replyContainer.innerHTML = "Loading...";
fetch(url.substring(0, url.indexOf("?")) + "load" + url.substring(url.indexOf("?"))).then((res) => {
    replyContainer.innerHTML = '';
    res.json().then((data) => {
    //console.log(data);
    data.forEach((e) => {
        console.log(e);
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
