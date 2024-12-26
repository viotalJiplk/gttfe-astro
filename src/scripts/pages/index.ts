import { listGames } from "../api/game";
import { loadSponsors } from "../api/sponsors";
import { carouselAppendChild } from "../carousel";

    const carousel = document.getElementById("index-sponsor-carousel") as HTMLDivElement;
    const gameHolder = document.getElementById("index-gamesHolder") as HTMLDivElement;
    
    async function loadSponsorCarousel(){
        const sponsors = await loadSponsors();
        
        for(let sponsor of sponsors){
            const a = document.createElement("a");
            a.classList.add("index-sponsor");
            a.setAttribute("href", sponsor.sponsorLink);

            const img = document.createElement("img");
            img.setAttribute("src", sponsor.logo);
            a.appendChild(img);

            carouselAppendChild(carousel, a);
        }
    }

    async function loadGameBanners(){
        const games = await listGames();
        for(const game of games){
            const a = document.createElement("a");
            a.classList.add("index-game");
            a.setAttribute("href", `/games/rules/${game.name}/`);

            const img = document.createElement("img");
            img.setAttribute("src", game.icon);
            a.appendChild(img);

            gameHolder.appendChild(a);
        }
    }
    loadGameBanners();
    //loadSponsorCarousel();