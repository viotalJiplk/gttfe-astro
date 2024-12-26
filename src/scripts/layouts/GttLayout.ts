const toast = document.getElementById("GttLayout-toast")
if(toast === null){
    console.error("Toast not found");
}else{
    toast.addEventListener("click", event=>{
        toast.style.display = "none";
    });
}