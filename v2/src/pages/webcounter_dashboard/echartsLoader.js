// echarts（npm 依赖）与地图数据（页面目录下的 json）都用 dynamic import 引入，
// 由构建拆成独立 chunk 按需加载；registerMap 只做一次，所以整个加载过程做成单例缓存。

let preparePromise = null;

export function prepareEcharts(){
    if (!preparePromise){
        preparePromise = (async () => {
            const [worldMapModule, echarts] = await Promise.all([
                import("./world_cn.json"),
                import("echarts")
            ]);
            echarts.registerMap("world", worldMapModule.default);
            return echarts;
        })();
        // 失败时清空缓存，方便下次重试
        preparePromise.catch(() => {
            preparePromise = null;
        });
    }
    return preparePromise;
}
