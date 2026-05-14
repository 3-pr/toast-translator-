/*
const addonBlackList = [
    "org.stremio.mammamia",                 // Mamma Mia
    "com.linvo.stremiochannels",            // Youtube
    "org.community.orion",                  // Orion
    "stremio.addons.mediafusion|elfhosted", // MediaFusion Elfhosted
    "org.stremio.thepiratebay-catalog",     // TPB Catalog
    "org.zoropogaddon",                     // One Piece Catalog
    "com.noone.stremio-trakt-up-next",      // Trakt Up Next
    "community.usatv",                      // USA TV
    "community.argentinatv",                // Argentina TV
    "tmdb-addon",                           // TMDB Addon
    "pw.ers.concerts"                       // Music Concerts
]
*/

const compatibilityList = [
    "com.linvo.cinemeta",               // Cinemeta
    "community.anime.kitsu",            // Kitsu 
    "org.stremio.animecatalogs",        // Anime Catalogs
    "marcojoao.ml.cyberflix.catalog",   // Cyberflix Catalogs
    "pw.ers.netflix-catalog",           // Streaming Catalogs
    "org.trakt.",                       // Trakt Stremio Official
    "community.trakt-tv",               // Trakt TV
    "org.stremio.pubdomainmovies",      // Public Domains
    "org.imdbcatalogs",                 // IMDB Catalogs
    "org.imdbcatalogs.rpdb",            // IMDB Catalogs (with ratings)
    "pw.ers.rottentomatoes",            // Rotten Tomatoes Catalogs
    "com.mdblist.",                     // MDBLists Catalogs
    //"com.sagetendo.mal-stremio-addon",  // MAL Addon
    "dev.filmwhisper.",                 // AI Film Whisper
    "community.anime.kitsu.search",     // Kitsu search addon
    "com.joaogonp.marveladdon"         // Marvel addon
    //"org.stremio.aiolists"              //AIO Lists
]


async function loadAddon(url, _showError=false, type="default", appendNow=true) {
    if (!url) {
        showError("❌ Invalid URL.");
        return null;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            if (_showError) showError(`❌ Error: ${response.status}`);
            return null;
        }

        const manifest = await response.json();
        const serverUrl = window.location.origin;

        if (!compatibilityList.some(id => manifest.id.startsWith(id))) {
            if (_showError) showError("❌ Incompatible addon.");
            return null;
        }

        if ("translated" in manifest && !url.includes(serverUrl)) {
            return null;
        }

        // Return the element without immediately appending
        return createAddonCard(manifest, url, type, appendNow);

    } catch (error) {
        console.log(error);
        return null;
    }
}

function createAddonCard(manifest, url, type="default", appendNow=true) {
    const container = document.getElementById("addons-container");

    const addonCard = document.createElement("div");
    addonCard.className = "addon-info";

    addonCard.appendChild(createAddonHeader(manifest));
    addonCard.appendChild(createAddonDescription(manifest));
    addonCard.appendChild(createAddonVersion(manifest));
    //addonCard.appendChild(createSkipPosterOption(manifest));
    addonCard.appendChild(createRPDBOption(manifest));
    addonCard.appendChild(createToastRatingsOption(manifest));
    addonCard.appendChild(createTopStreamPosterOption(manifest));
    addonCard.appendChild(createBetterPosterOption(manifest));

    // Rende checkbox esclusive
    makePosterOptionsExclusive(addonCard);

    const actionsDiv = document.createElement("div");
    actionsDiv.className = "addon-actions";

    if (type == "default") {
        const installBtn = createInstallButton(manifest, url);
        actionsDiv.appendChild(installBtn);
    } else if (type == "generator") {
        const generateBtn = createGenerateButton(manifest, url);
        const copyBtn = createCopyButton(manifest, url);
        actionsDiv.appendChild(generateBtn);
        actionsDiv.appendChild(copyBtn);
        addonCard.appendChild(createLinkTextBox("", manifest));
    }

    addonCard.appendChild(actionsDiv);

    if (appendNow) container.appendChild(addonCard);

    return addonCard; // always return the element
}

