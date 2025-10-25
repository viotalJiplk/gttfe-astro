import { listAllMatches, listEvents, TournamentEvent, TournamentMatchEvent } from "../../api/event";
import { ShowError } from "../../api/utils";
import { SvgEvent } from "./playoffRenderer/tournamentPrimitives";
import { ResizableSvg } from "./playoffRenderer/svgPrimitives";

const eventsHolder = document.getElementById("contestants-events-holder") as HTMLDivElement;
const eventsSelector = document.getElementById("contestants-events-selector") as HTMLDivElement;

function getBlankDiv() {
    const div = document.createElement("div");
    div.classList.add("blank");
    div.innerText = "Zatím nebylo publikováno";
    return div;
}

async function loadEvent(eventId: number, eventType: string) {
    eventsHolder.innerHTML = "";
    const matches = await listAllMatches(eventId);
    if (matches.length === 0) {
        eventsHolder.appendChild(getBlankDiv());
    } else {
        if (eventType === "PlayOff") {
            type MinifiedMatch = {
                team1: string | undefined;
                score1: number | undefined;
                team2: string | undefined;
                score2: number | undefined;
            };
            const grouped = matches.reduce((acc, item) => {
                const key = item.stageIndex;
                if (!acc[key]) {
                    acc[key] = [];
                }
                const itemMinified: MinifiedMatch = {
                    team1: item.firstTeamName,
                    score1: item.firstTeamResult,
                    team2: item.secondTeamName,
                    score2: item.secondTeamResult
                }
                acc[key].push(itemMinified);
                return acc;
            }, {} as Record<number, MinifiedMatch[]>);
            const preparedMatches: MinifiedMatch[][] = Object.entries(grouped)
                .sort(([a], [b]) => Number(a) - Number(b)) // sort by stageIndex
                .map(([_, value]) => value);
            for (let i = 0; i < preparedMatches.length; i++) {
                if ((i > 0) && (preparedMatches[i].length < (Math.ceil(preparedMatches[i - 1].length / 2)))) {
                    for (let j = preparedMatches[i].length; j < Math.ceil(preparedMatches[i - 1].length / 2); j++) {
                        preparedMatches[i].push({
                            team1: undefined,
                            score1: undefined,
                            team2: undefined,
                            score2: undefined,
                        });
                    }
                }
                if (((i + 1) == preparedMatches.length) && (preparedMatches[i].length > 1)) {
                    preparedMatches.push([]);
                    for (let j = 0; j < Math.ceil(preparedMatches[i].length / 2); j++) {
                        preparedMatches[i + 1].push({
                            team1: undefined,
                            score1: undefined,
                            team2: undefined,
                            score2: undefined,
                        });
                    }
                }
            }
            console.log(JSON.stringify(preparedMatches, null, 4));
            const root = new ResizableSvg([]);
            root.elem.classList.add("playoff");
            eventsHolder.appendChild(root.elem);

            const event = new SvgEvent(root.elem, 0, 0, preparedMatches, undefined)
            root.appendChild(event);
        }
    }
}

function renderEventSelector(events: TournamentEvent[], activeEvent: TournamentEvent | undefined) {
    eventsSelector.innerHTML = "";

    function createEventSelectorDiv(event: TournamentEvent) {
        const div = document.createElement("div");
        div.classList.add("eventSelectorItem");
        div.setAttribute("data-eventId", String(event.eventId));
        div.setAttribute("data-eventType", String(event.eventType));
        div.innerText = event.description;
        div.addEventListener("click", (event) => {
            if (event.target !== null && (event.target instanceof HTMLDivElement)) {
                if (event.target.parentElement !== null) {
                    Array.from(event.target.parentElement.getElementsByClassName("active")).forEach((elem) => {
                        elem.classList.remove("active");
                    })
                }
                event.target.classList.add("active");
                const eventId = event.target.getAttribute("data-eventId");
                const eventType = event.target.getAttribute("data-eventType");
                if (eventId === null || eventType === null) {
                    console.error("eventId or eventType is null")
                    throw new ShowError("Nastala chyba, prosím kontaktujte podporu");
                }
                loadEvent(Number(eventId), eventType);
            }
        });
        return div;
    }

    for (const event of events) {
        const div = createEventSelectorDiv(event);
        if (event === activeEvent) {
            div.classList.add("active");
        }
        eventsSelector.appendChild(div);
    }
}

async function loadEvents() {
    const gameId = Number(eventsHolder.getAttribute("data-gameId"))
    const events = await listEvents();
    // sort by date and end time
    const eventsSorted = events.filter((ev) => { return ev.gameId === gameId }).sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.endTime}`);
        const dateB = new Date(`${b.date}T${b.endTime}`);
        return dateA.getTime() - dateB.getTime();
    })

    let active = undefined;
    const dateNow = Date.now();
    for (const event of eventsSorted.reverse()) {
        if (active === undefined) {
            active = event;
        } else {
            const eventBeginTime = new Date(`${event.date}T${event.beginTime}`);
            const eventEndTime = new Date(`${event.date}T${event.endTime}`);
            if ((eventBeginTime.getTime() < dateNow) && (dateNow < eventEndTime.getTime())) {
                active = event;
            } else if (dateNow > eventEndTime.getTime()) {
                break;
            }
        }
    }

    renderEventSelector(eventsSorted.reverse(), active);
    if (active !== undefined) {
        loadEvent(Number(active.eventId), active.eventType);
    } else {
        eventsHolder.appendChild(getBlankDiv());
    }
}

loadEvents();
