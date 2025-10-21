import { ApiObject } from "./api/utils";

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

export class UserObject extends ApiObject{
    static types = {
        "id": String,
        "username": String,
        "avatar": [null, String],
        "discriminator": String,
        "public_flags": [undefined, Number],
        "flags": [undefined, Number],
        "banner": [null, String],
        "accent_color": [null, Number],
        "global_name": [null, String],
        "avatar_decoration_data": [null, Object],
        "banner_color": [null, String],
        "clan": [null, Object],
        "primary_guild": [null, Object]
    };
    id: string;
    username: string;
    avatar: null|string;
    discriminator: string;
    public_flags: undefined | number;
    flags: undefined | number;
    banner: null | string;
    accent_color: null | number;
    global_name: null | string;
    avatar_decoration_data: null | Object;
    banner_color: null | string;
    clan: null | Object;
    primary_guild: null | Object;
    constructor(id = "", username = "", avatar = "", discriminator = "", public_flags = undefined,
        flags = undefined, banner = null, accent_color = null, global_name = "",
        avatar_decoration_data = null, banner_color = null, clan = null, primary_guild = null) {
        super();
        this.id = id;
        this.username = username;
        this.avatar = avatar;
        this.discriminator = discriminator;
        this.public_flags = public_flags;
        this.flags = flags;
        this.banner = banner;
        this.accent_color = accent_color;
        this.global_name = global_name;
        this.avatar_decoration_data = avatar_decoration_data;
        this.banner_color = banner_color;
        this.clan = clan;
        this.primary_guild = primary_guild;
    }
}

class LocalStorageHandler{
    get jwt() {
        let jwt = localStorage.getItem("jwt");
        if (jwt === null) {
            return undefined;
        } else {
            return jwt;
        }
    }
    set jwt(jwt: string | undefined) {
        if (jwt !== undefined) {
            localStorage.setItem("jwt", jwt);
        } else {
            localStorage.removeItem("jwt");
        }
    }

    get userObject() {
        let userObject = localStorage.getItem("userObject");
        if (userObject === null) {
            return undefined;
        } else {
            return JSON.parse(userObject) as UserObject;
        }
    }
    set userObject(userObject: UserObject | undefined) {
        if (userObject !== undefined) {
            localStorage.setItem("userObject", JSON.stringify(userObject));
        } else {
            localStorage.removeItem("userObject");
        }
    }
}

export const storage = new LocalStorageHandler();
