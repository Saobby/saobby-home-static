<script setup>
import { IconClover, IconMessage, IconLink, IconTool, IconAddressBook, IconMail, IconBrandTelegram, IconBrandQq, IconBrandWechat, IconBrandGithub, IconBrandBilibili, IconMusic, IconPencil, IconVinyl, IconUser, IconBell, IconUserCircle, IconSettings, IconChartDots, IconMessagePlus } from '@tabler/icons-vue';
</script>
<template>
    <div class="wux-typo wux-container">
        <div class="hco wux-row-md-3 same-height-container">
            <div class="wux-col same-height-box">
                <div class="wux-card wux-card-flat">
                    <div class="wux-card-body">
                        <h2 class="mc"><IconAddressBook width="32px" height="32px"/><span>联系方式</span></h2>
                        <ul>
                            <li><span class="mc"><IconMail width="16px" height="16px"/> <b class="simple"><a href="mailto:s@saobby.com" target="_blank" onclick="navigator.clipboard.writeText(this.innerHTML);">s@saobby.com</a></b></span></li>
                            <li><span class="mc"><IconBrandTelegram width="16px" height="16px"/> <b class="simple"><a href="https://t.me/stguable" target="_blank">@stguable</a></b></span></li>
                            <li><span class="mc"><IconBrandQq width="16px" height="16px"/><span class="simple"><b onclick="navigator.clipboard.writeText(this.innerHTML);">3569602435</b><span text-color="#FF8686" style="--attr-custom-text-color:#FF8686;">(请务必备注添加原因)</span></span></span></li>
                            <li><span class="mc"><IconBrandWechat width="16px" height="16px"/> <b class="simple" onclick="navigator.clipboard.writeText(this.innerHTML);">chen2008chen0808</b><span text-color="#FF8686" style="--attr-custom-text-color:#FF8686;">(几乎不上微信)</span></span></li>
                            <li><span class="mc"><IconBrandGithub width="16px" height="16px"/> <b class="simple"><a href="https://github.com/Saobby" target="_blank">Saobby</a></b></span></li>
                            <li><span class="mc"><IconBrandBilibili width="16px" height="16px"/> <b class="simple"><a href="https://space.bilibili.com/1896864189" target="_blank" class="wux-btn-text">Saobby</a></b></span></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="wux-col same-height-box">
                <div class="wux-card wux-card-flat">
                    <div class="wux-card-body">
                        <h2 class="mc"><IconTool width="32px" height="32px"/><span>工具集</span></h2>
                        <ul>
                            <li><a href="/webcounter" target="_blank">[Beta] 网站访问量统计工具</a></li>
                            <li><a href="/midi2scratch" target="_blank">在Scratch中演奏Midi (新)</a></li>
                            <li><a href="https://saobby.pythonanywhere.com/image_cutter" target="_blank">宫格图制作</a></li>
                            <li><a href="https://github.com/Saobby/SaobbyCAPTCHA-V3" target="_blank">Saobby人机验证-V3</a></li>
                            <li><a href="https://40code.com/#page=work&id=2604" target="_blank">Scratch云变量服务</a>(接口正常,演示作品暂不可用)</li>
                            <li><a href="/upload_file" target="_blank">图床/网盘</a></li>
                            <li><a href="/create_vote" target="_blank">Markdown实现投票功能</a></li>
                            <li><a href="/bvdlp" target="_blank">B站视频直链解析工具</a></li>
                            <li><a href="/midishow" target="_blank">[Beta] Midishow 网站 MIDI 快速下载机</a></li>
                            <li><a href="/connector" target="_blank">[Beta] 多设备图文互传</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="wux-col same-height-box">
                <div class="wux-card wux-card-flat">
                    <div class="wux-card-body">
                        <h2 class="mc"><IconLink width="32px" height="32px"/><span>友情链接</span></h2>
                        <ul>
                            <li><a href="https://nekomoe.tw/" target="_blank">Bob的主页</a></li>
                            <li>Nights的<a href="https://axolotlpool.cfd/" target="_blank">蝾螈池</a>|<a href="https://sparklejs.axolotlpower.com/" target="_blank">小游戏</a></li>
                            <li><a href="https://blog.yang1120.com/" target="_blank">氧化某人的博客</a></li>
                            <li><a href="https://axolotlpower.com/" target="_blank">AxolotlPower</a></li>
                            <li><a href="https://sqy419.axolotlpower.com/" target="_blank">SQY的个人网站</a></li>
                            <li><a href="https://brume.top/" target="_blank">春树暮云的博客</a></li>
                            <li><a href="https://wangzhaohan2910.github.io/" target="_blank">wangzhaohan2910的博客</a></li>
                            <li><a href="https://huhu.tomstudio.site/" target="_blank">Huhu的思绪矩阵</a></li>
                            <li><a href="https://www.zhengddzz.com/" target="_blank">zhengddzz的主页</a></li>
                            <li><a href="https://www.xuzhoulab.cn/" target="_blank">虚舟实验室</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        <div class="hco wux-row-md-3 same-height-container">
            <div class="wux-col same-height-box">
                <div class="wux-card wux-card-flat">
                    <div class="wux-card-body">
                        <h2 class="mc"><IconMessage width="32px" height="32px"/><span>论坛</span></h2>
                        <div class="wux-row-xs-2">
                            <div class="wux-col">
                                <a href="/posts"><button class="wux-btn wux-btn-primary wux-btn-xl wux-btn-text mc" type="button"><IconMessage width="20px" height="20px"/><span>帖子列表</span></button></a>
                                <a href="/music/"><button class="wux-btn wux-btn-warning wux-btn-xl wux-btn-text mc" type="button"><IconMusic width="20px" height="20px"/><span>一起听歌<span class="wux-badge">Beta</span></span></button></a>
                            </div>
                            <div class="wux-col">
                                <a href="/create_post"><button class="wux-btn wux-btn-primary wux-btn-xl wux-btn-text mc" type="button"><IconPencil width="20px" height="20px"/><span>创建帖子</span></button></a>
                                <a href="/share_music/"><button class="wux-btn wux-btn-warning wux-btn-xl wux-btn-text mc" type="button"><IconVinyl width="20px" height="20px"/><span>分享歌曲</span></button></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="wux-col same-height-box">
                <div class="wux-card wux-card-flat">
                    <div class="wux-card-body">
                        <h2 class="mc"><IconClover width="32px" height="32px"/><span>签到</span></h2>
                        <div class="centered">
                            <div hidden>
                                <img src="@/assets/image/particle/tera.webp">
                                <img src="@/assets/image/particle/cat.webp">
                                <img src="@/assets/image/particle/giga.webp">
                                <img src="@/assets/image/particle/gobo.webp">
                                <img src="@/assets/image/particle/nano.webp">
                                <img src="@/assets/image/particle/pico.webp">
                            </div>
                            <div id="loading-div">
                                <span class="wux-loading"></span><br>
                                <span class="result" id="check-in-loading-result"></span>
                            </div>
                            <div id="show-date-div" hidden>
                                <span style="font-size: 20px">今天是</span><br>
                                <span style="color: #4050b4; font-size: 48px;" id="date">--/--</span><br>
                                <button class="wux-btn wux-btn-primary mc" type="button" onclick="check_in().then();" id="check-in-btn"><IconClover width="16px" height="16px"/><span>签到</span></button><br>
                                <span class="result" id="check-in-result"></span>
                            </div>
                            <div id="show-fortune-div" hidden>
                                <span style="font-size: 20px">今日运势</span><br>
                                <span style="color: #f59632; font-size: 48px;" id="fortune"></span><br>
                                <span>你已连续签到<b id="check-in-combo"></b>天</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="wux-col same-height-box">
                <div class="wux-card wux-card-flat">
                    <div class="wux-card-body">
                        <h2 class="mc"><IconUser width="32px" height="32px"/><span>用户区域</span></h2>
                        <div class="wux-row-xs-2">
                            <div class="wux-col">
                                <a href="/notifications"><button class="wux-btn wux-btn-primary wux-btn-xl wux-btn-text mc" type="button"><IconBell width="20px" height="20px"/><span>通知中心</span><span class="wux-badge" id="notification-count" hidden></span></button></a>
                            </div>
                            <div class="wux-col">
                                <a href="/set_avatar"><button class="wux-btn wux-btn-primary wux-btn-xl wux-btn-text mc" type="button"><IconUserCircle width="20px" height="20px"/><span>更换头像</span></button></a>
                            </div>
                        </div>
                        <div class="wux-row-xs-2">
                            <div class="wux-col">
                                <a href="/bind_email"><button class="wux-btn wux-btn-primary wux-btn-xl wux-btn-text mc" type="button"><IconLink width="20px" height="20px"/><span>绑定电子邮箱</span></button></a>
                            </div>
                            <div class="wux-col">
                                <a href="/user_config"><button class="wux-btn wux-btn-primary wux-btn-xl wux-btn-text mc" type="button"><IconSettings width="20px" height="20px"/><span>用户设置</span></button></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="wux-row-md-1" id="birthdaystar-div" hidden>
            <div class="wux-col">
                <div class="wux-card wux-card-flat mb">
                    <div class="wux-card-body" id="birthdaystar">
                        Loading...
                    </div>
                </div>
            </div>
        </div>
