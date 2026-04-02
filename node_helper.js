const NodeHelper = require("node_helper");

module.exports = NodeHelper.create({
    retryTimer: null,

    log: function(level, message) {
        const levels = { "NONE": 0, "ERROR": 1, "INFO": 2, "DEBUG": 3 };
        const configLevel = this.config && this.config.logLevel ? levels[this.config.logLevel.toUpperCase()] : 2;
        const msgLevel = levels[level] || 2;

        if (msgLevel <= configLevel) {
            if (level === "ERROR") {
                console.error(message);
            } else {
                console.log(message);
            }
        }
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "CONFIG") {
            this.config = payload;
            this.log("INFO", "Configuration received. Starting weather monitor...");
            this.checkWeather();

            setInterval(() => {
                this.log("DEBUG", "Regular update interval reached.");
                this.checkWeather();
            }, this.config.updateInterval);
        }
    },

    async checkWeather() {
        if (this.retryTimer) {
            clearTimeout(this.retryTimer);
            this.retryTimer = null;
        }


        const { lat, lon, showIfRainWithin, alwaysVisible, rainSearchRadius = 0 } = this.config;

        try {
            this.log("DEBUG", `--- WEATHER CHECK STARTED ---`);
            const locations = [{ lat: lat, lon: lon, name: "Center" }];

            if (rainSearchRadius > 0) {
                const latOffset = rainSearchRadius / 111.32;
                const lonOffset = rainSearchRadius / (111.32 * Math.cos(lat * Math.PI / 180));

                locations.push({ lat: lat + latOffset, lon: lon, name: "North" });
                locations.push({ lat: lat - latOffset, lon: lon, name: "South" });
                locations.push({ lat: lat, lon: lon + lonOffset, name: "East" });
                locations.push({ lat: lat, lon: lon - lonOffset, name: "West" });

                this.log("DEBUG", `Search Radius active: ${rainSearchRadius}km. Scanning 5 points around ${lat}, ${lon}`);
            } else {
                this.log("DEBUG", `Scanning exact location: ${lat}, ${lon}`);
            }

            const today = new Date().toISOString();

            const fetchPromises = locations.map(loc => {
                const url = `https://api.brightsky.dev/weather?lat=${loc.lat}&lon=${loc.lon}&date=${today}`;
                return fetch(url).then(async res => {
                    if (!res.ok) throw new Error(`Status ${res.status}`);
                    const data = await res.json();
                    return { name: loc.name, weather: data.weather };
                });
            });

            const responses = await Promise.all(fetchPromises);

            const now = new Date();
            const checkStart = new Date(now.getTime() - 60 * 60000);
            const limit = new Date(now.getTime() + showIfRainWithin * 60000);

            this.log("DEBUG", `Looking for rain between ${checkStart.toLocaleTimeString()} and ${limit.toLocaleTimeString()}`);

            let upcomingEvent = null;


            for (const response of responses) {
                if (!response.weather) continue;

                const relevantHours = response.weather.filter(h => {
                    const fTime = new Date(h.timestamp);
                    return fTime >= checkStart && fTime <= limit;
                });


                const eventAtLocation = relevantHours.find(h => h.precipitation > 0);

                if (eventAtLocation) {
                    this.log("DEBUG", `[${response.name}] Hit! Precipitation: ${eventAtLocation.precipitation} mm | Condition: ${eventAtLocation.condition}`);
                    if (!upcomingEvent) {
                        upcomingEvent = {
                            ...eventAtLocation,
                            locationName: response.name
                        };
                    }
                } else {
                    this.log("DEBUG", `[${response.name}] All clear.`);
                }
            }


            if (!alwaysVisible) {
                if (upcomingEvent) {

                    this.log("INFO", `Precipitation detected nearby at [${upcomingEvent.locationName}] (${upcomingEvent.precipitation} mm). Radar will be shown.`);
                    this.sendSocketNotification("SHOW_RADAR", { show: true, precipType: upcomingEvent.condition || "rain" });
                } else {
                    this.log("INFO", `No precipitation expected in the given timeframe or radius. Hiding radar.`);
                    this.sendSocketNotification("SHOW_RADAR", { show: false });
                }
            } else {

                if (upcomingEvent) {
                    this.sendSocketNotification("SHOW_RADAR", { show: true, precipType: upcomingEvent.condition || "rain" });
                } else {
                    this.sendSocketNotification("SHOW_RADAR", { show: true, precipType: "rain" });
                }
            }

        } catch (error) {
            this.log("ERROR", `Fetch failed: ${error.message}`);
            this.log("INFO", "Network not ready or API unreachable. Scheduling automatic retry in 30 seconds...");

            this.retryTimer = setTimeout(() => {
                this.log("INFO", "Executing scheduled retry after previous failure...");
                this.checkWeather();
            }, 30000);
        }
    }
});
