<script setup>
import { IconClover, IconMessage, IconLink, IconTool, IconAddressBook, IconMail, IconBrandTelegram, IconBrandQq, IconBrandWechat, IconBrandGithub, IconBrandBilibili, IconMusic, IconPencil, IconVinyl, IconUser, IconBell, IconUserCircle, IconSettings, IconChartDots, IconMessagePlus } from '@tabler/icons-vue';
import CommentsSection from '@/components/CommentsSection.vue';
import { onMounted, ref } from 'vue';
import { is_in_array, getUrlArgs, fetch_api } from '@/assets/js/util';
import BirthdayNotice from './components/BirthdayNotice.vue';
import CheckInBox from './components/CheckInBox.vue';
import Folder from "@/components/Folder.vue";
const domain = import.meta.env.VITE_API_DOMAIN;
const homePageUrl = import.meta.env.VITE_HOME_PAGE_URL;
const musicPageUrl = import.meta.env.VITE_MUSIC_PAGE_URL;
const shareMusicPageUrl = import.meta.env.VITE_SHARE_MUSIC_PAGE_URL;
const userConfigPageUrl = import.meta.env.VITE_USER_CONFIG_PAGE_URL;

const commentPlaceId = ref(114514);
const commentOnly = ref(false);
const scrollTo = ref(null);
const commentsSessionRef = ref(null);
onMounted(()=>{
    (()=>{
        const nurl = window.location.href.split("?")
        if (nurl.length !== 2) {
            return;
        }
        const args = nurl[1].split("&")
        commentPlaceId.value = parseInt(args[0]);
        commentOnly.value = is_in_array(args, "comments-only");
        const urlArgs = getUrlArgs();
        if (urlArgs.scroll_to) {
            scrollTo.value = urlArgs.scroll_to;
        }
    })();
    if (commentPlaceId.value === 114514) {
        commentsSessionRef.value.updateComments().then();
        commentsSessionRef.value.loadDraft().then();
    }
});
const showAddCommentWindow = ref(false);
function copyText(text){
    window.navigator.clipboard.writeText(text);
}
const notificationCount = ref(0);
onMounted(async () => {
    if (localStorage.getItem("access-token")) {
        const rsp = await fetch_api(domain + "/api/count_unread_notification", {
            access_token: localStorage.getItem("access-token")
        });
        if (!rsp.retcode){
            notificationCount.value = rsp.data.count;
        }
    }
});
</script>
<template>
    <div class="wux-typo wux-container">
        <div :hidden="commentOnly" class="wux-row-md-3 same-height-container">
            <div class="wux-col same-height-box">
                <div class="wux-card wux-card-flat">
                    <div class="wux-card-body">
                        <h2 class="mc2"><IconAddressBook width="32px" height="32px"/><span>联系方式</span></h2>
                        <ul style="margin-bottom: 0">
                            <li><span text-color="#FF8686" style="--attr-custom-text-color:#FF8686;">推荐使用以下方式联系</span></li>
                            <li class="mc2">
                                <IconMail width="16px" height="16px"/>
                                <span class="simple"><b><a href="mailto:s@saobby.com" target="_blank" @click="copyText('s@saobby.com');">s@saobby.com</a></b></span>
                            </li>
                            <li class="mc2">
                                <IconBrandTelegram width="16px" height="16px"/>
                                <span class="simple"><b><a href="https://t.me/stguable" target="_blank">@stguable</a></b></span>
                            </li>
                            <li class="mc2">
                                <IconBrandGithub width="16px" height="16px"/>
                                <span class="simple"><b><a href="https://github.com/Saobby" target="_blank">Saobby</a></b></span>
                            </li>
                        </ul>
                        <Folder a-style="margin-left:15px;" unfold-text="不常用联系方式" fold-text="不常用联系方式">
                            <ul>
                                <li>
                                    <span text-color="#FF8686" style="--attr-custom-text-color:#FF8686;">以下通讯软件很少登录，不推荐使用</span>
                                </li>
                                <li class="mc2">
                                    <IconBrandQq width="16px" height="16px" class="qq-icon"/>
                                    <span class="simple"><b @click="copyText('3569602435');">3569602435</b><span text-color="#FF8686" style="--attr-custom-text-color:#FF8686;">(请备注添加原因)</span></span>
                                </li>
                                <li class="mc2">
                                    <IconBrandWechat width="16px" height="16px"/>
                                    <span class="simple"><b @click="copyText('chen2008chen0808');">chen2008chen0808</b><span text-color="#FF8686" style="--attr-custom-text-color:#FF8686;">(请备注添加原因)</span></span>
                                </li>
                                <li class="mc2">
                                    <IconBrandBilibili width="16px" height="16px"/>
                                    <span class="simple"><b><a href="https://space.bilibili.com/1896864189" target="_blank" class="wux-btn-text">Saobby</a></b></span>
                                </li>
                            </ul>
                        </Folder>
                    </div>
                </div>
            </div>
            <div class="wux-col same-height-box">
                <div class="wux-card wux-card-flat">
                    <div class="wux-card-body">
                        <h2 class="mc2"><IconTool width="32px" height="32px"/><span>工具集</span></h2>
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
                        <h2 class="mc2"><IconLink width="32px" height="32px"/><span>友情链接</span></h2>
                        <ul>
                            <li><a href="https://nekomoe.tw/" target="_blank" rel="noopener">Bob的主页</a></li>
                            <li>Nights的<a href="https://axopl.com/" target="_blank" rel="noopener">蝾螈池</a>|<a href="https://sparklejs.axolotlpower.com/" target="_blank">小游戏</a></li>
                            <li><a href="https://blog.yang1120.com/" target="_blank" rel="noopener">氧化某人的博客</a></li>
                            <li><a href="https://axolotlpower.com/" target="_blank" rel="noopener">AxolotlPower</a></li>
                            <li><a href="https://sqy419.axolotlpower.com/" target="_blank" rel="noopener">SQY的个人网站</a></li>
                            <li><a href="https://brume.top/" target="_blank" rel="noopener">春树暮云的博客</a></li>
                            <li><a href="https://wangzhaohan2910.github.io/" target="_blank" rel="noopener">wangzhaohan2910的博客</a></li>
                            <li><a href="https://huhu.tomstudio.site/" target="_blank" rel="noopener">Huhu的思绪矩阵</a></li>
                            <li><a href="https://www.xuzhoulab.cn/" target="_blank" rel="noopener">虚舟实验室</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        <div :hidden="commentOnly" class="wux-row-md-3 same-height-container">
            <div class="wux-col same-height-box">
                <div class="wux-card wux-card-flat">
                    <div class="wux-card-body">
                        <h2 class="mc2"><IconMessage width="32px" height="32px"/><span>论坛</span></h2>
                        <div class="wux-row-xs-2">
                            <div class="wux-col">
                                <a href="/posts"><button class="wux-btn wux-btn-primary wux-btn-xl wux-btn-text mc2" type="button"><IconMessage width="20px" height="20px"/><span>帖子列表</span></button></a>
                                <a :href="musicPageUrl"><button class="wux-btn wux-btn-warning wux-btn-xl wux-btn-text mc2" type="button"><IconMusic width="20px" height="20px"/><span>一起听歌<span class="wux-badge">Beta</span></span></button></a>
                            </div>
                            <div class="wux-col">
                                <a href="/create_post"><button class="wux-btn wux-btn-primary wux-btn-xl wux-btn-text mc2" type="button"><IconPencil width="20px" height="20px"/><span>创建帖子</span></button></a>
                                <a :href="shareMusicPageUrl"><button class="wux-btn wux-btn-warning wux-btn-xl wux-btn-text mc2" type="button"><IconVinyl width="20px" height="20px"/><span>分享歌曲</span></button></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="wux-col same-height-box">
                <div class="wux-card wux-card-flat">
                    <div class="wux-card-body">
                        <h2 class="mc2"><IconClover width="32px" height="32px"/><span>签到</span></h2>
                        <CheckInBox />
                    </div>
                </div>
            </div>
            <div class="wux-col same-height-box">
                <div class="wux-card wux-card-flat">
                    <div class="wux-card-body">
                        <h2 class="mc2"><IconUser width="32px" height="32px"/><span>用户区域</span></h2>
                        <div class="wux-row-xs-2">
                            <div class="wux-col">
                                <a href="/notifications"><button class="wux-btn wux-btn-primary wux-btn-xl wux-btn-text mc2" type="button"><IconBell width="20px" height="20px"/><span>通知中心</span><span class="wux-badge" v-if="notificationCount > 0">{{ notificationCount }}</span></button></a>
                            </div>
                            <div class="wux-col">
                                <a href="/set_avatar"><button class="wux-btn wux-btn-primary wux-btn-xl wux-btn-text mc2" type="button"><IconUserCircle width="20px" height="20px"/><span>更换头像</span></button></a>
                            </div>
                        </div>
                        <div class="wux-row-xs-2">
                            <div class="wux-col">
                                <a href="/bind_email"><button class="wux-btn wux-btn-primary wux-btn-xl wux-btn-text mc2" type="button"><IconLink width="20px" height="20px"/><span>绑定电子邮箱</span></button></a>
                            </div>
                            <div class="wux-col">
                                <a :href="userConfigPageUrl"><button class="wux-btn wux-btn-primary wux-btn-xl wux-btn-text mc2" type="button"><IconSettings width="20px" height="20px"/><span>用户设置</span></button></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <BirthdayNotice/>
