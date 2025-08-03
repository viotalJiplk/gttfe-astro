import { isIterable } from "../utils";
import { ApiObject, authFetch, ShowError } from "./utils";

export class TournamentEvent extends ApiObject {
    static types = {
        "date": String,
        "beginTime": String,
        "endTime": String,
        "gameId": Number,
        "description": String,
        "eventType": String,
        "eventId": Number
    };
    date: string;
    beginTime: string;
    endTime: string;
    gameId: number;
    description: string;
    eventType: string;
    eventId: number;
    constructor(date: string, beginTime: string, endTime: string, gameId: number, description: string, eventType: string, eventId: number) {
        super();
        this.date = date;
        this.beginTime = beginTime;
        this.endTime = endTime;
        this.gameId = gameId;
        this.description = description;
        this.eventType = eventType;
        this.eventId = eventId;
    }
}

export async function listEvents() {
    let res = await authFetch('/backend/event/listAll');
    if (res.ok === false && res.status !== 200) {
        console.error(`/backend/event/listAll returned code ${res.status}`)
        throw new ShowError("Chyba serveru, kontaktujte prosím podporu.");
    }
    res = await res.json();
    if (!isIterable(res)) {
        console.error(`/backend/event/listAll responded with non iterable.`);
        throw new ShowError("Chyba serveru, kontaktujte prosím podporu.");
    }

    const events: TournamentEvent[] = [];

    //@ts-expect-error
    for (const eventObject of res) {
        //@ts-expect-error
        events.push(TournamentEvent.fromObject(eventObject));
    }
    return events;
}

export class TournamentMatchEvent extends TournamentEvent {
    static types = {
        ...TournamentEvent.types,
        "matchId": Number,
        "stageId": Number,
        "firstTeamId": Number,
        "secondTeamId": Number,
        "firstTeamName": String,
        "secondTeamName": String,
        "firstTeamResult": Number,
        "secondTeamResult": Number,
        "stageName": String,
        "stageIndex": Number
    };

    matchId: number;
    stageId: number;
    firstTeamId: number;
    secondTeamId: number;
    firstTeamName: string;
    secondTeamName: string;
    firstTeamResult: number;
    secondTeamResult: number;
    stageName: string;
    stageIndex: number;

    constructor(
        matchId: number,
        stageId: number,
        firstTeamId: number,
        secondTeamId: number,
        firstTeamName: string,
        secondTeamName: string,
        firstTeamResult: number,
        secondTeamResult: number,
        stageName: string,
        stageIndex: number,
        date: string,
        beginTime: string,
        endTime: string,
        gameId: number,
        description: string,
        eventType: string,
        eventId: number
    ) {
        super(date, beginTime, endTime, gameId, description, eventType, eventId);
        this.matchId = matchId;
        this.stageId = stageId;
        this.firstTeamId = firstTeamId;
        this.secondTeamId = secondTeamId;
        this.firstTeamName = firstTeamName;
        this.secondTeamName = secondTeamName;
        this.firstTeamResult = firstTeamResult;
        this.secondTeamResult = secondTeamResult;
        this.stageName = stageName;
        this.stageIndex = stageIndex;
    }
}

export async function listAllMatches(eventId: number) {
    let res = await authFetch(`/backend/event/${eventId}/matches/`);
    if (res.ok === false && res.status === 404) {
        console.error(`/backend/event/listAll returned code ${res.status}`)
        throw new ShowError("Tento bracket neexistuje.");
    } else if (res.ok === false && res.status !== 200) {
        console.error(`/backend/event/listAll returned code ${res.status}`)
        throw new ShowError("Chyba serveru, kontaktujte prosím podporu.");
    }
    res = await res.json();
    if (!isIterable(res)) {
        console.error(`/backend/event/${eventId}/matches/`);
        throw new ShowError("Chyba serveru, kontaktujte prosím podporu.");
    }

    const matches: TournamentMatchEvent[] = [];

    //@ts-expect-error
    for (const eventObject of res) {
        //@ts-expect-error
        matches.push(TournamentMatchEvent.fromObject(eventObject));
    }
    return matches;
}
