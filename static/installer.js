function generateTranslatorLink(addonUrl, rpdb, toast_ratings, tsPoster) {
    const serverUrl = window.location.origin;
    const baseAddonUrl = getBaseUrl(addonUrl).replace("/manifest.json", "");
    const urlEncoded = btoa(baseAddonUrl);
    const tmdbApiKey = document.getElementById("tmdb-key").value;
    const language = document.getElementById("language").value;
    let rpdbKey = document.getElementById("rpdb-key") ? document.getElementById("rpdb-key").value : "";
    const topPosterKey = document.getElementById("top-key") ? document.getElementById("top-key").value : "";

    // BetterPoster Logic
    const bpEnabled = document.getElementById('better-poster-enabled').checked ? '1' : '0';
    let bpPath = '';
    if (document.getElementById('bp-genre').checked) bpPath += 'g';
    if (document.getElementById('bp-quality').checked) bpPath += 'q';
    if (document.getElementById('bp-rating').checked) bpPath += 'r';
    if (document.getElementById('bp-average').checked) bpPath += 'a';
    
    const bpSource = document.getElementById('bp-source').value;
    const bpTrend = document.getElementById('bp-trend').checked ? '1' : '0';

    let userSettings = `rpdb=${rpdb},tr=${toast_ratings},tsp=${tsPoster},language=${language},tmdb_key=${tmdbApiKey},bp=${bpEnabled},bpp=${bpPath},bps=${bpSource},bpt=${bpTrend}`;
    
    if (rpdb === '1') {
        userSettings += `,rpdb_key=${rpdbKey || "t0-free-rpdb"}`;
    } else if (tsPoster === '1') {
        userSettings += `,topkey=${topPosterKey}`;
    }

    if (addonUrl.includes(serverUrl)) {
        const addonBase64String = addonUrl.split("/")[3];
        return `${serverUrl}/${addonBase64String}/${userSettings}/manifest.json`;
    }

    return `${serverUrl}/${urlEncoded}/${userSettings}/manifest.json`;
}

function getBaseUrl(urlString) {
    try {
        const url = new URL(urlString);
        return `${url.protocol}//${url.host}${url.pathname}`;
    } catch (e) {
        return urlString;
    }
}
