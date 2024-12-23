export function addOptions(selectionId: string, elementId: string, options: string[]) {
    const selection = document.getElementById(selectionId) as HTMLSelectElement | null;
    const input = document.getElementById(elementId) as  HTMLInputElement | null;
    if (selection === null || input === null) {
        console.error("Selection or input not found.");
    } else {
        selection.innerHTML = "";
        options.forEach(textValue => {
            let div = document.createElement("div");
            div.innerText = textValue;
            div.addEventListener("mousedown", event => {
                if (event.target !== null && "innerText" in event.target) {
                    input.value = String(event.target.innerText);
                }
            });
            div.classList.add("Selection-option");
            selection.appendChild(div);
        });
    }
}