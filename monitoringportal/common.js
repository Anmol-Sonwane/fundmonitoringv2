/** Safe URL for stored upload paths (fixes //uploads/... -> https://uploads/...). */
function resolvePhotoUrl(path) {
    if (!path) return "";

    let value = String(path).trim();
    if (!value) return "";

    if (/^https?:\/\//i.test(value) || value.startsWith("data:") || value.startsWith("blob:")) {
        return value;
    }

    value = value.replace(/^\/+/, "");

    if (!value.startsWith("uploads/") && /\.(jpe?g|png|gif|webp|bmp)$/i.test(value) && !value.includes("/")) {
        value = `uploads/${value}`;
    }

    return `/${value}`;
}

window.resolvePhotoUrl = resolvePhotoUrl;
