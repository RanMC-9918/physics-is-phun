function changeWebsiteTheme(newTheme){

    console.log(
      `Theme is ${newTheme}`
    );
    
    switch (newTheme) {
      case "darkBlue":
        localStorage.setItem("theme", "darkBlue");
        document.body.style.setProperty("--primary", "#ccceff");
        document.body.style.setProperty("--secondary", "#000088");
        document.body.style.setProperty("--tertiary", "#0000aa");
        document.body.style.setProperty("--bgColor", "#0000ff");
        document.body.style.setProperty("--textColor", "#ffffffff");
        break;
      case "mintyGreen":
        localStorage.setItem("theme", "mintyGreen");
        document.body.style.setProperty("--primary", "#B6174B"); //call to action
        document.body.style.setProperty("--secondary", "#549B54"); //light
        document.body.style.setProperty("--tertiary", "#C3EB78"); //lighter
        document.body.style.setProperty("--bgColor", "#F3FFC6"); //lightest
        document.body.style.setProperty("--textColor", "#1C5253"); //darkest
        break;
      default:
        localStorage.setItem("theme", "grayscale");
        document.body.style.setProperty("--primary", "#555555"); //call to action
        document.body.style.setProperty("--secondary", "#999999"); //light
        document.body.style.setProperty("--tertiary", "#BBBBBB"); //lighter
        document.body.style.setProperty("--bgColor", "#FFFFFF"); //lightest
        document.body.style.setProperty("--textColor", "#000000"); //darkest
    }
    
}

changeWebsiteTheme(localStorage.getItem("theme"));
// toggle twice to reset darkmode after refreshing the page