const url = new URL(window.location.href);
const code = url.searchParams.get("code");
const state = url.searchParams.get("state");
if ((url !== null) && (code !== null) && (state !== null)) {
    getToken(code, state);
} else {
    startLoginChain();
}

async function getToken(code: string, state: string) {
    console.log("rerender")
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
    }).catch(function (error) {
        if(error.response.status === 401){
            console.error("Pravdravděpodobně došlo k restartu serveru. Zkuste akci opakovat.");
        }else if(error.response.status !== 200){
            console.error("Neznámá chyba.");
        }else{
            return error.response;
        }
    });
    response = await response.json();
    if(response){
        localStorage.setItem("jwt", response.jws);
        localStorage.setItem("userObject", JSON.stringify(response.userObject));
        if(localStorage.getItem("afterlogin") !== null){
            const url = localStorage.getItem("afterlogin");
            localStorage.removeItem("afterlogin");
            //we force reload, so the new jwt would load before we start the code on page
            if(url === "exit"){
                window.close();
            }else{
                // @ts-expect-error
                window.location.href = url;
            }
        }else{
            window.location.href = "/account";
        }
    }
}

async function startLoginChain() {
    let res = await (fetch("/backend/discord/auth").catch(function (error) {
        if(error.response.status !== 200){
            console.error("Služba pravděpodobně není dostupná. Zkuste akci opakovat za chvíli.");
        }else{
            return error.response;
        }
    }));
    res = await res.json();

    const redirectUrl = new URL(res.redirectUrl )
    let newUrl = window.location.origin + "/login";
    if (newUrl.includes("localhost")) {
        newUrl = newUrl.replace("localhost", "127.0.0.1");
    }
    redirectUrl.searchParams.set("redirect_uri", newUrl);
    window.location.href = redirectUrl.href;
}