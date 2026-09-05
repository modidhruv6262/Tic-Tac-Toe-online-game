
// ==========================================
// --- PLAYGIRD LOADING SCREEN ---
// ==========================================
window.addEventListener('load', () => {
    // Artificial delay to show off the cool neon loading screen
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('fade-out');
            // Completely remove from DOM after fade out to prevent blocking clicks
            setTimeout(() => loadingScreen.remove(), 800); 
        }
    }, 1500);
});

const socket = new WebSocket('wss://tic-tac-toe-online-game-wokq.onrender.com');

// --- UI ELEMENTS & GLOBALS ---
const themeToggle = document.getElementById('themeToggle');
const nameScreen = document.getElementById('nameScreen');
const nameInput = document.getElementById('nameInput');
const saveNameBtn = document.getElementById('saveNameBtn');

const modeScreen = document.getElementById('modeScreen');
const vsBotBtn = document.getElementById('vsBotBtn');
const vsFriendBtn = document.getElementById('vsFriendBtn');
const backToNameBtn = document.getElementById('backToNameBtn');

const lobbyScreen = document.getElementById('lobbyScreen');
const lobbyActions = document.getElementById('lobbyActions');
const capacitySetup = document.getElementById('capacitySetup');
const capacityCards = document.querySelectorAll('.capacity-card');
const cancelCreateBtn = document.getElementById('cancelCreateBtn');
const createBtn = document.getElementById('createBtn');
const joinBtn = document.getElementById('joinBtn');
const codeInput = document.getElementById('codeInput');
const lobbyMessage = document.getElementById('lobbyMessage');
const backToModeBtn = document.getElementById('backToModeBtn');

const waitingScreen = document.getElementById('waitingScreen');
const waitingRoomCode = document.getElementById('waitingRoomCode');
const playerRoster = document.getElementById('playerRoster');
const waitingStatus = document.getElementById('waitingStatus');
const leaveWaitingBtn = document.getElementById('leaveWaitingBtn');

const hubScreen = document.getElementById('hubScreen');
const hubRoleBanner = document.getElementById('hubRoleBanner');
const hubRoomDisplay = document.getElementById('hubRoomDisplay');
const launchTicTacToe = document.getElementById('launchTicTacToe');
const launchLudo = document.getElementById('launchLudo');
const leaveHubBtn = document.getElementById('leaveHubBtn');

const difficultyContainer = document.getElementById('difficultyContainer');
const difficultySlider = document.getElementById('difficultySlider');
const diffLabelText = document.getElementById('diffLabelText');

const gameArea = document.getElementById('gameArea');
const gameControls = document.getElementById('gameControls');
const backToHubBtn = document.getElementById('backToHubBtn');
const restartBtn = document.getElementById('restartBtn');
const statusText = document.getElementById('statusText');

const tictactoeBoard = document.getElementById('tictactoeBoard');
const ludoWrapper = document.getElementById('ludoWrapper');
const ludoBoard = document.getElementById('ludoBoard');
const ludoDice = document.getElementById('ludoDice');
const rollDiceBtn = document.getElementById('rollDiceBtn');
const cells = document.querySelectorAll('.cell');
const strike = document.getElementById('strike');

const chatBox = document.getElementById('chatBox');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendChatBtn = document.getElementById('sendChatBtn');
const chatToggleBtn = document.getElementById('chatToggleBtn');
const chatIcon = document.getElementById('chatIcon');
const chatBadge = document.getElementById('chatBadge');
let unreadMessages = 0;

const rouletteOverlay = document.getElementById('rouletteOverlay');
const rouletteName = document.getElementById('rouletteName');
const rouletteRole = document.getElementById('rouletteRole');

const resultOverlay = document.getElementById('resultOverlay');
const resultTitle = document.getElementById('resultTitle');
const overlayRestartBtn = document.getElementById('overlayRestartBtn');
const overlayHubBtn = document.getElementById('overlayHubBtn');

let currentMode = ''; 
let activeGame = ''; 
let currentSymbol = 'X'; 
let myRole = ''; 
let gameActive = false; 
let myRoomCode = '';
let roomHost = '';
let playerName = ''; 
let opponentName = ''; 
let botDifficulty = 2; 



const leaveRequestModal = document.getElementById('leaveRequestModal');
const leaveRequestText = document.getElementById('leaveRequestText');
const allowLeaveBtn = document.getElementById('allowLeaveBtn');
const denyLeaveBtn = document.getElementById('denyLeaveBtn');
let pendingLeaveType = '';
let pendingLeavePlayer = '';

if (allowLeaveBtn) {
    allowLeaveBtn.addEventListener('click', () => {
        socket.send(JSON.stringify({ action: "approve_leave", leave_type: pendingLeaveType, player: pendingLeavePlayer }));
        leaveRequestModal.classList.add('hidden');
    });
}
if (denyLeaveBtn) {
    denyLeaveBtn.addEventListener('click', () => {
        socket.send(JSON.stringify({ action: "deny_leave", player: pendingLeavePlayer }));
        leaveRequestModal.classList.add('hidden');
    });
}

function requestLeave(type) {
    if (currentMode !== 'friend' || playerName === roomHost) {
        if (type === 'room') leaveRoom();
        else socket.send(JSON.stringify({action: "return_hub"}));
    } else {
        socket.send(JSON.stringify({ action: "request_leave", type: type, player: playerName }));
        showAlert("Request sent to Host. Waiting for approval...");
    }
}

const alertModal = document.getElementById('alertModal');
const alertModalText = document.getElementById('alertModalText');
const alertModalCloseBtn = document.getElementById('alertModalCloseBtn');

if (alertModalCloseBtn) {
    alertModalCloseBtn.addEventListener('click', () => {
        alertModal.classList.add('hidden');
    });
}

function showAlert(msg) {
    alertModalText.innerText = msg;
    alertModal.classList.remove('hidden');
}

// --- TRUTH OR DARE UI ---
const launchToD = document.getElementById('launchToD');
const todSettingsScreen = document.getElementById('todSettingsScreen');
const cancelTodBtn = document.getElementById('cancelTodBtn');
const startTodBtn = document.getElementById('startTodBtn');
const todScreen = document.getElementById('todScreen');
const leaveTodBtn = document.getElementById('leaveTodBtn');

const todIntensitySlider = document.getElementById('todIntensitySlider');
const todIntensityLabel = document.getElementById('todIntensityLabel');

const todTurnArea = document.getElementById('todTurnArea');
const todStatusText = document.getElementById('todStatusText');
const todBottleContainer = document.getElementById('todBottleContainer');
const todBottle = document.getElementById('todBottle');
const todSpinBtn = document.getElementById('todSpinBtn');

const todFateArea = document.getElementById('todFateArea');
const todChooseTruthBtn = document.getElementById('todChooseTruthBtn');
const todChooseDareBtn = document.getElementById('todChooseDareBtn');

const todAskerArea = document.getElementById('todAskerArea');
const todAskerTitle = document.getElementById('todAskerTitle');
const todDbBtn = document.getElementById('todDbBtn');
const todCustomBtn = document.getElementById('todCustomBtn');
const todCustomInputArea = document.getElementById('todCustomInputArea');
const todSendCustomBtn = document.getElementById('todSendCustomBtn');
const todCustomInput = document.getElementById('todCustomInput');

const todRevealArea = document.getElementById('todRevealArea');
const todRevealType = document.getElementById('todRevealType');
const todRevealText = document.getElementById('todRevealText');
const todResolutionArea = document.getElementById('todResolutionArea');
const todDoneBtn = document.getElementById('todDoneBtn');
const todForfeitBtn = document.getElementById('todForfeitBtn');

// New truth elements
const todTruthAnswerContainer = document.getElementById('todTruthAnswerContainer');
const todTruthInput = document.getElementById('todTruthInput');
const todSendTruthBtn = document.getElementById('todSendTruthBtn');
const todTruthDisplayContainer = document.getElementById('todTruthDisplayContainer');
const todTruthDisplayText = document.getElementById('todTruthDisplayText');


// Update showScreen to hide todScreen

// --- ROUTING & CHAT ---
function showScreen(screen) {
    nameScreen.classList.add('hidden'); 
    modeScreen.classList.add('hidden'); 
    lobbyScreen.classList.add('hidden');
    waitingScreen.classList.add('hidden');
    todScreen.classList.add('hidden');
    if (typeof todSettingsScreen !== 'undefined' && todSettingsScreen) todSettingsScreen.classList.add('hidden');
    hubScreen.classList.add('hidden'); 
    gameArea.classList.add('hidden'); 
    resultOverlay.classList.add('hidden');
    screen.classList.remove('hidden');
}

