document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector(".vault-form");
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