import { generatedRoleNameFromId, listGeneratedRoles } from "../../../scripts/api/generatedRoles";
import { listParticipating } from "../../../scripts/api/teams";

    const nav = {
        "generalRules": document.getElementById("GttLayoutGames-generalRules") as HTMLLinkElement,
        "rules": document.getElementById("GttLayoutGames-rules") as HTMLLinkElement,
        "bracket": document.getElementById("GttLayoutGames-bracket") as HTMLLinkElement,
        "contestants": document.getElementById("GttLayoutGames-contestants") as HTMLLinkElement,
    }
    const teamsHolder = document.getElementById("contestants-TeamsHolder") as HTMLDivElement;
    const gameId = Number(teamsHolder.getAttribute("data-gameId") || "-1");
    const gameName = teamsHolder.getAttribute("data-gameName") || "";
    nav.generalRules.href = "/games/rules/";
    nav.generalRules.classList.remove("disabled");

    async function loadGame(){
        if(gameId < 0){
            console.error("GameId not found.");
        }else{
            nav.rules.href = `/games/rules/${gameName}`;
            nav.rules.classList.remove("disabled");
            
            const generatedRoles = await listGeneratedRoles(gameId);
            const teams = await listParticipating(gameId);
            for(const team of teams){
                const teamElem = document.createElement('div');
                teamElem.classList.add("contestants-team");
                
                const teamName = document.createElement('h2');
                teamName.innerText = team.name;
                teamElem.appendChild(teamName);

                const playersHolder = document.createElement('div');
                playersHolder.classList.add("contestants-players");
                teamElem.appendChild(playersHolder);

                if(team.players !== undefined){
                    for(const player of team.players){
                        const playerElem = document.createElement("div");
                        playerElem.classList.add("contestants-player");
                        playersHolder.appendChild(playerElem);

                        const nick = document.createElement("div");
                        nick.classList.add("contestants-nick");
                        nick.innerText = player.nick;
                        playerElem.appendChild(nick);

                        const spacer = document.createElement("div");
                        spacer.classList.add("contestants-spacer");
                        playerElem.appendChild(spacer);

                        const roleName = document.createElement("div");
                        roleName.classList.add("contestants-roleName");
                        roleName.innerText = generatedRoleNameFromId(player.generatedRoleId, generatedRoles);
                        playerElem.appendChild(roleName);
                    }
                }

                teamsHolder.appendChild(teamElem);
            }
        }
    }
    loadGame();