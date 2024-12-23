import { isIterable } from "../utils";
import { authFetch, ShowError } from "./utils";
export class School{
    schoolId = -1;
    name = "";
    constructor(schoolId = -1, name = "") {
        this.schoolId = schoolId;
        this.name = name;
    }

    static fromObject(obj: Object) {
        if (typeof obj !== 'object' || obj === null || !(("schoolId" in obj) && ("name" in obj))) {
            console.error("Missing schoolId or schoolName in object.");
            throw new ShowError("Chyba serveru, kontaktujte prosím podporu.");
        }
        return new School(Number(obj.schoolId), String(obj.name));
    }
}

export async function listSchools(){
    let res = await authFetch("/backend/school/listAll/");
    let schoolsObj = await res.json();
    let schools: School[] = [];
    if (!isIterable(schoolsObj)) {
        console.error("/backend/school/listAll/ responded with non iterable.");
        throw new ShowError("Chyba serveru, kontaktujte prosím podporu.");
    }
    for (let schoolObj of schoolsObj){
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