function openChat() {
    if(chatToggleBtn) chatToggleBtn.classList.add('hidden');
    chatBox.classList.remove('hidden'); 
    document.body.classList.add('chat-active'); 
    unreadMessages = 0;
    if(chatBadge) chatBadge.classList.add('hidden');
}

function showChat() { 
    if (window.innerWidth <= 849) {
        // Mobile: just show the toggle button, keep chat closed by default
        if(chatToggleBtn) chatToggleBtn.classList.remove('hidden');
        return;
    }
    openChat();
}

function hideChat() { 
    if(chatToggleBtn) chatToggleBtn.classList.remove('hidden');
    chatBox.classList.add('hidden'); 
    document.body.classList.remove('chat-active'); 
}

if(chatToggleBtn) {
    chatToggleBtn.addEventListener('click', () => {
        openChat();
    });
}

const closeChatBtn = document.getElementById('closeChatBtn');
if(closeChatBtn) {
    closeChatBtn.addEventListener('click', () => {
        hideChat();
    });
}




difficultySlider.addEventListener('input', (e) => { 
    botDifficulty = parseInt(e.target.value); 
    diffLabelText.innerText = {1:"Easy", 2:"Medium", 3:"Hard"}[botDifficulty]; 
});

let isDarkMode = true; // Fix: start true because HTML is dark by default
themeToggle.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    if (isDarkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '☀️<span class="theme-text"> Light</span>';
    } else {
        document.documentElement.removeAttribute('data-theme');
        themeToggle.innerHTML = '🌙<span class="theme-text"> Dark</span>';
    }
});

nameInput.addEventListener('keypress', (e) => { 
    if (e.key === 'Enter') saveNameBtn.click(); 
});

saveNameBtn.addEventListener('click', () => { 
    playerName = nameInput.value.trim() || "Player"; 
    document.getElementById('greetingText').innerText = `Hey ${playerName}!`; 
    showScreen(modeScreen); 
});

vsBotBtn.addEventListener('click', () => { 
    currentMode = 'bot'; 
    myRole = 'Host'; 
    opponentName = 'Bot'; 
    hubRoleBanner.classList.add('hidden'); 
    hubRoomDisplay.classList.add('hidden'); 
    difficultyContainer.classList.remove('hidden'); 
    launchTicTacToe.classList.remove('locked-game'); 
    if (launchLudo) launchLudo.classList.remove('locked-game'); 
    if (launchToD) launchToD.classList.remove('locked-game'); 
    if (launchDnG) launchDnG.classList.remove('locked-game');
    showScreen(hubScreen); 
});

vsFriendBtn.addEventListener('click', () => { 
    currentMode = 'friend'; 
    difficultyContainer.classList.add('hidden'); 
    lobbyActions.classList.remove('hidden');
    capacitySetup.classList.add('hidden');
    showScreen(lobbyScreen); 
});

backToNameBtn.addEventListener('click', () => {
    showScreen(nameScreen);
});

// --- SMART BACK BUTTON LOGIC ---
backToModeBtn.addEventListener('click', () => { 
    // If inside Capacity Selection, go back to Join/Create screen
    if (!capacitySetup.classList.contains('hidden')) {
        capacitySetup.classList.add('hidden');
        lobbyActions.classList.remove('hidden');
    } else {
        // Otherwise, go all the way back to the Mode screen
        showScreen(modeScreen); 
        lobbyMessage.innerText = ''; 
        codeInput.value = ''; 
    }
});

// --- NEW ROOM CREATION FLOW ---
createBtn.addEventListener('click', () => { 
    lobbyActions.classList.add('hidden');
    capacitySetup.classList.remove('hidden');
});

capacityCards.forEach(card => {
    card.addEventListener('click', () => {
        const capacity = parseInt(card.getAttribute('data-cap'));
        socket.send(JSON.stringify({ action: "create", name: playerName, capacity: capacity })); 
    });
});

capacityCards.forEach(card => {
    card.addEventListener('click', () => {
        const capacity = parseInt(card.getAttribute('data-cap'));
        socket.send(JSON.stringify({ action: "create", name: playerName, capacity: capacity })); 
    });
});

joinBtn.addEventListener('click', () => { 
    const code = codeInput.value.trim(); 
    if (code.length === 4) {
        socket.send(JSON.stringify({ action: "join", room: code, name: playerName })); 
    } else {
        lobbyMessage.innerText = "Invalid Code";
    }
});

function leaveRoom() {
    socket.send(JSON.stringify({ action: "leave" })); 
    hideChat(); 
    chatMessages.innerHTML = ''; 
    showScreen(modeScreen); 
}

leaveHubBtn.addEventListener('click', () => { if (currentMode === 'friend') requestLeave('room'); else showScreen(modeScreen); });
leaveWaitingBtn.addEventListener('click', leaveRoom);

backToHubBtn.addEventListener('click', () => requestLeave('hub')); 
overlayHubBtn.addEventListener('click', () => requestLeave('hub'));

launchTicTacToe.addEventListener('click', () => { 
    if (myRole === 'Host' || currentMode === 'bot') { 
        if (currentMode === 'friend') {
            socket.send(JSON.stringify({ action: "launch_game", game: "tictactoe" }));
        } else {
            startGameUI("tictactoe");
        }
    } 
});

/* LUDO COMMENTED OUT
/* LUDO COMMENTED OUT
launchLudo.addEventListener('click', () => { 
    if (myRole === 'Host' || currentMode === 'bot') { 
        if (currentMode === 'friend') {
            socket.send(JSON.stringify({ action: "launch_game", game: "ludo" }));
        } else {
            startGameUI("ludo");
        }
    } 
});
*/

function startGameUI(gameType) {
    activeGame = gameType; 
    showScreen(gameArea); 
    gameControls.classList.remove('hidden');
    
    tictactoeBoard.classList.add('hidden'); 
    if (ludoWrapper) ludoWrapper.classList.add('hidden');
    
    if (activeGame === 'tictactoe') { 
        tictactoeBoard.classList.remove('hidden'); 
        resetBoard(); 
        
        if (currentMode === 'bot') {
            statusText.innerText = "Game Started! Your Turn."; 
        } else {
            if (myRole === 'Spectator') {
                statusText.innerText = "Spectating Match...";
            } else {
                statusText.innerText = currentSymbol === 'X' ? "Your Turn!" : "Opponent's Turn...";
            }
        }
    } else if (activeGame === 'ludo') { 
        if (ludoWrapper) ludoWrapper.classList.remove('hidden'); 
        initLudoGame(); 
    }
}

// ==========================================
// PHASE 3: THE SMART LUDO BRAIN
// ==========================================
let currentLudoTurn = 'Host'; 
let diceRolledValue = 0;
let hasRolled = false;
let myLudoColor = 'red'; // Default to red for bot mode

let ludoState = {
    red: [-1, -1, -1, -1],
    green: [-1, -1, -1, -1],
    blue: [-1, -1, -1, -1],
    yellow: [-1, -1, -1, -1]
};

const ludoTurnOrder = ['red', 'green', 'yellow', 'blue'];

const trackPath = [
    '6-1','6-2','6-3','6-4','6-5', '5-6','4-6','3-6','2-6','1-6','0-6', '0-7','0-8', 
    '1-8','2-8','3-8','4-8','5-8', '6-9','6-10','6-11','6-12','6-13','6-14', '7-14','8-14', 
    '8-13','8-12','8-11','8-10','8-9', '9-8','10-8','11-8','12-8','13-8','14-8', '14-7','14-6', 
    '13-6','12-6','11-6','10-6','9-6', '8-5','8-4','8-3','8-2','8-1','8-0', '7-0','6-0'
];

const homePaths = {
    red: ['7-1','7-2','7-3','7-4','7-5','center'],
    green: ['1-7','2-7','3-7','4-7','5-7','center'],
    yellow: ['7-13','7-12','7-11','7-10','7-9','center'],
    blue: ['13-7','12-7','11-7','10-7','9-7','center']
};

const safeZones = ['6-1', '8-2', '1-8', '2-6', '8-13', '6-12', '13-6', '12-8'];

function getDiceHTML(value) {
    if (!value) return '';
    const dots = {
        1: '<div class="dot center"></div>',
        2: '<div class="dot top-left"></div><div class="dot bottom-right"></div>',
        3: '<div class="dot top-left"></div><div class="dot center"></div><div class="dot bottom-right"></div>',
        4: '<div class="dot top-left"></div><div class="dot top-right"></div><div class="dot bottom-left"></div><div class="dot bottom-right"></div>',
        5: '<div class="dot top-left"></div><div class="dot top-right"></div><div class="dot center"></div><div class="dot bottom-left"></div><div class="dot bottom-right"></div>',
        6: '<div class="dot top-left"></div><div class="dot top-right"></div><div class="dot mid-left"></div><div class="dot mid-right"></div><div class="dot bottom-left"></div><div class="dot bottom-right"></div>'
    };
    return `<div class="dice-face">${dots[value]}</div>`;
}

