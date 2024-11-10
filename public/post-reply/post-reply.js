let form = document.getElementById('replyform');

let title = form.getElementById('title');
let body = form.getElementById('body');

let site = window.location.href;

form.onclick = () => {
    fetch(window.location.origin + '/post-reply-form/' + site.substring(site.indexOf('?')), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
           title: title.value,
           body: body.value,
           author: sessionStorage.getItem('id')
        })
    }).then(response => {
        window.location.href = window.location.origin + '/post-reply/' + site.substring(site.indexOf('?'))
    })

}