var midi_programs = [
    "0 Acoustic Grand Piano 大钢琴（声学钢琴）",
    "1 Bright Acoustic Piano 明亮的钢琴",
    "2 Electric Grand Piano 电钢琴",
    "3 Honky-tonk Piano 酒吧钢琴",
    "4 Rhodes Piano 柔和的电钢琴",
    "5 Chorused Piano 加合唱效果的电钢琴",
    "6 Harpsichord 羽管键琴（拨弦古钢琴）",
    "7 Clavichord 科拉维科特琴（击弦古钢琴）",
    "8 Celesta 钢片琴",
    "9 Glockenspiel",
    "10 Music box 八音盒",
    "11 Vibraphone 颤音琴",
    "12 Marimba 马林巴",
    "13 Xylophone 木琴",
    "14 Tubular Bells 管钟",
    "15 Dulcimer 大扬琴",
    "16 Hammond Organ 击杆风琴",
    "17 Percussive Organ 打击式风琴",
    "18 Rock Organ 摇滚风琴",
    "19 Church Organ 教堂风琴",
    "20 Reed Organ 簧管风琴",
    "21 Accordian 手风琴",
    "22 Harmonica 口琴",
    "23 Tango Accordian 探戈手风琴",
    "24 Acoustic Guitar (nylon) 尼龙弦吉他",
    "25 Acoustic Guitar (steel) 钢弦吉他",
    "26 Electric Guitar (jazz) 爵士电吉他",
    "27 Electric Guitar (clean) 清音电吉他",
    "28 Electric Guitar (muted) 闷音电吉他",
    "29 Overdriven Guitar 加驱动效果的电吉他",
    "30 Distortion Guitar 加失真效果的电吉他",
    "31 Guitar Harmonics 吉他和音",
    "32 Acoustic Bass 大贝司（声学贝司）",
    "33 Electric Bass(finger) 电贝司（指弹）",
    "34 Electric Bass (pick) 电贝司（拨片）",
    "35 Fretless Bass 无品贝司",
    "36 Slap Bass 1 掌击Bass 1",
    "37 Slap Bass 2 掌击Bass 2",
    "38 Synth Bass 1 电子合成Bass 1",
    "39 Synth Bass 2 电子合成Bass 2",
    "40 Violin 小提琴",
    "41 Viola 中提琴",
    "42 Cello 大提琴",
    "43 Contrabass 低音大提琴",
    "44 Tremolo Strings 弦乐群颤音音色",
    "45 Pizzicato Strings 弦乐群拨弦音色",
    "46 Orchestral Harp 竖琴",
    "47 Timpani 定音鼓",
    "48 String Ensemble 1 弦乐合奏音色1",
    "49 String Ensemble 2 弦乐合奏音色2",
    "50 Synth Strings 1 合成弦乐合奏音色1",
    "51 Synth Strings 2 合成弦乐合奏音色2",
    "52 Choir Aahs 人声合唱“啊”",
    "53 Voice Oohs 人声“嘟”",
    "54 Synth Voice 合成人声",
    "55 Orchestra Hit 管弦乐敲击齐奏",
    "56 Trumpet 小号",
    "57 Trombone 长号",
    "58 Tuba 大号",
    "59 Muted Trumpet 加弱音器小号",
    "60 French Horn 法国号（圆号）",
    "61 Brass Section 铜管组（铜管乐器合奏音色）",
    "62 Synth Brass 1 合成铜管音色1",
    "63 Synth Brass 2 合成铜管音色2",
    "64 Soprano Sax 高音萨克斯风",
    "65 Alto Sax 次中音萨克斯风",
    "66 Tenor Sax 中音萨克斯风",
    "67 Baritone Sax 低音萨克斯风",
    "68 Oboe 双簧管",
    "69 English Horn 英国管",
    "70 Bassoon 巴松（大管）",
    "71 Clarinet 单簧管（黑管）",
    "72 Piccolo 短笛",
    "73 Flute 长笛",
    "74 Recorder 竖笛",
    "75 Pan Flute 排箫",
    "76 Bottle Blow [中文名称暂缺]",
    "77 Shakuhachi 日本尺八",
    "78 Whistle 口哨声",
    "79 Ocarina 奥卡雷那",
    "80 Lead 1 (square) 合成主音1（方波）",
    "81 Lead 2 (sawtooth) 合成主音2（锯齿波）",
    "82 Lead 3 (caliope lead) 合成主音3",
    "83 Lead 4 (chiff lead) 合成主音4",
    "84 Lead 5 (charang) 合成主音5",
    "85 Lead 6 (voice) 合成主音6（人声）",
    "86 Lead 7 (fifths) 合成主音7（平行五度）",
    "87 Lead 8 (bass+lead)合成主音8（贝司加主音）",
    "88 Pad 1 (new age) 合成音色1（新世纪）",
    "89 Pad 2 (warm) 合成音色2 （温暖）",
    "90 Pad 3 (polysynth) 合成音色3",
    "91 Pad 4 (choir) 合成音色4 （合唱）",
    "92 Pad 5 (bowed) 合成音色5",
    "93 Pad 6 (metallic) 合成音色6 （金属声）",
    "94 Pad 7 (halo) 合成音色7 （光环）",
    "95 Pad 8 (sweep) 合成音色8",
    "96 FX 1 (rain) 合成效果 1 雨声",
    "97 FX 2 (soundtrack) 合成效果 2 音轨",
    "98 FX 3 (crystal) 合成效果 3 水晶",
    "99 FX 4 (atmosphere) 合成效果 4 大气",
    "100 FX 5 (brightness) 合成效果 5 明亮",
    "101 FX 6 (goblins) 合成效果 6 鬼怪",
    "102 FX 7 (echoes) 合成效果 7 回声",
    "103 FX 8 (sci-fi) 合成效果 8 科幻",
    "104 Sitar 西塔尔（印度）",
    "105 Banjo 班卓琴（美洲）",
    "106 Shamisen 三昧线（日本）",
    "107 Koto 十三弦筝（日本）",
    "108 Kalimba 卡林巴",
    "109 Bagpipe 风笛",
    "110 Fiddle 民族提琴",
    "111 Shanai 山奈",
    "112 Tinkle Bell 叮当铃",
    "113 Agogo [中文名称暂缺]",
    "114 Steel Drums 钢鼓",
    "115 Woodblock 木鱼",
    "116 Taiko Drum 太鼓",
    "117 Melodic Tom 通通鼓",
    "118 Synth Drum 合成鼓",
    "119 Reverse Cymbal 铜钹",
    "120 Guitar Fret Noise 吉他换把杂音",
    "121 Breath Noise 呼吸声",
    "122 Seashore 海浪声",
    "123 Bird Tweet 鸟鸣",
    "124 Telephone Ring 电话铃",
    "125 Helicopter 直升机",
    "126 Applause 鼓掌声",
    "127 Gunshot 枪声"
];
var scratch_programs = [
    "1 钢琴",
    "2 电钢琴",
    "3 风琴",
    "4 吉他",
    "5 电吉他",
    "6 贝斯",
    "7 拨弦",
    "8 大提琴",
    "9 长号",
    "10 单簧管",
    "11 萨克斯管",
    "12 长笛",
    "13 木长笛",
    "14 巴松管",
    "15 唱诗班",
    "16 颤音琴",
    "17 八音盒",
    "18 钢鼓",
    "19 马林巴琴",
    "20 合成主音",
    "21 合成柔音"
];
var ins_map = {0: 1, 1: 1, 3: 1, 6: 1, 7: 1, 8: 1, 15: 1, 2: 2, 4: 2, 5: 2, 9: 3, 13: 3, 14: 3, 16: 3, 17: 3, 18: 3, 19: 3, 20: 3, 21: 3, 22: 3, 23: 3, 24: 4, 25: 4, 32: 6, 26: 5, 27: 5, 28: 5, 29: 5, 30: 5, 31: 5, 33: 6, 34: 6, 35: 6, 36: 6, 37: 6, 38: 20, 87: 6, 44: 7, 45: 7, 46: 7, 106: 7, 107: 7, 40: 8, 41: 8, 42: 8, 43: 8, 110: 8, 56: 9, 57: 9, 58: 9, 59: 9, 60: 9, 61: 9, 68: 10, 69: 10, 71: 10, 64: 11, 65: 11, 66: 11, 67: 11, 72: 12, 73: 12, 109: 12, 74: 13, 75: 13, 76: 13, 77: 13, 78: 13, 79: 13, 70: 14, 52: 15, 53: 15, 54: 15, 85: 15, 91: 15, 11: 16, 10: 17, 112: 17, 124: 17, 47: 18, 113: 18, 115: 18, 116: 18, 117: 18, 118: 18, 119: 18, 12: 19, 108: 19, 80: 20, 81: 20, 82: 20, 83: 20, 84: 20, 86: 20, 92: 20, 93: 20, 94: 20, 95: 20, 96: 20, 97: 20, 98: 20, 99: 20, 100: 20, 101: 20, 102: 20, 103: 20, 111: 20, 39: 21, 48: 21, 49: 21, 50: 21, 51: 21, 55: 21, 62: 21, 63: 21, 88: 21, 89: 21, 90: 21, 104: 21, 105: 21, 120: 21, 121: 21, 122: 21, 123: 21, 125: 21, 126: 21, 127: 21};
var pm_unfolded = false;
gebi("midi-file").addEventListener("click", async function(){
     gebi("midi-player").src = b642link(await input_file2b64(gebi("midi-file").files[0]));
});

