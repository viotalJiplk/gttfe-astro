import { generatedRoleNameFromId, listGeneratedRoles } from "../../../scripts/api/generatedRoles";
import { listParticipating } from "../../../scripts/api/teams";
import { getGameFromGameName, listGames } from "../../api/game";

const teamsHolder = document.getElementById("contestants-TeamsHolder") as HTMLDivElement;
const teamsHolderNotParticipating = document.getElementById("contestants-TeamsHolder-notparticipating") as HTMLDivElement;

const gameName = teamsHolder.getAttribute("data-gameName") || "";

async function loadGame() {
    const allGames = await listGames();
    if (gameName === undefined) {
        console.error("gameName is undefined");
    } else {
        const game = getGameFromGameName(gameName, allGames);
        if(game === undefined){
            console.error("game is undefined");
        }else{
            const generatedRoles = await listGeneratedRoles(game.gameId);
            const teams = (await listParticipating(game.gameId)).sort((a, b) => {
                if (a.canPlaySince === undefined && b.canPlaySince === undefined) {
                    return (a.teamId > b.teamId)?1:-1;
                } else if (b.canPlaySince === undefined){
                    return 1;
                } else if (a.canPlaySince === undefined) {
                    return -1;
                } else {
                    return ((new Date(a.canPlaySince)) > (new Date(b.canPlaySince)))?1:-1;   
                }
            });
            let i = 1;
            for (const team of teams) {
                const teamElem = document.createElement('div');
                teamElem.classList.add("contestants-team");

                const teamNameAndIndex = document.createElement('h2');

                const teamIndex = document.createElement('span');
                if (i <= game.maxTeams) {
                    teamIndex.classList.add("contestants-team-teamIndex-participating");
                    teamIndex.innerText = String(i) + ". ";
                } else {
                    teamIndex.classList.add("contestants-team-teamIndex-notparticipating");
                    teamIndex.innerText = String(i-game.maxTeams) + ". ";
                }
                teamNameAndIndex.appendChild(teamIndex);

                const teamName = document.createElement('span');
                teamName.innerText = team.name;
                teamNameAndIndex.appendChild(teamName);

                teamElem.appendChild(teamNameAndIndex);

                const playersHolder = document.createElement('div');
                playersHolder.classList.add("contestants-players");
                teamElem.appendChild(playersHolder);

                if (team.players !== undefined) {
                    for (const player of team.players) {
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
                if (i <= game.maxTeams) {
                    teamsHolder.appendChild(teamElem);
                } else {
                    teamsHolderNotParticipating.appendChild(teamElem);
                }
                ++i;
            }
        }
    }
}
loadGame();