let form = document.getElementById('replyform');

let title = document.getElementById('title');
let body = document.getElementById('body');

let site = window.location.href;
console.log(site.substring(site.indexOf("?") + 4));


form.addEventListener('submit', (event) => {
    event.preventDefault();
    fetch(
      window.location.origin +
        "/post-reply-form/" +
        site.substring(site.indexOf("?")),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.value,
          body: body.value,
          author: sessionStorage.getItem("id"),
        }),
      }
    ).then((response) => {
      window.location.href =
        window.location.origin +
        "/post-reply/" +
        site.substring(site.indexOf("?"));
    });
})