<!--            <div class="wux-alert wux-alert-warning mb">2025-1-31 16:30 GMT+8 由于服务器刚刚更换IP, DNS记录更新有延迟, 这两天部分地区可能出现无法访问部分服务的问题</div>-->
        <div class="wux-row-md-1">
            <div class="wux-col">
                <div class="wux-card wux-card-flat" style="background-color:#00000000; border: 3px solid #f1f1f1;">
                    <div class="wux-card-body">
                        <h2 class="mc"><IconMessage width="32px" height="32px"/><span>评论区</span></h2>
                        <button class="wux-btn wux-btn-primary mc" onclick="show_comment_window()" type="button"><IconMessagePlus width="16px" height="16px"/><span>发表评论</span></button>
                        <a href="/?114514"><button class="wux-btn wux-btn-primary wux-btn-outline hco mc" type="button"><IconMessage width="16px" height="16px"/><span>主评论区</span></button></a>
                        
                        <hr>
                        <span class="hco mc"><IconBell width="16px" height="16px"/><span>绑定电子邮箱，有回复时发邮件提醒你 <a href="/bind_email">立即绑定</a></span><br></span>
                        
                    </div>
                </div>
            </div>
        </div>
        <div class="hco wux-row-md-1">
            <div class="wux-col">
                <div class="wux-card wux-card-flat">
                    <div class="wux-card-body">
                        <span><a target="_blank" href="https://stats.uptimerobot.com/pj3R5f9YRK" class="mc"><IconChartDots width="16px" height="16px"/><span>Saobby状态</span></a></span>
                    </div>
                </div>
            </div>
        </div>
        <div id="emotion-bar"></div>
        <div id="upload-image-progress-div"></div>
        <div id="scpc-v2" show-trigger="false"></div>
        <div style="font-size:12px" hidden>
            <center><a href="https://icp.gov.moe/?keyword=20225339" target="_blank">萌ICP备20225339号</a></center>
        </div>
    </div>
</template>
<style lang="css" scoped>
.wux-card-body h2{
    margin-top: 0px;
    margin-left: 12px;
    margin-bottom: 8px;
}
.wux-col {
    padding: 0px 4px;
}
</style>