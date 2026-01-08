document.addEventListener("DOMContentLoaded", () => {
    const getCSVAsObjectsPower = async (url) => {
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

    const getCSVAsObjectsSensor = async (url) => {
        try {
            const response = await fetch(url);
            const csvText = await response.text();
            const lines = csvText.trim().split('\n');
            const headers = lines[0].split(';').map(h => h.replace(/"/g, '').trim());

            const result = lines.slice(1).map(line => {
                const values = line.split(';');
                const obj = {};

                headers.forEach((header, index) => {
                    let value = values[index] ? values[index].replace(/"/g, '').trim() : null;

                    // Opsional: Membersihkan karakter encoding yang rusak pada header/value
                    const cleanHeader = header.replace(/[^\x00-\x7F]/g, "");

                    obj[cleanHeader || `column_${index}`] = value;
                });
                return obj;
            });

            return result;
        } catch (error) {
            console.error('Gagal mengambil file CSV: ', error);
        }
    }

    const formatSensorData = (data) => {
        const firstRow = data[0];
        const headers = {
            column_0: "DateTime",
            column_2: "Module_Temperature",
            column_3: "Ambient_Temperature",
            column_4: "Wind_Velocity",
            column_5: "Insolation",
            column_6: "Status",
            column_7: "Etotal_C"
        };

        // Khusus untuk "Sensor: Sensor (#2, 79)...", kita bersihkan namanya
        const irradiationKey = Object.keys(firstRow).find(key => key.includes("Sensor: Sensor"));

        // 2. Map seluruh data (mulai dari index 1 karena index 0 adalah header)
        return data.slice(1).map(item => {
            return {
                DateTime: item.column_0,
                Irradiation: item[irradiationKey], // Nilai W/m2
                Module_Temperature: parseFloat(item.column_2),
                Ambient_Temperature: parseFloat(item.column_3),
                Wind_Velocity: parseFloat(item.column_4),
                Insolation: parseFloat(item.column_5),
                Status: item.column_6,
                Etotal_C: parseFloat(item.column_7)
            };
        });
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
                        label: 'PV Power (W)',
                        data: powerValues,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.1)',
                        yAxisID: 'yPower',
                        borderWidth: 1,
                        pointRadius: 1,
                        fill: true,
                        tension: 0.1
                    },
                    {
                        label: 'Irradiation (W/m²)',
                        data: irradiationValues,
                        borderColor: 'rgba(255, 159, 64, 1)',
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
                        }
                    },
                    yPower: {
                        type: 'linear',
                        position: 'left',
                        title: { display: true, text: 'Power (W)' }
                    },
                    yIrr: {
                        type: 'linear',
                        position: 'right',
                        title: { display: true, text: 'Irradiation (W/m²)' },
                        grid: { drawOnChartArea: false }
                    }
                }
            }
        });
    }

    // Fungsi untuk merapikan tanggal Power (MM/DD/YYYY -> YYYY-MM-DD)
    const formatPowerDate = (dateStr) => {
        const [month, day, year] = dateStr.split('/');
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
        // POWER PROCESSING
        const powerMap = combinedPowerData.reduce((acc, curr) => {
            if (!curr.DateTime) return acc;

            const [datePart, timePart] = curr.DateTime.split(' ');
            const formattedDate = formatPowerDate(datePart);
            const timeKey = cleanTime(timePart);

            // formatted date filter
            if (formattedDate === targetDate && timeKey <= targetTime) {
                acc[timeKey] = parseFloat(curr.PV || 0);
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
                const energyWatt = parseFloat(curr.PV || 0);
                return acc + energyWatt;
            }
            return acc;
        }, 0); // start from zero

        // LOAD PROCESSING
        const totalLoadMap = combinedPowerData.reduce((acc, curr) => {
            if (!curr.DateTime) return acc;

            const [datePart, timePart] = curr.DateTime.split(' ');
            const formattedDate = formatPowerDate(datePart);
            const timeKey = cleanTime(timePart);

            // formatted date filter
            if (formattedDate === targetDate && timeKey <= targetTime) {
                const loadWatt = parseFloat(curr.Load || 0);
                return acc + loadWatt;
            }
            return acc;
        }, 0); // start from zero

        // IRRADIATION PROCESSING
        const formattedIrr = formatSensorData(combinedSensorData);

        const irrMap = formattedIrr.reduce((acc, curr) => {
            if (!curr.DateTime) return acc;

            const [datePart, timePart] = curr.DateTime.split(' ');
            const timeKey = cleanTime(timePart);

            // formatted date filter
            if (datePart === targetDate && timeKey <= targetTime) {
                acc[timeKey] = parseFloat(curr.Irradiation || 0);
            }
            return acc;
        }, {});

        // TOTAL IRRADIATION PROCESSING
        const totalIrrMap = formattedIrr.reduce((acc, curr) => {
            if (!curr.DateTime) return acc;

            const [datePart, timePart] = curr.DateTime.split(' ');
            const timeKey = cleanTime(timePart);

            // formatted date filter
            if (datePart === targetDate && timeKey <= targetTime) {
                const irrWHM = parseFloat(curr.Irradiation || 0);
                return acc + irrWHM;
            }
            return acc;
        }, 0); // start from zero

        // TEMPERATURE PROCESSING
        const formattedTemp = formatSensorData(combinedSensorData);
        const tempMap = formattedTemp.reduce((acc, curr) => {
            if (!curr.DateTime) return acc;

            const [datePart, timePart] = curr.DateTime.split(' ');
            const timeKey = cleanTime(timePart);

            // formatted date filter
            if (datePart === targetDate && timeKey <= targetTime) {
                acc[timeKey] = parseFloat(curr.Module_Temperature || 0);
            }
            return acc;
        }, {});

        // Sinkronisasi Waktu dengan Skala 24 Jam Tetap. Kita ambil semua menit yang ada di data asli untuk presisi, tapi filter berdasarkan targetTime
        const allPossibleTimes = Array.from(new Set([...Object.keys(powerMap), ...Object.keys(irrMap)])).sort();
        const finalPowerValues = allPossibleTimes.map(t => powerMap[t] || 0);
        const finalIrrValues = allPossibleTimes.map(t => irrMap[t] || 0);

        // RENDER CHART
        renderMultiAxisChart(allPossibleTimes, finalPowerValues, finalIrrValues);
    }

    // DATA INITIALIZATION
    const powerFiles = '../api/bandung-tv/bandung-tv-api.csv';
    const sensorFile = '../api/bandung-tv/Bandung TV Data Sensor 8-14 Dec 2025.csv';

    // EVENT INITIALIZATION
    Promise.all([getCSVAsObjectsPower(powerFiles), getCSVAsObjectsSensor(sensorFile)])
        .then(allData => {
            const powerData = allData[0];
            const sensorData = allData[1];

            const dateSelect = document.getElementById('dateSelect');
            const timeSlider = document.getElementById('timeSlider');
            const timeDisplay = document.getElementById('timeDisplay');

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
