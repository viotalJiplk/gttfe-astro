import { authFetch, ShowError } from "./utils";

export class User{
    schoolId = -1;
    name = "";
    surname = "";
    adult = false;
    camera = false;

    constructor(schoolId = -1, name = "", surname = "", adult = false, camera = false) {
        this.schoolId = schoolId;
        this.name = name;
        this.surname = surname;
        this.adult = adult;
        this.camera = camera
    }

    static fromObject(obj: Object) {
        if (typeof obj !== 'object' || obj === null) {
            console.error("Object wrong type.");
            throw new ShowError("Chyba serveru, kontaktujte prosím podporu.");
        } else if (!("schoolId" in obj)) {
            console.error("Object does not have schoolId.");
            throw new ShowError("Chyba serveru, kontaktujte prosím podporu.");
        } else if (!("name" in obj)) {
            console.error("Object does not have name.");
            throw new ShowError("Chyba serveru, kontaktujte prosím podporu.");
        } else if (!("surname" in obj)) {
            console.error("Object does not have surname.");
            throw new ShowError("Chyba serveru, kontaktujte prosím podporu.");
        } else if (!("adult" in obj)) {
            console.error("Object does not have adult.");
            throw new ShowError("Chyba serveru, kontaktujte prosím podporu.");
        } else if (!("camera" in obj)) {
            console.error("Object does not have camera.");
            throw new ShowError("Chyba serveru, kontaktujte prosím podporu.");
        }
        return new User(Number(obj.schoolId), String(obj.name), String(obj.surname), Boolean(obj.adult), Boolean(obj.camera));
    }
}

export async function meInfo() {
    let res = await authFetch("/backend/user/@me/");
    let response = await res.json();
    if (!("schoolId" in response) || (response.schoolId === null)) {
        response.schoolId = -1;
    }
    if (!("name" in response) || (response.name === "\"\"")) {
        response.name = "";
    }
    if (!("surname" in response) || (response.surname === "\"\"")) {
        response.surname = "";
    }
    if (!("adult" in response) || (response.adult === "\"\"")) {
        response.adult = false;
    }
    if (!("camera" in response) || (response.camera === "\"\"")) {
        response.camera = false;
    }
    return User.fromObject(response);
}

export async function updateInfo(newInfo: User) {
    const body: {
        name: string,
        surname: string,
        adult: boolean,
        schoolId?: number,
        camera: boolean
    } = {
        "name": newInfo.name,
        "surname": newInfo.surname,
        "adult": newInfo.adult,
        "camera": newInfo.camera
    };
    if (newInfo.schoolId !== -1) {
        body.schoolId = newInfo.schoolId;
    }
    const response = await authFetch('/backend/user/@me/', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    if (response.status === 404) {
        throw new ShowError("Nic nebylo změněno.");
    } else if (response.status !== 205 && response.status !== 200) {
        throw new ShowError("Neznámá chyba, kontaktujte prosím podporu.");
    }
}