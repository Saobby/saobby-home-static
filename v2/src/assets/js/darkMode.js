const DARK_MODE_QUERY = '(prefers-color-scheme: dark)';

function applyDarkMode(isDark) {
    if (isDark) {
        document.body.setAttribute('dark-mode', 'true');
    } else {
        document.body.removeAttribute('dark-mode');
    }
}

export function initDarkMode() {
    const mediaQuery = window.matchMedia(DARK_MODE_QUERY);
    applyDarkMode(mediaQuery.matches);
    mediaQuery.addEventListener('change', (event) => applyDarkMode(event.matches));
}
