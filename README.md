# Ludolog - Katalog Gier Wideo
<img width="1889" height="1036" alt="preview-screen" src="https://github.com/user-attachments/assets/3c2071c4-a361-4dce-aa6a-52a9358fa8ad" />

Aplikacja pełni funkcję katalogu gier, pozwalającego na przeglądanie trendów, wyszukiwanie tytułów, czytanie szczegółów oraz zarządzanie własną biblioteką gier.

## Technologie
* HTML5
* CSS3
* JavaScript
* API: [RAWG Video Games Database API](https://rawg.io/apidocs)

## Funkcjonalności
* **3 widoki:** Strona główna, Szczegóły gry, Moja lista.
* **Komunikacja z API:** Pobieranie danych z RAWG API (fetch).
* **Dynamiczne renderowanie:** Generowanie kart gier, banerów i detali na podstawie danych JSON.
* **Obsługa błędów:** Wyłapywanie błędów zapytania i wyświetlanie komunikatów w UI.
* **Responsywność:** Layout dostosowany do urządzeń mobilnych i desktopowych.

## Rozszerzenia
1. **Wyszukiwarka:** Dynamiczne przeszukiwanie bazy gier RAWG.
2. **Infinite Scroll:** Automatyczne doładowywanie kolejnych gier na stronie głównej podczas przewijania.
3. **Lista gier:** Dodawanie gier do własnej listy z zapisem w `LocalStorage`.
4. **Recenzje:** Tworzenie własnych recenzji na karcie gry, które zapisują się w `LocalStorage`).
