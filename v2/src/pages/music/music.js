import {fetch_api} from "@/assets/js/util.js";
const domain = import.meta.env.VITE_API_DOMAIN;

export async function fetchMusicList(sort, order, pageIndex, keyword, includedTags, excludedTags, filter, pageSize) {
    const payload = {
        sort: parseInt(sort),
        order: parseInt(order),
        pg_index: pageIndex,
        pg_size: pageSize || 16,
        keyword: keyword,
        included_tags: includedTags,
        excluded_tags: excludedTags,
        filter: parseInt(filter)
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
export async function editMusicApi(id, field, content){
    const payload = {
        music_id: id,
        field: field,
        content: content,
        access_token: localStorage.getItem("access-token")
    }
    return await fetch_api(domain + "/api/edit_music", payload);
}
export async function buildPlayList(ids){
    const payload = {
        music_ids: ids
    }
    if (localStorage.getItem("access-token")){
        payload.access_token = localStorage.getItem("access-token");
    }
    const rsp = await fetch_api(domain + "/api/get_music_urls", payload);
    if (rsp.retcode){
        return {
            retcode: rsp.retcode,
            msg: rsp.msg,
            data: null
        };
    }else{
        let urls = [];
        for (let i = 0; i < rsp.data.urls.length; i++){
            const music = rsp.data.urls[i];
            urls.push({
                id: music.id,
                src: music.audio_url,
                title: music.name,
                type: music.version === 2 ? "m3u8text": "default"
            });
        }
        return {
            retcode: 0,
            msg: "ok",
            data: urls
        }
    }
}
export function jumpToSearchTag(tag){
    window.location.href=`?includedTags=${encodeURIComponent(JSON.stringify([tag]))}`;
}
export function deleteMusicApi(id) {
    const payload = {
        music_id: id,
        access_token: localStorage.getItem("access-token")
    }
    return fetch_api(domain + "/api/delete_music", payload);
}
export function setVisibilityApi(id, visibility){
    const payload = {
        music_id: id,
        access_token: localStorage.getItem("access-token"),
        visibility: visibility
    }
    return fetch_api(domain + "/api/set_music_visibility", payload);
}