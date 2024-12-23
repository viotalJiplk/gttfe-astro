async function notLoggedIn(result: Response) {
    if (result.status === 401) {
        let resultObj = await result.clone().json();
        if ("kind" in resultObj && "msg" in resultObj && resultObj.kind === "JWS" && (
            [
                "Invalid JWS token!",
                "Invalid JWS signature!",
                "Missing Authorization header!",
                "Expired!",
                "Untrusted issuer!",
                "Missing userId!"
            ].includes(resultObj.msg))) {
            return true;
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
        window.open("/login", "_blank");
        alert("Nejste přihlášen/a pokračujte v nově otevřené záložce a po jejím zavření stiskněte ok.");
        init = addAuthHeader(init);
        result = await fetch(input, init);
    }
    if (await notLoggedIn(result)) {
        throw new ShowError("Nejste přihlášen/a.");
    }
    return result;
}

function addAuthHeader(init?: RequestInit) {
    let jwtString = localStorage.getItem("jwt") || "";
    if(jwtString !== ""){
        init = init || {};
        init.headers = {
            ...init.headers,
            Authorization: `Bearer ${jwtString}`,
        };   
    }
    return init;
}

export class ShowError extends Error{};