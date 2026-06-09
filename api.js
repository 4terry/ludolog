export const RAWG_API_KEY = "ee560a75d09c466d8e1b4a7e09dda290";
export const BASE_URL = "https://api.rawg.io/api";

export async function fetchGames(endpoint) {
    const response = await fetch(`${BASE_URL}${endpoint}&key=${RAWG_API_KEY}`);
    if (!response.ok) throw new Error("API error");
    return await response.json();
}

export async function fetchGameDetails(id) {
    const response = await fetch(`${BASE_URL}/games/${id}?key=${RAWG_API_KEY}`);
    if (!response.ok) throw new Error("API error");
    return await response.json();
}