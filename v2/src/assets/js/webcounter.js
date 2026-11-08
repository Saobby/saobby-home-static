// /webcounter、/create_webcounter、/my_webcounters、/webcounter_dashboard 四个页面共用

const domain = import.meta.env.VITE_WEBCOUNTER_API_DOMAIN;
const dashboardPageUrl = import.meta.env.VITE_WEBCOUNTER_DASHBOARD_PAGE_URL;

export function getCounterImageUrl(counterId){
    return `${domain}/w/${counterId}`;
}

export function getCounterMarkdownCode(counterId){
    return `![](${getCounterImageUrl(counterId)})`;
}

export function getCounterHtmlCode(counterId){
    return `<img src="${getCounterImageUrl(counterId)}">`;
}

export function getCounterApiUrl(counterId){
    return `GET ${domain}/api/visit/${counterId}`;
}

export function getCounterDashboardUrl(accessToken){
    return `${dashboardPageUrl}?access_token=${accessToken}`;
}

// pic_type: 0=位图(JPEG) 1=矢量图(SVG)
export function getPicTypeName(picType){
    return ["JPEG", "SVG"][picType];
}

// display_type: 0=访问量 1=独立IP数 2=不显示
export function getDisplayTypeName(displayType){
    return ["访问量", "IP数", "不显示"][displayType];
}

// 颜色一律按 9 位 #RRGGBBAA 发给后端，A 由不透明度(0~100)换算而来
export function getColorWithAlpha(color, opacity){
    const value = Math.min(Math.max(Number(opacity) || 0, 0), 100);
    return color + Math.round(value * 255 / 100).toString(16).padStart(2, "0");
}

// 取色器只认 6 位颜色，"A" 交给单独的滑块；不带 A 的颜色（如旧计数器）按完全不透明处理
export function splitColorAlpha(color){
    const matched = /^#([0-9a-fA-F]{6})([0-9a-fA-F]{2})?$/.exec(color || "");
    if (!matched){
        return { color: "#000000", opacity: 100 };
    }
    return {
        color: "#" + matched[1].toLowerCase(),
        opacity: matched[2] ? Math.round(parseInt(matched[2], 16) * 100 / 255) : 100
    };
}
