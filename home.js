import { fetchGames, fetchGameDetails } from './api.js';
import { buildGameCard, initGlobalSearch } from './ui.js';

document.addEventListener("DOMContentLoaded", () => {
    initGlobalSearch();

    const recentlyAddedContainer = document.getElementById("rawg-recently-added-container");
    const trendingContainer = document.getElementById("rawg-trending-container");
    const loadingSpinner = document.getElementById("loading-spinner");
    const scrollTrigger = document.getElementById("infinite-scroll-trigger");

    let currentPage = 1; //strona z api
    let isFetching = false;

    async function loadRandomHeroBanner() {
        const heroBanner = document.getElementById("hero-banner");
        try {
            const data = await fetchGames(`/games?ordering=-added&metacritic=80,100&page_size=20`);
            const randomGameInfo = data.results[Math.floor(Math.random() * data.results.length)];

            const currentGameData = await fetchGameDetails(randomGameInfo.id);

            heroBanner.style.backgroundImage = `url('${currentGameData.background_image}')`;
            document.getElementById("hero-title").textContent = currentGameData.name;
            
            const desc = currentGameData.description_raw || "brak opisu";
            document.getElementById("hero-desc").textContent = desc.length > 200 ? desc.substring(0, 200) + "..." : desc;

            document.getElementById("hero-details-btn").addEventListener("click", () => window.location.href = `./details.html?id=${currentGameData.id}`);
            
            const addBtn = document.querySelector('#hero-banner .btn-add');
            if(addBtn) {
                addBtn.addEventListener('click', () => {
                    let myList = JSON.parse(localStorage.getItem('myGamesList')) || [];
                    if (myList.some(g => g.id === currentGameData.id)) {
                        alert("gra jest już na liście");
                        return;
                    }
                    myList.push({
                        id: currentGameData.id,
                        name: currentGameData.name,
                        image: currentGameData.background_image,
                        rating: currentGameData.rating,
                        status: 'plan'
                    });
                    localStorage.setItem('myGamesList', JSON.stringify(myList));
                    alert("dodano");
                });
            }

        } catch (err) {
            document.getElementById("hero-title").textContent = "błąd";
            document.getElementById("hero-desc").textContent = "odśwież stronę";
        }
    }

    async function loadTrendingGames() {
        if(!trendingContainer) return;
        trendingContainer.textContent = "ładowanie gier";
        try {
            const today = new Date().toISOString().split('T')[0];
            const lastYear = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0];
            const data = await fetchGames(`/games?dates=${lastYear},${today}&ordering=-added&page_size=10`);
            trendingContainer.textContent = '';
            data.results.forEach(game => trendingContainer.appendChild(buildGameCard(game)));
        } catch (err) {
            trendingContainer.textContent = "błąd pobierania";
        }
    }

    async function fetchMoreRecentlyAdded() {
        if (isFetching || !recentlyAddedContainer) return;
        isFetching = true;
        if (loadingSpinner) loadingSpinner.style.display = "block";

        try {
            const data = await fetchGames(`/games?ordering=-added&page_size=20&page=${currentPage}`);
            if (currentPage === 1) recentlyAddedContainer.textContent = ''; 

            data.results.forEach(game => {
                if (game.background_image) recentlyAddedContainer.appendChild(buildGameCard(game));
            });
            currentPage++; 
        } catch (err) {
            if (currentPage === 1) recentlyAddedContainer.textContent = "błąd pobierania";
        } finally {
            isFetching = false;
            if (loadingSpinner) loadingSpinner.style.display = "none";
        }
    }

    loadTrendingGames();
    loadRandomHeroBanner();
    fetchMoreRecentlyAdded();

    //paginacja
    if (scrollTrigger && recentlyAddedContainer) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) fetchMoreRecentlyAdded();
        }, { rootMargin: "200px" });
        observer.observe(scrollTrigger);
    }
});