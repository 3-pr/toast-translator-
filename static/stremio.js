var stremioUser;

async function stremioLogin() {
    const email = document.getElementById("stremio-email").value;
    const password = document.getElementById("stremio-password").value;
    const loginUrl = "https://api.strem.io/api/login";
    const loginData = {
        "type": "Login",
        "email": email,
        "password": password,
        "facebook": false
    }
    
    try {
        const response = await fetch(loginUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loginData)
        }).then(res => res.json());
        
        if (response.error) {
            showError("❌ " + response.error.message);
            return false;
        } else {
            stremioUser = response;
            
            // Toggle visibility using classes
            document.getElementById("login-section").classList.add("hidden");
            document.getElementById("app-section").classList.remove("hidden");
            document.getElementById("action-buttons").classList.remove("hidden");
            
            await stremioLoadAddons(response.result.authKey);
            return true;
        }
    } catch (e) {
        showError("❌ Connection error. Please try again.");
        return false;
    }
}

async function reloadAddons(authKey) {
    document.getElementById("addons-container").innerHTML = "";
    await stremioLoadAddons(authKey);
}

async function stremioLoadAddons(authKey) {
    const loader = document.getElementById("addons-loader");
    loader.classList.remove("hidden");

    const container = document.getElementById("addons-container");
    const addonCollection = await stremioAddonCollectionGet(authKey);
    const addons = addonCollection.result.addons;

    const results = await Promise.all(addons.map(addon => loadAddon(addon.transportUrl, false, "default", false)));

    results.forEach(card => {
        if(card) container.appendChild(card);
    });

    loader.classList.add("hidden");
}

async function stremioAddonCollectionGet(authKey) {
    const addonCollectionUrl = "https://api.strem.io/api/addonCollectionGet"
    const payload = {
        "type": "AddonCollectionGet",
        "authKey": authKey,
        "update": true
    }
    const response = await fetch(addonCollectionUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
    return await response.json();
}

async function stremioAddonCollectionSet(authKey, addonList) {
    const addonCollectionUrl = "https://api.strem.io/api/addonCollectionSet"
    const payload = {
        "type": "AddonCollectionSet",
        "authKey": authKey,
        "addons": addonList
    }
    const response = await fetch(addonCollectionUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
    return await response.json();
}