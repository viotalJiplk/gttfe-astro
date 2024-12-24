import { isIterable } from "../utils";
import { ApiObject, authFetch, ShowError } from "./utils";

export class GeneratedRole extends ApiObject{
    static types = {
        "roleName": String,
        "discordRoleId": Number,
        "discordRoleIdEligible": Number,
        "gameId": Number,
        "default": Boolean,
        "minimal": Number,
        "maximal": Number,
        "generatedRoleId": Number
    }
    roleName: string;
    discordRoleId: number;
    discordRoleIdEligible: number;
    gameId: number;
    default: boolean;
    minimal: number;
    maximal: number;
    generatedRoleId: number;
    constructor(roleName = "", discordRoleId = -1, discordRoleIdEligible = -1, gameId = -1, isDefault = false, minimal = 0, maximal = 0, generatedRoleId = -1) {
        super();
        this.roleName = roleName;
        this.discordRoleId = discordRoleId;
        this.discordRoleIdEligible = discordRoleIdEligible;
        this.gameId = gameId;
        this.default = isDefault;
        this.minimal = minimal
        this.maximal = maximal;
        this.generatedRoleId = generatedRoleId;
    }
}

export async function listGeneratedRoles() {
    let res = await authFetch(`/backend/generatedRole/list/all/`);
    let generatedRolesObj = await res.json();
    let generatedRole: GeneratedRole[] = [];
    if (!isIterable(generatedRolesObj)) {
        console.error("/backend/generatedRole/list/all/ responded with non iterable.");
        throw new ShowError("Chyba serveru, kontaktujte prosím podporu.");
    }
    for (let generatedObj of generatedRolesObj) {
        //@ts-expect-error
        generatedRole.push(GeneratedRole.fromObject(generatedObj));
    }
    return generatedRole;
}

export function generatedRoleNameFromId(id: number, generatedRoles: GeneratedRole[]) {
    for (let generatedRole of generatedRoles) {
        if (generatedRole.generatedRoleId === id) {
            return generatedRole.roleName;
        }
    }
    return "";
}