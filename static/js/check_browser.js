// Browser detection script
// 作者: ChatGPTo1
// Supports checking minimum versions for Chrome, Edge, Firefox, Opera, Brave, Vivaldi, Tor, Safari, and Yandex.
// IE is explicitly marked as unsupported.
// This code uses basic string methods and parseFloat to ensure compatibility with older browsers.

(function () {
    // Define minimum versions
    // 测试: Saobby
    var minVersions = {
        chrome: 49,
        edge: 79,
        firefox: 50,
        opera: 36,
        brave: 1.0,
        vivaldi: 1.0,
        tor: 7.5,
        safari: 11,
        yandex: 16.4
    };

    // Simple function to parse version from user agent substring
    function parseVersion(uaString, token) {
        var index = uaString.indexOf(token);
        if (index === -1) {
            return -1; // token not found
        }
        var versionString = uaString.substring(index + token.length);
        // Split at next space or slash or end of string
        versionString = versionString.split(/[ /;)]/)[0];
        // Convert to number
        return parseFloat(versionString);
    }

    // Function to check if the browser is IE
    function isIE(uaString) {
        // Checking for "MSIE" or "Trident" indicates IE
        return uaString.indexOf("msie") !== -1 || uaString.indexOf("trident") !== -1;
    }

    // Detect and validate the current browser
    function checkBrowser() {
        var ua = navigator.userAgent.toLowerCase();

        // Check IE first
        if (isIE(ua)) {
            alert("警告:本站不支持使用IE浏览器访问,你将无法正常使用本站的大部分功能,请使用Chrome、Firefox、Edge等现代浏览器访问。");
            return;
        }

        // Check for Edge (Chromium-based uses 'edg/')
        if (ua.indexOf("edg/") !== -1) {
            var edgeVersion = parseVersion(ua, "edg/");
            if (edgeVersion < minVersions.edge) {
                alert("警告:你的Edge浏览器版本太老了,你将无法正常使用本站的大部分功能,请更新到最新版本后再访问。");
            }
            return;
        }
        // Older Edge (non-Chromium) detection if user agent uses 'edge/'
        if (ua.indexOf("edge/") !== -1) {
            alert("警告:你的Edge浏览器版本太老了(远古版本),你将无法正常使用本站的大部分功能,请安装最新版Edge浏览器后再试。");
            return;
        }

        // Check Chrome, Brave, Opera, Vivaldi
        // Opera may appear as OPR in user agent, Brave may appear similar to Chrome
        if (ua.indexOf("chrome") !== -1) {
            // Check for Opera (OPR)
            if (ua.indexOf("opr/") !== -1) {
                var operaVersion = parseVersion(ua, "opr/");
                if (operaVersion < minVersions.opera) {
                    alert("警告:你的Opera浏览器版本太老了,你将无法正常使用本站的大部分功能,请更新到最新版本后再访问。");
                }
                return;
            }
            // Check for Vivaldi
            if (ua.indexOf("vivaldi") !== -1) {
                var vivaldiVersion = parseVersion(ua, "vivaldi/");
                if (vivaldiVersion < minVersions.vivaldi) {
                    alert("警告:你的Vivaldi浏览器版本太老了,你将无法正常使用本站的大部分功能,请更新到最新版本后再访问。");
                }
                return;
            }
            // Check for Brave (basic detection, not always reliable)
            if (ua.indexOf("brave") !== -1) {
                var braveVersion = 1.0; // Brave rarely exposes version in UA; treat as 1.0
                if (braveVersion < minVersions.brave) {
                    alert("警告:你的Brave浏览器版本太老了,你将无法正常使用本站的大部分功能,请更新到最新版本后再访问。");
                }
                return;
            }
            // Check for Yandex
            if (ua.indexOf("yabrowser") !== -1) {
                var yandexVersion = parseVersion(ua, "yabrowser/");
                if (yandexVersion < minVersions.yandex) {
                    alert("警告:你的Yandex浏览器版本太老了,你将无法正常使用本站的大部分功能,请更新到最新版本后再访问。");
                }
                return;
            }
            // If it's plain Chrome
            var chromeVersion = parseVersion(ua, "chrome/");
            if (chromeVersion < minVersions.chrome) {
                alert("警告:你的Chrome浏览器版本太老了,你将无法正常使用本站的大部分功能,请更新到最新版本后再访问。");
            }
            return;
        }

        // Check Firefox
        if (ua.indexOf("firefox") !== -1) {
            var firefoxVersion = parseVersion(ua, "firefox/");
            if (firefoxVersion < minVersions.firefox) {
                alert("警告:你的Firefox浏览器版本太老了,你将无法正常使用本站的大部分功能,请更新到最新版本后再访问。");
            }
            return;
        }

        // Check Safari
        // Safari usually includes "safari" and "version/x.x" in UA,
        // but not "chrome" or "opr", etc.
        if (ua.indexOf("safari") !== -1 && ua.indexOf("version/") !== -1) {
            var safariVersion = parseVersion(ua, "version/");
            if (safariVersion < minVersions.safari) {
                alert("警告:你的Safari浏览器版本太老了,你将无法正常使用本站的大部分功能,请更新到最新版本后再访问。");
            }
            return;
        }

        // Check Tor
        if (ua.indexOf("tor") !== -1) {
            // Tor often includes "TorBrowser" or "Firefox;" so we attempt a basic parse
            var torVersion = parseVersion(ua, "torbrowser/");
            if (torVersion === -1) {
                // Some older Tor versions just show "Firefox"
                torVersion = parseVersion(ua, "firefox/");
            }
            if (torVersion < minVersions.tor) {
                alert("警告:你的Tor浏览器版本低于测试过可用的最低版本,你可能无法正常使用本站的某些功能,请更新到最新版本后再访问。");
            }
            return;
        }
    }

    // Run on load
    checkBrowser();
})();