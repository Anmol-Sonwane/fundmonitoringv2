/** Always return a same-origin absolute URL for upload assets. */
function resolvePhotoUrl(path) {
    if (!path) return "";

    let value = String(path).trim();
    if (!value) return "";

    if (value.startsWith("data:") || value.startsWith("blob:")) {
        return value;
    }

    // Repair broken URLs already saved in DOM/DB/cache:
    //   //uploads/file.jpg  -> https://uploads/file.jpg (browser bug)
    //   https://uploads/file.jpg
    if (/^https?:\/\/uploads(\/|$)/i.test(value)) {
        value = value.replace(/^https?:\/\/uploads\/?/i, "");
    } else if (/^\/\/uploads(\/|$)/i.test(value)) {
        value = value.replace(/^\/\/uploads\/?/i, "");
    } else if (/^https?:\/\//i.test(value)) {
        return value;
    }

    value = value.replace(/^\/+/, "");

    if (!value.startsWith("uploads/")) {
        if (/\.(jpe?g|png|gif|webp|bmp)$/i.test(value) && !value.includes("/")) {
            value = `uploads/${value}`;
        }
    }

    const relativePath = `/${value}`;
    const origin = window.location?.origin;

    if (origin && origin !== "null" && /^https?:/i.test(origin)) {
        return new URL(relativePath, origin).href;
    }

    return relativePath;
}

window.resolvePhotoUrl = resolvePhotoUrl;
