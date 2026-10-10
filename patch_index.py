import re
with open('web/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

replacement = """            <div class="game-card glass" id="launchDnG">
                <div class="game-icon">✏️</div>
                <h3>Draw & Guess</h3>
            </div>
            
            <div class="game-card glass" id="launchChess" style="display: none;">
                <div class="game-icon">♔</div>
                <h3>Chess</h3>
            </div>
        </div>"""

html = re.sub(r'            <div class="game-card glass" id="launchDnG">.*?</div>\s*</div>', replacement, html, flags=re.DOTALL)

with open('web/index.html', 'w', encoding='utf-8') as f:
    f.write(html)
