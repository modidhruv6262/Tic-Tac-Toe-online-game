chessLogic = """
// ==========================================
// CHESS GAME (Single Player vs Bot Only)
// ==========================================
let chessGame = null;
let chessBotLevel = 2; // 1 = Random, 2 = Basic Eval (fallback to random if simple), 3 = Better Eval

if (launchChess) {
    launchChess.addEventListener('click', () => {
        if (currentMode !== 'bot') return;
        if (launchChess.classList.contains('locked-game')) return;
        
        const sliderVal = document.getElementById('difficultySlider');
        if (sliderVal) chessBotLevel = parseInt(sliderVal.value);
        startChessGame();
    });
}

const leaveChessBtn = document.getElementById('leaveChessBtn');
if (leaveChessBtn) {
    leaveChessBtn.addEventListener('click', () => {
        showScreen(document.getElementById('hubScreen'));
        chessGame = null;
    });
}

function startChessGame() {
    showScreen(document.getElementById('chessScreen'));
    if (typeof Chess === 'undefined') {
        alert('Chess library is still loading or failed to load. Try again in a second.');
        return;
    }
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
    const boardDiv = document.getElementById('chessBoard');
    if(!boardDiv) return;
    boardDiv.innerHTML = '';
    
    if(!chessGame) return;
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
            boardDiv.appendChild(square);
        }
    }
}

function handleSquareClick(square) {
    if (!chessGame || chessGame.turn() !== 'w' || chessGame.game_over()) return;
    
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
    if (!chessGame || chessGame.game_over()) return;
    
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
    const statusDisp = document.getElementById('chessStatusDisplay');
    if(!statusDisp) return;
    
    if (chessGame.in_checkmate()) {
        statusDisp.innerText = `Checkmate! ${chessGame.turn() === 'w' ? 'Black' : 'White'} wins!`;
    } else if (chessGame.in_draw()) {
        statusDisp.innerText = 'Draw!';
    } else if (chessGame.in_stalemate()) {
        statusDisp.innerText = 'Stalemate!';
    } else {
        statusDisp.innerText = `${chessGame.turn() === 'w' ? 'White (You)' : 'Black (Bot)'} to move${chessGame.in_check() ? ' - CHECK!' : ''}`;
    }
}
"""

with open('web/script.js', 'a', encoding='utf-8') as f:
    f.write("\n" + chessLogic)
