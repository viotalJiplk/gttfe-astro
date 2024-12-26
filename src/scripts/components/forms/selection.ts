function filter(event: Event) {
    if (event.target != null && "value" in event.target) {
        const target = event.target as HTMLInputElement;
        let inputText = target.value.toUpperCase();
        if (target.nextElementSibling !== null) {
            for (let holder of target.nextElementSibling.children[0].children) {
                let typedHolder = holder as HTMLElement;
                if (typedHolder.innerHTML.toUpperCase().includes(inputText)) {
                    typedHolder.style.display = "block";
                } else {
                    typedHolder.style.display = "none";
                }
            }
        }
    }
}
Array.from(document.getElementsByClassName("Selection-input")).forEach(element => {
    element.addEventListener("keyup", filter);
    element.addEventListener("click", filter);
});