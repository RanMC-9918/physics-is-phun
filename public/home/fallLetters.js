const letters = document.getElementsByClassName("letter");
const fallTrigger = document.getElementById("fallTrigger");

fallTrigger.addEventListener("mouseover", fallLetters);
fallTrigger.addEventListener("mouseout", returnLetters);

let hovering = false;

function fallLetters() {

    if(hovering) {
        return;
    }
    hovering = true;

  for (var i = 0; i < letters.length; i++) {
    letters[i].style.position = "relative";
    let factor = Math.random() * 70;
    letters[i].style.top = factor + "px";
  }
}

function returnLetters(event) {

    if(fallTrigger.contains(event.relatedTarget)){
        hovering = true;
        return;
    }

    hovering = false;

    console.log("out");

  for (var i = 0; i < letters.length; i++) {
    letters[i].style.position = "relative";
    letters[i].style.top = "0px";
  }
}

