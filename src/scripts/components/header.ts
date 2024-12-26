const hamButton = document.getElementById("Header-hamburgerButton") as HTMLDivElement;
const nav = document.getElementById("Header-navbar") as HTMLDivElement;
hamButton.addEventListener("click", event => {
    if(nav.style.display === "block"){
        nav.style.display = "none";
    }else{
        nav.style.display = "block";
    }
});