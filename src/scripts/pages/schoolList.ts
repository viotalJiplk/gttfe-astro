import { listSchools, School } from "../api/schools";
import { ShowError } from "../api/utils";
import { loadingError } from "../loading";
import { showToastError } from "../toast";

const ul = document.getElementById("schoolList-list");
const loading = document.getElementById("schoolList-loading");
const main = document.getElementById("schools");
const input = document.getElementById("schoolList-input");
let schools: School[] = [];

async function loadSchools() {
    try {
        schools = await listSchools();
        render(schools);
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
}

function render(schools: School[]){
    if(ul !== null && loading !== null && main !== null){
        ul.innerHTML = "";
        schools.forEach(school => {
            let li = document.createElement("li");
            li.innerText = school.name;
            ul.appendChild(li);
        });
        main.style.display = "block";
        loading.style.display = "none";
    }else{
        console.error("loading or list or main not found");
    }
}

if(input !== null){
    input.addEventListener("keyup", event=>{
        if(event.target != null && "value" in event.target){
            const target = event.target as HTMLInputElement;
            let schoolsLocal = schools.filter(school =>{
                return school.name.toUpperCase().includes(target.value.toUpperCase());
            });
            render(schoolsLocal);
        }
    });
}

loadSchools();