// I'm waiting for the entire HTML page to load before I run my script.
// This is a good practice to prevent errors from trying to access elements that aren't created yet.
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. DOM ELEMENT SELECTION ---
    // I need to grab all the HTML elements I'll be working with.
    const cityInput = document.getElementById('city-input');
    const searchBtn = document.getElementById('search-btn');
    const currentLocationBtn = document.getElementById('current-location-btn');
    const themeToggle = document.getElementById('theme-toggle');
    
    // These are the containers that I'll show or hide.
    const weatherContainer = document.getElementById('weather-container');
    const currentWeatherDisplay = document.getElementById('current-weather-display');
    const forecastDisplay = document.getElementById('forecast-display');
    const messageDisplay = document.getElementById('message-display');
    
    // Specific elements for displaying weather data.
    const cityName = document.getElementById('city-name');
    const weatherDescription = document.getElementById('weather-description');
    const weatherIcon = document.getElementById('weather-icon');
    const temperature = document.getElementById('temperature');
    const humidity = document.getElementById('humidity');
    const windSpeed = document.getElementById('wind-speed');
    const forecastCardsContainer = document.getElementById('forecast-cards-container');

    // Elements for the new features.
    const tempUnitC = document.getElementById('temp-unit-c');
    const tempUnitF = document.getElementById('temp-unit-f');
    const recentSearchesContainer = document.getElementById('recent-searches-container');
    const recentSearchesDropdown = document.getElementById('recent-searches-dropdown');
    const weatherAlert = document.getElementById('weather-alert');
    const alertMessage = document.getElementById('alert-message');
    const backgroundContainer = document.getElementById('background-container');

    // --- 2. API CONFIGURATION & STATE MANAGEMENT ---
    const apiKey = "1fd873c62315373cfe4df8c173231c5f"; // My OpenWeatherMap API Key
    let currentUnit = 'metric'; // 'metric' for Celsius, 'imperial' for Fahrenheit
    let lastFetchedData = null; // I'll store the last successful data fetch here to avoid unnecessary API calls.

    // --- 3. THEME SWITCHER LOGIC (TAILWIND COMPATIBLE) ---
    // Icons for the theme toggle button.
    const sunIcon = `<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>`;
    const moonIcon = `<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>`;

    // This function applies the theme by adding/removing the 'dark' class from the <html> element.
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            themeToggle.innerHTML = sunIcon;
        } else {
            document.documentElement.classList.remove('dark');
            themeToggle.innerHTML = moonIcon;
        }
    };

    // I'm checking localStorage for a saved theme preference. If not found, I default to 'light'.
    let savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
        savedTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
        localStorage.setItem('theme', savedTheme);
        applyTheme(savedTheme);
    });

    // --- 4. WEATHER FETCHING & DATA HANDLING ---

    // This is my main function to get weather data. It takes a URL and returns the JSON data.
    const fetchWeatherData = async (url) => {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    };

    // This function orchestrates the fetching for both current weather and the forecast.
    const getWeather = async (city) => {
        // First, I show a loading message and hide the old data.
        messageDisplay.classList.remove('hidden');
        messageDisplay.querySelector('p').textContent = `Fetching weather for ${city}...`;
        currentWeatherDisplay.classList.add('hidden');
        forecastDisplay.classList.add('hidden');
        weatherAlert.classList.add('hidden'); // Also hide any old alerts

        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

        try {
            // I'm using Promise.all to fetch both sets of data at the same time for better performance.
            const [currentWeather, forecast] = await Promise.all([
                fetchWeatherData(currentWeatherUrl),
                fetchWeatherData(forecastUrl)
            ]);
            
            lastFetchedData = { currentWeather, forecast }; // Storing the raw metric data
            updateUI(lastFetchedData);
            saveSearch(city); // Save the city to recent searches on success
            loadAndDisplayRecentSearches(); // Update the dropdown

        } catch (error) {
            console.error("Failed to fetch weather data:", error);
            // If something goes wrong, I display a clear error message.
            messageDisplay.classList.remove('hidden');
            messageDisplay.querySelector('p').textContent = 'City not found. Please check the spelling and try again.';
            currentWeatherDisplay.classList.add('hidden');
            forecastDisplay.classList.add('hidden');
        }
    };
    
    // I created a separate function to get weather by coordinates for the geolocation feature.
    const getWeatherByCoords = async (lat, lon) => {
        messageDisplay.classList.remove('hidden');
        messageDisplay.querySelector('p').textContent = `Fetching weather for your location...`;
        currentWeatherDisplay.classList.add('hidden');
        forecastDisplay.classList.add('hidden');

        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        
        try {
            const [currentWeather, forecast] = await Promise.all([
                fetchWeatherData(currentWeatherUrl),
                fetchWeatherData(forecastUrl)
            ]);
            lastFetchedData = { currentWeather, forecast };
            updateUI(lastFetchedData);
        } catch (error) {
            console.error("Failed to fetch weather data by coords:", error);
            messageDisplay.querySelector('p').textContent = 'Could not fetch weather for your location.';
        }
    };

    // --- 5. UI UPDATE FUNCTIONS ---

    // This is the main function that updates the entire UI.
    const updateUI = (data) => {
        updateCurrentWeather(data.currentWeather);
        updateForecast(data.forecast);

        // Once data is loaded, I hide the message display and show the weather content.
        messageDisplay.classList.add('hidden');
        currentWeatherDisplay.classList.remove('hidden');
        forecastDisplay.classList.remove('hidden');
    };
    
    // This function specifically updates the current weather section.
    const updateCurrentWeather = (data) => {
        const temp = (currentUnit === 'metric') ? data.main.temp : (data.main.temp * 9/5) + 32;
        const wind = (currentUnit === 'metric') ? data.wind.speed * 3.6 : data.wind.speed; // Convert m/s to km/h or mph
        const windUnit = (currentUnit === 'metric') ? 'km/h' : 'mph';

        cityName.textContent = `${data.name}, ${data.sys.country}`;
        weatherDescription.textContent = data.weather[0].description;
        temperature.textContent = `${Math.round(temp)}`;
        humidity.textContent = `${data.main.humidity}%`;
        windSpeed.textContent = `${wind.toFixed(1)} ${windUnit}`;
        weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
        weatherIcon.alt = data.weather[0].description;

        // I'm adding a check here for the dynamic background and alerts.
        handleWeatherConditions(data.weather[0].main, data.main.temp);
    };

    // This function handles the 5-day forecast.
    const updateForecast = (data) => {
        forecastCardsContainer.innerHTML = ''; // I clear out old forecast cards first.

        // The API gives data every 3 hours, so I need to filter it to get one forecast per day.
        // I'm choosing the forecast closest to noon (12:00) for each day.
        const dailyForecasts = data.list.filter(item => item.dt_txt.includes("12:00:00"));

        dailyForecasts.forEach(day => {
            const date = new Date(day.dt * 1000);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            
            const temp = (currentUnit === 'metric') ? day.main.temp : (day.main.temp * 9/5) + 32;

            const card = `
                <div class="text-center p-3 bg-white/30 dark:bg-black/20 rounded-lg flex flex-col items-center">
                    <p class="font-semibold text-gray-700 dark:text-gray-300">${dayName}</p>
                    <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="${day.weather[0].description}" class="w-12 h-12">
                    <p class="font-bold text-gray-800 dark:text-white">${Math.round(temp)}°</p>
                </div>
            `;
            forecastCardsContainer.innerHTML += card;
        });
    };
    
    // This function handles special UI changes based on weather.
    const handleWeatherConditions = (condition, temp) => {
        // Dynamic background for rain
        if (condition.toLowerCase().includes('rain')) {
            backgroundContainer.classList.add('rain');
        } else {
            backgroundContainer.classList.remove('rain');
        }

        // Custom alert for extreme heat
        if (temp > 40) { // Checking temperature in Celsius
            alertMessage.textContent = "Extreme heat warning! Stay hydrated.";
            weatherAlert.classList.remove('hidden');
        } else {
            weatherAlert.classList.add('hidden');
        }
    };
    
    // --- 6. FEATURE-SPECIFIC LOGIC (UNITS, RECENTS, GEOLOCATION) ---

    // Logic for the °C/°F toggle.
    const handleUnitToggle = (selectedUnit) => {
        if (currentUnit === selectedUnit) return; // Do nothing if the unit is already selected.
        
        currentUnit = selectedUnit;

        // Update button styles
        if (selectedUnit === 'metric') {
            tempUnitC.classList.replace('opacity-50', 'opacity-100');
            tempUnitF.classList.replace('opacity-100', 'opacity-50');
        } else {
            tempUnitF.classList.replace('opacity-50', 'opacity-100');
            tempUnitC.classList.replace('opacity-100', 'opacity-50');
        }
        
        // If I have data, I'll just re-render it with the new unit instead of a new API call.
        if (lastFetchedData) {
            updateUI(lastFetchedData);
        }
    };

    // This function saves a successfully searched city to localStorage.
    const saveSearch = (city) => {
        let searches = JSON.parse(localStorage.getItem('recentSearches')) || [];
        // I'm using a Set to easily handle duplicates and keep the list clean.
        searches = [city.toLowerCase(), ...searches.filter(s => s !== city.toLowerCase())];
        if (searches.length > 5) searches.pop(); // Keep only the 5 most recent searches.
        localStorage.setItem('recentSearches', JSON.stringify(searches));
    };

    // This function loads searches from localStorage and populates the dropdown.
    const loadAndDisplayRecentSearches = () => {
        const searches = JSON.parse(localStorage.getItem('recentSearches')) || [];
        if (searches.length > 0) {
            recentSearchesDropdown.innerHTML = `<option value="" disabled selected>Recent Searches</option>`; // Default option
            searches.forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                // I'm capitalizing the city name for better display.
                option.textContent = city.charAt(0).toUpperCase() + city.slice(1);
                recentSearchesDropdown.appendChild(option);
            });
            recentSearchesContainer.classList.remove('hidden');
        } else {
            recentSearchesContainer.classList.add('hidden');
        }
    };

    // --- 7. EVENT LISTENERS ---

    // For the main search button.
    searchBtn.addEventListener('click', () => {
        const city = cityInput.value.trim();
        if (city) {
            getWeather(city);
            cityInput.value = '';
        } else {
            // I'm adding a nice little validation message here.
            messageDisplay.classList.remove('hidden');
            messageDisplay.querySelector('p').textContent = 'Please enter a city name.';
        }
    });

    // To allow searching by pressing the 'Enter' key.
    cityInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            searchBtn.click();
        }
    });

    // For the current location button.
    currentLocationBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    getWeatherByCoords(latitude, longitude);
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    messageDisplay.classList.remove('hidden');
                    messageDisplay.querySelector('p').textContent = 'Unable to retrieve your location. Please allow location access.';
                }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    });

    // For the unit toggle buttons.
    tempUnitC.addEventListener('click', () => handleUnitToggle('metric'));
    tempUnitF.addEventListener('click', () => handleUnitToggle('imperial'));
    
    // For the recent searches dropdown.
    recentSearchesDropdown.addEventListener('change', (event) => {
        const selectedCity = event.target.value;
        if (selectedCity) {
            getWeather(selectedCity);
        }
    });

    // --- 8. INITIALIZATION ---
    // On page load, I'll immediately populate the recent searches dropdown.
    loadAndDisplayRecentSearches();

});