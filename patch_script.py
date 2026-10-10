import re

with open('web/script.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Define launchChess
js = js.replace("const launchDnG = document.getElementById('launchDnG');", 
                "const launchDnG = document.getElementById('launchDnG');\nconst launchChess = document.getElementById('launchChess');\nconst chessScreen = document.getElementById('chessScreen');\nconst chessBoard = document.getElementById('chessBoard');\nconst chessStatusDisplay = document.getElementById('chessStatusDisplay');\nconst leaveChessBtn = document.getElementById('leaveChessBtn');")

# 2. In vsBotBtn logic
vsBotRepl = """    launchTicTacToe.classList.remove('locked-game'); 
    if (launchLudo) launchLudo.classList.remove('locked-game'); 
    if (launchToD) launchToD.classList.remove('locked-game'); 
    if (launchDnG) launchDnG.style.display = 'none';
    if (launchChess) {
        launchChess.style.display = 'flex';
        launchChess.classList.remove('locked-game');
    }"""
js = re.sub(r'    launchTicTacToe\.classList\.remove\(\'locked-game\'\); \n    if \(launchLudo\) launchLudo\.classList\.remove\(\'locked-game\'\); \n    if \(launchToD\) launchToD\.classList\.remove\(\'locked-game\'\); \n    if \(launchDnG\) launchDnG\.classList\.remove\(\'locked-game\'\);', vsBotRepl, js)

# 3. In vsFriendBtn/lobby logic
hostRepl = """            launchTicTacToe.classList.remove('locked-game'); 
            if (launchLudo) launchLudo.classList.remove('locked-game'); 
            if (launchToD) launchToD.classList.remove('locked-game'); 
            if (launchDnG) {
                launchDnG.style.display = 'flex';
                launchDnG.classList.remove('locked-game');
            }
            if (launchChess) launchChess.style.display = 'none';"""
js = re.sub(r'            launchTicTacToe\.classList\.remove\(\'locked-game\'\); \n            if \(launchLudo\) launchLudo\.classList\.remove\(\'locked-game\'\); \n            if \(launchToD\) launchToD\.classList\.remove\(\'locked-game\'\); \n            if \(launchDnG\) launchDnG\.classList\.remove\(\'locked-game\'\);', hostRepl, js)

nonHostRepl = """            launchTicTacToe.classList.add('locked-game'); 
            if (launchLudo) launchLudo.classList.add('locked-game'); 
            if (launchToD) launchToD.classList.add('locked-game'); 
            if (launchDnG) {
                launchDnG.style.display = 'flex';
                launchDnG.classList.add('locked-game');
            }
            if (launchChess) launchChess.style.display = 'none';"""
js = re.sub(r'            launchTicTacToe\.classList\.add\(\'locked-game\'\); \n            if \(launchLudo\) launchLudo\.classList\.add\(\'locked-game\'\); \n            if \(launchToD\) launchToD\.classList\.add\(\'locked-game\'\); \n            if \(launchDnG\) launchDnG\.classList\.add\(\'locked-game\'\);', nonHostRepl, js)

# 4. Implement launchChess click and basic chess logic
chessLogic = """
// -----------------------------------------
// CHESS GAME (Single Player vs Bot Only)
// -----------------------------------------
let chessGame = null;
let chessBotLevel = 2; // 1 = Random, 2 = Basic Eval (fallback to random if simple), 3 = Better Eval

if (launchChess) {
    launchChess.addEventListener('click', () => {
        if (currentMode !== 'bot') return;
        if (launchChess.classList.contains('locked-game')) return;
        
        chessBotLevel = parseInt(difficultySlider.value);
        startChessGame();
    });
}

if (leaveChessBtn) {
    leaveChessBtn.addEventListener('click', () => {
        showScreen(hubScreen);
        chessGame = null;
    });
}

function startChessGame() {
    showScreen(chessScreen);
    chessGame = new Chess();
    renderChessBoard();
    updateChessStatus();
}

function getPieceSymbol(type, color) {
    const pieces = {
        'w': { 'p': '♙', 'n': '♘', 'b': '♗', 'r': '♖', 'q': '♕', 'k': '♔' },
        'b': { 'p': '♟', 'n': '♞', 'b': '♝', 'r': '♜', 'q': '♛', 'k': '♚' }
    };
    return pieces[color][type];
}

let selectedSquare = null;

function renderChessBoard() {
    chessBoard.innerHTML = '';
    const board = chessGame.board();
    
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            let square = document.createElement('div');
            let isBlack = (r + c) % 2 !== 0;
            square.style.backgroundColor = isBlack ? '#769656' : '#eeeed2';
            square.style.display = 'flex';
            square.style.alignItems = 'center';
            square.style.justifyContent = 'center';
            square.style.fontSize = '2.5rem';
            square.style.cursor = 'pointer';
            
            const alg = String.fromCharCode(97 + c) + (8 - r);
            square.dataset.square = alg;
            
            if (selectedSquare === alg) {
                square.style.backgroundColor = '#baca44'; // highlight selected
            }
            
            let piece = board[r][c];
            if (piece) {
                square.innerHTML = getPieceSymbol(piece.type, piece.color);
                square.style.color = piece.color === 'w' ? '#fff' : '#000';
                square.style.textShadow = piece.color === 'w' ? '0 0 2px #000' : 'none';
            }
            
            square.addEventListener('click', () => handleSquareClick(alg));
            chessBoard.appendChild(square);
        }
    }
}

function handleSquareClick(square) {
    if (chessGame.turn() !== 'w' || chessGame.game_over()) return;
    
    if (selectedSquare) {
        // try to move
        const move = chessGame.move({
            from: selectedSquare,
            to: square,
            promotion: 'q' // always promote to queen for simplicity
        });
        
        if (move) {
            // Valid move
            selectedSquare = null;
            renderChessBoard();
            updateChessStatus();
            
            if (!chessGame.game_over()) {
                setTimeout(makeBotMove, 500); // bot thinks
            }
        } else {
            // Invalid move, maybe selecting a different piece
            const piece = chessGame.get(square);
            if (piece && piece.color === 'w') {
                selectedSquare = square;
            } else {
                selectedSquare = null;
            }
            renderChessBoard();
        }
    } else {
        const piece = chessGame.get(square);
        if (piece && piece.color === 'w') {
            selectedSquare = square;
            renderChessBoard();
        }
    }
}

function makeBotMove() {
    if (chessGame.game_over()) return;
    
    const possibleMoves = chessGame.moves();
    if (possibleMoves.length === 0) return;
    
    // Very simple bot: random move for Easy, capture preferred for Medium/Hard
    let bestMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    
    if (chessBotLevel >= 2) {
        // Find if there's a capture move
        const captures = possibleMoves.filter(m => m.includes('x'));
        if (captures.length > 0) {
            bestMove = captures[Math.floor(Math.random() * captures.length)];
        }
    }
    
    if (chessBotLevel === 3) {
        // Find if there's a check move
        const checks = possibleMoves.filter(m => m.includes('+'));
        if (checks.length > 0) {
            bestMove = checks[Math.floor(Math.random() * checks.length)];
        }
    }
    
    chessGame.move(bestMove);
    renderChessBoard();
    updateChessStatus();
}

function updateChessStatus() {
    if (chessGame.in_checkmate()) {
        chessStatusDisplay.innerText = `Checkmate! ${chessGame.turn() === 'w' ? 'Black' : 'White'} wins!`;
    } else if (chessGame.in_draw()) {
        chessStatusDisplay.innerText = 'Draw!';
    } else if (chessGame.in_stalemate()) {
        chessStatusDisplay.innerText = 'Stalemate!';
    } else {
        chessStatusDisplay.innerText = `${chessGame.turn() === 'w' ? 'White (You)' : 'Black (Bot)'} to move${chessGame.in_check() ? ' - CHECK!' : ''}`;
    }
}
"""

js = js.replace("// -----------------------------------------", chessLogic + "\n// -----------------------------------------")

with open('web/script.js', 'w', encoding='utf-8') as f:
    f.write(js)
