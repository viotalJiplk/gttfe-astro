import { isIterable } from "../utils";
import { ApiObject, authFetch, ShowError } from "./utils";
export class School extends ApiObject{
    static types = {
        "schoolId": Number,
        "name": String
    };
    schoolId = -1;
    name = "";
    constructor(schoolId = -1, name = "") {
        super();
        this.schoolId = schoolId;
        this.name = name;
    }
}

export async function listSchools(){
    let res = await fetch(`/backend/school/listAll/`);
    let schoolsObj = await res.json();
    let schools: School[] = [];
    if (!isIterable(schoolsObj)) {
        console.error("/backend/school/listAll/ responded with non iterable.");
        throw new ShowError("Chyba serveru, kontaktujte prosím podporu.");
    }
    for (let schoolObj of schoolsObj) {
        //@ts-expect-error
        schools.push(School.fromObject(schoolObj));
    }
    return schools;
}

export function getSchoolNameFromId(id: Number, schools: School[]) {
    for (let school of schools) {
        if (school.schoolId === id) {
            return school.name;
        }
    }
    return undefined;
}

export function getIdFromSchoolName(name: String, schools: School[]) {
    for (let school of schools) {
        if (school.name === name) {
            return school.schoolId;
        }
    }
    return -1;
}