function createAddonHeader(manifest) {
    const addonHeader = document.createElement("div");
    addonHeader.className = "addon-header";

    const logo = document.createElement("img");
    logo.className = "addon-logo";
    logo.src = manifest.logo || "static/img/addon_logo.png";
    logo.alt = "Addon logo";
    addonHeader.appendChild(logo);

    const title = document.createElement("h3");
    title.innerText = manifest.name || "N/A";
    addonHeader.appendChild(title);

    return addonHeader;
}

function createAddonDescription(manifest) {
    const description = document.createElement("p");
    description.innerHTML = `<strong>Description:</strong> ${manifest.description || "N/A"}`;
    return description;
}

function createAddonVersion(manifest) {
    const version = document.createElement("p");
    version.innerHTML = `<strong>Version:</strong> ${manifest.version || "N/A"}`;
    return version;
}

function createSkipPosterOption(manifest) {
    const skipPosterDiv = document.createElement("div");
    skipPosterDiv.className = "skip-poster";

    const skipPosterCheckbox = document.createElement("input");
    skipPosterCheckbox.type = "checkbox";
    skipPosterCheckbox.id = `skipPoster-${manifest.name}`;
    skipPosterDiv.appendChild(skipPosterCheckbox);

    const skipPosterLabel = document.createElement("label");
    skipPosterLabel.htmlFor = `skipPoster-${manifest.name}`;
    skipPosterLabel.innerText = "Skip Poster";
    skipPosterDiv.appendChild(skipPosterLabel);

    return skipPosterDiv;
}

function createRPDBOption(manifest) {
    const rpdbDiv = document.createElement("div");
    rpdbDiv.className = "rpdb";

    const rpdbCheckbox = document.createElement("input");
    rpdbCheckbox.type = "checkbox";
    rpdbCheckbox.id = `rpdb-${manifest.name}`;
    rpdbDiv.appendChild(rpdbCheckbox);

    const rpdbLabel = document.createElement("label");
    rpdbLabel.htmlFor = `rpdb-${manifest.name}`;
    rpdbLabel.innerText = "RPDB Posters";
    rpdbDiv.appendChild(rpdbLabel);

    return rpdbDiv;
}

function createToastRatingsOption(manifest) {
    const toastRatingsDiv = document.createElement("div");
    toastRatingsDiv.className = "toast-ratings";

    const toastRatingsCheckbox = document.createElement("input");
    toastRatingsCheckbox.type = "checkbox";
    toastRatingsCheckbox.id = `toastRatings-${manifest.name}`;
    toastRatingsDiv.appendChild(toastRatingsCheckbox);

    const toastRatingsLabel = document.createElement("label");
    toastRatingsLabel.htmlFor = `toastRatings-${manifest.name}`;
    toastRatingsLabel.innerText = "Toast Ratings Posters";
    toastRatingsDiv.appendChild(toastRatingsLabel);

    return toastRatingsDiv;
}

function createTopStreamPosterOption(manifest) {
    const tsPosterDiv = document.createElement("div");
    tsPosterDiv.className = "tsPoster";

    const tsPosterCheckbox = document.createElement("input");
    tsPosterCheckbox.type = "checkbox";
    tsPosterCheckbox.id = `tsPoster-${manifest.name}`;
    tsPosterDiv.appendChild(tsPosterCheckbox);

    const tsPosterLabel = document.createElement("label");
    tsPosterLabel.htmlFor = `tsPoster-${manifest.name}`;
    tsPosterLabel.innerText = "Top Streaming Posters";
    tsPosterDiv.appendChild(tsPosterLabel);

    return tsPosterDiv;
}

function createBetterPosterOption(manifest) {
    const bpDiv = document.createElement("div");
    bpDiv.className = "betterPoster";

    const bpCheckbox = document.createElement("input");
    bpCheckbox.type = "checkbox";
    bpCheckbox.id = `betterPoster-${manifest.name}`;
    bpDiv.appendChild(bpCheckbox);

    const bpLabel = document.createElement("label");
    bpLabel.htmlFor = `betterPoster-${manifest.name}`;
    bpLabel.innerText = "BetterPoster";
    bpDiv.appendChild(bpLabel);

    return bpDiv;
}