function gen_select(selected_index, n){
    //console.log(selected_index, n);
    var ret = `<select class="wux-form-select" style="width:150px;" onchange="programs_map_update(${n},this.selectedIndex);">`;
    for (var index in scratch_programs){
        //console.log(selected_index,index);
        ret += `<option${selected_index===parseInt(index)?" selected":""}>${scratch_programs[index]}</option>`;
    }
    ret += `</select>`;
    return ret;
}

function programs_map_update(midi, scratch){
    ins_map[midi] = scratch + 1;
}

function init(){
    gebi("programs-btn").addEventListener("click", function(){
        if (pm_unfolded){
            pm_unfolded = false;
            gebi("program-map-div").hidden = true;
            gebi("programs-btn").innerHTML = icon_with_text("folder-primary", "展开设置");
        }else{
            pm_unfolded = true;
            gebi("program-map-div").hidden = false;
            gebi("programs-btn").innerHTML = icon_with_text("folder-filled-primary", "收起设置");
        }
    });
    var programs_html = `<table class="wux-table"><thead><tr><th>MIDI 音色</th><th>Scratch 音色</th></tr></thread><tbody>`;
    for (var index in midi_programs){
        programs_html += `<tr><th><span style="margin-left:10px">${midi_programs[index]}</span></th><td>${gen_select(ins_map[index]-1, index)}</td></tr>`;
    }
    programs_html += `</tbody></table>`;
    gebi("program-map-div").innerHTML = programs_html;
}

