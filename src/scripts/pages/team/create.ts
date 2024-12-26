import { loadingError } from "../../loading";
import { flashToastError, showToastError } from "../../toast";
import { getIdFromRankName, listRanks } from "../../api/ranks";
import { Rank } from "../../api/ranks";
import { addOptions } from "../../selection";
import { ShowError } from "../../api/utils";
import { Game, listGames, getIdFromGameName } from "../../api/game";
import { create } from "../../api/teams";

const main = document.getElementById("create") as HTMLDivElement;
const loading = document.getElementById("create-loading") as HTMLDivElement;
const accountInfoComplete = document.getElementById("create-accountInfo-complete") as HTMLDivElement;
const createInfo = document.getElementById("create-info") as HTMLDivElement;
const gameInfo = document.getElementById("create-game-info") as HTMLDivElement;
const gameButton = document.getElementById("create-gameSave") as HTMLButtonElement;
const gameInput = document.getElementById("create-game") as HTMLInputElement;
const formHolder = document.getElementById("create-formHolder") as HTMLDivElement;
const form = document.getElementById("create-form") as HTMLDivElement;
const formInputs = {
    "name": document.getElementById("create-name") as HTMLInputElement,
    "nick": document.getElementById("create-nick") as HTMLInputElement,
    "rank": document.getElementById("create-rank") as HTMLInputElement,
    "maxRank": document.getElementById("create-maxRank") as HTMLInputElement
}
let games: Game[] = [];
let ranks: Rank[] = [];
let gameId: number = -1;

async function loadRanks(gameId: number) {
    ranks = await listRanks(gameId);
    let options: string[] = [];
    ranks.forEach(rank => {
        options.push(rank.rankName);
    });
    addOptions("create-rank-selection", "create-rank", options);
    addOptions("create-maxRank-selection", "create-maxRank", options);
    return ranks;
}

async function loadGameSelector(){
    try {
        games = await listGames();
        let options: string[] = [];
        games.forEach(game => {
            options.push(game.name);
        });
        addOptions("create-game-selection", "create-game", options);
        main.style.display = "block";
        loading.style.display = "none";
        accountInfoComplete.addEventListener("click", event=>{
            gameInfo.style.display = "block";
            createInfo.style.display = "none";
        });
        gameButton.addEventListener("click", event=>{
            gameId = getIdFromGameName(gameInput.value, games);
            if(gameId === -1){
                flashToastError("Vyberte hru.");
            }else{
                load(gameId);
            }
        });
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

async function load(gameId: number){
    try {
        await loadRanks(gameId);
        formHolder.style.display = "block";
        gameInfo.style.display = "none";
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
async function submit(event: Event){
    event.preventDefault();
    const rank = getIdFromRankName(formInputs.rank.value, ranks);
    const maxRank = getIdFromRankName(formInputs.maxRank.value, ranks);
    if(formInputs.name.value === ""){
        flashToastError("Zadejte prosím název týmu.");
    } else if(formInputs.nick.value === ""){
        flashToastError("Zadejte prosím přezdívku.");
    } else if(rank === -1){
        flashToastError("Zadejte prosím aktuální rank.");
    } else if(maxRank === -1){
        flashToastError("Zadejte prosím maximimální dosažený rank.");
    } else if(gameId === -1){
        flashToastError("Zadejte prosím hru.");
    }else{
        main.style.display = "none";
        loading.style.display = "block";
        try {
            await create(formInputs.name.value, gameId, formInputs.nick.value, rank, maxRank);
            window.location.href = "/myTeams";
        } catch (e) {
            if (e instanceof ShowError) {
                loadingError(loading);
                flashToastError(e.message);
            } else {
                loadingError(loading);
                showToastError("Neznámá chyba, kontaktujte prosím podporu.");
                throw e;
            }
        }
    }
}

loadGameSelector();

form.addEventListener("submit", submit);