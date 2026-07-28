(function () {
    var DARK_MODE_QUERY = '(prefers-color-scheme: dark)';

    function applyDarkMode(isDark) {
        if (!document.body) {
            return;
        }
        if (isDark) {
            document.body.setAttribute('dark-mode', 'true');
        } else {
            document.body.removeAttribute('dark-mode');
        }
    }

    function initDarkMode() {
        var mediaQuery = window.matchMedia(DARK_MODE_QUERY);
        applyDarkMode(mediaQuery.matches);
        mediaQuery.addEventListener('change', function (event) {
            applyDarkMode(event.matches);
        });
    }

    if (window.matchMedia(DARK_MODE_QUERY).matches) {
        document.documentElement.style.backgroundColor = '#1e1e1e';
        document.documentElement.style.colorScheme = 'dark';
        document.addEventListener('DOMContentLoaded', function () {
            applyDarkMode(true);
        });
    }

    if (document.body) {
        initDarkMode();
    } else {
        document.addEventListener('DOMContentLoaded', initDarkMode);
    }
})();
