import { captcha } from "@/assets/js/captcha";
import { fetch_api } from "@/assets/js/util";
const domain = import.meta.env.VITE_CONNECTOR_API_DOMAIN;

export async function createChannelApi() {
    const rsp1 = await captcha();
    if (rsp1.retcode !== 0) {
        return { retcode: rsp1.retcode, msg: "人机验证失败:"+rsp1.msg };
    }
    const rsp2 = await fetch_api(domain+"/api/create_channel", {captcha_token: rsp1.data.token});
    if (rsp2.retcode !== 0) {
        return { retcode: rsp2.retcode, msg: rsp2.msg };
    }
    return { retcode: 0, msg: rsp2.msg, data: rsp2.data };
}
export async function publishBroadcastApi(channelId, secret, content) {
    const rsp2 = await fetch_api(domain+"/api/publish_broadcast", {
        channel_id: channelId,
        secret: secret,
        content: content
    });
    if (rsp2.retcode !== 0) {
        return { retcode: rsp2.retcode, msg: rsp2.msg };
    }
    return { retcode: 0, msg: rsp2.msg, data: rsp2.data };
}
export async function publishMessageApi(channelId, content) {
    const rsp2 = await fetch_api(domain+"/api/publish_message", {
        channel_id: channelId,
        message: content
    });
    if (rsp2.retcode !== 0) {
        return { retcode: rsp2.retcode, msg: rsp2.msg };
    }
    return { retcode: 0, msg: rsp2.msg, data: rsp2.data };
}
export async function getChannelInfoApi(channelId) {
    const rsp2 = await fetch_api(domain+"/api/get_channel_info", {
        channel_id: channelId
    });
    if (rsp2.retcode !== 0) {
        return { retcode: rsp2.retcode, msg: rsp2.msg };
    }
    return { retcode: 0, msg: rsp2.msg, data: rsp2.data };
}
