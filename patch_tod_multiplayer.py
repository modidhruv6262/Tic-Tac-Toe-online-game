import re

with open('web/script.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Update launch_game logic
launch_hook = '''    else if (data.type === "launch_game") { 
        if (data.game === 'tictactoe') {
            myRole = data.role;
            runRoulette(data.all_players, data.role, data.symbol, data);
        } else if (data.game === 'ludo') {
            myLudoColor = data.color;
            runRoulette(data.all_players.map(p=>p.name), "Player", data.color.toUpperCase(), data);
        } else if (data.game === 'tod') {
            todPlayers = data.all_players || [];
            todMode = data.mode;
            todIntensity = data.intensity;
            initTodGame();
        }
    }'''
js = re.sub(r'else if \(data\.type === "launch_game"\) \{.*?\n\s*\}', launch_hook, js, flags=re.DOTALL)

# 2. Add tod_event handler at the end of socket.onmessage
tod_event_handler = '''    else if (data.action === "tod_event") {
        if (data.event === "spin") {
            currentAsker = data.asker;
            currentVictim = data.victim;
            resetTodUI();
            todTurnArea.classList.remove('hidden');
            todBottleContainer.classList.remove('hidden');
            todStatusText.innerText = `${currentAsker} is spinning...`;
            todBottle.style.transform = `rotate(${data.deg}deg)`;
            
            setTimeout(() => {
                todStatusText.innerText = `Bottle points to: ${currentVictim}!`;
                setTimeout(() => {
                    resetTodUI();
                    todTurnArea.classList.remove('hidden');
                    if (myName === currentVictim) {
                        todStatusText.innerText = `You were chosen! What is your fate?`;
                        todFateArea.classList.remove('hidden');
                    } else {
                        todStatusText.innerText = `${currentVictim} is choosing their fate...`;
                    }
                }, 1500);
            }, 3000);
        }
        else if (data.event === "fate_chosen") {
            const fate = data.fate;
            todRevealType.innerText = fate;
            resetTodUI();
            if (myName === currentAsker) {
                todAskerArea.classList.remove('hidden');
                todAskerTitle.innerText = `${currentVictim} chose ${fate}. Pick a prompt!`;
            } else {
                todTurnArea.classList.remove('hidden');
                todStatusText.innerText = `${currentAsker} is picking a ${fate} for ${currentVictim}...`;
            }
        }
        else if (data.event === "reveal") {
            resetTodUI();
            todRevealArea.classList.remove('hidden');
            todRevealType.innerText = data.fate;
            todRevealText.innerText = data.text;
            
            if (myName === currentVictim) {
                todResolutionArea.classList.remove('hidden');
            }
        }
        else if (data.event === "resolved") {
            resetToSpin();
        }
    }
'''
js = js.replace('else if (data.type === "chat") { \n        handleChat(data.sender, data.message);\n    }', 
                'else if (data.type === "chat") { \n        handleChat(data.sender, data.message);\n    }\n' + tod_event_handler)

# 3. Replace the entire "TRUTH OR DARE LOGIC (FRONTEND PREVIEW)" block with multiplayer logic
multiplayer_logic = '''
// --- TRUTH OR DARE LOGIC (MULTIPLAYER) ---
let todPlayers = [];
let todMode = "both";
let todIntensity = 3;
let currentAsker = "";
let currentVictim = "";

if (launchToD) {
    launchToD.addEventListener('click', () => {
        todSettingsModal.classList.remove('hidden');
    });
}

if (cancelTodBtn) {
    cancelTodBtn.addEventListener('click', () => {
        todSettingsModal.classList.add('hidden');
    });
}

if (todIntensitySlider) {
    todIntensitySlider.addEventListener('input', (e) => {
        todIntensityLabel.innerText = `Level ${e.target.value}`;
    });
}

function resetTodUI() {
    todTurnArea.classList.add('hidden');
    todBottleContainer.classList.add('hidden');
    todSpinBtn.classList.add('hidden');
    todFateArea.classList.add('hidden');
    todAskerArea.classList.add('hidden');
    todCustomInputArea.classList.add('hidden');
    todRevealArea.classList.add('hidden');
    todResolutionArea.classList.add('hidden');
}

if (startTodBtn) {
    startTodBtn.addEventListener('click', () => {
        const mode = document.getElementById('todModeSelect').value;
        const intensity = todIntensitySlider.value;
        socket.send(JSON.stringify({ 
            action: "launch_game", 
            game: "tod", 
            mode: mode, 
            intensity: intensity 
        }));
    });
}

if (leaveTodBtn) {
    leaveTodBtn.addEventListener('click', () => {
        socket.send(JSON.stringify({action: "return_hub"}));
    });
}

function initTodGame() {
    todSettingsModal.classList.add('hidden');
    showScreen(todScreen);
    resetToSpin();
}

function resetToSpin() {
    resetTodUI();
    todTurnArea.classList.remove('hidden');
    todBottleContainer.classList.remove('hidden');
    todBottle.style.transform = `rotate(0deg)`;
    todStatusText.innerText = "Waiting for someone to spin...";
    todSpinBtn.classList.remove('hidden');
}

if (todSpinBtn) {
    todSpinBtn.addEventListener('click', () => {
        let victims = todPlayers.filter(p => p.name !== myName);
        if (victims.length === 0) victims = todPlayers; // Fallback if playing solo
        let randomVictim = victims[Math.floor(Math.random() * victims.length)].name;
        
        socket.send(JSON.stringify({
            action: "tod_event",
            event: "spin",
            asker: myName,
            victim: randomVictim,
            deg: Math.floor(Math.random() * 360) + 1440
        }));
    });
}

if (todChooseTruthBtn) {
    todChooseTruthBtn.addEventListener('click', () => { 
        socket.send(JSON.stringify({ action: "tod_event", event: "fate_chosen", fate: "TRUTH" }));
    });
}

if (todChooseDareBtn) {
    todChooseDareBtn.addEventListener('click', () => { 
        socket.send(JSON.stringify({ action: "tod_event", event: "fate_chosen", fate: "DARE" }));
    });
}

if (todDbBtn) {
    todDbBtn.addEventListener('click', () => {
        const fate = todRevealType.innerText;
        const text = fate === 'TRUTH' 
            ? "What is the most embarrassing thing you've done in front of a crush? (Mock Database)" 
            : "Do a crazy dance in the middle of the room for 30 seconds. (Mock Database)";
        socket.send(JSON.stringify({ action: "tod_event", event: "reveal", fate: fate, text: text }));
    });
}

if (todCustomBtn) {
    todCustomBtn.addEventListener('click', () => {
        todCustomInputArea.classList.remove('hidden');
    });
}

if (todSendCustomBtn) {
    todSendCustomBtn.addEventListener('click', () => {
        const txt = todCustomInput.value.trim();
        const fate = todRevealType.innerText;
        if(txt) {
           socket.send(JSON.stringify({ action: "tod_event", event: "reveal", fate: fate, text: txt }));
           todCustomInput.value = "";
        }
    });
}

if (todDoneBtn) { 
    todDoneBtn.addEventListener('click', () => {
        socket.send(JSON.stringify({ action: "tod_event", event: "resolved" }));
    }); 
}

if (todForfeitBtn) { 
    todForfeitBtn.addEventListener('click', () => {
        socket.send(JSON.stringify({ action: "tod_event", event: "resolved" }));
    });
}
'''

# Use regex to replace the old block starting at // --- TRUTH OR DARE LOGIC
js = re.sub(r'// --- TRUTH OR DARE LOGIC \(FRONTEND PREVIEW\).*?(?=\Z)', multiplayer_logic, js, flags=re.DOTALL)

with open('web/script.js', 'w', encoding='utf-8') as f:
    f.write(js)
print('Updated script.js for multiplayer ToD!')
