async function getCSVAsObjectsPower(url) {
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

async function getCSVAsObjectsIrradiation(url) {
    try {
        const response = await fetch(url);
        const csvText = await response.text();

        // 1. Pecah berdasarkan baris
        const lines = csvText.trim().split('\n');

        // 2. Gunakan pemisah ';' sesuai format file Anda
        // Kita gunakan regex /;|,(?=(?:(?:[^"]*"){2})*[^"]*$)/ agar lebih aman jika ada koma di dalam teks
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

getCSVAsObjectsPower('/api/bandung-tv/Bandung TV 8 Dec 2025.csv').then(data => {
    // 1. Filter data berdasarkan rentang tanggal
    const filteredData = data.filter(item => {
        // Ambil bagian tanggal saja (DD-MM-YYYY) dari string "15-05-2020 00:00"
        const datePart = item.DateTime.split(' ')[0];

        // Ubah format DD-MM-YYYY menjadi YYYY-MM-DD agar bisa dibandingkan secara string/Date
        const [month, day, year] = datePart.split('/');
        const formattedDate = `${year}-${month}-${day}`;

        return formattedDate === "2025-12-8"
    });
    console.log(filteredData);

    // 2. Lanjutkan dengan Aggregation (Penjumlahan)
    const aggregatedData = filteredData.reduce((acc, curr) => {
        const time = curr.DateTime;

        if (!acc[time]) {
            acc[time] = {
                DateTime: time,
                PV: 0,
                Grid: 0,
                Load: 0
            };
        }

        acc[time].PV += parseFloat(curr.PV || 0);
        acc[time].Grid += parseFloat(curr.Grid || 0);
        acc[time].Load += parseFloat(curr.Load || 0);

        return acc;
    }, {});

    const finalResult = Object.values(aggregatedData);

    const dateTime = finalResult.map(item => {
        // item.DateTime formatnya "15-05-2020 06:15"
        // split(' ') membagi menjadi ["15-05-2020", "06:15"]
        const timePart = item.DateTime.split(' ')[1];
        return timePart; // Mengembalikan hanya "06:15"
    });
    const acPowerValues = finalResult.map(item => item.PV);

    // console.log(finalResult);
    // renderMultiAxisChart(dateTime, acPowerValues);
});

getCSVAsObjectsIrradiation('/api/bandung-tv/Bandung TV Data Sensor 8-14 Dec 2025.csv').then(data => {
    const allFormattedData = formatSensorData(data);
    const filteredData = allFormattedData.filter(item => {
        if (!item.DateTime) return false;
        const datePart = item.DateTime.split(' ')[0];
        return datePart === "2025-12-08"
    });
    console.log(filteredData);

    // 2. Lanjutkan dengan Aggregation (Penjumlahan)
    const aggregatedData = filteredData.reduce((acc, curr) => {
        const time = curr.DateTime;

        if (!acc[time]) {
            acc[time] = {
                DateTime: time,
                Ambient_Temperature: 0,
                Etotal_C: 0,
                Insolation: 0,
                Irradiation: 0,
                Module_Temperature: 0,
                Status: 0,
                Wind_Velocity: 0
            };
        }

        acc[time].Ambient_Temperature += parseFloat(curr.Ambient_Temperature || 0);
        acc[time].Etotal_C += parseFloat(curr.Etotal_C || 0);
        acc[time].Insolation += parseFloat(curr.Insolation || 0);
        acc[time].Irradiation += parseFloat(curr.Irradiation || 0);
        acc[time].Module_Temperature += parseFloat(curr.Module_Temperature || 0);
        acc[time].Status += parseFloat(curr.Status || 0);
        acc[time].Wind_Velocity += parseFloat(curr.Wind_Velocity || 0);
        return acc;
    }, {});

    const finalResult = Object.values(aggregatedData);
    console.log(finalResult);
});