
let form = document.getElementById('message-form');

sessionStorage.getItem("id");

form.addEventListener('submit', event => {
    event.preventDefault();

    const title = document.getElementById('title').value;
    const message = document.getElementById('question').value;
    const id = sessionStorage.getItem("id");

    console.log(title, message, id);

    if(title && message){
        fetch(window.location.origin + "/add-message-form", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({title: title, message: message, id: id})
        }).then(response => {
            console.log(response);
            window.location.href = (window.location.origin + "/loggedIn-chat");
        });
    }
})