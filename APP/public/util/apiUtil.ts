export function getApiURL(): string {
    if (window.location.hostname === "localhost") {
        return "https://powernukkitx.com/api";
    } else {
        return "/api";
    }
}