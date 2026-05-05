document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector(".details-form");
    const reviewsContainer = document.getElementById("user-reviews-container");

    if (form) {
        form.addEventListener("submit", function(event) {
            event.preventDefault(); 

            const status = document.getElementById("status").value;
            const reviewText = document.getElementById("review").value;

            const ratingNumber = parseInt(document.getElementById("rating").value);

            let starsString = "★".repeat(ratingNumber) + "☆".repeat(5 - ratingNumber);

            const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            const newReviewElement = document.createElement("div");
            newReviewElement.classList.add("review-item");

            newReviewElement.innerHTML = `
                <div class="review-avatar">
                    <span class="material-icons">person</span>
                </div>
                <div class="review-content">
                    <div class="review-top">
                        <span class="reviewer-name">You</span>
                        <span class="review-date">${today}</span>
                    </div>
                    <div class="review-meta">
                        <span class="review-stars" style="color: #e91e63;">${starsString}</span>
                        <span class="review-status"><span class="status-dot"></span> ${status.toUpperCase()}</span>
                    </div>
                    <p class="review-text">${reviewText}</p>
                    <div class="review-actions">
                        <span class="action-btn"><span class="material-icons">favorite_border</span> 0 Likes</span>
                        <span class="action-btn"><span class="material-icons">chat_bubble_outline</span> 0</span>
                        <span class="action-btn">Open review</span>
                    </div>
                </div>
            `;

            reviewsContainer.prepend(newReviewElement);

            form.reset();
        });
    }
});

const trendingContainer = document.getElementById("rawg-trending-container");

    if (trendingContainer) {
        const RAWG_API_KEY = "ee560a75d09c466d8e1b4a7e09dda290";

        console.log("Uderzam do RAWG API...");

        fetch(`https://api.rawg.io/api/games?key=${RAWG_API_KEY}&ordering=-added&page_size=4`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error connecting to API');
                }
                return response.json();
            })
            .then(data => {
                trendingContainer.innerHTML = '';

                data.results.forEach(game => {
                    const ratingNumber = Math.round(game.rating);
                    
                    const starsString = "★".repeat(ratingNumber) + "☆".repeat(5 - ratingNumber);

                    const gameCardLink = document.createElement("a");
                    gameCardLink.href = `./details.html?id=${game.id}`; 
                    gameCardLink.className = "card-link";

                    gameCardLink.innerHTML = `
                        <div class="game-card">
                            <img src="${game.background_image}" alt="${game.name}" class="row-poster" title="${game.name}">
                            <div class="rating-overlay">
                                <span class="stars">${starsString}</span>
                                <span class="rating-text">${game.rating.toFixed(1)}</span>
                            </div>
                        </div>
                    `;

                    trendingContainer.appendChild(gameCardLink);
                });
            })
            .catch(error => {
                console.error("There was an error:", error);
                trendingContainer.innerHTML = '<p style="color: red; padding: 20px;">There was an error.</p>';
            });
    }

    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('id');

    if (gameId) {
        const RAWG_API_KEY = "ee560a75d09c466d8e1b4a7e09dda290";

        fetch(`https://api.rawg.io/api/games/${gameId}?key=${RAWG_API_KEY}`)
            .then(response => {
                if (!response.ok) throw new Error('Details loading error');
                return response.json();
            })
            .then(game => {
                console.log("Game info:", game);

                document.getElementById('dynamic-title').textContent = game.name;
                let cleanDesc = game.description;
                if (cleanDesc.includes('Español')) {
                    cleanDesc = cleanDesc.split('Español')[0]; 
                }
                
                document.getElementById('dynamic-desc').innerHTML = cleanDesc;

                if (game.developers && game.developers.length > 0) {
                    document.getElementById('dynamic-developer').innerHTML = `by <strong>${game.developers[0].name}</strong>`;
                } else {
                    document.getElementById('dynamic-developer').innerHTML = '';
                }

                const genresContainer = document.getElementById('dynamic-genres');
                genresContainer.innerHTML = '';
                game.genres.forEach(genre => {
                    genresContainer.innerHTML += `<span class="pill">${genre.name}</span>`;
                });

                const platformsContainer = document.getElementById('dynamic-platforms');
                platformsContainer.innerHTML = '';
                game.platforms.forEach(p => {
                    platformsContainer.innerHTML += `<span class="pill">${p.platform.name}</span>`;
                });

                const track = document.getElementById('screenshot-track');
                track.innerHTML = `<img src="${game.background_image}" alt="${game.name} Image 1">`;
                
                if(game.background_image_additional) {
                    track.innerHTML += `<img src="${game.background_image_additional}" alt="${game.name} Image 2">`;
                }
            })
            .catch(error => {
                console.error("Loading error:", error);
                document.getElementById('dynamic-title').textContent = "Błąd ładowania gry";
                document.getElementById('dynamic-desc').textContent = "Upewnij się, że nie wyczerpałeś limitu zapytań API.";
            });
    }