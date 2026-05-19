document.addEventListener("DOMContentLoaded", function() {
    const RAWG_API_KEY = "ee560a75d09c466d8e1b4a7e09dda290";

    function buildGameCard(game) {
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

    const recentlyAddedContainer = document.getElementById("rawg-recently-added-container");
    const trendingContainer = document.getElementById("rawg-trending-container");
    const loadingSpinner = document.getElementById("loading-spinner");
    const scrollTrigger = document.getElementById("infinite-scroll-trigger");

    let currentPage = 1;
    let isFetching = false;

    async function loadTrendingGames() {
        if (!trendingContainer) return;
        trendingContainer.textContent = "Ładowanie hitów...";
        try {
            const today = new Date().toISOString().split('T')[0];
            const lastYear = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0];
            
            const res = await fetch(`https://api.rawg.io/api/games?key=${RAWG_API_KEY}&dates=${lastYear},${today}&ordering=-added&page_size=10`);
            if (!res.ok) throw new Error("API error");
            const data = await res.json();
            trendingContainer.textContent = '';
            data.results.forEach(game => {
                trendingContainer.appendChild(buildGameCard(game));
            });
        } catch (err) {
            console.error(err);
            trendingContainer.textContent = "Błąd pobierania trendów";
        }
    }

    async function fetchMoreRecentlyAdded() {
        if (isFetching || !recentlyAddedContainer) return;
        isFetching = true;
        if (loadingSpinner) loadingSpinner.style.display = "block";

        try {
            const res = await fetch(`https://api.rawg.io/api/games?key=${RAWG_API_KEY}&ordering=-released&page_size=20&page=${currentPage}`);
            if (!res.ok) throw new Error("API error");
            const data = await res.json();
            
            if (currentPage === 1) recentlyAddedContainer.textContent = ''; 

            data.results.forEach(game => {
                if (game.background_image) {
                    recentlyAddedContainer.appendChild(buildGameCard(game));
                }
            });

            currentPage++; 
        } catch (err) {
            console.error(err);
        } finally {
            isFetching = false;
            if (loadingSpinner) loadingSpinner.style.display = "none";
        }
    }

    if (trendingContainer) loadTrendingGames();
    if (recentlyAddedContainer) fetchMoreRecentlyAdded();

    if (scrollTrigger && recentlyAddedContainer) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                fetchMoreRecentlyAdded();
            }
        }, { rootMargin: "200px" });
        observer.observe(scrollTrigger);
    }

    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', async function (e) {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                const targetContainer = recentlyAddedContainer || trendingContainer;
                
                if (!query || !targetContainer) return;

                const rowTitle = document.querySelector('.row-title');
                if (rowTitle) rowTitle.textContent = `Wyniki wyszukiwania dla: ${query}`;
                
                targetContainer.textContent = 'Szukam gier w bazie RAWG...';
                if (scrollTrigger) scrollTrigger.style.display = 'none';

                try {
                    const res = await fetch(`https://api.rawg.io/api/games?key=${RAWG_API_KEY}&search=${query}&page_size=12`);
                    const data = await res.json();
                    targetContainer.textContent = '';

                    if (data.results.length === 0) {
                        targetContainer.textContent = 'Brak wyników';
                        return;
                    }

                    data.results.forEach(game => {
                        targetContainer.appendChild(buildGameCard(game));
                    });
                } catch (err) {
                    targetContainer.textContent = 'Błąd podczas szukania.';
                }
            }
        });
    }

    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('id');
    let currentGameData = null; 

    if (gameId) {
        async function loadGameDetails() {
            try {
                const res = await fetch(`https://api.rawg.io/api/games/${gameId}?key=${RAWG_API_KEY}`);
                if (!res.ok) throw new Error('Details loading error');
                const game = await res.json();
                currentGameData = game; 

                document.getElementById('dynamic-title').textContent = game.name;
                document.getElementById('dynamic-desc').textContent = game.description_raw || "Brak opisu.";

                const devContainer = document.getElementById('dynamic-developer');
                if (game.developers && game.developers.length > 0) {
                    devContainer.textContent = `by ${game.developers[0].name}`;
                } else {
                    devContainer.textContent = '';
                }

                const genresContainer = document.getElementById('dynamic-genres');
                genresContainer.textContent = '';
                game.genres.forEach(g => {
                    const pill = document.createElement('span');
                    pill.className = 'pill';
                    pill.textContent = g.name;
                    genresContainer.appendChild(pill);
                });

                const platformsContainer = document.getElementById('dynamic-platforms');
                platformsContainer.textContent = '';
                game.platforms.forEach(p => {
                    const pill = document.createElement('span');
                    pill.className = 'pill';
                    pill.textContent = p.platform.name;
                    platformsContainer.appendChild(pill);
                });

                const track = document.getElementById('screenshot-track');
                track.textContent = '';
                const img1 = document.createElement('img');
                img1.src = game.background_image;
                track.appendChild(img1);
                
                if (game.background_image_additional) {
                    const img2 = document.createElement('img');
                    img2.src = game.background_image_additional;
                    track.appendChild(img2);
                }
            } catch (err) {
                console.error(err);
            }
        }
        loadGameDetails();
    }

    const addToListBtn = document.querySelector('.btn-add');
    if (addToListBtn) {
        addToListBtn.addEventListener('click', function() {
            let myList = JSON.parse(localStorage.getItem('myGamesList')) || [];
            
            if (currentGameData) {
                if (myList.some(g => g.id === currentGameData.id)) {
                    alert("Ta gra już jest na Twojej liście!");
                    return;
                }
                const gameToSave = {
                    id: currentGameData.id,
                    name: currentGameData.name,
                    image: currentGameData.background_image,
                    rating: currentGameData.rating,
                    status: 'plan'
                };
                myList.push(gameToSave);
                localStorage.setItem('myGamesList', JSON.stringify(myList));
                alert("Dodano do listy! Sprawdź zakładkę My List.");
            } else {
                alert("Nie znaleziono danych dynamicznych gry.");
            }
        });
    }

    const form = document.querySelector(".details-form");
    const reviewsContainer = document.getElementById("user-reviews-container");

    if (form && reviewsContainer) {
        form.addEventListener("submit", function(event) {
            event.preventDefault(); 

            const status = document.getElementById("status").value;
            const reviewText = document.getElementById("review").value;
            const ratingNumber = parseInt(document.getElementById("rating").value);
            const starsString = "★".repeat(ratingNumber) + "☆".repeat(5 - ratingNumber);
            const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            const reviewItem = document.createElement("div");
            reviewItem.className = "review-item";

            const avatar = document.createElement("div");
            avatar.className = "review-avatar";
            const icon = document.createElement("span");
            icon.className = "material-icons";
            icon.textContent = "person";
            avatar.appendChild(icon);

            const content = document.createElement("div");
            content.className = "review-content";

            const topRow = document.createElement("div");
            topRow.className = "review-top";
            const nameSpan = document.createElement("span");
            nameSpan.className = "reviewer-name";
            nameSpan.textContent = "You";
            const dateSpan = document.createElement("span");
            dateSpan.className = "review-date";
            dateSpan.textContent = today;
            topRow.appendChild(nameSpan);
            topRow.appendChild(dateSpan);

            const metaRow = document.createElement("div");
            metaRow.className = "review-meta";
            const starsSpan = document.createElement("span");
            starsSpan.className = "review-stars";
            starsSpan.style.color = "#e91e63";
            starsSpan.textContent = starsString;
            const statusSpan = document.createElement("span");
            statusSpan.className = "review-status";
            statusSpan.textContent = ` ${status.toUpperCase()}`;
            metaRow.appendChild(starsSpan);
            metaRow.appendChild(statusSpan);

            const pText = document.createElement("p");
            pText.className = "review-text";
            pText.textContent = reviewText;

            content.appendChild(topRow);
            content.appendChild(metaRow);
            content.appendChild(pText);
            reviewItem.appendChild(avatar);
            reviewItem.appendChild(content);

            reviewsContainer.prepend(reviewItem);
            form.reset();
        });
    }

    const myListPlanContainer = document.getElementById("mylist-plan-container");

    function renderUserList() {
        if (!myListPlanContainer) return; 

        myListPlanContainer.textContent = '';

        const currentSavedList = JSON.parse(localStorage.getItem('myGamesList')) || [];

        if (currentSavedList.length === 0) {
            myListPlanContainer.textContent = "Twoja lista jest całkowicie pusta! Dodaj gry na stronie głównej.";
            return;
        }

        currentSavedList.forEach((game, index) => {
            const card = document.createElement("div");
            card.className = "game-card";

            const wrapper = document.createElement("div");
            wrapper.className = "card-image-wrapper";

            const badge = document.createElement("span");
            badge.className = `badge badge-${game.status}`;
            badge.textContent = "Plan to Play";

            const delBtn = document.createElement("button");
            delBtn.className = "delete-btn";
            delBtn.textContent = "✖";
            
            delBtn.addEventListener('click', function(e) {
                e.preventDefault();
                currentSavedList.splice(index, 1);
                localStorage.setItem('myGamesList', JSON.stringify(currentSavedList));
                renderUserList(); 
            });

            const img = document.createElement("img");
            img.src = game.image || './logo_cien.png';
            img.className = "grid-poster-large";
            img.alt = game.name;

            wrapper.appendChild(badge);
            wrapper.appendChild(delBtn);
            wrapper.appendChild(img);

            const info = document.createElement("div");
            info.className = "card-info";

            const title = document.createElement("h3");
            title.className = "game-title";
            title.textContent = game.name;

            const ratingDiv = document.createElement("div");
            ratingDiv.className = "game-rating";
            const starsNum = Math.round(game.rating) || 0;
            ratingDiv.textContent = "★".repeat(starsNum) + "☆".repeat(5 - starsNum);

            const dateP = document.createElement("p");
            dateP.className = "date-added";
            dateP.textContent = "Added: Recently";

            info.appendChild(title);
            info.appendChild(ratingDiv);
            info.appendChild(dateP);

            card.appendChild(wrapper);
            card.appendChild(info);

            myListPlanContainer.appendChild(card);
        });
    }

    renderUserList();
});