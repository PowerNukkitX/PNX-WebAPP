import {translate} from "./language";

export function time2AgoString(time: Date | number): string {
    if (typeof time === "number") {
        time = new Date(time);
    }
    const now = new Date();
    const diff = now.getTime() - time.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);
    if (seconds < 60) {
        return translate("just-now");
    } else if (minutes < 60) {
        return `${minutes} ${translate("minutes-ago")}`;
    } else if (hours < 24) {
        return `${hours} ${translate("hours-ago")}`;
    } else if (days < 30) {
        return `${days} ${translate("days-ago")}`;
    } else if (months < 12) {
        return `${months} ${translate("months-ago")}`;
    } else {
        return `${years} years ago`;
    }
}