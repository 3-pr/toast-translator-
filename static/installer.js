function generateTranslatorLink(addonUrl, rpdb, toast_ratings, tsPoster) {
    const serverUrl = window.location.origin;
    const baseAddonUrl = getBaseUrl(addonUrl).replace("/manifest.json", "");
    const urlEncoded = btoa(baseAddonUrl);
    const tmdbApiKey = document.getElementById("tmdb-key").value;
    const language = document.getElementById("language").value;
    let rpdbKey = document.getElementById("rpdb-key") ? document.getElementById("rpdb-key").value : "";
    const topPosterKey = document.getElementById("top-key") ? document.getElementById("top-key").value : "";

    // Simplified BetterPoster Logic
    const bpEnabled = document.getElementById('better-poster-enabled').checked ? '1' : '0';

    let userSettings = `rpdb=${rpdb},tr=${toast_ratings},tsp=${tsPoster},language=${language},tmdb_key=${tmdbApiKey},bp=${bpEnabled}`;
    
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