<!--            <div class="wux-alert wux-alert-warning mb">2025-1-31 16:30 GMT+8 由于服务器刚刚更换IP, DNS记录更新有延迟, 这两天部分地区可能出现无法访问部分服务的问题</div>-->
        <div class="wux-row-md-1">
            <div class="wux-col">
                <div class="wux-card wux-card-flat" style="background-color:#00000000; border: 3px solid #f1f1f1;">
                    <div class="wux-card-body">
                        <h2 class="mc2"><IconMessage width="32px" height="32px"/><span>评论区</span></h2>
                        <button class="wux-btn wux-btn-primary mc2" @click="showAddCommentWindow = !showAddCommentWindow;" type="button"><IconMessagePlus width="16px" height="16px"/><span>发表评论</span></button>
                        <a :href="homePageUrl+'?114514'"><button class="wux-btn wux-btn-primary wux-btn-outline mc2 simple" :hidden="commentOnly" type="button"><IconMessage width="16px" height="16px"/><span>主评论区</span></button></a>
                        <CommentsSection :show-add-comment-window="showAddCommentWindow" ref="commentsSessionRef" :place-id="commentPlaceId">
                            <hr>
                            <span :hidden="commentOnly" class="mc2"><IconBell width="16px" height="16px"/><span>绑定电子邮箱，有回复时发邮件提醒你 <a href="/bind_email">立即绑定</a></span><br></span>
                        </CommentsSection>
                    </div>
                </div>
            </div>
        </div>
        <div :hidden="commentOnly" class="wux-row-md-1">
            <div class="wux-col">
                <div class="wux-card wux-card-flat">
                    <div class="wux-card-body">
                        <span><a target="_blank" href="https://stats.uptimerobot.com/pj3R5f9YRK" class="mc2"><IconChartDots width="16px" height="16px"/><span class="simple">Saobby状态</span></a></span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style lang="css" scoped>
.wux-card-body h2{
    margin-top: 0;
    margin-left: 12px;
    margin-bottom: 8px;
}
.wux-col {
    padding: 0 4px;
}
[hidden] {
    display: none !important;
}
</style>