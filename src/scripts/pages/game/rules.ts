import { getGameFromGameName, listGames } from "../../api/game";
import { listGeneratedRoles } from "../../api/generatedRoles";

const nav = {
    "generalRules": document.getElementById("GttLayoutGames-generalRules") as HTMLLinkElement,
    "rules": document.getElementById("GttLayoutGames-rules") as HTMLLinkElement,
    "bracket": document.getElementById("GttLayoutGames-bracket") as HTMLLinkElement,
    "contestants": document.getElementById("GttLayoutGames-contestants") as HTMLLinkElement,
}
nav.generalRules.href = "/games/rules/";
nav.generalRules.classList.remove("disabled");

function formateDate(date: Date|undefined){
    if(date === undefined){
        return "již brzy";
    }else{
        return `${date.getDate()}. ${date.getMonth() + 1}. ${date.getHours()}:${date.getMinutes()}`
    }
}

const registration = document.getElementById("gameRules-registrationTime") as HTMLDivElement;
const gameRolesHolder = document.getElementById("gameRules-gameRoles") as HTMLDivElement;
// const gameRulesH1 = document.getElementById("gameRules-h1") as HTMLHeadingElement;
// const gameId = Number(gameRulesH1.getAttribute("data-gameId") || "-1");
const url = window.location.href;
const gameName = decodeURIComponent(url.split('/').filter(Boolean).pop()||"");

async function loadGame(){
    const allGames = await listGames();
    if(gameName === undefined){
        console.error("gameName is undefined");
    }else{
        const game = getGameFromGameName(gameName, allGames);
        if(game === undefined){
            console.error("game is undefined");
        }else{
            nav.contestants.href = `/games/contestants/${game.name}`;
            nav.contestants.classList.remove("disabled");

            const registrationStart = game.registrationStart?new Date(game.registrationStart): undefined;
            const registrationEnd = game.registrationEnd?new Date(game.registrationEnd): undefined;
            registration.innerText = `${formateDate(registrationStart)} - ${formateDate(registrationEnd)}`;
            const gameRoles = await listGeneratedRoles(game.gameId);
            if(gameRoles.length > 0){
                const table = document.createElement('table');
                table.classList.add("GttLayoutGames-table");

                const thead = document.createElement('thead');
                const headerRow = document.createElement('tr');

                const headerRole = document.createElement('th');
                const headerRoleSpan = document.createElement('span');
                headerRoleSpan.innerText = "ROLE";
                headerRole.appendChild(headerRoleSpan);
                headerRow.appendChild(headerRole);

                const headerMin = document.createElement('th');
                const HeaderMinSpan = document.createElement('span');
                HeaderMinSpan.innerText = "MIN";
                headerMin.appendChild(HeaderMinSpan);
                headerRow.appendChild(headerMin);

                const headerMax = document.createElement('th');
                const headerMaxSpan = document.createElement('span');
                headerMaxSpan.innerText = "MAX";
                headerMax.appendChild(headerMaxSpan);
                headerRow.appendChild(headerMax);

                thead.appendChild(headerRow);
                
                const tbody = document.createElement('tbody');

                for(const gameRole of gameRoles){
                    const row = document.createElement('tr');

                    const name = document.createElement('td');
                    name.textContent = String(gameRole.roleName);
                    row.appendChild(name);

                    const min = document.createElement('td');
                    min.textContent = String(gameRole.minimal);
                    row.appendChild(min);

                    const max = document.createElement('td');
                    max.textContent = String(gameRole.maximal);
                    row.appendChild(max);

                    tbody.appendChild(row);
                }
                table.appendChild(thead);
                table.appendChild(tbody);
                gameRolesHolder.appendChild(table);
            }
        }
    }
}
loadGame();