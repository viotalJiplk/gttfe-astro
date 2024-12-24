import { ApiObject, authFetch, ShowError } from "./utils";

export class User extends ApiObject{
    static types = {
        "schoolId": Number,
        "name": String,
        "surname": String,
        "adult": Boolean,
        "camera": Boolean,
    };
    schoolId = -1;
    name = "";
    surname = "";
    adult = false;
    camera = false;

    constructor(schoolId = -1, name = "", surname = "", adult = false, camera = false) {
        super();
        this.schoolId = schoolId;
        this.name = name;
        this.surname = surname;
        this.adult = adult;
        this.camera = camera
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