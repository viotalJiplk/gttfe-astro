const toastMsg = document.getElementById("GttLayout-toast") as HTMLDivElement;

export function showToastError(str: string) {
    toastMsg.innerText = str;
    if (toastMsg.classList.contains("GttLayout-toast-ok")) {
        toastMsg.classList.remove("GttLayout-toast-ok");
    }
    toastMsg.classList.add("GttLayout-toast-error");
    toastMsg.style.display = "block";
}

export function flashToastError(str: string, timeout: number = 2000) {
    toastMsg.innerText = str;
    if (toastMsg.classList.contains("GttLayout-toast-ok")) {
        toastMsg.classList.remove("GttLayout-toast-ok");
    }
    toastMsg.classList.add("GttLayout-toast-error");
    toastMsg.style.display = "block";
    setTimeout(hideToast, timeout);
}

function hideToast() {
    toastMsg.innerText = "";
    if (toastMsg.classList.contains("GttLayout-toast-ok")) {
        toastMsg.classList.remove("GttLayout-toast-ok");
    }
    if (toastMsg.classList.contains("GttLayout-toast-error")) {
        toastMsg.classList.remove("GttLayout-toast-error");
    }
    toastMsg.style.display = "none";
}