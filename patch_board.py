import re

with open('web/script.js', 'r', encoding='utf-8') as f:
    js = f.read()

new_render_func = """function renderChessBoard() {
    const boardDiv = document.getElementById('chessBoard');
    if(!boardDiv) return;
    boardDiv.innerHTML = '';
    
    if(!chessGame) return;
    const board = chessGame.board();
    
    let validMoves = [];
    if (selectedSquare) {
        validMoves = chessGame.moves({ square: selectedSquare, verbose: true }).map(m => m.to);
    }
    
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
            square.style.position = 'relative'; // For absolute positioning of dots
            
            const alg = String.fromCharCode(97 + c) + (8 - r);
            square.dataset.square = alg;
            
            if (selectedSquare === alg) {
                square.style.backgroundColor = '#baca44'; // highlight selected
            }
            
            let piece = board[r][c];
            if (piece) {
                let pieceSpan = document.createElement('span');
                pieceSpan.innerHTML = getPieceSymbol(piece.type, piece.color);
                pieceSpan.style.color = piece.color === 'w' ? '#fff' : '#000';
                pieceSpan.style.textShadow = piece.color === 'w' ? '0 0 2px #000' : 'none';
                pieceSpan.style.zIndex = '2';
                square.appendChild(pieceSpan);
            }
            
            // Draw valid move dot/indicator
            if (validMoves.includes(alg)) {
                let dot = document.createElement('div');
                dot.style.position = 'absolute';
                if (piece) {
                    // Capture highlight (circle outline or larger dot)
                    dot.style.width = '85%';
                    dot.style.height = '85%';
                    dot.style.borderRadius = '50%';
                    dot.style.border = '4px solid rgba(0, 0, 0, 0.15)';
                } else {
                    // Normal move dot
                    dot.style.width = '30%';
                    dot.style.height = '30%';
                    dot.style.borderRadius = '50%';
                    dot.style.backgroundColor = 'rgba(0, 0, 0, 0.15)';
                }
                dot.style.zIndex = '1';
                square.appendChild(dot);
            }
            
            square.addEventListener('click', () => handleSquareClick(alg));
            boardDiv.appendChild(square);
        }
    }
}"""

# Replace old renderChessBoard with new one
js = re.sub(r'function renderChessBoard\(\) \{.*?(?=function handleSquareClick)', new_render_func + '\n\n', js, flags=re.DOTALL)

with open('web/script.js', 'w', encoding='utf-8') as f:
    f.write(js)