function initLudoGame() {
    ludoState = { red: [-1,-1,-1,-1], green: [-1,-1,-1,-1], blue: [-1,-1,-1,-1], yellow: [-1,-1,-1,-1] };
    drawLudoBoard();
    currentLudoTurn = 'red'; // Red always starts
    hasRolled = false;
    ludoDice.innerHTML = getDiceHTML(6); 
    
    // In bot mode, Host is red. In MP, color is assigned by server.
    if (currentMode === 'bot') {
        myLudoColor = 'red';
        myRole = 'Host';
    }
    
    rollDiceBtn.disabled = myLudoColor !== currentLudoTurn;
    statusText.innerText = myLudoColor === currentLudoTurn ? "Ludo! Your Turn to Roll." : `Waiting for ${currentLudoTurn}'s turn...`;
    gameActive = true;
}

if (rollDiceBtn) rollDiceBtn.addEventListener('click', () => {
    if (activeGame !== 'ludo' || myLudoColor !== currentLudoTurn || hasRolled || !gameActive) return;
    const val = Math.floor(Math.random() * 6) + 1;
    
    if (currentMode === 'friend') {
        socket.send(JSON.stringify({ action: "roll_dice", roller: myLudoColor, value: val }));
    } else {
        animateDice(val, myLudoColor);
    }
});

function animateDice(finalValue, rollerColor) {
    rollDiceBtn.disabled = true; 
    hasRolled = true; 
    diceRolledValue = finalValue;
    
    let counter = 0; 
    ludoDice.classList.add('rolling'); 
    
    const interval = setInterval(() => {
        ludoDice.innerHTML = getDiceHTML(Math.floor(Math.random() * 6) + 1);
        counter++;
        if (counter > 10) {
            clearInterval(interval);
            ludoDice.classList.remove('rolling');
            ludoDice.innerHTML = getDiceHTML(finalValue);
            statusText.innerText = `${rollerColor === myLudoColor ? "You" : rollerColor} rolled a ${finalValue}!`;
            
            setTimeout(() => { processTurnMoves(rollerColor); }, 800);
        }
    }, 50);
}

function processTurnMoves(colorStr) {
    const tokens = ludoState[colorStr];
    let movableTokens = [];
    
    tokens.forEach((pos, index) => {
        if (pos === -1 && diceRolledValue === 6) movableTokens.push(index);
        else if (pos !== -1 && pos + diceRolledValue <= 56) movableTokens.push(index);
    });

    if (movableTokens.length === 0) {
        statusText.innerText = "No valid moves! Turn skipped.";
        setTimeout(() => { switchLudoTurn(colorStr); }, 1500);
        return;
    }

    const allSamePosition = movableTokens.every(idx => tokens[idx] === tokens[movableTokens[0]]);
    if (allSamePosition && colorStr === myLudoColor) {
        statusText.innerText = "Auto-moving pawn...";
        setTimeout(() => { executeMove(colorStr, movableTokens[0]); }, 600);
        return;
    }

    if (colorStr === myLudoColor) {
        statusText.innerText = "Action required: Click a glowing pawn!";
        movableTokens.forEach(idx => {
            const pawn = document.getElementById(`${colorStr}-pawn-${idx}`);
            pawn.classList.add('movable-glow');
            
            pawn.onclick = () => {
                for(let i=0; i<4; i++) { 
                    const p = document.getElementById(`${colorStr}-pawn-${i}`);
                    p.classList.remove('movable-glow'); 
                    p.onclick = null; 
                }
                executeMove(colorStr, idx);
            };
        });
    } else if (currentMode === 'bot' && colorStr === 'blue') {
        setTimeout(() => {
            let chosenToken = movableTokens[0];
            if (movableTokens.some(idx => tokens[idx] === -1)) {
                chosenToken = movableTokens.find(idx => tokens[idx] === -1);
            } else {
                chosenToken = movableTokens.reduce((maxIdx, currentIdx) => tokens[currentIdx] > tokens[maxIdx] ? currentIdx : maxIdx, movableTokens[0]);
            }
            executeMove('blue', chosenToken);
        }, 1000);
    }
}

function executeMove(colorStr, tokenIndex) {
    if (currentMode === 'friend' && colorStr === myLudoColor) {
        socket.send(JSON.stringify({ action: "ludo_move", roller: colorStr, token: tokenIndex, roll: diceRolledValue }));
    }
    
    let oldPos = ludoState[colorStr][tokenIndex];
    let newPos = oldPos === -1 ? 0 : oldPos + diceRolledValue;
    ludoState[colorStr][tokenIndex] = newPos;
    
    movePawnDOM(colorStr, tokenIndex, newPos);
    
    let captured = false;
    if (newPos > -1 && newPos < 51) {
        const myAbsolutePos = getAbsoluteId(colorStr, newPos);
        
        if (!safeZones.includes(myAbsolutePos)) {
            ['red', 'blue', 'green', 'yellow'].forEach(oppColor => {
                if (oppColor !== colorStr) {
                    ludoState[oppColor].forEach((oppPos, oppIdx) => {
                        if (oppPos > -1 && oppPos < 51 && getAbsoluteId(oppColor, oppPos) === myAbsolutePos) {
                            ludoState[oppColor][oppIdx] = -1;
                            movePawnDOM(oppColor, oppIdx, -1);
                            captured = true;
                            statusText.innerText = "SMASH! Sent home!";
                        }
                    });
                }
            });
        }
    }

    if (ludoState[colorStr].every(p => p === 57)) {
        gameActive = false;
        setTimeout(() => {
            resultTitle.innerText = colorStr === myLudoColor ? "LUDO CHAMPION! 🎉" : `${colorStr} WINS! 😢`;
            resultTitle.style.color = `var(--accent-${colorStr})`;
            resultOverlay.classList.remove('hidden');
        }, 1000);
        return;
    }

    setTimeout(() => {
        if (diceRolledValue === 6 || captured || newPos === 57) {
            statusText.innerText = "Bonus Roll!";
            hasRolled = false;
            if (colorStr === myLudoColor) rollDiceBtn.disabled = false;
            if (currentMode === 'bot' && colorStr === 'blue') {
                setTimeout(() => { animateDice(Math.floor(Math.random() * 6) + 1, 'blue'); }, 1500);
            }
        } else {
            switchLudoTurn(colorStr);
        }
    }, 1500);
}

function switchLudoTurn(current) {
    // In bot mode, we only toggle red/blue for simplicity
    if (currentMode === 'bot') {
        currentLudoTurn = current === 'red' ? 'blue' : 'red';
    } else {
        // In multiplayer, it cycles to the next active player. For now we assume all 4 could be playing.
        const currentIndex = ludoTurnOrder.indexOf(current);
        currentLudoTurn = ludoTurnOrder[(currentIndex + 1) % 4];
    }
    
    hasRolled = false;
    
    if (currentLudoTurn === myLudoColor) {
        rollDiceBtn.disabled = false;
        statusText.innerText = "Your Turn: Roll the Dice!";
    } else {
        rollDiceBtn.disabled = true;
        statusText.innerText = `Waiting for ${currentLudoTurn}...`;
        if (currentMode === 'bot' && currentLudoTurn === 'blue') {
            setTimeout(() => { animateDice(Math.floor(Math.random() * 6) + 1, 'blue'); }, 1500);
        }
    }
}

function getAbsoluteId(colorStr, pos) {
    if (pos === -1) return null; 
    
    if (pos >= 51) {
        return homePaths[colorStr][pos - 51];
    }
    
    // Shifts based on official Ludo layout
    let offset = 0;
    if (colorStr === 'green') offset = 13;
    if (colorStr === 'yellow') offset = 26;
    if (colorStr === 'blue') offset = 39;
    
    return trackPath[(pos + offset) % 52];
}

function movePawnDOM(colorStr, tokenIndex, pos) {
    const pawn = document.getElementById(`${colorStr}-pawn-${tokenIndex}`);
    
    if (pos === -1) {
        const baseInner = document.querySelector(`.bg-${colorStr} .ludo-base-inner`);
        const slot = baseInner.children[tokenIndex];
        slot.appendChild(pawn);
    } else {
        const cellId = getAbsoluteId(colorStr, pos);
        let targetCell = cellId === 'center' ? document.querySelector('.center-home') : document.getElementById(`cell-${cellId}`);
        targetCell.appendChild(pawn);
    }
    
    document.querySelectorAll('.ludo-cell, .center-home').forEach(cell => {
        const pawnCount = cell.querySelectorAll('.pawn').length;
        cell.setAttribute('data-pawns', pawnCount);
    });
}

