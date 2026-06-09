import { initGlobalSearch } from './ui.js';

document.addEventListener("DOMContentLoaded", function() {
    initGlobalSearch();

    const myListPlanContainer = document.getElementById("mylist-plan-container");

    function renderUserList() {
        if (!myListPlanContainer) return; 
        myListPlanContainer.textContent = '';
        
        const currentSavedList = JSON.parse(localStorage.getItem('myGamesList')) || [];

        if (currentSavedList.length === 0) {
            const emptyMsg = document.createElement("p");
            emptyMsg.style.color = "#888";
            emptyMsg.textContent = "Your list is empty.";
            myListPlanContainer.appendChild(emptyMsg);
            return;
        }

        currentSavedList.forEach(function(game) {
            const card = document.createElement("div");
            card.className = "game-card";

            const wrapper = document.createElement("div");
            wrapper.className = "card-image-wrapper";

            const badge = document.createElement("span");
            badge.className = "badge";
            badge.style.backgroundColor = '#e65100'; // Ustawione na sztywno dla planowanych gier
            badge.style.color = "white";
            badge.textContent = "PLAN TO PLAY";

            const img = document.createElement("img");
            img.src = game.image || './logo_cien.png';
            img.className = "grid-poster-large";
            img.alt = game.name;

            const delBtn = document.createElement("button");
            delBtn.className = "delete-btn";
            delBtn.textContent = "✖";
            
            delBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                const indexToRemove = currentSavedList.findIndex(function(g) {
                    return g.id === game.id;
                });
                
                if(indexToRemove > -1) {
                    currentSavedList.splice(indexToRemove, 1);
                    localStorage.setItem('myGamesList', JSON.stringify(currentSavedList));
                    renderUserList(); 
                }
            });

            wrapper.appendChild(badge);
            wrapper.appendChild(delBtn);
            wrapper.appendChild(img);

            const info = document.createElement("div");
            info.className = "card-info";
            
            const title = document.createElement("h3");
            title.className = "game-title";
            title.textContent = game.name;

            const starsNum = Math.round(game.rating) || 0;
            const ratingDiv = document.createElement("div");
            ratingDiv.className = "game-rating";
            ratingDiv.style.color = "#ffd700";
            ratingDiv.style.letterSpacing = "2px";
            ratingDiv.textContent = "★".repeat(starsNum) + "☆".repeat(5 - starsNum);

            info.appendChild(title);
            info.appendChild(ratingDiv);

            card.appendChild(wrapper);
            card.appendChild(info);

            card.addEventListener('click', function(e) {
                if (e.target !== delBtn) window.location.href = `./details.html?id=${game.id}`;
            });

            myListPlanContainer.appendChild(card);
        });
    }

    renderUserList();
});