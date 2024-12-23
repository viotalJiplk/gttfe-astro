import { getIdFromSchoolName, getSchoolNameFromId, listSchools, School } from "./api/schools";
import { meInfo, updateInfo, User } from "./api/user";
import { ShowError } from "./api/utils";
import {loadingError} from "./loading";
import { addOptions } from "./selection";
import { showToastError, flashToastError } from "./toast";

let schools: School[] = [];

const main = document.getElementById("account-main") as HTMLFormElement | null;
const form = document.getElementById("account-form") as HTMLFormElement | null;
const loading = document.getElementById("account-loading") as HTMLDivElement | null;
const formInputs = {
    "name": document.getElementById("account-name") as HTMLInputElement,
    "surname": document.getElementById("account-surname") as HTMLInputElement,
    "school": document.getElementById("account-school") as HTMLInputElement,
    "adult": document.getElementById("account-adult") as HTMLInputElement,
    "tos": document.getElementById("account-tos") as HTMLInputElement,
    "camera": document.getElementById("account-camera") as HTMLInputElement,
}

async function load() {
    if (loading !== null && main !== null) {
        try {
            schools = await loadSchools();
            let user = await meInfo();
            formInputs.name.value = user.name;
            formInputs.surname.value = user.surname;
            formInputs.school.value = getSchoolNameFromId(user.schoolId, schools)||"";
            formInputs.adult.checked = user.adult;
            formInputs.camera.checked = user.camera;
            console.log(user);
            main.style.display = "block";
            loading.style.display = "none";   
        } catch (e) {
            if (e instanceof ShowError) {
                loadingError(loading);
                showToastError(e.message);
            } else {
                loadingError(loading);
                showToastError("Neznámá chyba, kontaktujte prosím podporu.");
                throw e;
            }
        }
    } else {
        console.error("Loading and main not found.");
    }
}

async function update() {
    if (loading !== null && main !== null) {
        if (!formInputs.tos.checked) {
            flashToastError("Musíte souhlasit s pravidly.");
        } else {
            let schoolId = getIdFromSchoolName(formInputs.school.value, schools);
            if (schoolId === -1 && formInputs.school.value !== "") {
                flashToastError("Neznámá škola.");
            } else {
                loading.style.display = "block";
                main.style.display = "none";
                let user = new User(
                    schoolId,
                    formInputs.name.value,
                    formInputs.surname.value,
                    formInputs.adult.checked,
                    formInputs.camera.checked
                );
                try {
                    await updateInfo(user);
                    await load();
                } catch (e) {
                    if (e instanceof ShowError) {
                        loadingError(loading);
                        flashToastError(e.message);
                    } else {
                        loadingError(loading);
                        showToastError("Neznámá chyba, kontaktujte prosím podporu.");
                        throw e;
                    }
                }
            }
        }
    } else {
        console.error("Loading and main not found.");
    }
}

async function loadSchools() {
    let schools = await listSchools();
    let options: string[] = [];
    schools.forEach(school => {
        options.push(school.name);
    });
    addOptions("account-selection", "account-school", options);
    return schools;
}

if (form === null) {
    console.error("Form not found");
} else {
    form.addEventListener("submit", event => {
        event.preventDefault();
        update();
    });
}

if (loading === null) {
    console.error("Loading not found");
} else {
    load();
}

