import { hideLoginOverlay, showLoginOverlay, storage } from "../utils";

async function notLoggedIn(result: Response) {
    if (result.status === 401) {
        let resultObj = await result.clone().json();
        if ("kind" in resultObj && "msg" in resultObj) {
            if (resultObj.kind === "JWS" && (
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
    } catch (e) {
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
    let jwtString = storage.jwt;
    if (jwtString !== null) {
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
            if (storage.jwt !== undefined) {
                resolve(undefined);
            }
        });
    });
    await jwsSet;
}

export class ShowError extends Error { };

export class ApiObject {
    static types = {};
    static fromObject(obj: object) {
        const instance = new this(); // Create an instance to access instance attributes

        for (const attrInd in this.types) {
            // @ts-expect-error
            let attrs = this.types[attrInd];
            // @ts-expect-error
            if (!(Array.isArray(this.types[attrInd]))) {
                // @ts-expect-error
                attrs = [this.types[attrInd]];
            }
            if (!(attrInd in obj)) {
                if (!attrs.includes(undefined)) {
                    console.error(`${attrInd} does not exist in the object.`);
                    throw new ShowError("Chyba serveru, kontaktujte prosím podporu.");
                }
                
            } else {
                let found = false;
                for (const attr of attrs) {
                    if (attr === String) {
                         // @ts-expect-error
                        if (typeof obj[attrInd] === 'string') {
                            found = true;
                            break;
                        }
                    } else if (attr === Number) {
                        // @ts-expect-error
                        if (!isNaN(obj[attrInd]) && isFinite(obj[attrInd])) {
                            found = true;
                            break;
                        }
                    } else if (attr === Array) {
                        // @ts-expect-error
                        if (Array.isArray(obj[attrInd])) {
                            found = true;
                            break;
                        }
                    } else if (attr === Boolean) {
                        // @ts-expect-error
                        if ([true, "true", false, "false", 1, "1", 0, "0"].includes(obj[attrInd])) {
                            // @ts-expect-error
                            if ([true, "true", 1, "1"].includes(obj[attrInd])) {
                                // @ts-expect-error
                                obj[attrInd] = true;
                            } else {
                                // @ts-expect-error
                                obj[attrInd] = false;
                            }
                            found = true;
                            break;
                        }
                    } else if (attr === Object) {
                        // @ts-expect-error
                        if (obj[attrInd] instanceof Object) {
                            found = true;
                            break;
                        }
                    }else if (attr === null) {
                        // @ts-expect-error
                        if (obj[attrInd] == null) {
                            found = true;
                            break;
                        }
                    }
                }
                if (found) {
                    // @ts-expect-error
                    instance[attrInd] = obj[attrInd];
                } else {
                    // @ts-expect-error
                    console.error(`${attrInd} has wrong type in the object.\nFound: ${typeof obj[attrInd]}`);
                    throw new ShowError("Chyba serveru, kontaktujte prosím podporu.");
                }
            }
        }
        return instance;
    }
}