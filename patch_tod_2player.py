import re

with open('web/script.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Add todTurnIndex
js = js.replace('let todMode = "both";', 'let todMode = "both";\nlet todTurnIndex = 0;')

# 2. Replace initTodGame and resetToSpin (injecting startTwoPlayerTurn)
old_init = '''function initTodGame() {
    showScreen(todScreen);
    resetToSpin();
}'''

new_init = '''function initTodGame() {
    showScreen(todScreen);
    todTurnIndex = 0;
    if (todPlayers.length <= 2) {
        startTwoPlayerTurn();
    } else {
        resetToSpin();
    }
}

function startTwoPlayerTurn() {
    resetTodUI();
    currentAsker = todPlayers[todTurnIndex % todPlayers.length].name;
    currentVictim = todPlayers[(todTurnIndex + 1) % todPlayers.length].name;
    
    todTurnArea.classList.remove('hidden');
    if (myName === currentVictim) {
        todStatusText.innerText = `It's your turn! What is your fate?`;
        todFateArea.classList.remove('hidden');
    } else {
        todStatusText.innerText = `Waiting for ${currentVictim} to pick their fate...`;
    }
}'''

js = js.replace(old_init, new_init)

# 3. Replace resolved logic
old_resolved = '''        else if (data.event === "resolved") {
            resetToSpin();
        }'''

new_resolved = '''        else if (data.event === "resolved") {
            if (todPlayers.length <= 2) {
                todTurnIndex++;
                startTwoPlayerTurn();
            } else {
                resetToSpin();
            }
        }'''

js = js.replace(old_resolved, new_resolved)

with open('web/script.js', 'w', encoding='utf-8') as f:
    f.write(js)
print('Updated 2-player logic for ToD!')
