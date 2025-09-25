// --- 1. DOM ELEMENTS ---
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const themeToggle = document.getElementById('theme-toggle');
const weatherDisplay = document.getElementById('weather-display');
const messageDisplay = document.getElementById('message-display'); // For errors and welcome text

const weatherIcon = document.getElementById('weather-icon');
const temperature = document.getElementById('temperature');
const cityName = document.getElementById('city-name');
const weatherDescription = document.getElementById('weather-description');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');

// --- 2. API CONFIGURATION ---
const apiKey = "1fd873c62315373cfe4df8c173231c5f"; // API KEY HERE!

// --- 3. THEME SWITCHER LOGIC ---
const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>`;
const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>`;

const applyTheme = (theme) => {
    if (theme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = sunIcon;
    } else {
        document.body.removeAttribute('data-theme');
        themeToggle.innerHTML = moonIcon;
    }
};

let currentTheme = localStorage.getItem('theme') || 'light';
applyTheme(currentTheme);

themeToggle.addEventListener('click', () => {
    currentTheme = document.body.hasAttribute('data-theme') ? 'light' : 'dark';
    localStorage.setItem('theme', currentTheme);
    applyTheme(currentTheme);
});

// --- 4. WEATHER FETCHING & UI UPDATE (SIMPLE) ---
async function getWeather(city) {
    // Hide weather display and show a temporary loading message
    weatherDisplay.classList.add('hidden');
    messageDisplay.classList.remove('hidden');
    messageDisplay.textContent = 'Fetching weather...';

    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('City not found');
        }
        const data = await response.json();
        updateWeatherUI(data);
    } catch (error) {
        console.error("Error:", error);
        messageDisplay.textContent = 'City not found. Please try again.';
    }
}

function updateWeatherUI(data) {
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    cityName.textContent = data.name;
    weatherDescription.textContent = data.weather[0].description;
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${data.wind.speed.toFixed(1)} km/h`;
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
    
    // Hide message display and show the weather info
    messageDisplay.classList.add('hidden');
    weatherDisplay.classList.remove('hidden');
}

// --- 5. EVENT LISTENERS ---
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeather(city);
    }
});

cityInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            getWeather(city);
        }
    }
});