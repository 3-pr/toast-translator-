function generateTranslatorLink(addonUrl, rpdbOverride = null, toast_ratings = '0', tsPoster = '0', bpOverride = null) {
    const serverUrl = window.location.origin;
    const baseAddonUrl = getBaseUrl(addonUrl).replace("/manifest.json", "");
    const urlEncoded = btoa(baseAddonUrl);
    const tmdbApiKey = document.getElementById("tmdb-key").value;
    // BetterPoster Logic
    let bpEnabled = bpOverride;
    if (bpEnabled === null) {
        const globalBP = document.getElementById('better-poster-enabled');
        bpEnabled = globalBP && globalBP.checked ? '1' : '0';
    }

    // Top Poster Logic
    let tspEnabled = tsPoster;
    if (tspEnabled === '0' || tspEnabled === null) {
        const globalTSP = document.getElementById('top-poster-enabled');
        tspEnabled = globalTSP && globalTSP.checked ? '1' : '0';
    }

    const topPosterKey = document.getElementById("top-key") ? document.getElementById("top-key").value : "poster-qa";

    let userSettings = `rpdb=0,tr=0,tsp=${tspEnabled},language=${language},tmdb_key=${tmdbApiKey},bp=${bpEnabled}`;
    
    if (tspEnabled === '1') {
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
