import { fetchGameDetails } from './api.js';
import { initGlobalSearch } from './ui.js';

document.addEventListener("DOMContentLoaded", () => {
    initGlobalSearch();

    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('id');
    
    if (!gameId) {
        document.getElementById('dynamic-title').textContent = "nie wybrano gry";
        return;
    }

    let currentGameData = null;

    async function loadDetails() {
        try {
            const game = await fetchGameDetails(gameId);
            currentGameData = game; 

            document.getElementById('dynamic-title').textContent = game.name;
            document.getElementById('dynamic-desc').textContent = game.description_raw || "brak opisu";

            const devContainer = document.getElementById('dynamic-developer');
            devContainer.textContent = '';
            if (game.developers && game.developers.length > 0) {
                devContainer.appendChild(document.createTextNode("by "));
                const strongTag = document.createElement("strong");
                strongTag.textContent = game.developers[0].name;
                devContainer.appendChild(strongTag);
            }

            const genresContainer = document.getElementById('dynamic-genres');
            genresContainer.textContent = '';
            game.genres.forEach(g => {
                const pill = document.createElement('span');
                pill.className = 'pill'; pill.textContent = g.name;
                genresContainer.appendChild(pill);
            });

            const platformsContainer = document.getElementById('dynamic-platforms');
            platformsContainer.textContent = '';
            game.platforms.forEach(p => {
                const pill = document.createElement('span');
                pill.className = 'pill'; pill.textContent = p.platform.name;
                platformsContainer.appendChild(pill);
            });

            const track = document.getElementById('screenshot-track');
            track.textContent = '';
            [game.background_image, game.background_image_additional].forEach(src => {
                if (src) {
                    const img = document.createElement('img');
                    img.src = src; track.appendChild(img);
                }
            });

            initReviewsSystem(game.id);

        } catch (err) {
            document.getElementById('dynamic-title').textContent = "błąd pobierania danych gry.";
        }
    }

    loadDetails();

    const addToListBtn = document.querySelector('.btn-add');
    if (addToListBtn) {
        addToListBtn.addEventListener('click', function() {
            if (!currentGameData) return;
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
            alert("dodano do listy");
        });
    }

    function initReviewsSystem(id) {
        const form = document.querySelector(".details-form");
        const reviewsContainer = document.getElementById("user-reviews-container");
        if (!form || !reviewsContainer) return;

        const lsKey = `reviews_${id}`;
        const savedReviews = JSON.parse(localStorage.getItem(lsKey)) || [];
        
        savedReviews.forEach(review => {
            reviewsContainer.prepend(createReviewElement(review));
        });

        form.addEventListener("submit", function(event) {
            event.preventDefault(); 
            const status = document.getElementById("status").value;
            const reviewText = document.getElementById("review").value;
            const ratingNumber = parseInt(document.getElementById("rating").value);
            const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            const newReview = {
                name: "Ty (Użytkownik)",
                date: today,
                stars: ratingNumber,
                status: status,
                text: reviewText
            };

            const currentReviews = JSON.parse(localStorage.getItem(lsKey)) || [];
            currentReviews.push(newReview);
            localStorage.setItem(lsKey, JSON.stringify(currentReviews));

            reviewsContainer.prepend(createReviewElement(newReview));
            form.reset();
            alert("dodano recenzję");
        });
    }

    function createReviewElement(review) {
        const reviewItem = document.createElement("div");
        reviewItem.className = "review-item";

        const avatarDiv = document.createElement("div");
        avatarDiv.className = "review-avatar";
        const avatarIcon = document.createElement("span");
        avatarIcon.className = "material-icons";
        avatarIcon.textContent = "person";
        avatarDiv.appendChild(avatarIcon);

        const contentDiv = document.createElement("div");
        contentDiv.className = "review-content";

        const topDiv = document.createElement("div");
        topDiv.className = "review-top";
        const nameSpan = document.createElement("span");
        nameSpan.className = "reviewer-name";
        nameSpan.textContent = review.name;
        const dateSpan = document.createElement("span");
        dateSpan.className = "review-date";
        dateSpan.textContent = review.date;
        topDiv.appendChild(nameSpan);
        topDiv.appendChild(dateSpan);

        const metaDiv = document.createElement("div");
        metaDiv.className = "review-meta";
        const starsSpan = document.createElement("span");
        starsSpan.className = "review-stars";
        starsSpan.textContent = "★".repeat(review.stars) + "☆".repeat(5 - review.stars);

        const statusSpan = document.createElement("span");
        statusSpan.className = "review-status";
        const statusDot = document.createElement("span");
        statusDot.className = "status-dot";
        statusDot.style.background = review.status === 'completed' ? '#4caf50' : review.status === 'playing' ? '#2196f3' : '#f44336';
        
        statusSpan.appendChild(statusDot);
        statusSpan.appendChild(document.createTextNode(" " + review.status.charAt(0).toUpperCase() + review.status.slice(1)));

        metaDiv.appendChild(starsSpan);
        metaDiv.appendChild(statusSpan);

        const textP = document.createElement("p");
        textP.className = "review-text";
        textP.textContent = review.text;

        contentDiv.appendChild(topDiv);
        contentDiv.appendChild(metaDiv);
        contentDiv.appendChild(textP);

        reviewItem.appendChild(avatarDiv);
        reviewItem.appendChild(contentDiv);

        return reviewItem;
    }
});