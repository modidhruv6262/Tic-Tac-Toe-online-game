import re

with open('script.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Completely replace showChat, hideChat, and the chatToggleBtn listener block
old_block = re.compile(
    r'function showChat\(\)\s*\{.*?if\(chatToggleBtn\)\s*\{.*?chatToggleBtn\.addEventListener.*?\}\);\s*\}',
    re.DOTALL
)

new_block = """function showChat() { 
    if(chatToggleBtn) chatToggleBtn.classList.add('hidden');
    chatBox.classList.remove('hidden'); 
    document.body.classList.add('chat-active'); 
    unreadMessages = 0;
    if(chatBadge) chatBadge.classList.add('hidden');
}

function hideChat() { 
    if(chatToggleBtn) chatToggleBtn.classList.remove('hidden');
    chatBox.classList.add('hidden'); 
    document.body.classList.remove('chat-active'); 
}

if(chatToggleBtn) {
    chatToggleBtn.addEventListener('click', () => {
        showChat();
    });
}

const closeChatBtn = document.getElementById('closeChatBtn');
if(closeChatBtn) {
    closeChatBtn.addEventListener('click', () => {
        hideChat();
    });
}"""

js = old_block.sub(new_block, js)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("Done!")
