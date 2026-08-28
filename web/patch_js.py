import re

with open('script.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Fix Theme Logic
old_theme = r"let isDarkMode = false;\s*themeToggle\.addEventListener\('click', \(\) => \{\s*isDarkMode = !isDarkMode;\s*if \(isDarkMode\) \{\s*document\.body\.setAttribute\('data-theme', 'dark'\);\s*themeToggle\.innerText = '.*?';\s*\} else \{\s*document\.body\.removeAttribute\('data-theme'\);\s*themeToggle\.innerText = '.*?';\s*\}\s*\}\);"

new_theme = """let isDarkMode = true; // Fix: start true because HTML is dark by default
themeToggle.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    if (isDarkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '☀️<span class="theme-text"> Light</span>';
    } else {
        document.documentElement.removeAttribute('data-theme');
        themeToggle.innerHTML = '🌙<span class="theme-text"> Dark</span>';
    }
});"""

js = re.sub(old_theme, new_theme, js)

# Fix Close Button listener
close_chat_js = """if(chatToggleBtn) {
    chatToggleBtn.addEventListener('click', () => {
        showChat();
    });
}
const closeChatBtn = document.getElementById('closeChatBtn');
if (closeChatBtn) {
    closeChatBtn.addEventListener('click', () => {
        hideChat();
    });
}"""

js = re.sub(r"if\(chatToggleBtn\)\s*\{\s*chatToggleBtn\.addEventListener\('click',\s*\(\)\s*=>\s*\{\s*showChat\(\);\s*\}\);\s*\}", close_chat_js, js)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("Done script.js")
