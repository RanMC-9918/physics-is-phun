
let form = document.getElementById('message-form');

form.addEventListener('submit', event => {
    event.preventDefault();

    const title = document.getElementById('title').value;
    const message = document.getElementById('question').value;


    if(title && message){
        fetch(window.location.origin + "/add-message-form", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({title, message})
        }).then(response => {
            redirectToChat();
            console.log(response);
        });
    }
})

function redirectToChat() {
    window.location.href = window.location.origin + "/chat";
}