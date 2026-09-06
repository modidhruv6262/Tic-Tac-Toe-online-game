let socket = new WebSocket('wss://tic-tac-toe-online-game-wokq.onrender.com');

socket.onopen = () => console.log("Admin connected to server");
socket.onerror = (e) => console.error("Admin WebSocket error", e);


const loginScreen = document.getElementById('adminLoginScreen');
const dashboard = document.getElementById('adminDashboard');
const loginBtn = document.getElementById('adminLoginBtn');
const passInput = document.getElementById('adminPassword');
const errorMsg = document.getElementById('loginError');
const refreshBtn = document.getElementById('refreshBtn');
const tbody = document.getElementById('logsTableBody');

const statTotal = document.getElementById('statTotal');
const statUnique = document.getElementById('statUnique');

loginBtn.addEventListener('click', () => {
    const pwd = passInput.value.trim();
    if (pwd) {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ action: "admin_request", password: pwd }));
        } else {
            errorMsg.innerText = "Error: Cannot connect to server. Did you push to Render?";
            errorMsg.classList.remove('hidden');
        }
    }
});
passInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') loginBtn.click();
});

refreshBtn.addEventListener('click', () => {
    const pwd = passInput.value.trim();
    refreshBtn.classList.add('refreshing');
    refreshBtn.innerText = 'Refreshing';
    socket.send(JSON.stringify({ action: "admin_request", password: pwd }));
});

socket.onmessage = function(event) {
    const data = JSON.parse(event.data);

    if (data.type === "admin_auth_success") {
        errorMsg.classList.add('hidden');
        loginScreen.classList.add('hidden');
        dashboard.classList.remove('hidden');
    } 
    else if (data.type === "admin_auth_failed") {
        errorMsg.classList.remove('hidden');
        passInput.value = '';
    }
    else if (data.type === "admin_data") {
        refreshBtn.classList.remove('refreshing');
        refreshBtn.innerText = 'Refresh Data';
        populateLogs(data.logs);
    }
};

function populateLogs(logs) {
    tbody.innerHTML = '';
    let uniqueIPs = new Set();
    
    // Sort logs by created_at descending (newest first)
    logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    logs.forEach(log => {
        uniqueIPs.add(log.ip_address);
        const tr = document.createElement('tr');
        
        const d = new Date(log.created_at);
        const timeStr = d.toLocaleString();

        tr.innerHTML = `
            <td style="color: var(--text-muted); font-size: 0.8rem;">${timeStr}</td>
            <td style="font-weight: bold; color: var(--accent-cyan);">${log.player_name}</td>
            <td style="font-family: monospace;">${log.ip_address}</td>
            <td>${log.location}</td>
        `;
        tbody.appendChild(tr);
    });

    statTotal.innerText = logs.length;
    statUnique.innerText = uniqueIPs.size;
}
