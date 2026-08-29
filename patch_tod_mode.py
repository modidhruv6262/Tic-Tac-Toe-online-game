import re

with open('web/script.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Update spin setTimeout
old_spin = '''                setTimeout(() => {
                    resetTodUI();
                    todTurnArea.classList.remove('hidden');
                    if (myName === currentVictim) {
                        todStatusText.innerText = `You were chosen! What is your fate?`;
                        todFateArea.classList.remove('hidden');
                    } else {
                        todStatusText.innerText = `${currentVictim} is choosing their fate...`;
                    }
                }, 1500);'''

new_spin = '''                setTimeout(() => {
                    resetTodUI();
                    todTurnArea.classList.remove('hidden');
                    if (myName === currentVictim) {
                        if (todMode === 'truth') {
                            socket.send(JSON.stringify({ action: "tod_event", event: "fate_chosen", fate: "TRUTH" }));
                        } else if (todMode === 'dare') {
                            socket.send(JSON.stringify({ action: "tod_event", event: "fate_chosen", fate: "DARE" }));
                        } else {
                            todStatusText.innerText = `You were chosen! What is your fate?`;
                            todFateArea.classList.remove('hidden');
                        }
                    } else {
                        if (todMode === 'both') {
                            todStatusText.innerText = `${currentVictim} is choosing their fate...`;
                        }
                    }
                }, 1500);'''

js = js.replace(old_spin, new_spin)


# 2. Update startTwoPlayerTurn
old_two_player = '''    if (myName === currentVictim) {
        todStatusText.innerText = `It's your turn! What is your fate?`;
        todFateArea.classList.remove('hidden');
    } else {
        todStatusText.innerText = `Waiting for ${currentVictim} to pick their fate...`;
    }'''

new_two_player = '''    if (myName === currentVictim) {
        if (todMode === 'truth') {
            socket.send(JSON.stringify({ action: "tod_event", event: "fate_chosen", fate: "TRUTH" }));
        } else if (todMode === 'dare') {
            socket.send(JSON.stringify({ action: "tod_event", event: "fate_chosen", fate: "DARE" }));
        } else {
            todStatusText.innerText = `It's your turn! What is your fate?`;
            todFateArea.classList.remove('hidden');
        }
    } else {
        if (todMode === 'both') {
            todStatusText.innerText = `Waiting for ${currentVictim} to pick their fate...`;
        }
    }'''

js = js.replace(old_two_player, new_two_player)

with open('web/script.js', 'w', encoding='utf-8') as f:
    f.write(js)
print('Updated auto-fate selection based on todMode!')
