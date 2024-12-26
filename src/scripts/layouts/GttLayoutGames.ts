import { listGames } from "../api/game";
import { carouselAppendChild } from "../carousel";

const carousel = document.getElementById("gameSelectCarousel") as HTMLDivElement;

async function loadGameBanners(){
    const games = await listGames();
    for(const game of games){
        const a = document.createElement("a");
        a.classList.add("index-game");
        a.setAttribute("href", `/games/rules/${game.name}`);

        const img = document.createElement("img");
        img.setAttribute("src", game.icon);
        a.appendChild(img);

        carouselAppendChild(carousel, a);
    }
}
loadGameBanners();