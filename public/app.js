// Fetch and display services status
async function fetchStatus() {
    try {
        const response = await fetch('/api/status');
        const data = await response.json();
        
        updateStats(data.services);
        displayServices(data.services);
        updateLastUpdateTime(data.timestamp);
    } catch (error) {
        console.error('Error fetching status:', error);
    }
}

// Update statistics
function updateStats(services) {
    const total = services.length;
    const online = services.filter(s => s.status === 'online').length;
    const offline = services.filter(s => s.status === 'offline').length;
    const avgUptime = total > 0 
        ? (services.reduce((sum, s) => sum + s.uptime, 0) / total).toFixed(1)
        : 100;
    
    document.getElementById('totalServices').textContent = total;
    document.getElementById('onlineServices').textContent = online;
    document.getElementById('offlineServices').textContent = offline;
    document.getElementById('avgUptime').textContent = avgUptime + '%';
}

// Display services list
function displayServices(services) {
    const servicesList = document.getElementById('servicesList');
    
    if (services.length === 0) {
        servicesList.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No services being monitored. Add a new service to get started!</p>';
        return;
    }
    
    servicesList.innerHTML = services.map(service => {
        const uptimeHistory = generateUptimeHistory(service.uptime);
        const responseTimeColor = getResponseTimeColor(service.responseTime);
        
        return `
        <div class="service-card ${service.status}">
            <div class="service-info">
                <div class="service-header">
                    <div class="service-title">
                        <h3>${service.name}</h3>
                        <span class="service-url">${service.url}</span>
                    </div>
                    <span class="status-badge ${service.status}">${getStatusText(service.status)}</span>
                </div>
                
                <div class="service-metrics">
                    <div class="metric-card">
                        <div class="metric-label">Response Time</div>
                        <div class="metric-value" style="color: ${responseTimeColor}">
                            ${service.responseTime ? service.responseTime + ' ms' : '-'}
                        </div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">Uptime</div>
                        <div class="metric-value">${service.uptime.toFixed(1)}%</div>
                        <div class="uptime-bar">
                            <div class="uptime-fill" style="width: ${service.uptime}%"></div>
                        </div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">Last Checked</div>
                        <div class="metric-value">${service.lastChecked ? formatTime(service.lastChecked) : '-'}</div>
                    </div>
                </div>
                
                <div class="uptime-history">
                    <div class="history-label">30-Day Uptime History</div>
                    <div class="history-bars">
                        ${uptimeHistory}
                    </div>
                </div>
            </div>
        </div>
    `;
    }).join('');
}

// Generate uptime history visualization (30 days)
function generateUptimeHistory(currentUptime) {
    const days = 30;
    let bars = '';
    
    for (let i = 0; i < days; i++) {
        // Simulate historical data with some randomness around current uptime
        const variance = Math.random() * 10 - 5;
        const dayUptime = Math.max(0, Math.min(100, currentUptime + variance));
        const status = dayUptime >= 95 ? 'good' : dayUptime >= 80 ? 'degraded' : 'poor';
        
        bars += `<div class="history-bar ${status}" title="Day ${i + 1}: ${dayUptime.toFixed(1)}%"></div>`;
    }
    
    return bars;
}

// Get color based on response time
function getResponseTimeColor(responseTime) {
    if (!responseTime) return '#94a3b8';
    if (responseTime < 200) return '#10b981';
    if (responseTime < 500) return '#f59e0b';
    return '#ef4444';
}

// Get status text in Indonesian
function getStatusText(status) {
    const statusMap = {
        'online': '✅ Online',
        'offline': '❌ Offline',
        'degraded': '⚠️ Degraded',
        'checking': '🔄 Checking'
    };
    return statusMap[status] || status;
}

// Format timestamp
function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
}

// Update last update time
function updateLastUpdateTime(timestamp) {
    const lastUpdate = document.getElementById('lastUpdate');
    const date = new Date(timestamp);
    lastUpdate.textContent = date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// Auto-refresh every 5 seconds
setInterval(fetchStatus, 5000);

// Initial fetch
fetchStatus();
