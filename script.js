// ================= 1. THEME TOGGLE LOGIC =================
const themeBtn = document.getElementById('theme-toggle');
const body = document.body;

if(localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-theme');
    themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i> Light Mode';
}

themeBtn.addEventListener('click', () => {
    body.classList.toggle('dark-theme');
    const isDark = body.classList.contains('dark-theme');
    if(isDark){
        themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i> Light Mode';
        localStorage.setItem('theme', 'dark'); 
    } else {
        themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i> Dark Mode';
        localStorage.setItem('theme', 'light'); 
    }
});

// ================= 2. WEATHER API LOGIC =================

const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const apiPollutionUrl = "https://api.openweathermap.org/data/2.5/air_pollution?";

const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const weatherIcon = document.querySelector(".weather-icon");
const errorMsg = document.querySelector(".error");
const weatherSection = document.querySelector(".weather");

// --- NEW FUNCTION TO GET KEY AND CHECK WEATHER ---
async function checkWeather(city) {
    if(!city) {
        alert("Please enter a city name");
        return;
    }

    try {
        // 1. FETCH THE API KEY FROM config.json
        const configResponse = await fetch('config.json');
        const config = await configResponse.json();
        const apiKey = config.apiKey;

        // 2. Fetch Basic Weather using the key
        const response = await fetch(apiUrl + city + `&appid=${apiKey}`);

        if (response.status == 404) {
            errorMsg.style.display = "block";
            weatherSection.style.display = "none";
        } else {
            const data = await response.json();

            // Update UI
            document.querySelector(".city").innerText = data.name;
            document.querySelector(".temp").innerText = Math.round(data.main.temp) + "°c";
            document.querySelector(".humidity").innerText = data.main.humidity + "%";
            document.querySelector(".wind").innerText = data.wind.speed + " km/h";
            document.querySelector(".desc").innerText = data.weather[0].description;
            
            const iconCode = data.weather[0].icon;
            weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

            // 3. Get Lat/Lon & Fetch Air Quality
            const lat = data.coord.lat;
            const lon = data.coord.lon;
            const aqiResponse = await fetch(`${apiPollutionUrl}lat=${lat}&lon=${lon}&appid=${apiKey}`);
            const aqiData = await aqiResponse.json();

            const aqiIndex = aqiData.list[0].main.aqi;
            let aqiText = ["Unknown", "Good", "Fair", "Moderate", "Poor", "Very Poor"][aqiIndex] || "Unknown";
            
            document.querySelector(".aqi").innerText = aqiText;

            weatherSection.style.display = "block";
            errorMsg.style.display = "none";
        }
    } catch (err) {
        console.error("Error details:", err);
    }
}

searchBtn.addEventListener("click", () => checkWeather(searchBox.value));
searchBox.addEventListener("keypress", (e) => {
    if (e.key === "Enter") checkWeather(searchBox.value);
});