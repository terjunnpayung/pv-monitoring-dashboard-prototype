document.addEventListener("DOMContentLoaded", () => {
    const html = document.documentElement;
    const darkModeToggle = document.getElementById('darkModeToggle');
    const userPreference = localStorage.getItem('darkMode');

    // DARK MODE
    darkModeToggle.addEventListener('click', function () {
        html.classList.toggle('dark');
        let isDarkMode = html.classList.contains('dark');
        localStorage.setItem('darkMode', isDarkMode);
        if (isDarkMode) {
            darkModeToggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" class="size-6 fill-yellow-500">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                </svg>`
        }
        else {
            darkModeToggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" class="size-6 fill-purple-700">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                </svg>`
        }

        const chart = Chart.getChart('solarChart');
        if (chart) {
            chart.update();
        }
    })

    if (userPreference) {
        html.classList.toggle('dark', userPreference === 'true');
        if (userPreference === 'true') {
            darkModeToggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" class="size-6 fill-yellow-500">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                </svg>`
        }
        else {
            darkModeToggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" class="size-6 fill-purple-700">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                </svg>`
        }
    }

    const getCSVAsObjects = async (url) => {
        try {
            const response = await fetch(url);
            const csvText = await response.text();

            const lines = csvText.trim().split('\n');
            const headers = lines[0].split(',');

            const result = lines.slice(1).map(line => {
                const values = line.split(',');
                const obj = {};

                headers.forEach((header, index) => {
                    obj[header.trim()] = values[index] ? values[index].trim() : null;
                });
                return obj;
            });
            return result;
        } catch (error) {
            console.error('Gagal mengambil file CSV: ', error)
        }
    }

    const renderMultiAxisChart = (labels, powerValues, irradiationValues) => {
        const ctx = document.getElementById('solarChart').getContext('2d');
        const existingChart = Chart.getChart(ctx);
        if (existingChart) existingChart.destroy();

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Power',
                        data: powerValues,
                        borderColor: 'rgba(118, 6, 198, 1)',
                        backgroundColor: 'rgba(118, 6, 198, 0.2)',
                        yAxisID: 'yPower',
                        borderWidth: 1,
                        pointRadius: 1,
                        fill: true,
                        tension: 0.1
                    },
                    {
                        label: 'Irradiation',
                        data: irradiationValues,
                        borderColor: 'rgba(255, 151, 66, 1)',
                        backgroundColor: 'rgba(255, 151, 66, 0.2)',
                        yAxisID: 'yIrr',
                        borderWidth: 1,
                        pointRadius: 1,
                        fill: true,
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                maintainAspectRatio: false,
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Time'
                        },
                        type: 'category',
                        ticks: {
                            maxTicksLimit: 24
                        },
                        grid: {
                            color: () => document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(220, 220, 220, 1)'
                        }
                    },
                    yPower: {
                        type: 'linear',
                        position: 'left',
                        title: { display: true, text: 'Power (W)' },
                        grid: {
                            color: () => document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(220, 220, 220, 1)'
                        }
                    },
                    yIrr: {
                        type: 'linear',
                        position: 'right',
                        title: { display: true, text: 'Irradiation (W/m²)' },
                        grid: {
                            drawOnChartArea: false,
                        }
                    }
                }
            }
        });
    }

    // Fungsi untuk merapikan tanggal Power (MM/DD/YYYY -> YYYY-MM-DD)
    const formatPowerDate = (dateStr) => {
        const [day, month, year] = dateStr.split('-');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // Fungsi untuk memotong detik pada waktu (00:00:00 -> 00:00)
    const cleanTime = (timeStr) => {
        const parts = timeStr.trim().split(':');
        return `${parts[0]}:${parts[1]}`; // Ambil Jam dan Menit saja
    }

    // Fungsi mengubah menit ke format HH:mm
    const minutesToTime = (totalMinutes) => {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    // --- Fungsi Utama untuk Memproses dan Menampilkan Data ---
    const updateDashboard = (targetDate, targetTime, combinedPowerData, combinedSensorData) => {
        const timeInterval = 15 / 60;

        // POWER PROCESSING
        const powerMap = combinedPowerData.reduce((acc, curr) => {
            if (!curr.DateTime) return acc;

            const [datePart, timePart] = curr.DateTime.split(' ');
            const formattedDate = formatPowerDate(datePart);
            const timeKey = cleanTime(timePart);

            // formatted date filter
            if (formattedDate === targetDate && timeKey <= targetTime) {
                const powerVal = parseFloat(curr.PV || 0);
                acc[timeKey] = powerVal;
            }
            return acc;
        }, {});

        // TOTAL ENERGY PROCESSING
        const totalEnergyMap = combinedPowerData.reduce((acc, curr) => {
            if (!curr.DateTime) return acc;

            const [datePart, timePart] = curr.DateTime.split(' ');
            const formattedDate = formatPowerDate(datePart);
            const timeKey = cleanTime(timePart);

            // formatted date filter
            if (formattedDate === targetDate && timeKey <= targetTime) {
                const powerVal = parseFloat(curr.PV || 0);
                const energyInterval = powerVal * timeInterval;
                return acc + energyInterval;
            }
            return acc;
        }, 0); // start from zero

        // LOAD PROCESSING
        const LoadMap = combinedPowerData.reduce((acc, curr) => {
            if (!curr.DateTime) return acc;

            const [datePart, timePart] = curr.DateTime.split(' ');
            const formattedDate = formatPowerDate(datePart);
            const timeKey = cleanTime(timePart);

            // formatted date filter
            if (formattedDate === targetDate && timeKey <= targetTime) {
                const loadVal = parseFloat(curr.Load || 0);
                acc[timeKey] = loadVal;
            }
            return acc;
        }, {});

        // IRRADIATION PROCESSING
        const irrMap = combinedSensorData.reduce((acc, curr) => {
            if (!curr.DateTime) return acc;

            const [datePart, dateSpace, timePart] = curr.DateTime.split(' ');
            const formattedDate = formatPowerDate(datePart);
            const timeKey = cleanTime(timePart);

            // formatted date filter
            if (formattedDate === targetDate && timeKey <= targetTime) {
                const irrVal = parseFloat(curr.Irradiation || 0);
                acc[timeKey] = irrVal;
            }
            return acc;
        }, {});

        // TOTAL IRRADIATION PROCESSING
        const totalIrrMap = combinedSensorData.reduce((acc, curr) => {
            if (!curr.DateTime) return acc;

            const [datePart, dateSpace, timePart] = curr.DateTime.split(' ');
            const formattedDate = formatPowerDate(datePart);
            const timeKey = cleanTime(timePart);

            // formatted date filter
            if (formattedDate === targetDate && timeKey <= targetTime) {
                const irrVal = parseFloat(curr.Irradiation || 0);
                const irradiationInterval = irrVal * timeInterval;
                return acc + irradiationInterval;
            }
            return acc;
        }, 0); // start from zero

        // TEMPERATURE PROCESSING
        const tempMap = combinedSensorData.reduce((acc, curr) => {
            if (!curr.DateTime) return acc;

            const [datePart, dateSpace, timePart] = curr.DateTime.split(' ');
            const formattedDate = formatPowerDate(datePart);
            const timeKey = cleanTime(timePart);

            // formatted date filter
            if (formattedDate === targetDate && timeKey <= targetTime) {
                const tempVal = parseFloat(curr.Module_Temperature || 0);
                acc[timeKey] = tempVal;
            }
            return acc;
        }, {});

        // DATACARD PROCESSING
        // PV Data
        const powerTime = Object.keys(powerMap).sort();
        const latestPowerTime = powerTime[powerTime.length - 1];
        const currentPower = latestPowerTime ? (powerMap[latestPowerTime]) : 0;
        const currentLoad = latestPowerTime ? (LoadMap[latestPowerTime]) : 0;
        const actualYield = totalEnergyMap;
        console.log(actualYield);

        // Sensor Data
        const sensorTime = Object.keys(irrMap).sort();
        const latestSensorTime = sensorTime[sensorTime.length - 1];
        const currentTemp = latestSensorTime ? (tempMap[latestSensorTime]) : 0;
        const totalIrradiation = totalIrrMap;
        console.log(totalIrradiation);

        // PR PROCESSING
        let performanceRatio = 0; // %
        const pvCapacity = 300000; // KWp
        const irradiationSTC = 1; // kWh/m2

        if (totalIrrMap > 0) {
            performanceRatio = (actualYield / (pvCapacity * (totalIrradiation / irradiationSTC))) * 100;
        }

        const prDisplay = performanceRatio;

        // A. Update Card Current Power
        document.getElementById('currentPowerText').innerText = (currentPower / 1000).toFixed(2);
        // Update Card Current Load
        document.getElementById('totalLoadText').innerText = (currentLoad / 1000).toFixed(2);
        // Update Card Today Yield
        document.getElementById('totalYieldText').innerText = (actualYield / 1000).toFixed(2);
        // Update Card Temperature
        document.getElementById('currentTempText').innerText = currentTemp.toFixed(1);
        // Update Card PR
        document.getElementById('currentPRText').innerText = prDisplay.toFixed(1);

        // Sinkronisasi Waktu dengan Skala 24 Jam Tetap. Kita ambil semua menit yang ada di data asli untuk presisi, tapi filter berdasarkan targetTime
        const allPossibleTimes = Array.from(new Set([...Object.keys(powerMap), ...Object.keys(irrMap)])).sort();
        const finalPowerValues = allPossibleTimes.map(t => powerMap[t] || 0);
        const finalIrrValues = allPossibleTimes.map(t => irrMap[t] || 0);

        // RENDER CHART
        renderMultiAxisChart(allPossibleTimes, finalPowerValues, finalIrrValues);
    }

    // DATA INITIALIZATION
    const powerFiles = '../api/india-solar/india-solar-api-power.csv';
    const sensorFile = '../api/india-solar/india-solar-api-weather.csv';
    const sites = [
        { id: 'bandung-tv', name: 'Bandung TV' },
        { id: 'india-solar', name: 'India Solar' },
    ];

    // EVENT INITIALIZATION
    Promise.all([getCSVAsObjects(powerFiles), getCSVAsObjects(sensorFile)])
        .then(allData => {
            const powerData = allData[0];
            const sensorData = allData[1];

            const siteSelect = document.getElementById('siteSelect');
            const dateSelect = document.getElementById('dateSelect');
            const timeSlider = document.getElementById('timeSlider');
            const timeDisplay = document.getElementById('timeDisplay');

            // adding site select
            if (siteSelect) {
                // 1. Ambil ID dari URL (misal: "india-solar-power-plant")
                const currentPath = window.location.pathname;
                const currentPageId = currentPath.substring(currentPath.lastIndexOf('/') + 1).replace('.html', '');

                // 2. Generate elemen <option> secara dinamis
                sites.forEach(site => {
                    const option = document.createElement('option');
                    option.value = site.id;
                    option.textContent = site.name;
                    option.classList.add('text-zinc-950');

                    // Tandai sebagai 'selected' jika ID cocok dengan URL saat ini
                    if (site.id === currentPageId) {
                        option.selected = true;
                    }

                    siteSelect.appendChild(option);
                });

                // 3. Listener untuk perpindahan halaman
                siteSelect.addEventListener('change', (e) => {
                    const destination = e.target.value;
                    if (destination) {
                        window.location.href = `${destination}.html`;
                    }
                });
            }

            // Adding Select Option
            const uniqueDates = [...new Set(powerData.map(item => {
                if (item.DateTime) {
                    const [datePart] = item.DateTime.split(' ');
                    return formatPowerDate(datePart);
                }
                return null;
            }))].filter(date => date !== null).sort();

            // Adding unique dates into select option
            uniqueDates.forEach(date => {
                const option = document.createElement('option');
                option.value = date;
                option.classList.add('text-zinc-950');

                // Formatting Text
                const dateObj = new Date(date);
                const options = { day: 'numeric', month: 'short', year: 'numeric' };
                option.text = dateObj.toLocaleDateString('en-GB', options);

                dateSelect.appendChild(option);
            });

            // Set default value to lastest date
            if (uniqueDates.length > 0) {
                dateSelect.value = uniqueDates[uniqueDates.length - 1];
            }

            // Fungsi triggerUpdate
            const triggerUpdate = () => {
                let timeValue;
                if (timeDisplay.tagName === "INPUT") {
                    timeValue = timeDisplay.value;
                } else {
                    timeValue = minutesToTime(timeSlider.value);
                    timeDisplay.innerText = timeValue;
                }

                // Jalankan fungsi update dashboard yang sudah dibuat sebelumnya
                updateDashboard(dateSelect.value, timeValue, powerData, sensorData);
            };

            // Event listener for date
            dateSelect.addEventListener('change', triggerUpdate);

            // Event listener for slider
            timeSlider.addEventListener('input', (e) => {
                const timeValue = minutesToTime(e.target.value);
                timeDisplay.value = timeValue;

                triggerUpdate();
            });

            // Event listener for input text
            timeDisplay.addEventListener('change', (e) => {
                const timeStr = e.target.value;

                // Time format validation
                if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeStr)) {
                    const [hours, minutes] = timeStr.split(':').map(Number);
                    const totalMinutes = (hours * 60) + minutes;

                    timeSlider.value = totalMinutes;

                    triggerUpdate();
                } else {
                    alert("Format waktu tidak valid! Gunakan format HH:mm (contoh: 14:30)");

                    timeDisplay.value = minutesToTime(timeSlider.value);
                }
            });
            triggerUpdate();
        });
});