function drawLudoBoard() {
    ludoBoard.innerHTML = ''; 
    const bases = [
        { id: 'red', class: 'bg-red', colStart: 1, colEnd: 7, rowStart: 1, rowEnd: 7 }, 
        { id: 'green', class: 'bg-green', colStart: 10, colEnd: 16, rowStart: 1, rowEnd: 7 }, 
        { id: 'blue', class: 'bg-blue', colStart: 1, colEnd: 7, rowStart: 10, rowEnd: 16 }, 
        { id: 'yellow', class: 'bg-yellow', colStart: 10, colEnd: 16, rowStart: 10, rowEnd: 16 } 
    ];

    bases.forEach(b => {
        const baseDiv = document.createElement('div'); 
        baseDiv.className = `ludo-base ${b.class}`;
        baseDiv.style.gridColumn = `${b.colStart} / ${b.colEnd}`; 
        baseDiv.style.gridRow = `${b.rowStart} / ${b.rowEnd}`;
        
        const innerDiv = document.createElement('div'); 
        innerDiv.className = 'ludo-base-inner';
        
        for(let i=0; i<4; i++) {
            const slot = document.createElement('div'); 
            slot.className = 'ludo-token-slot';
            const pawn = document.createElement('div'); 
            pawn.className = `pawn ${b.id}`; 
            pawn.id = `${b.id}-pawn-${i}`;
            slot.appendChild(pawn); 
            innerDiv.appendChild(slot);
        }
        baseDiv.appendChild(innerDiv); 
        ludoBoard.appendChild(baseDiv);
    });

    const centerHome = document.createElement('div'); 
    centerHome.className = 'center-home';
    centerHome.style.gridColumn = '7 / 10'; 
    centerHome.style.gridRow = '7 / 10'; 
    ludoBoard.appendChild(centerHome);

    for (let row = 0; row < 15; row++) {
        for (let col = 0; col < 15; col++) {
            const inTopLeft = row < 6 && col < 6; 
            const inTopRight = row < 6 && col > 8;
            const inBottomLeft = row > 8 && col < 6; 
            const inBottomRight = row > 8 && col > 8;
            const inCenter = row >= 6 && row <= 8 && col >= 6 && col <= 8;

            if (!inTopLeft && !inTopRight && !inBottomLeft && !inBottomRight && !inCenter) {
                const cell = document.createElement('div'); 
                cell.className = 'ludo-cell';
                cell.style.gridColumn = `${col + 1}`; 
                cell.style.gridRow = `${row + 1}`; 
                cell.id = `cell-${row}-${col}`;

                if (row === 6 && col === 1) cell.classList.add('bg-red', 'start-cell');
                if (row === 1 && col === 8) cell.classList.add('bg-green', 'start-cell');
                if (row === 8 && col === 13) cell.classList.add('bg-yellow', 'start-cell');
                if (row === 13 && col === 6) cell.classList.add('bg-blue', 'start-cell');

                if (row === 7 && col >= 1 && col <= 5) cell.classList.add('bg-red');
                if (col === 7 && row >= 1 && row <= 5) cell.classList.add('bg-green');
                if (row === 7 && col >= 9 && col <= 13) cell.classList.add('bg-yellow');
                if (col === 7 && row >= 9 && row <= 13) cell.classList.add('bg-blue');

                if (safeZones.includes(`${row}-${col}`)) {
                    cell.innerHTML = '<div class="safe-star">⭐</div>';
                }
                ludoBoard.appendChild(cell);
            }
        }
    }
}

// ==========================================
// TIC-TAC-TOE & COMMON LOGIC
// ==========================================
function resetBoard() { 
    cells.forEach(c => { c.innerText = ""; c.style.color = ""; c.style.pointerEvents = myRole === 'Spectator' ? 'none' : 'auto'; }); 
    currentSymbol = 'X'; 
    gameActive = true; 
    strike.className = 'strike hidden'; 
    strike.style.background = ''; 
    resultOverlay.classList.add('hidden'); 
}

function applyColor(cell, symbol) { 
    cell.style.color = symbol === 'X' ? 'var(--accent-x)' : 'var(--accent-o)'; 
}

const winningConditions = [ [0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6] ];

function checkBoardWinner(board) { 
    for (let c of winningConditions) { 
        if (board[c[0]] && board[c[0]] === board[c[1]] && board[c[0]] === board[c[2]]) return board[c[0]]; 
    } 
    return board.every(c => c !== "") ? 'tie' : null; 
}

function minimax(board, depth, isMax) {
    let res = checkBoardWinner(board); 
    if (res === 'O') return 10 - depth; 
    if (res === 'X') return depth - 10; 
    if (res === 'tie') return 0;
    
    let best = isMax ? -Infinity : Infinity;
    for (let i = 0; i < 9; i++) {
        if (board[i] === "") {
            board[i] = isMax ? 'O' : 'X';
            let score = minimax(board, depth + 1, !isMax);
            board[i] = ""; 
            best = isMax ? Math.max(score, best) : Math.min(score, best);
        }
    } 
    return best;
}

function getBestMove() {
    let board = Array.from(cells).map(c => c.innerText); 
    let empty = board.map((v, i) => v === "" ? i : null).filter(v => v !== null);
    if (botDifficulty === 1 || (botDifficulty === 2 && Math.random() < 0.5)) return empty[Math.floor(Math.random() * empty.length)];
    
    let best = -Infinity; let move = empty[0];
    for (let i of empty) { 
        board[i] = 'O'; 
        let score = minimax(board, 0, false); 
        board[i] = ""; 
        if (score > best) { best = score; move = i; } 
    } 
    return move;
}

function handleBotMove() {
    if (!gameActive) return; statusText.innerText = "Bot is thinking...";
    setTimeout(() => { 
        let m = getBestMove(); 
        if (m !== undefined) { 
            cells[m].innerText = 'O'; applyColor(cells[m], 'O'); currentSymbol = 'X'; statusText.innerText = "Your Turn!"; checkWin(); 
        } 
    }, 500);
}

cells.forEach(cell => {
    cell.addEventListener('click', () => {
        if(activeGame !== 'tictactoe' || myRole === 'Spectator') return; 
        
        let sym = myRole === 'Player 1' || currentMode === 'bot' ? 'X' : 'O';
        
        if (cell.innerText === "" && gameActive && currentSymbol === sym) {
            if (currentMode === 'friend') {
                socket.send(JSON.stringify({ action: "move", index: cell.getAttribute('data-index'), symbol: sym }));
            } else { 
                cell.innerText = 'X'; applyColor(cell, 'X'); currentSymbol = 'O'; checkWin(); if (gameActive) handleBotMove(); 
            }
        }
    });
});

function checkWin() {
    let winCls = ''; let won = false;
    const strikeClasses = ['row-1', 'row-2', 'row-3', 'col-1', 'col-2', 'col-3', 'diag-1', 'diag-2'];
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (cells[a].innerText !== "" && cells[a].innerText === cells[b].innerText && cells[a].innerText === cells[c].innerText) { 
            won = true; 
            winCls = strikeClasses[i]; 
            break; 
        }
    }
    if (won) {
        gameActive = false; 
        const wSym = currentSymbol === 'X' ? 'O' : 'X'; 
        
        let me = false;
        if (currentMode === 'bot') me = wSym === 'X';
        else me = (myRole === 'Player 1' && wSym === 'X') || (myRole === 'Player 2' && wSym === 'O');

        setTimeout(() => { 
            if (myRole === 'Spectator') {
                resultTitle.innerText = `${wSym} WINS!`;
            } else {
                resultTitle.innerText = me ? "YOU WIN! 🎉" : "YOU LOSE! 😢"; 
            }
            resultTitle.style.color = wSym === 'X' ? 'var(--accent-x)' : 'var(--accent-o)'; 
            resultOverlay.classList.remove('hidden'); 
        }, 500); 
        strike.style.color = wSym === 'X' ? 'var(--accent-x)' : 'var(--accent-o)'; 
        strike.className = `strike ${winCls}`;
    } else if ([...cells].every(c => c.innerText !== "")) { 
        gameActive = false; setTimeout(() => { resultTitle.innerText = "DRAW!"; resultTitle.style.color = 'var(--secondary-color)'; resultOverlay.classList.remove('hidden'); }, 400); 
    }
}

