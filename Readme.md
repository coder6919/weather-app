WeatherWise is a modern, responsive, and feature-rich weather forecast application built with HTML, Tailwind CSS, and JavaScript. It fetches live data from the OpenWeatherMap API to provide users with current weather conditions, a 5-day forecast, and several user-friendly features like geolocation, recent search history, and a persistent light/dark theme.

Github linl- [https://github.com/coder6919/weather-app]

Features
Current Weather Details: Get up-to-the-minute information on temperature, weather conditions, humidity, and wind speed.

5-Day Extended Forecast: View a concise weather forecast for the next five days.

Search by City: Find weather information for any city around the globe.

One-Click Geolocation: Instantly get the forecast for your current location using the browser's geolocation API.

Recent Searches History: A dropdown menu automatically saves and displays your last 5 city searches for quick access.

°C / °F Unit Toggle: Switch between Celsius and Fahrenheit on the fly. The conversion happens instantly without reloading or re-fetching data.

Light/Dark Theme: Toggle between a light and dark theme. Your preference is saved in localStorage and remembered on your next visit.

Dynamic Backgrounds: The user interface features a dynamic background that changes to reflect rainy weather conditions.

Extreme Weather Alerts: A custom alert message appears on the UI if the temperature exceeds 40°C.

Fully Responsive: The layout is designed to be intuitive and accessible on all screen sizes, from mobile phones to desktops.

Technology Stack
HTML5: For the core structure and content.

Tailwind CSS: For all major styling and layout, implemented via a CDN for rapid, utility-first design.

CSS3: For minimal custom styling, such as the dynamic background effect.

JavaScript (ES6+): For all application logic, including API calls, state management, and DOM manipulation.

How to Run
Download or Clone: Get the index.html, style.css, and script.js files and place them in the same project folder.

Get an API Key:

Sign up for a free account at OpenWeatherMap.

Navigate to the "API keys" section and copy your default API key.

Add the API Key:

Open the script.js file.

Find the line: const apiKey = "YOUR_API_KEY_HERE";

Replace "YOUR_API_KEY_HERE" with the key you copied.

Open in Browser: Open the index.html file in your preferred web browser.

Code Explained
index.html
The HTML file provides the complete structure for the application. All styling is handled directly within this file using Tailwind CSS utility classes. It includes the Tailwind CDN script in the <head> and links to the script.js file at the end of the <body> for all functionality. Elements are given specific id attributes for easy targeting by the JavaScript.

style.css
This is a minimal stylesheet that complements Tailwind CSS. Its primary purpose is to handle the dynamic background image effect, which is smoother to implement with a dedicated CSS class.

script.js
This file is the brain of the application and handles all the logic.

API Interaction: The script fetches both current weather and the 5-day forecast data concurrently using Promise.all for better performance. It can fetch data based on either a city name or geographic coordinates.

State Management: It manages the application's state, such as the selected temperature unit (metric or imperial). It cleverly stores the last fetched data, allowing the °C/°F toggle to convert temperatures on the client side without needing extra API calls.

LocalStorage: localStorage is used for two key persistence features: saving the user's preferred theme (light/dark) and storing the list of recently searched cities.

UI Logic: The script is responsible for all DOM manipulation, including dynamically creating and rendering the 5-day forecast cards, updating all weather details, and toggling visibility of different sections.

Error Handling: If an API call fails or a city is not found, a user-friendly error message is displayed directly on the UI instead of using a disruptive browser alert.
