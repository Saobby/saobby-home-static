import { fetch_api } from "@/assets/js/util";
const domain = import.meta.env.VITE_API_DOMAIN;

export function getDate() {
    const now = new Date();
    now.setMinutes(now.getMinutes() + now.getTimezoneOffset() + 480);
    return now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
}

export async function checkInApi(){
    const rsp = await fetch_api(domain+"/api/check_in", {
        access_token: localStorage.getItem("access-token")
    });
    return rsp;
}

export async function getCheckInStatusApi(){
    const rsp = await fetch_api(domain+"/api/get_check_in_status", {
        access_token: localStorage.getItem("access-token")
    });
    return rsp;
}
