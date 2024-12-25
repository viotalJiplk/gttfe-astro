import { isIterable } from "../utils";
import { ApiObject, authFetch, ShowError } from "./utils";

export class Game extends ApiObject {
    static types = {
        "name": String,
        "registrationStart": String,
        "registrationEnd": String,
        "maxTeams": Number,
        "gameId": Number,
        "backdrop": String,
        "icon": String
    }

    name: string;
    registrationStart: string;
    registrationEnd: string;
    maxTeams: number;
    gameId: number;
    backdrop: string;
    icon: string;
    constructor(name = "", registrationStart = "", registrationEnd = "", maxTeams = -1, gameId = -1, backdrop = "", icon = "") {
        super();
        this.name = name;
        this.registrationStart = registrationStart;
        this.registrationEnd = registrationEnd;
        this.maxTeams = maxTeams;
        this.gameId = gameId;
        this.backdrop = backdrop;
        this.icon = icon;
    }
}

export async function listGames() {
    let res = await authFetch('/backend/game/all/');
    let gamesObj = await res.json();
    let games: Game[] = [];
    if (!isIterable(gamesObj)) {
        console.error(`/game/all/responded with non iterable.`);
        throw new ShowError("Chyba serveru, kontaktujte prosím podporu.");
    }
    for (let gameObj of gamesObj) {
        //@ts-expect-error
        games.push(Game.fromObject(gameObj));
    }
    return games;
}

export function getGameNameFromId(id: Number, games: Game[]) {
    for (let game of games) {
        if (game.gameId === id) {
            return game.name;
        }
    }
    return undefined;
}

export function getIdFromGameName(name: String, games: Game[]) {
    for (let game of games) {
        if (game.name === name) {
            return game.gameId;
        }
    }
    return -1;
}