export function isIterable(variable: any) {
    return variable != null && typeof variable[Symbol.iterator] === 'function';
}

export function showLoginOverlay() {
    const loginOverlay = document.getElementsByClassName("LoginOverlay")[0] as HTMLElement;
    if (loginOverlay !== null) {
        loginOverlay.style.display = "block";
    }
    else {
        console.error("Login overlay not found.");
    }
}

export function hideLoginOverlay() {
    const loginOverlay = document.getElementsByClassName("LoginOverlay")[0] as HTMLElement;
    if (loginOverlay !== null) {
        loginOverlay.style.display = "none";
    }
    else {
        console.error("Login overlay not found.");
    }
}