function upload_midi() {
    var file = gebi("midi-file").files[0];
    if (!file){
        gebi("upload-result").innerHTML = "请先选择 MIDI 文件";
        return;
    }
    set_btn_html(gebi("upload-btn"), "请完成人机验证");
    gebi("midi-file").disabled = true;
    saobbyCaptchaV2.open_window_and_return_promise().then(function(val){
        set_btn_html(gebi("upload-btn"), "正在上传");
        var form_data = new FormData;
        var http = new XMLHttpRequest;
        http.open("post", "https://midi2scratch.saobby.com/api/gen_sprite_file", true);
        http.onreadystatechange = function(){
            if (this.readyState === 4){
                var ret = JSON.parse(this.responseText);
                if (ret.success){
                    var file_bytes = atob(ret.data.file);
                    var file_bytes_array = new Uint8Array(file_bytes.length);
                    for (var i=0; i < file_bytes.length; i++){
                        file_bytes_array[i] = file_bytes.charCodeAt(i);
                    }
                    var file_blob = new Blob([file_bytes_array], {"type": "application/scratch3-sprite"});
                    var file_url = URL.createObjectURL(file_blob);
                    gebi("upload-result").innerHTML = `成功生成了角色文件!现在可以下载!<br><a href="${file_url}" target="_blank" download="player.sprite3"><button class="wux-btn wux-btn-primary wux-btn-lg" onclick="set_btn_html(this,'已开始下载');setTimeout(set_btn_html,1000,this);">${icon_with_text("download-white", "下载")}</button></a>`;
                }else{
                    gebi("upload-result").innerHTML = ret.message;
                }
                set_btn_html(gebi("upload-btn"));
                gebi("midi-file").disabled = false;
            }
        };
        http.upload.onprogress = function(t){
            if (t.lengthComputable){
                var percentage = 100 * t.loaded / t.total;
                if (percentage === 100){
                    gebi("upload-result").innerHTML = "正在处理，请稍候...";
                    gebi("upload-progress").hidden = true;
                }else{
                    gebi("upload-result").innerHTML = "上传中(" + Math.floor(percentage) + "%)";
                    gebi("upload-progress").value = percentage;
                    gebi("upload-progress").hidden = false;
                }
            }
        };
        form_data.append("midi", file);
        form_data.append("instruments", JSON.stringify(ins_map));
        form_data.append("captcha_token", val.captcha_token);
        http.send(form_data);
    },
    function(val){
        gebi("upload-result").innerHTML = "请先完成人机验证:"+val.message;
        gebi("midi-file").disabled = false;
        set_btn_html(gebi("upload-btn"));
    });
}

init();
