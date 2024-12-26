import { listGeneratedRolePermissions, type GeneratedRolePermission } from "../api/generatedRolePermissions";
import { generatedRoleNameFromId, listGeneratedRoles, type GeneratedRole } from "../api/generatedRoles";
import { getPlayerFromId, getPlayers, getUsersTeam, kickUser, newJoinString, Team } from "../api/teams";
import { ShowError } from "../api/utils";
import { loadingError } from "../loading";
import { showToastError } from "../toast";
import { storage, UserObject } from "../utils";

const main = document.getElementById("myTeams") as HTMLDivElement | null;
const loading = document.getElementById("myTeams-loading") as HTMLDivElement | null;
const teamsHolder = document.getElementById("myTeams-teamHolder") as HTMLDivElement | null;
const joinOverlayHolder = document.getElementById("myTeams-join-overlay-holder") as HTMLDivElement | null;
const joinStringHolder = document.getElementById("myTeams-join-joinString") as HTMLSpanElement | null;
const joinStringRegen = document.getElementById("myTeams-join-regen") as HTMLSpanElement | null;

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
                const button = document.createElement("button");
                button.innerText = "Přidat člena";
                button.setAttribute("data-teamId", String(team.teamId));
                button.setAttribute("data-gameId", String(team.gameId));
                button.setAttribute("data-joinString", team.joinString?team.joinString:"null");
                button.addEventListener("click", loadJoin);
                teamHolder.appendChild(button);
            }

            teamsHolder.appendChild(teamHolder);
        }
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

async function loadJoin(event: Event) {
    if (!(event.target instanceof HTMLElement)) {
        console.error("Event.target is not HTMLElement");
    } else {
        const teamId = Number(event.target.getAttribute("data-teamId"));
        const joinString = event.target.getAttribute("data-joinString");
        const gameId = Number(event.target.getAttribute("data-gameId"));
        if (Number.isNaN(teamId)) {
            console.error("TeamId is Nan");
        } else if (Number.isNaN(gameId)) {
            console.error("GameId is Nan");
        } else if (joinString === null) {
            console.error("joinString is null");
        } else if (joinStringRegen === null) {
            console.error("joinStringRegen is null");
        } else {
            if (joinStringHolder === null || joinOverlayHolder === null ) {
                console.error("joinStringHolder or joinOverlayHolder is null");
            } else {
                joinStringRegen.setAttribute("data-teamId", String(teamId));
                joinStringRegen.setAttribute("data-gameId", String(gameId));
                joinStringHolder.innerText = createJoinStringUrl(teamId, joinString, gameId);
                joinOverlayHolder.style.display = "block";
            }
        }
    }
}

async function regenJoinString(event: Event) {
    if (!(event.target instanceof HTMLElement)) {
        console.error("Event.target is not HTMLElement");
    } else {
        const teamId = Number(event.target.getAttribute("data-teamId"));
        const gameId = Number(event.target.getAttribute("data-gameId"));
        if (Number.isNaN(teamId)) {
            console.error("TeamId is Nan");
        } else if (Number.isNaN(gameId)) {
            console.error("GameId is Nan");
        } else {
            try {
                let joinString = await newJoinString(teamId);
                if (joinStringHolder === null || joinOverlayHolder === null ) {
                    console.error("joinStringHolder or joinOverlayHolder is null");
                } else if (joinString === null) {
                    console.error("joinString is null");
                    loadingError(loading);
                    showToastError("Neznámá chyba, kontaktujte prosím podporu.");
                } else {
                    joinStringHolder.innerText = createJoinStringUrl(teamId, joinString, gameId);
                    joinOverlayHolder.style.display = "block";
                }
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

function createJoinStringUrl(teamId: number, joinString: string, gameId: number) {
    if (joinString === "null" || joinString === "undefined") {
        return "";
    }
    const url = new URL(window.location.origin + "/team/join");
    url.searchParams.append("teamId", String(teamId));
    url.searchParams.append("gameId", String(gameId));
    url.searchParams.append("joinString", joinString);
    return url.toString();
}

if (joinStringRegen !== null) {
    joinStringRegen.addEventListener("click", regenJoinString);
} else {
    console.error("joinStringRegen not found");
}

loadTeams();

const joinHolderOverlay = document.getElementById("myTeams-join-overlay-holder");
const joinSpacer = document.getElementById("myTeams-join-spacer");
if(joinSpacer === null){
    console.error("joinSpacer not found");
} else if(joinHolderOverlay === null){
    console.error("joinHolderOverlay not found");
}else {
    joinSpacer.addEventListener("click", event =>{
        window.location.reload();
    });
}