function createInstallButton(manifest, url) {
    const installBtn = document.createElement("button");
    installBtn.className = "install-btn";
    installBtn.innerText = "Select";
    installBtn.state = "active";
    installBtn.style.backgroundColor = "#2ecc71";
    installBtn.onclick = () => toggleAddonSelection(installBtn, manifest, url);
    return installBtn;
}

function createGenerateButton(manifest, url) {
    const generateBtn = document.createElement("button");
    generateBtn.className = "generate-btn";
    generateBtn.innerText = "Generate link";
    generateBtn.onclick = async () => {
        await generateLinkByCard(manifest, url, generateTranslatorLink);
    };
    return generateBtn;
}

function createCopyButton(manifest, url) {
    const generateBtn = document.createElement("button");
    generateBtn.className = "copy-btn";
    generateBtn.innerText = "Copy link";
    generateBtn.onclick = () => copyLinkCard(manifest);
    return generateBtn;
}

function createLinkTextBox(link, manifest) {
    const textArea = document.createElement("textarea");
    textArea.className = "read-only-textarea";
    textArea.id = `linkBox-${manifest.name}`;
    textArea.readOnly = true; 
    textArea.value = link;
    return textArea;
}

function toggleAddonSelection(installBtn, manifest, url) {
    //const spCheckbox = document.getElementById(`skipPoster-${manifest.name}`);
    const rpdbCheckbox = document.getElementById(`rpdb-${manifest.name}`);
    const trCheckbox = document.getElementById(`toastRatings-${manifest.name}`);
    const tsCheckbox = document.getElementById(`tsPoster-${manifest.name}`);
    const bpCheckbox = document.getElementById(`betterPoster-${manifest.name}`);
    if (installBtn.state === "active") {
        installBtn.state = "not_active";
        installBtn.innerText = "Remove";
        installBtn.style.backgroundColor = "#ff4b4b";
        
        const rpdbQuery = rpdbCheckbox.checked ? 1 : 0;
        const rateQuery = trCheckbox.checked ? 1 : 0;
        const tsQuery = tsCheckbox.checked ? 1 : 0;
        const bpQuery = bpCheckbox.checked ? 1 : 0;
        
        rpdbCheckbox.disabled = true;
        trCheckbox.disabled = true;
        tsCheckbox.disabled = true;
        bpCheckbox.disabled = true;
        manifest.transportUrl = url;
        manifest.rpdb = rpdbQuery;
        manifest.toastRatings = rateQuery;
        manifest.tsPoster = tsQuery;
        manifest.betterPoster = bpQuery;
        transteArray.push(manifest);
    } else {
        rpdbCheckbox.disabled = false;
        trCheckbox.disabled = false;
        tsCheckbox.disabled = false;
        bpCheckbox.disabled = false;
        installBtn.state = "active";
        installBtn.innerText = "Select";
        installBtn.style.backgroundColor = "#2ecc71";
        
        // Remove from translation selections
        transteArray = transteArray.filter(item => item !== manifest);
    }
}

async function copyLinkCard(manifest) {
    const linkBox = document.getElementById(`linkBox-${manifest.name}`);
    await navigator.clipboard.writeText(linkBox.value);
    showSuccess('✅ Link copied!');
}

