function toggleDarkMode(){

    console.log(
      `dark mode is ${localStorage.getItem("isDarkModeActive") === "true"}`
    );
    
    if(localStorage.getItem("isDarkModeActive") === "true")
    {
        localStorage.setItem("isDarkModeActive", 'false');
        document.body.style.setProperty("--primary", "#B6174B"); //call to action
        document.body.style.setProperty("--secondary", "#549B54"); //light
        document.body.style.setProperty("--tertiary", "#C3EB78"); //lighter
        document.body.style.setProperty("--bgColor", "#F3FFC6"); //lightest
        document.body.style.setProperty("--textColor", "#1C5253"); //darkest
    }
    else{
        localStorage.setItem("isDarkModeActive", 'true');
        document.body.style.setProperty("--primary", "#ccceff");
        document.body.style.setProperty("--secondary", "#000088");
        document.body.style.setProperty("--tertiary", "#0000aa");
        document.body.style.setProperty("--bgColor", "#0000ff");
        document.body.style.setProperty("--textColor", "#ffffffff");
    }
    
}8

toggleDarkMode();
toggleDarkMode();

// toggle twice to reset darkmode after refreshing the page