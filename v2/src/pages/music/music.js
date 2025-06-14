import {fetch_api} from "@/assets/js/util.js";
const domain = import.meta.env.VITE_API_DOMAIN;

export async function fetchMusicList(sort, order, pageIndex, keyword) {
    const payload = {
        sort: parseInt(sort),
        order: parseInt(order),
        pg_index: pageIndex,
        pg_size: 16,
        keyword: keyword
    }
    if (localStorage.getItem("access-token")) {
        payload.access_token = localStorage.getItem("access-token");
    }
    return await fetch_api(domain + "/api/list_music", payload);
}
export async function likeMusic(id, like) {
    const payload = {
        music_id: id,
        like: like, 
        access_token: localStorage.getItem("access-token")
    }
    return await fetch_api(domain + "/api/like_music", payload);
}