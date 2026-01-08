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
