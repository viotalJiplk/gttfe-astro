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
    eventType = eventType.toLowerCase();
    const matches = await listAllMatches(eventId);
    if (matches.length === 0) {
        eventsHolder.appendChild(getBlankDiv());
    } else {
        if (eventType === "playoff") {
            type MinifiedMatch = {
                team1: string | undefined;
                score1: number | undefined;
                id1: number | undefined;
                team2: string | undefined | null;
                score2: number | undefined;
                id2: number | undefined;
            };
            const dummyMatch = {
                            team1: undefined,
                            score1: undefined,
                            id1: undefined,
                            team2: undefined,
                            score2: undefined,
                            id2: undefined
                        };

            const grouped = matches.reduce((acc, item) => {
                const key = item.stageIndex;
                if (!acc[key]) {
                    acc[key] = [];
                }
                const itemMinified: MinifiedMatch = {
                    team1: item.firstTeamName,
                    score1: item.firstTeamResult,
                    id1: item.firstTeamId,
                    team2: item.firstTeamId === item.secondTeamId ? null : item.secondTeamName,
                    score2: item.secondTeamResult,
                    id2: item.secondTeamId
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
                        preparedMatches[i].push(dummyMatch);
                    }
                }
                if (((i + 1) === preparedMatches.length) && (preparedMatches[i].length > 1)) {
                    preparedMatches.push([]);
                    for (let j = 0; j < Math.ceil(preparedMatches[i].length / 2); j++) {
                        preparedMatches[i + 1].push(dummyMatch);
                    }
                }
            }
            console.log(JSON.stringify(preparedMatches, null, 4));

            const continuousMatches = new Array<MinifiedMatch[]>(preparedMatches.length);

            if (preparedMatches.length > 0 && preparedMatches[preparedMatches.length - 1].length > 0) {
                continuousMatches[continuousMatches.length - 1] = preparedMatches[preparedMatches.length - 1];
            }

            for (let stage = continuousMatches.length - 1; stage > 0; stage--) {
                continuousMatches[stage - 1] = [];
                for (const match of continuousMatches[stage]) {

                    if (match.id1 === undefined || match.id2 === undefined){
                        // Stage is not finished => copy lower stage from prepared matches and start sorting the next
                        continuousMatches[stage - 1] = preparedMatches[stage - 1];
                        break;
                    }

                    const findDependency = (teamId: number) => preparedMatches[stage - 1].findIndex(x => x.id1 === teamId || x.id2 === teamId);

                    if (match.id1 === match.id2) {
                        const dependencyIndex = findDependency(match.id1);
                        if (dependencyIndex === -1) {
                            console.error(`Missing match dependency for team ${match.team1}`)
                            continuousMatches[stage - 1].push(dummyMatch);
                            continue;
                        }
                        continuousMatches[stage - 1].push(preparedMatches[stage - 1][dependencyIndex]);
                        continue;
                    }

                    const dependencyIndex1 = findDependency(match.id1);
                    if (dependencyIndex1 === -1) {
                        console.error(`Missing match dependency for team ${match.team1}`)
                        continuousMatches[stage - 1].push(dummyMatch);
                    } else {
                        continuousMatches[stage - 1].push(preparedMatches[stage - 1][dependencyIndex1]);
                    }

                    const dependencyIndex2 = findDependency(match.id2);
                    if (dependencyIndex2 === -1) {
                        console.error(`Missing match dependency for team ${match.team2}`)
                        continuousMatches[stage - 1].push(dummyMatch);
                    } else {
                        continuousMatches[stage - 1].push(preparedMatches[stage - 1][dependencyIndex2]);
                    }
                }
            }
            console.log(JSON.stringify(continuousMatches, null, 4));

            const root = new ResizableSvg([]);
            root.elem.classList.add("playoff");
            eventsHolder.appendChild(root.elem);

            const event = new SvgEvent(root.elem, 0, 0, continuousMatches, undefined)
            root.appendChild(event);
        } else if (eventType.startsWith("swiss")) {
            const threshold = Number(eventType.slice("swiss,".length)?? "-1");
            if (threshold === -1 || Number.isNaN(threshold)) {
                eventsHolder.appendChild(getBlankDiv());
                console.debug(`Malformed event type: ${eventType}`);
                return;
            }

            type MinifiedMatch = {
                team1: string;
                score1: number;
                id1: number;
                team2: string;
                score2: number;
                id2: number;
            };
            type Score = {
              wins: number;
              losses: number;
            };
            let stageCount = 0;
            const teamScores = {} as Record<number, Score>;
            const stageMatches = matches.reduce((acc, item) => {
                const key = item.stageIndex;
                if (!acc[key]) {
                    acc[key] = [];
                    stageCount++;
                }
                if (!teamScores[item.firstTeamId]) {
                    teamScores[item.firstTeamId] = {wins: 0, losses: 0};
                }
                if (!teamScores[item.secondTeamId]) {
                    teamScores[item.secondTeamId] = {wins: 0, losses: 0};
                }

                const minified: MinifiedMatch = {
                    team1: item.firstTeamName,
                    score1: item.firstTeamResult,
                    id1: item.firstTeamId,
                    team2: item.secondTeamName,
                    score2: item.secondTeamResult,
                    id2: item.secondTeamId,
                };
                acc[key].push(minified);
                return acc;
            }, {} as Record<number, MinifiedMatch[]>);


            const root = document.createElement("div");
            root.style.display = "flex";
            root.style.justifyContent = "center";
            root.style.flexDirection = "row";
            root.style.flexWrap = "wrap";
            eventsHolder.appendChild(root);

            for (let i = 0; i < stageCount; i++) {
                if (i > 0) {
                    // Count current wins and losses
                    for (let j = 0; j < stageMatches[i-1].length; j++) {
                        const match = stageMatches[i-1][j];

                        if (match.score1 > match.score2) {
                            teamScores[match.id1].wins++;
                            teamScores[match.id2].losses++;
                        }  else if (match.score2 > match.score1) {
                            teamScores[match.id2].wins++;
                            teamScores[match.id1].losses++;
                        } else {
                            console.error(`Invalid state! ${match.team1} vs ${match.team2} result is indeterminate. This might cause issues with the bracket.`);
                        }
                    }
                    stageMatches[i].sort((a, b) =>
                        (teamScores[b.id1].wins + teamScores[b.id2].wins) - (teamScores[a.id1].wins + teamScores[a.id2].wins)
                    ) // sort by score in descending order
                }

                const stageContainer = document.createElement("table");
                stageContainer.style.margin = "1em";

                const stageCaption = document.createElement("caption");
                stageCaption.innerText = `${i + 1}. kolo`;
                stageContainer.appendChild(stageCaption);

                for (let j = 0; j < stageMatches[i].length; j++) {
                    const match = stageMatches[i][j];
                    const matchContainer = document.createElement("tr");

                    addCell(matchContainer, String(match.score1));
                    const team1Cell = addCell(matchContainer, match.team1);
                    if (teamScores[match.id1].wins === threshold - 1 && match.score1 > match.score2) {
                        team1Cell.style.backgroundColor = "#4F9D69";
                    } else if (teamScores[match.id1].losses === threshold -1 && match.score1 < match.score2) {
                        team1Cell.style.backgroundColor = "#C33C54";
                    }

                    addCell(matchContainer, "VS");

                    const team2Cell = addCell(matchContainer, match.team2);
                    if (teamScores[match.id2].wins === threshold - 1 && match.score2 > match.score1) {
                        team2Cell.style.backgroundColor = "#4F9D69";
                    } else if (teamScores[match.id2].losses === threshold -1 && match.score2 < match.score1) {
                        team2Cell.style.backgroundColor = "#C33C54";
                    }

                    addCell(matchContainer, String(match.score2));

                    stageContainer.appendChild(matchContainer);
                }

                root.appendChild(stageContainer);
            }
        } else if (eventType.startsWith("groups")) {
            type MinifiedMatch = {
                team1: string;
                id1: number;
                score1: number;
                team2: string;
                id2: number;
                score2: number;
                stageIndex: number;
            }

            type Group = {
                name: string;
                matches: MinifiedMatch[];
            }

            const groupIndexes: string[] = [];
            const groups = matches.reduce((acc, item) => {
                const groupName = item.stageName.split("-", 2)[0].trimEnd();
                if (!acc[groupName]) {
                    acc[groupName] = {name: groupName, matches: []};
                    groupIndexes.push(groupName);
                }

                const minified = {
                    team1: item.firstTeamName,
                    id1: item.firstTeamId,
                    score1: item.firstTeamResult,
                    team2: item.secondTeamName,
                    id2: item.secondTeamId,
                    score2: item.secondTeamResult,
                    stageIndex: item.stageIndex
                }
                acc[groupName].matches.push(minified);
                return acc;
            }, {} as Record<string, Group>);

            const root = document.createElement("div");
            root.style.display = "flex";
            root.style.flexDirection = "column";
            root.style.alignItems = "center";
            eventsHolder.appendChild(root);

            groupIndexes.sort();
            for (const index of groupIndexes) {
                const group = groups[index];
                group.matches.sort((a, b) => a.stageIndex - b.stageIndex);

                const groupLabel = document.createElement("h3");
                groupLabel.innerText = `Skupina ${index}`;
                root.appendChild(groupLabel);

                const groupContainer = document.createElement("div");
                groupContainer.style.display = "flex";
                groupContainer.style.justifyContent = "center";
                groupContainer.style.flexDirection = "row";
                groupContainer.style.flexWrap = "wrap";
                groupContainer.style.marginBottom = "3em";

                let stageContainer: HTMLTableElement|undefined;

                let previousStageIndex = -1;
                for (let i = 0; i < group.matches.length; i++) {
                    const match = group.matches[i];
                    if (match.stageIndex > previousStageIndex || stageContainer === undefined) {
                        previousStageIndex = match.stageIndex;
                        stageContainer = document.createElement("table");
                        stageContainer.style.margin = "1em";

                        const stageCaption = document.createElement("caption");
                        stageCaption.innerText = `${match.stageIndex + 1}. kolo`
                        stageContainer.appendChild(stageCaption);
                    }

                    const matchContainer = document.createElement("tr");

                    addCell(matchContainer, String(match.score1));
                    addCell(matchContainer, match.team1);
                    addCell(matchContainer, "VS");
                    addCell(matchContainer, match.team2);
                    addCell(matchContainer, String(match.score2));

                    stageContainer.appendChild(matchContainer);

                    if (stageContainer !== undefined) {
                        groupContainer.appendChild(stageContainer);
                    }
                }

                root.appendChild(groupContainer);
            }
        }
    }
}

function addCell(row: HTMLTableRowElement, text: string) {
    const cell = document.createElement("td");
    cell.innerText = text;
    row.appendChild(cell);
    return cell;
};

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
