function flagFromCountry(country) {
    return country
        .toUpperCase()
        .split('')
        .map(c => String.fromCodePoint(127397 + c.charCodeAt(0)))
        .join('');
}

const select = document.getElementById('language');

fetch('languages.json')
    .then(response => response.json())
    .then(locales_main => {
        locales_main.forEach(locale => {
            const [lang, country] = locale.split('-');

            let languageName;
            try {
                languageName = new Intl.DisplayNames([lang], { type: 'language' }).of(lang);
            } catch {
                languageName = lang;
            }

            const flag = flagFromCountry(country);

            const option = document.createElement('option');
            option.value = locale;
            option.textContent = `${flag} ${languageName} (${locale})`;
            select.appendChild(option);
        });

        // Initial RTL check
        if (select.value.startsWith('ar')) {
            document.body.classList.add('rtl');
        }
    })
    .catch(err => console.error('Error on load languages.json:', err));

select.addEventListener('change', () => {
    if (select.value.startsWith('ar')) {
        document.body.classList.add('rtl');
    } else {
        document.body.classList.remove('rtl');
    }
});