function returnToHub() { currentMode === 'friend' ? socket.send(JSON.stringify({ action: "return_hub" })) : showScreen(hubScreen); }

function triggerRestart() { currentMode === 'friend' ? socket.send(JSON.stringify({ action: "restart" })) : (resetBoard(), statusText.innerText = "Rematch! Your Turn."); }
restartBtn.addEventListener('click', triggerRestart); overlayRestartBtn.addEventListener('click', triggerRestart);

function sendChatMessage() { 
    const msg = chatInput.value.trim(); 
    if (msg.length > 0) { socket.send(JSON.stringify({ action: "chat", message: msg })); chatInput.value = ''; } 
}
sendChatBtn.addEventListener('click', sendChatMessage); 
chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendChatMessage(); });

// --- SOCKET MESSAGES & ROULETTE LOGIC ---
function runRoulette(players, assignedRole, symbol, finalRoleData) {
    rouletteOverlay.classList.remove('hidden');
    let counter = 0;
    
    // Rapidly flash random names
    const interval = setInterval(() => {
        const randPlayer = players[Math.floor(Math.random() * players.length)];
        rouletteName.innerText = randPlayer;
        rouletteRole.innerText = "Shuffling...";
        counter++;
        
        if (counter > 20) {
            clearInterval(interval);
            rouletteName.innerText = "Role Assigned!";
            rouletteRole.innerText = `You are: ${assignedRole} ${symbol ? '('+symbol+')' : ''}`;
            
            setTimeout(() => {
                rouletteOverlay.classList.add('hidden');
                startGameUI(finalRoleData.game);
                
                if (finalRoleData.game === 'tictactoe') {
                    if (assignedRole === 'Spectator') {
                        statusText.innerText = `Spectating: ${finalRoleData.p1} (X) vs ${finalRoleData.p2} (O)`;
                    } else {
                        statusText.innerText = symbol === 'X' ? "Your Turn!" : "Waiting for Opponent...";
                    }
                }
            }, 2500);
        }
    }, 100);
}

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.type === "room_created") { 
        showChat(); myRoomCode = data.room; 
        myRole = 'Host'; 
        // Do not show hub yet, wait for lobby update
    }
    else if (data.type === "lobby_update") {
        showChat(); myRoomCode = data.room;
        roomHost = data.host;
        waitingRoomCode.innerText = myRoomCode;
        waitingStatus.innerText = `Waiting for players... (${data.players.length}/${data.capacity})`;
        
        playerRoster.innerHTML = '';
        data.players.forEach(p => {
            playerRoster.innerHTML += `<div style="font-weight: 800; font-size: 1.1rem; padding: 5px 0;">👤 ${p} ${p === data.host ? '(Host)' : ''}</div>`;
        });
        
        showScreen(waitingScreen);
        showChat();
    }
    else if (data.type === "hub_start") { 
        showChat(); myRoomCode = data.room; 
        opponentName = data.host;
        roomHost = data.host; 
        
        if (playerName === data.host) { 
            hubRoleBanner.innerText = `Host: Pick a game for the lobby!`; 
            launchTicTacToe.classList.remove('locked-game'); 
            if (launchLudo) launchLudo.classList.remove('locked-game'); 
            if (launchToD) launchToD.classList.remove('locked-game'); 
            if (launchDnG) launchDnG.classList.remove('locked-game');
        } else { 
            hubRoleBanner.innerText = `Waiting for Host (${data.host}) to pick a game...`; 
            launchTicTacToe.classList.add('locked-game'); 
            if (launchLudo) launchLudo.classList.add('locked-game'); 
            if (launchToD) launchToD.classList.add('locked-game'); 
            if (launchDnG) launchDnG.classList.add('locked-game');
        } 
        hubRoomDisplay.innerText = `Room Code: ${myRoomCode}`; 
        showScreen(hubScreen); 
    }
        else if (data.type === "launch_game") { 
        if (data.game === 'tictactoe') {
            myRole = data.role;
            runRoulette(data.all_players, data.role, data.symbol, data);
        } else if (data.game === 'ludo') {
            myLudoColor = data.color;
            runRoulette(data.all_players.map(p=>p.name), "Player", data.color.toUpperCase(), data);
        } else if (data.game === 'dng') {
            console.log('Received launch_game for dng from server!');
            dngPlayers = (data.all_players || []).map(p => p.name);
            initDnGGame();
        } else if (data.game === 'tod') {
            console.log('Received launch_game for tod from server!', data);
            todPlayers = data.all_players || [];
            todMode = data.mode;
            todLanguage = data.language || "english";
            todIntensity = data.intensity;
            initTodGame();
        }
    }
    else if (data.type === "return_hub") { showScreen(hubScreen); }

    else if (data.type === "leave_request") {
        if (playerName === roomHost) {
            pendingLeaveType = data.leave_type;
            pendingLeavePlayer = data.player;
            leaveRequestText.innerText = `${data.player} is requesting to leave.`;
            leaveRequestModal.classList.remove('hidden');
        }
    }
    else if (data.type === "leave_approved") {
        showAlert("Host approved your request to leave.");
        leaveRoom();
    }
    else if (data.type === "leave_denied") {
        showAlert("Host has canceled the request.");
    }

    else if (data.action === "dng_draw") { 
        drawLineLocally(data.startX, data.startY, data.endX, data.endY, data.color, data.size); 
    }
    else if (data.action === "dng_clear") {
        dngCtx.fillStyle = "#ffffff";
        dngCtx.fillRect(0, 0, dngCanvas.width, dngCanvas.height);
    }
    else if (data.action === "dng_event") {
        handleDngEvent(data);
    }
    else if (data.action === "typing") {
        if (data.is_typing) {
            activeTypers[data.context].add(data.player);
        } else {
            activeTypers[data.context].delete(data.player);
        }
        updateTypingUI(data.context);
    }
    else if (data.type === "dice_rolled") { animateDice(data.value, data.roller); }
    else if (data.type === "ludo_move") { 
        diceRolledValue = data.roll; 
        executeMove(data.roller, data.token); 
    }
    else if (data.type === "chat") { 
        const msg = document.createElement('div'); msg.classList.add('chat-message'); 
        const color = data.sender === playerName ? 'var(--accent-x)' : 'var(--accent-o)'; 
        msg.innerHTML = `<span style="color: ${color}">${data.sender}:</span> ${data.message}`; 
        chatMessages.appendChild(msg); chatMessages.scrollTop = chatMessages.scrollHeight; 
        
        if (chatBox.classList.contains('hidden') && data.sender !== playerName) {
            unreadMessages++;
            if (chatBadge) {
                chatBadge.innerText = unreadMessages;
                chatBadge.classList.remove('hidden');
            }
        }
    }
    else if (data.type === "restart") { 
        if(activeGame === 'tictactoe') { 
            resetBoard(); 
            if (myRole === 'Spectator') statusText.innerText = "Spectating Match...";
            else statusText.innerText = myRole === 'Player 1' ? "Rematch! Your Turn." : "Waiting for Opponent...";
        } /* else if(activeGame === 'ludo') { initLudoGame(); } */
    }
    else if (data.type === "error") { lobbyMessage.innerText = data.message; }
    else if (data.type === "player_left") { 
        statusText.innerText = `${data.name} left the room.`; 
        gameActive = false; 
        hideChat(); chatMessages.innerHTML = ''; showScreen(modeScreen); showAlert(`${data.name} disconnected.`); 
    }
    else if (data.type === "move" && activeGame === 'tictactoe') { 
        cells[data.index].innerText = data.symbol; applyColor(cells[data.index], data.symbol); currentSymbol = data.symbol === 'X' ? 'O' : 'X'; 
        if (gameActive) { 
            if (myRole === 'Spectator') statusText.innerText = `Current Turn: ${currentSymbol}`;
            else statusText.innerText = currentSymbol === (myRole === 'Player 1' ? 'X' : 'O') ? "Your Turn!" : "Opponent's Turn..."; 
            checkWin(); 
        } 
    }
    else if (data.action === "tod_event") {
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
                    if (playerName === currentVictim) {
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
                }, 1500);
            }, 3000);
        }
        else if (data.event === "fate_chosen") {
            const fate = data.fate;
            todRevealType.innerText = fate;
            todDbBtn.innerText = "🎲 Random " + (fate === "TRUTH" ? "Truth" : "Dare");
            resetTodUI();
            if (playerName === currentAsker) {
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
            
            if (playerName === currentAsker) {
                todResolutionArea.classList.remove('hidden');
            }
            if (playerName === currentVictim && data.fate === 'TRUTH') {
                todTruthAnswerContainer.classList.remove('hidden');
            }
        }
        else if (data.event === "truth_answer") {
            todTruthAnswerContainer.classList.add('hidden');
            todTruthDisplayContainer.classList.remove('hidden');
            todTruthDisplayText.innerText = data.text;
        }
        else if (data.event === "forfeit") {
            resetTodUI();
            todTurnArea.classList.remove('hidden');
            todStatusText.innerText = `${currentVictim} forfeited! Moving to next turn...`;
            setTimeout(() => {
                completeTurn();
            }, 2500);
        }
        else if (data.event === "resolved") {
            completeTurn();
        }
    }
};


