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
    "dev.filmwhisper.",                 // AI Film Whisper
    "community.anime.kitsu.search",     // Kitsu search addon
    "com.joaogonp.marveladdon"         // Marvel addon
]

async function loadAddon(url, _showError = false, type = "default", appendNow = true) {
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

        return createAddonCard(manifest, url, type, appendNow);

    } catch (error) {
        console.log(error);
        return null;
    }
}

function createAddonCard(manifest, url, type = "default", appendNow = true) {
    const container = document.getElementById("addons-container");

    const addonCard = document.createElement("div");
    addonCard.className = "addon-info";

    // Header
    const addonHeader = document.createElement("div");
    addonHeader.className = "addon-header";
    const logo = document.createElement("img");
    logo.className = "addon-logo";
    logo.src = manifest.logo || "static/img/addon_logo.png";
    logo.alt = "Logo";
    const title = document.createElement("h3");
    title.innerText = manifest.name || "N/A";
    addonHeader.appendChild(logo);
    addonHeader.appendChild(title);
    addonCard.appendChild(addonHeader);

    // Description
    const description = document.createElement("p");
    description.innerHTML = `<strong>Description:</strong> ${manifest.description || "N/A"}`;
    addonCard.appendChild(description);

    // Poster Options Grid
    const optionsGrid = document.createElement("div");
    optionsGrid.className = "poster-options";

    optionsGrid.appendChild(createOption(manifest, "bp", "✨ BetterPoster"));
    optionsGrid.appendChild(createOption(manifest, "rpdb", "⭐ RPDB Posters"));
    optionsGrid.appendChild(createOption(manifest, "tr", "📊 Toast Ratings"));
    optionsGrid.appendChild(createOption(manifest, "tsp", "🎬 Top Stream"));

    addonCard.appendChild(optionsGrid);

    // Actions
    const actionsDiv = document.createElement("div");
    actionsDiv.className = "addon-actions";

    if (type == "default") {
        const installBtn = document.createElement("button");
        installBtn.innerText = "Select Addon";
        installBtn.state = "active";
        installBtn.style.backgroundColor = "var(--success)";
        installBtn.onclick = () => toggleAddonSelection(installBtn, manifest, url);
        actionsDiv.appendChild(installBtn);
    } else {
        const generateBtn = document.createElement("button");
        generateBtn.innerText = "Generate";
        generateBtn.onclick = () => generateLinkByCard(manifest, url);
        
        const copyBtn = document.createElement("button");
        copyBtn.innerText = "Copy";
        copyBtn.style.backgroundColor = "var(--border)";
        copyBtn.onclick = () => copyLinkCard(manifest);
        
        actionsDiv.appendChild(generateBtn);
        actionsDiv.appendChild(copyBtn);
        addonCard.appendChild(createLinkTextBox(manifest));
    }

    addonCard.appendChild(actionsDiv);

    // Exclusive logic
    const checkboxes = optionsGrid.querySelectorAll('input');
    checkboxes.forEach(chk => {
        chk.addEventListener('change', () => {
            if (chk.checked) {
                checkboxes.forEach(other => { if (other !== chk) other.checked = false; });
            }
        });
    });

    if (appendNow) container.appendChild(addonCard);
    return addonCard;
}

function createOption(manifest, id, labelText) {
    const div = document.createElement("div");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.id = `${id}-${manifest.id}`;
    
    const label = document.createElement("label");
    label.htmlFor = input.id;
    label.innerText = labelText;
    
    div.appendChild(input);
    div.appendChild(label);
    return div;
}

function createLinkTextBox(manifest) {
    const textArea = document.createElement("textarea");
    textArea.className = "read-only-textarea hidden";
    textArea.id = `linkBox-${manifest.id}`;
    textArea.readOnly = true;
    return textArea;
}

function toggleAddonSelection(btn, manifest, url) {
    const bp = document.getElementById(`bp-${manifest.id}`);
    const rpdb = document.getElementById(`rpdb-${manifest.id}`);
    const tr = document.getElementById(`tr-${manifest.id}`);
    const tsp = document.getElementById(`tsp-${manifest.id}`);

    if (btn.state === "active") {
        btn.state = "selected";
        btn.innerText = "Remove Selection";
        btn.style.backgroundColor = "var(--danger)";

        [bp, rpdb, tr, tsp].forEach(c => c.disabled = true);

        manifest.transportUrl = url;
        manifest.bp = bp.checked ? '1' : '0';
        manifest.rpdb = rpdb.checked ? '1' : '0';
        manifest.toastRatings = tr.checked ? '1' : '0';
        manifest.tsPoster = tsp.checked ? '1' : '0';
        
        transteArray.push(manifest);
    } else {
        [bp, rpdb, tr, tsp].forEach(c => c.disabled = false);
        btn.state = "active";
        btn.innerText = "Select Addon";
        btn.style.backgroundColor = "var(--success)";
        transteArray = transteArray.filter(item => item.id !== manifest.id);
    }
}

async function generateLinkByCard(manifest, url) {
    const tmdbKey = document.getElementById("tmdb-key").value;
    if (!tmdbKey) {
        showError("⚠️ TMDB Key required");
        return;
    }

    const bp = document.getElementById(`bp-${manifest.id}`).checked ? '1' : '0';
    const rpdb = document.getElementById(`rpdb-${manifest.id}`).checked ? '1' : '0';
    const tr = document.getElementById(`tr-${manifest.id}`).checked ? '1' : '0';
    const tsp = document.getElementById(`tsp-${manifest.id}`).checked ? '1' : '0';

    const link = generateTranslatorLink(url, rpdb, tr, tsp, bp);
    const box = document.getElementById(`linkBox-${manifest.id}`);
    box.value = link;
    box.classList.remove("hidden");
    box.style.height = "auto";
    box.style.height = (box.scrollHeight) + "px";
}

async function copyLinkCard(manifest) {
    const box = document.getElementById(`linkBox-${manifest.id}`);
    if (!box.value) return;
    await navigator.clipboard.writeText(box.value);
    showSuccess('✅ Link copied!');
}
