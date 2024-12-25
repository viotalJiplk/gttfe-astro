import { isIterable } from "../utils";
import { ApiObject, authFetch, ShowError } from "./utils";

export class Rank extends ApiObject{
    static types ={
        "rankId": Number,
        "rankName": String,
        "gameId": Number,
    }
    rankId: number;
    rankName: string;
    gameId: number;
    constructor(rankId = -1, rankName = "", gameId = -1) {
        super();
        this.rankId = rankId;
        this.rankName = rankName;
        this.gameId = gameId;
    }
}

export async function listRanks(gameId: number) {
    let res = await authFetch(`/backend/rank/list/${gameId}/`)
    let ranksObj = await res.json();
    let ranks: Rank[] = [];
    if (!isIterable(ranksObj)) {
        console.error(`/backend/rank/list/${gameId}/ responded with non iterable.`);
        throw new ShowError("Chyba serveru, kontaktujte prosím podporu.");
    }
    for (let schoolObj of ranksObj) {
        //@ts-expect-error
        ranks.push(Rank.fromObject(schoolObj));
    }
    return ranks;
}

export function getRankNameFromId(id: Number, ranks: Rank[]) {
    for (let rank of ranks) {
        if (rank.rankId === id) {
            return rank.rankName;
        }
    }
    return undefined;
}

export function getIdFromRankName(name: String, ranks: Rank[]) {
    for (let rank of ranks) {
        if (rank.rankName === name) {
            return rank.rankId;
        }
    }
    return -1;
}