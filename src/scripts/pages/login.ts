import { loadingError } from "../loading";
import { showToastError } from "../toast";
import { storage, UserObject } from "../utils";

const loading = document.getElementById("login-loading") as HTMLDivElement;

const url = new URL(window.location.href);
const code = url.searchParams.get("code");
const state = url.searchParams.get("state");
if ((url !== null) && (code !== null) && (state !== null)) {
    getToken(code, state);
} else {
    startLoginChain();
}

async function getToken(code: string, state: string) {
    let data = {
        "code": code,
        "state": state,
        "redirectUri": window.location.href.split("?")[0],
    }
    let response = await fetch("/backend/discord/token", {
        "method": "POST",
        "headers": {
            "Content-Type": "application/json"
        },
        "body": JSON.stringify(data)
    });
    if (response.status === 401) {
        showToastError("Pravdravděpodobně došlo k restartu serveru. Zkuste akci opakovat.");
        loadingError(loading);
    } else if (response.status !== 200) {
        showToastError("Neznámá chyba.");
        loadingError(loading);
    } else {
        response = await response.json();
        if (response) {
            if ("jws" in response) {
                storage.jwt = String(response.jws);
            }
            if ("userObject" in response) {
                // @ts-expect-error
                storage.userObject = UserObject.fromObject(response.userObject);
            }
            if (localStorage.getItem("afterlogin") !== null) {
                const url = localStorage.getItem("afterlogin");
                localStorage.removeItem("afterlogin");
                //we force reload, so the new jwt would load before we start the code on page
                if (url === "exit") {
                    window.close();
                } else {
                    // @ts-expect-error
                    window.location.href = url;
                }
            } else {
                window.location.href = "/account";
            }
        }
    }
}

async function startLoginChain() {
    let res = await (fetch("/backend/discord/auth").catch(function (error) {
        if(error.response.status !== 200){
            showToastError("Služba pravděpodobně není dostupná. Zkuste akci opakovat za chvíli.");
            loadingError(loading);
        }else{
            return error.response;
        }
    }));
    res = await res.json();

    const redirectUrl = new URL(res.redirectUrl )
    let newUrl = window.location.origin + "/login/";
    if (newUrl.includes("localhost")) {
        newUrl = newUrl.replace("localhost", "127.0.0.1");
    }
    redirectUrl.searchParams.set("redirect_uri", newUrl);
    window.location.href = redirectUrl.href;
}