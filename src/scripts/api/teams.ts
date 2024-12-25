import { isIterable } from "../utils";
import { ApiObject, authFetch, ShowError } from "./utils"

class Player extends ApiObject {
    static types = {
        "userId": String,
        "nick": String,
        "generatedRoleId": Number
    };
    userId: string = "";
    nick: string = "";
    generatedRoleId: number = -1;
    constructor(userId = "", nick = "", generatedRoleId = -1) {
        super();
        this.userId = userId;
        this.nick = nick;
        this.generatedRoleId = generatedRoleId;
    }
}

export class Team extends ApiObject {
    static types = {
        "name": String,
        "teamId": Number,
        "gameId": Number,
        "joinString": [String, undefined, null],
        "players": [Array, undefined]
    };
    name = "";
    teamId = -1;
    gameId = -1;
    joinString?: string | null;
    players?: Player[];
    constructor(name: string = "", teamId: number = -1, gameId: number = -1, joinString: string | undefined = undefined, players: Player[] | undefined = undefined) {
        super();
        this.name = name;
        this.teamId = teamId;
        this.gameId = gameId;
        this.joinString = joinString;
        this.players = players;
    }
}

/**
 * Returns users teams
 * @param userId userId or '@me'
 */
export async function getUsersTeam(userId: string) {
    let usersTeams: Team[] = [];
    let res = await authFetch(`/backend/user/${userId}/teams/`);
    let teamsObjects = await res.json();
    if (!isIterable(teamsObjects)) {
        console.error(`/backend/user/${userId}/teams/ responded with non iterable.`);
        throw new ShowError("Chyba serveru, kontaktujte prosím podporu.");
    }
    for (let teamObj of teamsObjects) {
        //@ts-expect-error
        usersTeams.push(Team.fromObject(teamObj));
    }
    return usersTeams;
}

export async function getPlayers(teamId: number): Promise<Team> {
    let players: Player[] = [];
    let res = await authFetch(`/backend/team/id/${teamId}/`);
    let teamObject = await res.json();
    if (!isIterable(teamObject.Players)) {
        console.error(`/backend/team/id/${teamId}/ responded with non iterable.`);
        throw new ShowError("Chyba serveru, kontaktujte prosím podporu.");
    }
    for (let playerObj of teamObject.Players) {
        //@ts-expect-error
        players.push(Player.fromObject(playerObj));
    }
    let team = Team.fromObject(teamObject) as Team;
    team.players = players;
    return team;
}

export function getPlayerFromId(userId: string, team: Team) {
    if (team.players === undefined) {
        return undefined;
    } else {
        for (const player of team.players) {
            if (player.userId === userId) {
                return player;
            }
        }
        return undefined
    }
}

export async function kickUser(teamId: number, userId: string) {
    let res = await authFetch(`/backend/team/id/${String(teamId)}/kick/${userId}/`, {
        method: 'DELETE'
    });
    if (res.status !== 200) {
        throw new ShowError("Chyba serveru, kontaktujte prosím podporu.");
    }
}

export async function newJoinString(teamId: number) {
    const res = await authFetch(`/backend/team/id/${teamId}/joinString/`);
    if (res.status !== 200) {
        console.error(res);
        throw new ShowError("Chyba serveru, kontaktujte prosím podporu.");
    } else {
        const response = await res.json();
        if (!("joinString" in response)) {
            console.error("Response is missing joinString.");
            throw new ShowError("Chyba serveru, kontaktujte prosím podporu.");
        } else {
            return String(response.joinString);
        }
    }
}

async function errorTest(response: Response) {
    let resObj = await response.json();
    if(resObj){
        if (response.status === 403) {
            if (resObj.msg === "Team full or you are in another team for this game.") {
                throw new ShowError("Tým je plný nebo již jste v jiném týmu pro tuto hru.");
            } else if (resObj.msg === "Game not found.") {
                throw new ShowError("Hra nebyla nalezena.");
            } else if (resObj.msg === "Wrong joinString.") {
                throw new ShowError("Špatny link pro připojení do týmu.");
            } else if (resObj.msg === "Already registered for game.") {
                throw new ShowError("Již jste v jiném týmu pro tuto hru.");
            } else if (resObj.msg === "This team already has the maximum number of players permitted in this role.") {
                throw new ShowError("Tato role je v tomto týmu již plně obsazena.");
            }  else if (resObj.msg === "Missing nick, rank, max_rank or role." || resObj.msg === "Missing game_id or name." || resObj.msg === "Missing nick, rank, or max_rank of capitain.") {
                throw new ShowError("Chyba požadavku.");
            } else {
                console.error(response.status);
                throw new ShowError("Neznámá chyba. Zkuste akci opakovat později.");
            }
        } else if (response.status === 404) {
            if (resObj.msg === "User is not in database.") {
                throw new ShowError("Nejste zaregistrován v systému.");
            } else {
                console.error(response.status);
                throw new ShowError("Neznámá chyba. Zkuste akci opakovat později.");
            }
        } else if (response.status === 410) {
            throw new ShowError("Registrace ještě nezačala nebo už byla ukončena.");
        } else if (response.status === 400) {
            if (resObj.msg === 'You have not filled info required for creating Team.') {
                throw new ShowError("Nemáte zadané informace potřebné k připojení k týmu. Nastavte je v záložce Váš profil.");
            } else {
                console.error(response.status);
                throw new ShowError("Neznámá chyba. Zkuste akci opakovat později.");
            }
        } else {
            return resObj;
        }
    } else {
        console.error(response.status + " Odpověď nemá tělo.");
        throw new ShowError("Neznámá chyba. Zkuste akci opakovat později.");
    }
}

export async function join(teamId: number, joinString: string, nick: string, rank: number, maxRank: number, role: number) {
    let res = await authFetch(`/backend/team/id/${String(teamId)}/join/${joinString}/`, {
        "method": "POST",
        "headers": {
            "Content-Type": "application/json"
        },
        "body": JSON.stringify({
            "nick":nick,
            "rank": rank,
            "maxRank": maxRank,
            "generatedRoleId": role
        })
    });
    return await errorTest(res);
}

export async function create(name: string, gameId: number, nick: string, rank: number, maxRank: number) {
    let res = await authFetch("/backend/team/create/", {
        "method": "POST",
        "headers": {
            "Content-Type": "application/json"
        },
        "body": JSON.stringify({
            "name": name,
            "gameId": gameId,
            "nick": nick,
            "rank": rank,
            "maxRank": maxRank
        })
    });
    return await errorTest(res);
}