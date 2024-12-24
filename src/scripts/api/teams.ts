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
        "joinString": [String, undefined],
        "players": [Array, undefined]
    };
    name = "";
    teamId = -1;
    gameId = -1;
    joinString?: string;
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
    await authFetch(`/backend/team/id/${String(teamId)}/kick/${userId}/`, {
        method: 'DELETE'
    });
}