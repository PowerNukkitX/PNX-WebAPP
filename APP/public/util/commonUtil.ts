
// 获取cookie
export function getCookie(name: string) {
    const reg = new RegExp(`(^| )${name}=([^;]*)(;|$)`);
    const match = document.cookie.match(reg);
    return match ? decodeURIComponent(match[2]) : null;
}


// 设置cookie
export function setCookie(name: string, value: any, days: number) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}