// --- TRUTH OR DARE LOGIC (MULTIPLAYER) ---
let todPlayers = [];
let todMode = "both";
let todTurnIndex = 0;
let todIntensity = 3;
let todLanguage = "english";
let currentAsker = "";
let currentVictim = "";

if (launchToD) {
    launchToD.addEventListener('click', () => {
        if (myRole !== 'Host' && currentMode !== 'bot') return; // Prevent non-hosts
        if (launchToD.classList.contains('locked-game')) return; // Extra safety
        showScreen(todSettingsScreen);
    });
}

if (cancelTodBtn) {
    cancelTodBtn.addEventListener('click', () => {
        showScreen(hubScreen);
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
    todTruthAnswerContainer.classList.add('hidden');
    todTruthDisplayContainer.classList.add('hidden');
    todTruthInput.value = "";
}

if (startTodBtn) {
    startTodBtn.addEventListener('click', () => {
        const mode = document.getElementById('todModeSelect').value;
        const language = document.getElementById('todLanguageSelect').value;
        const intensity = todIntensitySlider.value;
        socket.send(JSON.stringify({ 
            action: "launch_game", 
            game: "tod", 
            mode: mode, 
            language: language,
            intensity: intensity 
        }));
    });
}

if (leaveTodBtn) {
    leaveTodBtn.addEventListener('click', () => {
        requestLeave('hub');
    });
}

function initTodGame() {
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
    if (playerName === currentVictim) {
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
    }
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
        let victims = todPlayers.filter(p => p.name !== playerName);
        if (victims.length === 0) victims = todPlayers; // Fallback if playing solo
        let randomVictim = victims[Math.floor(Math.random() * victims.length)].name;
        
        socket.send(JSON.stringify({
            action: "tod_event",
            event: "spin",
            asker: playerName,
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

const TRUTH_PROMPTS = {
    "english": [
        "What is the most embarrassing thing you've done in front of a crush?",
        "What is a secret you've never told anyone in this room?",
        "If you had to delete one app from your phone forever, what would it be?",
        "Who was your first celebrity crush?",
        "What's the weirdest thing you've ever eaten?",
        "Have you ever lied to get out of hanging out with a friend?",
        "What's the most childish thing you still do?",
        "If you could swap lives with anyone in this room for a day, who would it be?",
        "What is your biggest fear?",
        "What's the worst text message you've accidentally sent to the wrong person?",
        "What's your most embarrassing late-night purchase?",
        "Have you ever practiced kissing in a mirror?",
        "What is the longest you've gone without showering?",
        "What is the most ridiculous thing you've cried over?",
        "If someone went through your search history, what is the weirdest thing they'd find?"
    ],
    "hindi": [
        "क्रश के सामने आपने सबसे शर्मनाक काम क्या किया है?",
        "ऐसा कौन सा राज है जो आपने इस कमरे में किसी को नहीं बताया?",
        "अगर आपको अपने फोन से हमेशा के लिए एक ऐप डिलीट करना हो, तो वो क्या होगा?",
        "आपका पहला सेलिब्रिटी क्रश कौन था?",
        "आपने अब तक की सबसे अजीब चीज़ क्या खाई है?",
        "क्या आपने कभी किसी दोस्त के साथ बाहर जाने से बचने के लिए झूठ बोला है?",
        "आप आज भी कौन सी सबसे बचकानी हरकत करते हैं?",
        "अगर आप इस कमरे में किसी के साथ अपनी जिंदगी एक दिन के लिए बदल सकें, तो वह कौन होगा?",
        "आपका सबसे बड़ा डर क्या है?",
        "वो सबसे खराब मैसेज कौन सा है जो आपने गलती से किसी गलत इंसान को भेजा हो?",
        "रात के समय आपकी सबसे शर्मनाक ऑनलाइन शॉपिंग कौन सी रही है?",
        "क्या आपने कभी शीशे के सामने चूमने की प्रैक्टिस की है?",
        "आप बिना नहाए सबसे ज्यादा कितने दिन रहे हैं?",
        "सबसे बेतुकी किस बात पर आप रोये हैं?",
        "अगर कोई आपकी सर्च हिस्ट्री देखे, तो उन्हें सबसे अजीब चीज़ क्या मिलेगी?"
    ],
    "gujarati": [
        "ક્રશની સામે તમે સૌથી શરમજનક વસ્તુ શું કરી છે?",
        "એવું કયું રહસ્ય છે જે તમે આ રૂમમાં કોઈને ક્યારેય કહ્યું નથી?",
        "જો તમારે કાયમ માટે તમારા ફોનમાંથી એક એપ ડિલીટ કરવી હોય, તો તે કઈ હશે?",
        "તમારો પહેલો સેલિબ્રિટી ક્રશ કોણ હતો?",
        "તમે અત્યાર સુધીની સૌથી વિચિત્ર વસ્તુ કઈ ખાધી છે?",
        "શું તમે ક્યારેય મિત્ર સાથે બહાર ન જવા માટે ખોટું બોલ્યા છો?",
        "તમે આજે પણ સૌથી બાલિશ વસ્તુ કઈ કરો છો?",
        "જો તમે આ રૂમમાં કોઈની સાથે એક દિવસ માટે જીવન બદલી શકો, તો તે કોણ હશે?",
        "તમારો સૌથી મોટો ડર શું છે?",
        "તમે ભૂલથી ખોટી વ્યક્તિને મોકલેલો સૌથી ખરાબ મેસેજ કયો છે?",
        "રાત્રિના સમયે તમારી સૌથી શરમજનક ઓનલાઈન ખરીદી કઈ છે?",
        "શું તમે ક્યારેય અરીસાની સામે ચુંબન કરવાની પ્રેક્ટિસ કરી છે?",
        "તમે સ્નાન કર્યા વગર સૌથી લાંબો સમય કેટલો કાઢ્યો છે?",
        "સૌથી વાહિયાત કઈ બાબત પર તમે રડ્યા છો?",
        "જો કોઈ તમારી સર્ચ હિસ્ટ્રી જુએ, તો તેમને સૌથી વિચિત્ર વસ્તુ શું મળશે?"
    ]
};

const DARE_PROMPTS = {
    "english": [
        "Do a crazy dance in the middle of the room for 30 seconds.",
        "Let another player text anyone from your phone and you can't say it was a dare.",
        "Do 20 pushups right now.",
        "Speak in a weird accent for the next 3 rounds.",
        "Let the group look through your photo gallery for 1 minute.",
        "Try to juggle 3 items of the group's choosing.",
        "Sing the chorus of your favorite song loudly.",
        "Hold a plank for a full minute.",
        "Let someone in the room draw on your face with a pen.",
        "Eat a spoonful of a condiment chosen by the group.",
        "Show the last 5 people you texted and what the messages say.",
        "Act like a chicken until your next turn.",
        "Call a random contact and sing 'Happy Birthday' to them.",
        "Keep your eyes closed until your next turn.",
        "Let the person to your left style your hair however they want."
    ],
    "hindi": [
        "30 सेकंड के लिए कमरे के बीच में एक पागलों वाला डांस करो।",
        "किसी अन्य खिलाड़ी को अपने फोन से किसी को भी मैसेज करने दो और आप यह नहीं बता सकते कि यह डेयर था।",
        "अभी तुरंत 20 पुशअप्स लगाओ।",
        "अगले 3 राउंड तक एक अजीब एक्सेंट (लहजे) में बात करो।",
        "ग्रुप को 1 मिनट तक अपनी फोटो गैलरी देखने दो।",
        "ग्रुप की पसंद की 3 चीजों से जगलिंग करने की कोशिश करो।",
        "अपने पसंदीदा गाने का कोरस जोर से गाओ।",
        "पूरे एक मिनट तक प्लैंक (Plank) करो।",
        "कमरे में मौजूद किसी व्यक्ति को अपने चेहरे पर पेन से कुछ बनाने दो।",
        "ग्रुप की पसंद का कोई भी सॉस या चटनी एक चम्मच खाओ।",
        "उन आखिरी 5 लोगों को दिखाओ जिन्हें आपने मैसेज किया था और उसमें क्या लिखा था।",
        "अपनी अगली बारी तक मुर्गे की तरह हरकतें करो।",
        "किसी भी रैंडम कांटेक्ट को कॉल करो और उन्हें 'Happy Birthday' गाकर सुनाओ।",
        "अपनी अगली बारी तक अपनी आँखें बंद रखो।",
        "अपनी बाईं ओर बैठे व्यक्ति को अपने बाल जैसे चाहें वैसे संवारने दो।"
    ],
    "gujarati": [
        "30 સેકન્ડ માટે રૂમની મધ્યમાં પાગલ જેવો ડાન્સ કરો.",
        "કોઈ અન્ય ખેલાડીને તમારા ફોનમાંથી કોઈને પણ મેસેજ કરવા દો અને તમે કહી શકશો નહીં કે આ એક ડેર હતો.",
        "અત્યારે જ 20 પુશઅપ્સ કરો.",
        "આગામી 3 રાઉન્ડ માટે વિચિત્ર ઉચ્ચાર સાથે વાત કરો.",
        "ગ્રુપને 1 મિનિટ માટે તમારી ફોટો ગેલેરી જોવા દો.",
        "ગ્રુપની પસંદગીની 3 વસ્તુઓ સાથે જગલિંગ કરવાનો પ્રયાસ કરો.",
        "તમારા મનપસંદ ગીતનું કોરસ મોટેથી ગાઓ.",
        "એક આખી મિનિટ માટે પ્લેન્ક (Plank) કરો.",
        "રૂમમાં રહેલ કોઈપણ વ્યક્તિને તમારા ચહેરા પર પેન વડે કશુંક દોરવા દો.",
        "ગ્રુપની પસંદગીની કોઈપણ ચટણીની એક ચમચી ખાઓ.",
        "છેલ્લા 5 લોકોને બતાવો જેમને તમે મેસેજ કર્યો હતો અને મેસેજ શું છે.",
        "તમારા આગલા વારા સુધી મરઘીની જેમ વર્તન કરો.",
        "કોઈપણ રેન્ડમ કોન્ટેક્ટને કૉલ કરો અને તેમને 'Happy Birthday' ગાઈ સંભળાવો.",
        "તમારા આગલા વારા સુધી તમારી આંખો બંધ રાખો.",
        "તમારી ડાબી બાજુની વ્યક્તિને તમારા વાળ ગમે તેમ સેટ કરવા દો."
    ]
};

if (todDbBtn) {
    todDbBtn.addEventListener('click', () => {
        const fate = todRevealType.innerText;
        let text = "";
        const lang = todLanguage || "english";
        if (fate === 'TRUTH') {
            text = TRUTH_PROMPTS[lang][Math.floor(Math.random() * TRUTH_PROMPTS[lang].length)];
        } else {
            text = DARE_PROMPTS[lang][Math.floor(Math.random() * DARE_PROMPTS[lang].length)];
        }
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
        socket.send(JSON.stringify({ action: "tod_event", event: "forfeit" }));
    });
}


function completeTurn() {
    if (todPlayers.length <= 2) {
        todTurnIndex++;
        startTwoPlayerTurn();
    } else {
        resetToSpin();
    }
}

if (todSendTruthBtn) {
    todSendTruthBtn.addEventListener('click', () => {
        const ans = todTruthInput.value.trim();
        if (ans) {
            socket.send(JSON.stringify({ action: "tod_event", event: "truth_answer", text: ans }));
        }
    });
}

// ==========================================
// --- DRAW & GUESS (SKRIBBL CLONE) LOGIC ---
// ==========================================
const launchDnG = document.getElementById('launchDnG');
const dngScreen = document.getElementById('dngScreen');
const leaveDngBtn = document.getElementById('leaveDngBtn');
const dngCanvas = document.getElementById('dngCanvas');
const dngCtx = dngCanvas.getContext('2d');
const dngColorPicker = document.getElementById('dngColorPicker');
const dngSizePicker = document.getElementById('dngSizePicker');
const dngClearBtn = document.getElementById('dngClearBtn');
const dngToolbar = document.getElementById('dngToolbar');
const dngGuessInput = document.getElementById('dngGuessInput');
const dngGuessBtn = document.getElementById('dngGuessBtn');
const dngChatBox = document.getElementById('dngChatBox');
const dngLeaderboard = document.getElementById('dngLeaderboard');
const dngWordDisplay = document.getElementById('dngWordDisplay');
const dngTimerDisplay = document.getElementById('dngTimer');

let isDrawing = false;
let dngMyRole = "guesser"; 
let dngLastPos = {x: 0, y: 0};
let dngPlayers = [];
let dngTurnIndex = 0;
let dngScores = {};
let dngCurrentDrawer = "";
let dngCurrentWord = "";
let dngTimer = 0;
let dngTimerInterval = null;
let dngHasGuessed = false;
let dngCorrectGuesses = 0;

const dngWordList = [
    "APPLE", "BANANA", "HOUSE", "CAR", "DOG", "CAT", "SUN", "MOON", 
    "TREE", "SPIDER", "SNAKE", "COMPUTER", "PHONE", "PENCIL", "BOOK", 
    "SHOES", "GUITAR", "PIZZA", "HAMBURGER", "WATERMELON", "ELEPHANT", 
    "BIRD", "FISH", "AIRPLANE", "TRAIN", "MOUNTAIN", "RIVER", "BEACH", 
    "CLOCK", "GHOST", "TIGER", "LION", "TURTLE", "BUTTERFLY", "RAINBOW"
];

if (launchDnG) {
    launchDnG.addEventListener('click', () => {
        if (myRole !== 'Host' && currentMode !== 'bot') return; // Prevent non-hosts
        if (launchDnG.classList.contains('locked-game')) return; // Extra safety
        
        if (myRole === 'Host' || currentMode === 'bot') { 
            if (currentMode === 'friend') {
                socket.send(JSON.stringify({ action: "launch_game", game: "dng" }));
            } else {
                dngPlayers = [playerName, "Bot"];
                initDnGGame();
            }
        }
    });
}

if (leaveDngBtn) {
    leaveDngBtn.addEventListener('click', () => {
        clearInterval(dngTimerInterval);
        requestLeave('hub');
    });
}

function initDnGGame() {
    activeGame = 'dng';
    showScreen(dngScreen);
    
    // Clear canvas
    dngCtx.fillStyle = "#ffffff";
    dngCtx.fillRect(0, 0, dngCanvas.width, dngCanvas.height);
    dngChatBox.innerHTML = '';
    
    // Host initializes scores and starts game loop
    if (playerName === roomHost || currentMode === 'bot') {
        dngScores = {};
        dngPlayers.forEach(p => dngScores[p] = 0);
        dngTurnIndex = 0;
        startDngTurn();
    }
}

function startDngTurn() {
    dngCurrentDrawer = dngPlayers[dngTurnIndex];
    dngCurrentWord = dngWordList[Math.floor(Math.random() * dngWordList.length)];
    
    const packet = {
        action: "dng_event",
        event: "start_turn",
        drawer: dngCurrentDrawer,
        word: dngCurrentWord,
        scores: dngScores
    };
    
    if (currentMode === 'friend') {
        socket.send(JSON.stringify(packet));
    } else {
        handleDngEvent(packet);
    }
}

function endDngTurn() {
    const packet = {
        action: "dng_event",
        event: "end_turn",
        word: dngCurrentWord,
        scores: dngScores
    };
    if (currentMode === 'friend') {
        socket.send(JSON.stringify(packet));
    } else {
        handleDngEvent(packet);
    }
}

function handleDngEvent(data) {
    if (data.event === "start_turn") {
        clearInterval(dngTimerInterval);
        dngCurrentDrawer = data.drawer;
        dngCurrentWord = data.word;
        dngScores = data.scores || dngScores;
        dngHasGuessed = false;
        dngCorrectGuesses = 0;
        
        dngMyRole = (playerName === dngCurrentDrawer) ? "drawer" : "guesser";
        
        // Update UI
        dngCtx.fillStyle = "#ffffff";
        dngCtx.fillRect(0, 0, dngCanvas.width, dngCanvas.height);
        
        dngChatBox.innerHTML += `<p class="sys-msg">✏️ ${dngCurrentDrawer} is drawing!</p>`;
        dngChatBox.scrollTop = dngChatBox.scrollHeight;
        
        if (dngMyRole === 'drawer') {
            dngToolbar.classList.remove('hidden');
            if(dngWordDisplay) dngWordDisplay.innerText = dngCurrentWord;
        } else {
            dngToolbar.classList.add('hidden');
            if(dngWordDisplay) dngWordDisplay.innerText = "_ ".repeat(dngCurrentWord.length).trim();
        }
        
        updateDngLeaderboard();
        
        // Start Local Timer
        dngTimer = 60;
        if(dngTimerDisplay) dngTimerDisplay.innerText = `⏱️ ${dngTimer}s`;
        dngTimerInterval = setInterval(() => {
            dngTimer--;
            if(dngTimerDisplay) dngTimerDisplay.innerText = `⏱️ ${dngTimer}s`;
            if (dngTimer <= 0) {
                clearInterval(dngTimerInterval);
                if (playerName === roomHost || currentMode === 'bot') {
                    endDngTurn();
                }
            }
        }, 1000);
        
    } else if (data.event === "end_turn") {
        clearInterval(dngTimerInterval);
        dngScores = data.scores || dngScores;
        updateDngLeaderboard();
        
        dngChatBox.innerHTML += `<p class="sys-msg" style="color:var(--accent-red)">Time's up! The word was: ${data.word}</p>`;
        dngChatBox.scrollTop = dngChatBox.scrollHeight;
        if(dngWordDisplay) dngWordDisplay.innerText = data.word;
        
        // Host moves to next turn after 5 seconds
        if (playerName === roomHost || currentMode === 'bot') {
            setTimeout(() => {
                dngTurnIndex++;
                if (dngTurnIndex >= dngPlayers.length) {
                    dngTurnIndex = 0; // Loop or end game here
                }
                startDngTurn();
            }, 5000);
        }
        
    } else if (data.event === "chat") {
        dngChatBox.innerHTML += `<p><b>${data.player}:</b> ${data.text}</p>`;
        dngChatBox.scrollTop = dngChatBox.scrollHeight;
        
    } else if (data.event === "correct_guess") {
        dngChatBox.innerHTML += `<p class="sys-msg" style="color:var(--accent-green)">🎉 ${data.player} guessed the word!</p>`;
        dngChatBox.scrollTop = dngChatBox.scrollHeight;
        
        // Host awards points
        if (playerName === roomHost || currentMode === 'bot') {
            const points = dngTimer > 0 ? dngTimer : 10;
            dngScores[data.player] = (dngScores[data.player] || 0) + points;
            dngScores[dngCurrentDrawer] = (dngScores[dngCurrentDrawer] || 0) + Math.floor(points / 2);
            updateDngLeaderboard();
            
            dngCorrectGuesses++;
            const totalGuessers = dngPlayers.length - 1;
            if (dngCorrectGuesses >= totalGuessers && totalGuessers > 0) {
                // Everyone has guessed correctly! End turn instantly.
                endDngTurn();
            }
        }
    }
}

function updateDngLeaderboard() {
    if(!dngLeaderboard) return;
    dngLeaderboard.innerHTML = "";
    Object.keys(dngScores).sort((a,b) => dngScores[b] - dngScores[a]).forEach(p => {
        const isDrawer = (p === dngCurrentDrawer) ? " ✏️" : "";
        dngLeaderboard.innerHTML += `<li style="padding:5px 0; border-bottom:1px solid rgba(255,255,255,0.1);"><strong style="color:var(--accent-cyan)">${p}${isDrawer}</strong><span style="float:right">${dngScores[p]}</span></li>`;
    });
}

function submitDngGuess() {
    if (dngMyRole === 'drawer') return; // Drawers can't guess!
    
    const text = dngGuessInput.value.trim();
    if (!text) return;
    dngGuessInput.value = '';
    
    if (text.toUpperCase() === dngCurrentWord && !dngHasGuessed) {
        dngHasGuessed = true;
        // Correct Guess
        const packet = { action: "dng_event", event: "correct_guess", player: playerName };
        if (currentMode === 'friend') socket.send(JSON.stringify(packet));
        else handleDngEvent(packet);
    } else {
        // Normal chat
        const packet = { action: "dng_event", event: "chat", player: playerName, text: text };
        if (currentMode === 'friend') socket.send(JSON.stringify(packet));
        else handleDngEvent(packet);
    }
}

if (dngGuessBtn) dngGuessBtn.addEventListener('click', submitDngGuess);
if (dngGuessInput) {
    dngGuessInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') submitDngGuess();
    });
}

// Canvas Drawing Mechanics
function getCanvasPos(e) {
    const rect = dngCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
        x: (clientX - rect.left) * (dngCanvas.width / rect.width),
        y: (clientY - rect.top) * (dngCanvas.height / rect.height)
    };
}

function startDrawing(e) {
    if (dngMyRole !== 'drawer') return;
    isDrawing = true;
    dngLastPos = getCanvasPos(e);
}

function draw(e) {
    if (!isDrawing || dngMyRole !== 'drawer') return;
    e.preventDefault();
    const pos = getCanvasPos(e);
    
    const color = dngColorPicker.value;
    const size = dngSizePicker.value;
    
    drawLineLocally(dngLastPos.x, dngLastPos.y, pos.x, pos.y, color, size);
    
    if (currentMode === 'friend') {
        socket.send(JSON.stringify({
            action: "dng_draw",
            startX: dngLastPos.x, startY: dngLastPos.y,
            endX: pos.x, endY: pos.y,
            color: color, size: size
        }));
    }
    
    dngLastPos = pos;
}

function stopDrawing() {
    isDrawing = false;
}

function drawLineLocally(x1, y1, x2, y2, color, size) {
    dngCtx.beginPath();
    dngCtx.moveTo(x1, y1);
    dngCtx.lineTo(x2, y2);
    dngCtx.strokeStyle = color;
    dngCtx.lineWidth = size;
    dngCtx.lineCap = 'round';
    dngCtx.stroke();
}

// Event Listeners for Canvas
dngCanvas.addEventListener('mousedown', startDrawing);
dngCanvas.addEventListener('mousemove', draw);
dngCanvas.addEventListener('mouseup', stopDrawing);
dngCanvas.addEventListener('mouseout', stopDrawing);

dngCanvas.addEventListener('touchstart', startDrawing, {passive: false});
dngCanvas.addEventListener('touchmove', draw, {passive: false});
dngCanvas.addEventListener('touchend', stopDrawing);

if (dngClearBtn) {
    dngClearBtn.addEventListener('click', () => {
        if (dngMyRole !== 'drawer') return;
        dngCtx.fillStyle = "#ffffff";
        dngCtx.fillRect(0, 0, dngCanvas.width, dngCanvas.height);
        if (currentMode === 'friend') {
            socket.send(JSON.stringify({ action: "dng_clear" }));
        }
    });
}

// ==========================================
// --- TYPING INDICATOR LOGIC ---
// ==========================================
let typingTimers = {};
let isTypingState = {};
let activeTypers = { global_chat: new Set(), dng: new Set(), tod: new Set() };

function setupTypingIndicator(inputId, context) {
    const inputEl = document.getElementById(inputId);
    if (!inputEl) return;
    
    inputEl.addEventListener('input', () => {
        if (currentMode !== 'friend') return;
        
        if (!isTypingState[context]) {
            isTypingState[context] = true;
            socket.send(JSON.stringify({ action: "typing", context: context, is_typing: true, player: playerName }));
        }
        
        clearTimeout(typingTimers[context]);
        typingTimers[context] = setTimeout(() => {
            isTypingState[context] = false;
            socket.send(JSON.stringify({ action: "typing", context: context, is_typing: false, player: playerName }));
        }, 1500);
    });
}

// Ensure elements exist before setting them up. Since script.js runs at the end, they should exist.
setupTypingIndicator('chatInput', 'global_chat');
setupTypingIndicator('dngGuessInput', 'dng');
setupTypingIndicator('todCustomInput', 'tod');
setupTypingIndicator('todTruthInput', 'tod');

function updateTypingUI(context) {
    let indicatorId = "";
    if (context === 'global_chat') indicatorId = 'globalTypingIndicator';
    if (context === 'dng') indicatorId = 'dngTypingIndicator';
    if (context === 'tod') indicatorId = 'todTypingIndicator';
    
    if (!indicatorId) return;
    const ind = document.getElementById(indicatorId);
    if (!ind) return;
    
    const typers = Array.from(activeTypers[context]);
    if (typers.length > 0) {
        ind.innerHTML = typers.length === 1 ? `${typers[0]} is typing<span class="typing-dots"></span>` : `${typers.join(', ')} are typing<span class="typing-dots"></span>`;
        ind.classList.remove('hidden');
    } else {
        ind.innerText = "";
        ind.classList.add('hidden');
    }
}
