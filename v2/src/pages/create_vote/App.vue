<script setup lang="js">
import { ref } from 'vue';
import { fetch_api } from '@/assets/js/util.js';
import { captcha } from '@/assets/js/captcha.js';
import BtnWithLoading from '@/components/BtnWithLoading.vue';
import CopyButton from '@/components/CopyButton.vue';
import { IconPlus, IconTrash } from '@tabler/icons-vue';

const voteDomain = import.meta.env.VITE_VOTE_API_DOMAIN;
const homePageUrl = import.meta.env.VITE_HOME_PAGE_URL;

const title = ref("");
const options = ref(["", ""]);
const alwaysShowResult = ref(false);
const showNumber = ref(true);
const showPercent = ref(true);
const fontSize = ref(16);
const fontColor = ref("#000000");
const markdown = ref("");
const result = ref("");
const creating = ref(false);

const colorInputRef = ref(null);
const colorR = ref(0);
const colorG = ref(0);
const colorB = ref(0);

function addOption(){
    options.value.push("");
}

function removeOption(index){
    options.value.splice(index, 1);
}

// 使用浏览器的取色器选完颜色后，把 16 进制颜色同步到 RGB 滑块
function syncColorFromHex(){
    const matched = /^#([0-9a-fA-F]{6})$/.exec(fontColor.value);
    if (!matched){
        return;
    }
    colorR.value = parseInt(matched[1].slice(0, 2), 16);
    colorG.value = parseInt(matched[1].slice(2, 4), 16);
    colorB.value = parseInt(matched[1].slice(4, 6), 16);
}

// 拖动 RGB 滑块后，把颜色同步到 16 进制颜色（色块与取色器会一起变化）
function syncColorFromRgb(){
    fontColor.value = "#" + [colorR.value, colorG.value, colorB.value].map(
        (value) => parseInt(value).toString(16).padStart(2, "0")
    ).join("");
}

function openColorPicker(){
    if (colorInputRef.value){
        colorInputRef.value.click();
    }
}

async function submit(){
    const fontColorHex = fontColor.value.slice(1);
    if (title.value === "" || fontSize.value === "" || fontColorHex === "" || options.value.includes("")){
        result.value = "所有字段均不能为空";
        return;
    }
    if (options.value.length < 2){
        result.value = "请至少添加2个选项";
        return;
    }
    creating.value = true;
    result.value = "";

    const captchaRsp = await captcha();
    if (captchaRsp.retcode){
        result.value = "人机验证失败:" + captchaRsp.msg;
        creating.value = false;
        return;
    }

    const rsp = await fetch_api(voteDomain + "/api/create_vote", {
        options_amount: options.value.length,
        always_show_result: alwaysShowResult.value,
        show_number: showNumber.value,
        show_percent: showPercent.value,
        font_size: fontSize.value,
        font_color: fontColorHex,
        captcha_token: captchaRsp.data.token
    });
    if (rsp.retcode){
        result.value = rsp.msg;
        creating.value = false;
        return;
    }
    result.value = "创建成功";
    let generatedMarkdown = `**投票:${title.value}**(点击选项进行投票):  \n`;
    options.value.forEach((option, index) => {
        generatedMarkdown += `[${option}](${voteDomain}/v/${rsp.data.vote_id}/${index}) ![](${voteDomain}/i/${rsp.data.vote_id}/${index})  \n`;
    });
    markdown.value = generatedMarkdown;
    creating.value = false;
}
</script>

<template>
    <div class="wux-container">
        <ul class="wux-breadcrumb">
            <li class="wux-breadcrumb-item"><a :href="homePageUrl">主页</a></li>
            <li class="wux-breadcrumb-item">MD 投票工具</li>
        </ul>
        <div class="wux-typo">
            <h2 class="mt">创建一个投票</h2>
            <div id="config">
                <span class="label">1. 标题:</span>
                <input type="text" class="wux-form-input wux-form-input-md label" placeholder="标题" v-model="title" :disabled="creating">
                <span class="label">2. 投票选项:</span>
                <div id="options-div" class="pre-like label">
                    <template v-for="(option, index) in options" :key="index">
                        <input type="text" class="wux-form-input wux-form-input-md" :placeholder="'选项' + (index + 1)" v-model="options[index]" :disabled="creating">
                        <button class="wux-btn wux-btn-primary" type="button" :disabled="creating" @click="removeOption(index)"><IconTrash width="16px" height="16px" class="middle"/><span class="middle">删除此项</span></button>
                        <hr>
                    </template>
                </div>
                <button class="wux-btn wux-btn-primary label" type="button" :disabled="creating" @click="addOption()"><IconPlus width="16px" height="16px" class="middle"/><span class="middle">添加选项</span></button><br>
                <span class="label">3. 在何时显示投票结果?</span><br>
                <label><input class="wux-form-radios" type="radio" name="always-show-result" :value="false" v-model="alwaysShowResult" :disabled="creating">投票后可查看结果</label><br>
                <label><input class="wux-form-radios" type="radio" name="always-show-result" :value="true" v-model="alwaysShowResult" :disabled="creating">总是显示结果</label><br>
                <span class="label">4. 怎样显示投票结果:</span><br>
                <label><input type="checkbox" class="wux-form-checks" v-model="showNumber" :disabled="creating">显示投票人数</label><br>
                <label><input type="checkbox" class="wux-form-checks" v-model="showPercent" :disabled="creating">显示百分比</label><br>
                <span class="label">5. 字体大小:</span>
                <input type="number" class="wux-form-input wux-form-input-md label" placeholder="字体大小" v-model="fontSize" min="1" :disabled="creating">
                <span class="label">6. 字体颜色(点击下方色块使用浏览器的取色器):</span><br>
                <input ref="colorInputRef" type="color" class="label" style="width: 64px; height: 64px;" placeholder="填6位16进制颜色代码,要带#号,如#aa0000表示红色" v-model="fontColor" :disabled="creating" @input="syncColorFromHex()"><br>
                <span class="label">如果你的浏览器不支持,请使用下方的滑块</span>
                <div class="wux-row-md-3">
                    <div class="wux-col">
                        <label>R:<span>{{ colorR }}</span><input class="wux-form-range" type="range" v-model.number="colorR" min="0" max="255" :disabled="creating" @input="syncColorFromRgb()"></label><br>
                    </div>
                    <div class="wux-col">
                        <label>G:<span>{{ colorG }}</span><input class="wux-form-range" type="range" v-model.number="colorG" min="0" max="255" :disabled="creating" @input="syncColorFromRgb()"></label><br>
                    </div>
                    <div class="wux-col">
                        <label>B:<span>{{ colorB }}</span><input class="wux-form-range" type="range" v-model.number="colorB" min="0" max="255" :disabled="creating" @input="syncColorFromRgb()"></label><br>
                    </div>
                </div>
                <div class="color-preview" :style="{ backgroundColor: fontColor }" @click="openColorPicker()"></div>
            </div>
            <span class="label">7. 点击创建</span><br>
            <BtnWithLoading btn-class="wux-btn-primary label" :is-loading="creating" @click="submit()">创建投票</BtnWithLoading>
            <span id="result" class="result sep">{{ result }}</span>
            <textarea class="wux-form-input wux-form-input-md label" id="markdown" rows="5" placeholder="生成的Markdown会显示在这里" v-model="markdown"></textarea>
            <CopyButton :value="markdown" label="复制Markdown" class="wux-btn wux-btn-primary label"/>
        </div>
    </div>
</template>

<style scoped>
.color-preview{
    width: 64px;
    height: 64px;
    cursor: pointer;
}
</style>
