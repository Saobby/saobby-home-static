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
