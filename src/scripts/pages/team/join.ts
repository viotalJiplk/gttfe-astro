import { loadingError } from "../../loading";
import { flashToastError, showToastError } from "../../toast";
import { getIdFromRankName, listRanks } from "../../api/ranks";
import { Rank } from "../../api/ranks";
import { addOptions } from "../../selection";
import { ShowError } from "../../api/utils";
import { listGeneratedRoles, getIdFromGeneratedRoleName } from "../../api/generatedRoles";
import type { GeneratedRole } from "../../api/generatedRoles";
import {join} from "../../api/teams";

const main = document.getElementById("join") as HTMLDivElement;
const loading = document.getElementById("join-loading") as HTMLDivElement;
const accountInfoComplete = document.getElementById("join-accountInfo-complete") as HTMLDivElement;
const joinInfo = document.getElementById("join-info") as HTMLDivElement;
const formHolder = document.getElementById("join-formHolder") as HTMLDivElement;
const form = document.getElementById("join-form") as HTMLDivElement;
const formInputs = {
    "nick": document.getElementById("join-nick") as HTMLInputElement,
    "role": document.getElementById("join-role") as HTMLInputElement,
    "rank": document.getElementById("join-rank") as HTMLInputElement,
    "maxRank": document.getElementById("join-maxRank") as HTMLInputElement
}

let ranks: Rank[] = [];
let roles: GeneratedRole[] = [];

const url = new URL(window.location.href);
const teamId = Number(url.searchParams.get("teamId"));
const gameId = Number(url.searchParams.get("gameId"));
const joinString = url.searchParams.get("joinString");
if (isNaN(teamId) || typeof teamId !== 'number') {
    showToastError("Neplatný link");
    loadingError(loading);
} else if (isNaN(gameId) || typeof gameId !== 'number') {
    showToastError("Neplatný link");
    loadingError(loading);
} else if (joinString === null) {
    showToastError("Neplatný link");
    loadingError(loading);
}else{
    async function loadRanks(gameId: number) {
        ranks = await listRanks(gameId);
        let options: string[] = [];
        ranks.forEach(rank => {
            options.push(rank.rankName);
        });
        addOptions("join-rank-selection", "join-rank", options);
        addOptions("join-maxRank-selection", "join-maxRank", options);
        return ranks;
    }

    async function loadRoles(gameId: number) {
        roles = await listGeneratedRoles(gameId);
        let options: string[] = [];
        roles.forEach(role => {
            options.push(role.roleName);
        });
        addOptions("join-role-selection", "join-role", options);
        return roles;
    }

    async function load(){
        try {
            await loadRanks(gameId);
            await loadRoles(gameId);
            main.style.display = "block";
            loading.style.display = "none";
            accountInfoComplete.addEventListener("click", event=>{
                formHolder.style.display = "block";
                joinInfo.style.display = "none";
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
    async function submit(event: Event){
        event.preventDefault();
        const rank = getIdFromRankName(formInputs.rank.value, ranks);
        const maxRank = getIdFromRankName(formInputs.maxRank.value, ranks);
        const role = getIdFromGeneratedRoleName(formInputs.role.value, roles);
        if(formInputs.nick.value === ""){
            flashToastError("Zadejte prosím přezdívku.");
        } else if(rank === -1){
            flashToastError("Zadejte prosím aktuální rank.");
        } else if(maxRank === -1){
            flashToastError("Zadejte prosím maximimální dosažený rank.");
        } else if(role === -1){
            flashToastError("Zadejte prosím roli.");
        }else if (joinString === null) {
            showToastError("Neplatný link");
        }else{
            main.style.display = "none";
            loading.style.display = "block";
            try {
                await join(teamId, joinString, formInputs.nick.value, rank, maxRank, role);
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

    form.addEventListener("submit", submit);
    load();
    
}