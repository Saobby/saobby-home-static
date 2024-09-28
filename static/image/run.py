import os
import json

ret = {}
for a, b, c in os.walk("./hsr_ppg"):
    for d in c:
        path = a + "/" + d
        # emote_name = d.replace(".png", "").replace("Sticker_PPG_", "")
        ret["stk_ppg_"+d.replace(".png", "")] = "/static/image/hsr_ppg/"+d
        # os.rename(path, a+"/"+emote_name+".png")
print(json.dumps(ret))
