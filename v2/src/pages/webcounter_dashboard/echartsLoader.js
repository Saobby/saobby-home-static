// echarts 与地图数据都动态加载并拆成独立 chunk；registerMap 只执行一次，结果做单例缓存。

let preparePromise = null;

export function prepareEcharts(){
    if (!preparePromise){
        preparePromise = (async () => {
            const [worldMapModule, { init, registerMap }] = await Promise.all([
                import("./world_cn.json"),
                import("./echartsSetup.js")
            ]);
            registerMap("world", worldMapModule.default);
            return { init };
        })();
        // 失败时清空缓存，方便下次重试
        preparePromise.catch(() => {
            preparePromise = null;
        });
    }
    return preparePromise;
}
