import { generatedRoleNameFromId, listGeneratedRoles } from "../../../scripts/api/generatedRoles";
import { listParticipatingPlayers } from "../../../scripts/api/teams";
import { getGameFromGameName, listGames } from "../../api/game";
import { getRankNameFromId, listRanks } from "../../api/ranks";

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
            const ranks = await listRanks(game.gameId)
            if(ranks == undefined){
                console.error("no ranks found");
            } else {
                let ranksMaxLength = 0;
                for(let rank of ranks){
                    if(rank.rankName.length > ranksMaxLength){
                        ranksMaxLength = rank.rankName.length
                    }
                }
                const generatedRoles = await listGeneratedRoles(game.gameId);
                const teams = (await listParticipatingPlayers(game.gameId)).sort((a, b) => {
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
                    const teamHolder = document.createElement('tr');
                    teamHolder.classList.add("contestants-teamHolder");
                    teamHolder.style.backgroundColor = "initial";
                    const teamElem = document.createElement('td');
                    teamElem.setAttribute("colspan", "4")
                    teamElem.classList.add("contestants-team");
                    teamHolder.appendChild(teamElem);

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

                    if (i <= game.maxTeams) {
                        teamsHolder.appendChild(teamHolder);
                    } else {
                        teamsHolderNotParticipating.appendChild(teamHolder);
                    }


                    if (team.players !== undefined) {
                        for (const player of team.players) {
                            const playerElem = document.createElement("tr");
                            playerElem.classList.add("contestants-player");
                            if (i <= game.maxTeams) {
                                teamsHolder.appendChild(playerElem);
                            } else {
                                teamsHolderNotParticipating.appendChild(playerElem);
                            }

                            const nick = document.createElement("td");
                            nick.classList.add("contestants-nick");
                            nick.innerText = player.nick;
                            playerElem.appendChild(nick);

                            const roleName = document.createElement("td");
                            roleName.classList.add("contestants-roleName");
                            roleName.innerText = generatedRoleNameFromId(player.generatedRoleId, generatedRoles);
                            playerElem.appendChild(roleName);

                            const rank = document.createElement("td");
                            rank.classList.add("contestants-rank");
                            rank.innerText = getRankNameFromId(player.rank, ranks) || "Neznámý rank";
                            playerElem.appendChild(rank);


                            const maxRank = document.createElement("td");
                            maxRank.classList.add("contestants-maxRank");
                            maxRank.innerText = getRankNameFromId(player.maxRank, ranks) || "Neznámý rank";
                            playerElem.appendChild(maxRank);
                        }
                    }
                    ++i;
                }
            }
        }
    }
}
loadGame();
