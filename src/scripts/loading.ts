export function loadingError(element: HTMLElement | null) {
    if (element === null) {
        console.error("Element is null");
    } else {
        const loadingWait = element.getElementsByClassName("Loading-wait")[0] as HTMLElement | null;
        const loadingError = element.getElementsByClassName("Loading-error")[0] as HTMLElement | null;
        if (loadingError !== null && loadingWait !== null) {
            loadingWait.style.display = "none";
            loadingError.style.display = "flex";
        }
    }
}