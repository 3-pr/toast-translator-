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
        locales_main.filter(l => l === 'ar-SA').forEach(locale => {
            const [lang, country] = locale.split('-');
            const languageName = "العربية";
            const flag = flagFromCountry(country);

            const option = document.createElement('option');
            option.value = locale;
            option.textContent = `${flag} ${languageName} (${locale})`;
            select.appendChild(option);
        });
    })
    .catch(err => console.error('Error on load languages.json:', err));
