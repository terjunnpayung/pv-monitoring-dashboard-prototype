document.addEventListener("DOMContentLoaded", () => {
    const html = document.documentElement;
    const darkModeToggle = document.getElementById('darkModeToggle');
    const userPreference = localStorage.getItem('darkMode');

    darkModeToggle.addEventListener('click', () => {
        html.classList.toggle('dark');
        const isDarkMode = html.classList.contains('dark');
        localStorage.setItem('darkMode', isDarkMode);
    });

    if (userPreference === 'true') {
        html.classList.add('dark');
    } else {
        html.classList.remove('dark');
    }

    const siteSelect = document.getElementById('siteSelect');
    const sites = [
        { id: 'bandung-tv', name: 'Bandung TV' },
        { id: 'india-solar', name: 'India Solar' },
    ];

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
});
