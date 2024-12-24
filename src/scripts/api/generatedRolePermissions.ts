import { isIterable } from "../utils";
import { ApiObject, authFetch, ShowError } from "./utils";

export class GeneratedRolePermission extends ApiObject{
    static types = {
        "generatedRolePermissionId": Number,
        "permission": String,
        "generatedRoleId": Number,
        "gameId": Number,
        "eligible": Boolean
    }

    generatedRolePermissionId: number;
    permission: string;
    generatedRoleId: number;
    gameId: number;
    eligible: boolean;
    constructor(generatedRolePermissionId = -1, permission = "", generatedRoleId = -1, gameId = -1, eligible = false) {
        super();
        this.generatedRolePermissionId = generatedRolePermissionId;
        this.permission = permission;
        this.generatedRoleId = generatedRoleId; 
        this.gameId = gameId;
        this.eligible = eligible;
    }
}

export async function listGeneratedRolePermissions(generatedRolePermissionId: number) {
    let res = await authFetch(`/backend/generatedRole/${generatedRolePermissionId}/permissions/`);
    let permissionsObjects= await res.json();
    let permission: GeneratedRolePermission[] = [];
    if (!isIterable(permissionsObjects)) {
        console.error(`/generatedRole/${generatedRolePermissionId}/permissions/ responded with non iterable.`);
        throw new ShowError("Chyba serveru, kontaktujte prosím podporu.");
    }
    for (let permissionObj of permissionsObjects) {
        //@ts-expect-error
        permission.push(GeneratedRolePermission.fromObject(permissionObj));
    }
    return permission;
}