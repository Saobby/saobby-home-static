import { createApp, h, reactive, nextTick } from 'vue';
import Dialog from '@/components/Dialog.vue';

/*
 * 通用弹窗服务（外观与交互在 @/components/Dialog.vue）
 * 调用方式和旧版 windows.js 的 confirm()/prompt() 基本一致，Promise 化：
 *
 *   import { confirmDialog, promptDialog, alertDialog } from '@/assets/js/dialog.js';
 *
 *   if (!await confirmDialog({ title: "警告!", content: "你确定要关闭这个帖子吗?" })) return;
 *
 *   const text = await promptDialog({
 *       title: "保存编辑", content: "请填写编辑摘要/原因:", mustFill: true, inputRows: 3
 *   });
 *   if (text === null) return;            // 用户取消
 *
 *   alertDialog({ title: "提示", content: "复制成功!" });
 *
 * 返回：confirm → true/false；prompt → string/null(取消)；alert → 无
 * 说明：多个弹窗会排队，一次只显示一个；宿主节点惰性挂到 document.body，无需改模板。
 */

const queue = [];
const state = reactive({
    seq: 0,
    current: null
});
let hostEl = null;

function ensureHost(){
    if (hostEl){
        return;
    }
    hostEl = document.createElement('div');
    document.body.appendChild(hostEl);
    createApp({
        render(){
            const cur = state.current;
            if (!cur){
                return null;
            }
            return h(Dialog, {
                key: state.seq,   // 换 key，保证每次都是全新实例
                title: cur.opts.title,
                content: cur.opts.content || "",
                input: cur.kind === "prompt",
                placeholder: cur.opts.placeholder || "",
                inputRows: cur.opts.inputRows,
                mustFill: cur.opts.mustFill === true,
                defaultValue: cur.opts.defaultValue || "",
                confirmText: cur.opts.confirmText || "确定",
                cancelText: cur.opts.cancelText || "取消",
                showCancel: cur.opts.showCancel !== undefined ? cur.opts.showCancel : cur.kind !== "alert",
                zIndex: cur.opts.zIndex,
                onConfirm: (value) => finish(value),
                onCancel: () => finish(null)
            });
        }
    }).mount(hostEl);
}

function next(){
    if (state.current || queue.length === 0){
        return;
    }
    state.current = queue.shift();
    state.seq += 1;
}

function finish(value){
    const cur = state.current;
    state.current = null;
    if (!cur){
        return;
    }
    // 等 DOM 移除后再 resolve/开下一个，避免后续浮层(如验证码)被压在弹窗下面
    nextTick(() => {
        if (cur.kind === "alert"){
            cur.resolve();
        }else if (cur.kind === "confirm"){
            cur.resolve(value !== null);
        }else{
            cur.resolve(value);
        }
        next();
    });
}

function open(kind, opts){
    ensureHost();
    return new Promise((resolve) => {
        queue.push({kind: kind, opts: opts || {}, resolve: resolve});
        next();
    });
}

export function confirmDialog(opts){
    return open("confirm", opts);
}
export function promptDialog(opts){
    return open("prompt", opts);
}
export function alertDialog(opts){
    return open("alert", opts);
}