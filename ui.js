import { fetchGames } from './api.js';

export function buildGameCard(game) {
    const gameCardLink = document.createElement("a");
    gameCardLink.href = `./details.html?id=${game.id}`; 
    gameCardLink.className = "card-link";

    const gameCard = document.createElement("div");
    gameCard.className = "game-card";

    const img = document.createElement("img");
    img.src = game.background_image || './logo_cien.png';
    img.alt = game.name;
    img.className = "row-poster";
    img.title = game.name;

    const overlay = document.createElement("div");
    overlay.className = "rating-overlay";

    const stars = document.createElement("span");
    stars.className = "stars";
    const ratingNumber = Math.round(game.rating) || 0;
    stars.textContent = "★".repeat(ratingNumber) + "☆".repeat(5 - ratingNumber);

    const ratingText = document.createElement("span");
    ratingText.className = "rating-text";
    ratingText.textContent = (game.rating || 0).toFixed(1);

    overlay.appendChild(stars);
    overlay.appendChild(ratingText);
    gameCard.appendChild(img);
    gameCard.appendChild(overlay);
    gameCardLink.appendChild(gameCard);

    return gameCardLink;
}

export function initGlobalSearch() {
    const searchInput = document.querySelector('.search-input');
    if (!searchInput) return;

    searchInput.addEventListener('keypress', async function (e) {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (!query) return;

            const targetContainer = document.getElementById("rawg-recently-added-container") || document.getElementById("rawg-trending-container");
            
            if (targetContainer) {
                const rowTitle = document.querySelector('.row-title');
                if (rowTitle) rowTitle.textContent = `wyniki dla: ${query}`;
                
                targetContainer.textContent = 'szukam gier';
                const scrollTrigger = document.getElementById("infinite-scroll-trigger");
                if (scrollTrigger) scrollTrigger.style.display = 'none';

                try {
                    const data = await fetchGames(`/games?search=${query}&page_size=12`);
                    targetContainer.textContent = '';

                    if (data.results.length === 0) {
                        targetContainer.textContent = 'brak wyników';
                        return;
                    }

                    data.results.forEach(game => targetContainer.appendChild(buildGameCard(game)));
                } catch (err) {
                    targetContainer.textContent = 'błąd szukania';
                }
            } else {
                window.location.href = `./index.html?search=${encodeURIComponent(query)}`;
            }
        }
    });
}