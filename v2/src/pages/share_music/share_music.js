import { captcha } from "@/assets/js/captcha";
import { fetch_api } from "@/assets/js/util";
const domain = import.meta.env.VITE_API_DOMAIN;

export async function shareMusicApi(srcType, detail, desc, tags) {
    const payload = {
        desc: desc,
        detail: detail,
        src_type: srcType,
        tags: tags
    };
    if (localStorage.getItem("access-token")){
        payload.access_token = localStorage.getItem("access-token");
    }
    const rsp0 = await captcha();
    if (rsp0.retcode){
        return { retcode: rsp0.retcode, msg: "人机验证失败:" + rsp0.msg };
    }
    payload.captcha_token = rsp0.data.token;
    const rsp1 = await fetch_api(domain+"/api/share_music", payload);
    if (rsp1.retcode){
        return { retcode: rsp1.retcode, msg: rsp1.msg };
    }
    return { retcode: 0, msg: "分享成功", data: {musicId: rsp1.data.id} };
}
export async function queryProgressApi(music_id){
    const rsp0 = await fetch_api(domain+"/api/query_music_status", {
        music_id: music_id
    });
    if (rsp0.retcode){
        return { status: -1, msg: "无法查询任务状态: "+rsp0.msg };
    }else{
        if (rsp0.data.status === 1){
            return { status: 1, msg: rsp0.data.msg };
        }else if (rsp0.data.status === 0){
            return { status: 0, msg: "分享成功!即将跳转到音乐..." };
        }else if (rsp0.data.status === 2){
            return { status: 2, msg: "分享失败: "+rsp0.data.msg };
        }
    }
}
