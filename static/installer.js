function generateTranslatorLink(addonUrl, rpdbOverride = null, toast_ratings = '0', tsPoster = '0', bpOverride = null) {
    const serverUrl = window.location.origin;
    const baseAddonUrl = getBaseUrl(addonUrl).replace("/manifest.json", "");
    const urlEncoded = btoa(baseAddonUrl);
    const tmdbApiKey = document.getElementById("tmdb-key").value;
    const language = document.getElementById("language").value;
    let rpdbKey = "t0-free-rpdb"; // Use default free key unless extended later

    // BetterPoster Logic
    let bpEnabled = bpOverride;
    if (bpEnabled === null) {
        const globalBP = document.getElementById('better-poster-enabled');
        bpEnabled = globalBP && globalBP.checked ? '1' : '0';
    }

    // RPDB / IMDb Poster Logic
    let rpdbEnabled = rpdbOverride;
    if (rpdbEnabled === null) {
        const globalRPDB = document.getElementById('rpdb-enabled');
        rpdbEnabled = globalRPDB && globalRPDB.checked ? '1' : '0';
    }

    let userSettings = `rpdb=${rpdbEnabled},tr=0,tsp=0,language=${language},tmdb_key=${tmdbApiKey},bp=${bpEnabled}`;
    
    if (rpdbEnabled === '1') {
        userSettings += `,rpdb_key=${rpdbKey}`;
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