async function generateLinkByCard(manifest, url, linkGeneratorFunc) {

    // Check TMDB API Key validity
    const tmdbApiKey = document.getElementById("tmdb-key").value;

    if (!tmdbApiKey) {
        showError("⚠️ Please enter a TMDB API Key before continuing!");
        return null;
    }

    const valid = await validateTMDBKey(tmdbApiKey);
    console.log(valid)
    if (!valid) {
        showError("❌ Invalid TMDB API Key. Please check your key and try again.");
        return null;
    }

    //
    //const spCheckbox = document.getElementById(`skipPoster-${manifest.name}`);
    const rpdbCheckbox = document.getElementById(`rpdb-${manifest.name}`);
    const trCheckbox = document.getElementById(`toastRatings-${manifest.name}`);
    const tsCheckbox = document.getElementById(`tsPoster-${manifest.name}`);
    const bpCheckbox = document.getElementById(`betterPoster-${manifest.name}`);
    const linkBox = document.getElementById(`linkBox-${manifest.name}`)
    //const skipQuery = spCheckbox.checked ? 1 : 0;
    const rpdbQuery = rpdbCheckbox.checked ? 1 : 0;
    const rateQuery = trCheckbox.checked ? 1 : 0;
    const tsQuery = tsCheckbox.checked ? 1 : 0;
    const bpQuery = bpCheckbox.checked ? 1 : 0;
    const link = linkGeneratorFunc(url, rpdbQuery, rateQuery, tsQuery, bpQuery);
    
    linkBox.value = link;
    linkBox.style.opacity = 100;
    linkBox.style.height = "auto";
    linkBox.style.height = (linkBox.scrollHeight) + "px";
}


function makePosterOptionsExclusive(addonCard) {
    const posterCheckboxes = addonCard.querySelectorAll(
        '.rpdb input, .toast-ratings input, .tsPoster input, .betterPoster input'
    );

    posterCheckboxes.forEach(chk => {
        chk.addEventListener('change', () => {
            if (chk.checked) {
                posterCheckboxes.forEach(other => {
                    if (other !== chk) other.checked = false;
                });
            }

            // Show/hide global BetterPoster settings
            toggleGlobalBetterPosterSettings();
            
            // Handle exclusive API keys
            updateGlobalInputsState();
            
            // Update preview if BetterPoster is selected
            if (chk.classList.contains('betterPoster') || chk.parentElement.classList.contains('betterPoster')) {
                updateBPPreview();
            }
        });
    });
}

function toggleGlobalBetterPosterSettings() {
    const allBpCheckboxes = document.querySelectorAll('.betterPoster input');
    const globalSettings = document.getElementById('better-poster-settings');
    if (!globalSettings) return;

    const anyChecked = Array.from(allBpCheckboxes).some(chk => chk.checked);
    globalSettings.style.display = anyChecked ? 'block' : 'none';
}

function updateGlobalInputsState() {
    const allBpCheckboxes = document.querySelectorAll('.betterPoster input');
    const isAnyBpChecked = Array.from(allBpCheckboxes).some(chk => chk.checked);
    
    const topKeyInput = document.getElementById('top-key');
    if (topKeyInput) {
        if (isAnyBpChecked) {
            topKeyInput.disabled = true;
            topKeyInput.style.opacity = "0.5";
            topKeyInput.placeholder = "Disabled (BetterPoster active)";
        } else {
            topKeyInput.disabled = false;
            topKeyInput.style.opacity = "1";
            topKeyInput.placeholder = "Enter your Top Posters API key";
        }
    }
}

function updateBPPreview() {
    const trend = document.getElementById("bp-trend").checked;
    const quality = document.getElementById("bp-quality").checked;
    const genre = document.getElementById("bp-genre").checked;
    const rating = document.getElementById("bp-rating").checked;
    const source = document.getElementById("bp-source").value;
    const template = document.getElementById("bp-template").value;
    const languageInput = document.getElementById("language");
    const language = (languageInput ? languageInput.value : "ar-SA").split('-')[0];
    
    let prefix = "poster-qa";
    if (!quality) prefix = "poster-a";
    else if (!genre) prefix = "poster-ra";
    else if (!rating) prefix = "poster-gqa";
    
    let url = `https://btttr.cc/${prefix}/imdb/${template}/tt0111161.jpg?lang=${language}`;
    if (!trend) url += "&tag=none";
    if (source && source !== "none") url += `&rs=${source}`;
    
    const previewImg = document.getElementById("bp-preview-img");
    if (previewImg) previewImg.src = url;
}

// Initialize preview on load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        updateBPPreview();
        toggleGlobalBetterPosterSettings();
        updateGlobalInputsState();
    }, 500); // Small delay to ensure elements exist
    
    // Add listener to language selector if it exists
    const langSelector = document.getElementById("language");
    if (langSelector) {
        langSelector.addEventListener('change', updateBPPreview);
    }
});
