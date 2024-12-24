import { hideLoginOverlay, showLoginOverlay } from "../utils";

async function notLoggedIn(result: Response) {
    if (result.status === 401) {
        let resultObj = await result.clone().json();
        if ("kind" in resultObj && "msg" in resultObj) {
            if(resultObj.kind === "JWS" && (
                [
                    "Invalid JWS token!",
                    "Invalid JWS signature!",
                    "Missing Authorization header!",
                    "Expired!",
                    "Untrusted issuer!",
                    "Missing userId!"
                ].includes(resultObj.msg))) {
                return true;
            } else if (resultObj.kind === "Perms" && resultObj.msg === "Missing required permissions.") {
                return true;
            }
        }
        
    }
    return false;
}

export async function authFetch(input: RequestInfo | URL, init?: RequestInit) {
    init = addAuthHeader(init);
    let result: Response;
    try {
        result = await fetch(input, init);
    } catch (e){
        if (e instanceof TypeError && e.message === "NetworkError when attempting to fetch resource.") {
            throw new ShowError("Server je offline, kontaktujte prosím podporu.");
        } else {
            throw e;
        }
    }
    if (result.status >= 500 && result.status < 600) {
        console.error(result);
        throw new ShowError("Chyba serveru, kontaktujte prosím podporu.");
    }
    if (await notLoggedIn(result)) {
        localStorage.setItem("afterlogin", "exit");
        localStorage.removeItem("jwt");
        showLoginOverlay();
        await waitUntilJwsSet();
        hideLoginOverlay();
        init = addAuthHeader(init);
        result = await fetch(input, init);
    }
    if (await notLoggedIn(result)) {
        throw new ShowError("Nejste přihlášen/a.");
    }
    return result;
}

function addAuthHeader(init?: RequestInit) {
    let jwtString = localStorage.getItem("jwt");
    if(jwtString !== null){
        init = init || {};
        init.headers = {
            ...init.headers,
            Authorization: `Bearer ${jwtString}`,
        };   
    }
    return init;
}

async function waitUntilJwsSet() {
    let jwsSet = new Promise((resolve, reject) => {
        addEventListener("storage", (event) => {
            if (localStorage.getItem("jwt") !== null) {
                resolve(undefined);
            }
        });
    });
    await jwsSet;
}

export class ShowError extends Error{};