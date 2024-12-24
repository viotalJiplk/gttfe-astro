import { listGeneratedRolePermissions, type GeneratedRolePermission } from "./api/generatedRolePermissions";
import { generatedRoleNameFromId, listGeneratedRoles, type GeneratedRole } from "./api/generatedRoles";
import { getPlayerFromId, getPlayers, getUsersTeam, kickUser, Team } from "./api/teams";
import { ShowError } from "./api/utils";
import { loadingError } from "./loading";
import { showToastError } from "./toast";
import { storage, UserObject } from "./utils";

const main = document.getElementById("myTeams") as HTMLDivElement | null;
const loading = document.getElementById("myTeams-loading") as HTMLDivElement | null;
const teamsHolder = document.getElementById("myTeams-teamHolder") as HTMLDivElement | null;

async function loadTeams() {
    
    try {
        let teams = await getUsersTeam("@me");
        const userObject = storage.userObject;
        if (userObject === undefined) {
            console.error("Unknown userId.");
            throw new ShowError("Chyba serveru, prosím kontaktujte podporu.");
        }
        let teamsWithUser: Team[] = []
        let generatedRolePermissionsList: GeneratedRolePermission[][] = [];
        for (let team of teams) {
            let newTeam = await getPlayers(team.teamId);
            let player = getPlayerFromId(userObject.id, newTeam);
            if (player === undefined) {
                console.error("Unknown player.");
                throw new ShowError("Chyba serveru, prosím kontaktujte podporu.");
            }
            newTeam.joinString = team.joinString;
            teamsWithUser.push(newTeam);
            generatedRolePermissionsList[player.generatedRoleId] = await listGeneratedRolePermissions(player.generatedRoleId);
        }
        let genRoles = await listGeneratedRoles();
        render(teamsWithUser, genRoles, generatedRolePermissionsList, userObject);
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

function render(teams: Team[], generatedRoles: GeneratedRole[], generatedRolePermissionsList: GeneratedRolePermission[][], userObject: UserObject) {
    if (loading !== null && main !== null && teamsHolder !== null) {
        main.style.display = "block";
        loading.style.display = "none";
        for (const team of teams) {
            let player = getPlayerFromId(userObject.id, team);
            if (player === undefined) {
                console.error("Unknown player.");
                throw new ShowError("Chyba serveru, prosím kontaktujte podporu.");
            }
            const userId = player.userId;
            let kickTeam = false;
            for (let generatedRolePermission of generatedRolePermissionsList[player.generatedRoleId]) {
                if (generatedRolePermission.permission == "team.kickTeam") {
                    kickTeam = true;
                    break;
                }
            }

            const teamHolder = document.createElement("div");
            teamHolder.classList.add("myTeams-team");
            teamHolder.setAttribute("data-teamId", String(team.teamId));

            const h2 = document.createElement("h2");
            h2.innerText = team.name;
            teamHolder.appendChild(h2);

            const playersHolder = document.createElement("div");
            playersHolder.classList.add("myTeams-playersHolder");
            teamHolder.appendChild(playersHolder);
            if (team.players !== undefined) {
                for (let player of team.players) {
                    const playerElem = document.createElement("div");
                    playerElem.classList.add("myTeams-player");
                    playerElem.setAttribute("data-userId", player.userId);
                    playersHolder.appendChild(playerElem);

                    const nick = document.createElement("div");
                    nick.classList.add("myTeams-nick");
                    nick.innerText = player.nick;
                    playerElem.appendChild(nick);

                    const roleName = document.createElement("div");
                    roleName.classList.add("myTeams-roleName");
                    roleName.innerText = generatedRoleNameFromId(player.generatedRoleId, generatedRoles);
                    playerElem.appendChild(roleName);

                    const kickHolder = document.createElement("div");
                    kickHolder.classList.add("myTeams-kickHolder");
                    playerElem.appendChild(kickHolder);

                    const spacer = document.createElement("div");
                    spacer.classList.add("myTeams-spacer");
                    kickHolder.appendChild(spacer);

                    if (player.userId === userId) {
                        const kick = document.createElement("button");
                        kick.classList.add("myTeams-kick");
                        kick.innerText = "Opustit tým";
                        kick.setAttribute("data-teamId", String(team.teamId));
                        kick.setAttribute("data-userId", "@me");
                        kick.addEventListener("click", kickUserHandler);
                        kickHolder.appendChild(kick);
                    }else if (kickTeam) {
                        const kick = document.createElement("button");
                        kick.classList.add("myTeams-kick");
                        kick.innerText = "Vyhodit";
                        kick.setAttribute("data-teamId", String(team.teamId));
                        kick.setAttribute("data-userId", player.userId);
                        kick.addEventListener("click", kickUserHandler);
                        kickHolder.appendChild(kick);
                    }
                }
            }

            if (team.joinString !== undefined) {
                const a = document.createElement("a");
                a.innerText = "Přidat člena";
                teamHolder.appendChild(a);
            }

            teamsHolder.appendChild(teamHolder);
        }
        console.log(teams);
    } else {
        console.error("loading or teamsHolder or main not found");
    }
}

async function kickUserHandler(event: Event) {
    if (loading !== null && main !== null) {
        main.style.display = "none";
        loading.style.display = "block";
        if (event.target === null) {
            console.error("Event.target is null");
        } else {
            if (!(event.target instanceof HTMLElement)) {
                console.error("Event.target is not HTMLElement");
            } else {
                const teamId = Number(event.target.getAttribute("data-teamId"));
                const userId = event.target.getAttribute("data-userId");
                if (Number.isNaN(teamId)) {
                    console.error("TeamId is Nan");
                }else if (userId === null) {
                    console.error("UserId is null");
                } else {
                    try {
                        await kickUser(teamId, userId);
                        window.location.reload();
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
            }
        }
    } else {
        console.error("loading or main not found");
    }
}

loadTeams();