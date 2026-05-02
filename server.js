require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cron = require('node-cron');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const CHECK_INTERVAL = process.env.CHECK_INTERVAL || 30;

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Parse services from .env
function parseServicesFromEnv() {
    const servicesString = process.env.SERVICES || '';
    const servicesList = servicesString.split(',').filter(s => s.trim());
    
    return servicesList.map((service, index) => {
        const [name, url] = service.split('|').map(s => s.trim());
        return {
            id: index + 1,
            name: name || `Service ${index + 1}`,
            url: url || '',
            status: 'checking',
            responseTime: null,
            lastChecked: null,
            uptime: 100
        };
    }).filter(s => s.url); // Only include services with valid URLs
}

// Status data storage
let services = parseServicesFromEnv();

// Check service status
async function checkService(service) {
    const startTime = Date.now();
    try {
        const response = await axios.get(service.url, {
            timeout: 5000,
            validateStatus: (status) => status < 500
        });
        
        const responseTime = Date.now() - startTime;
        
        return {
            status: response.status < 400 ? 'online' : 'degraded',
            responseTime: responseTime,
            lastChecked: new Date().toISOString()
        };
    } catch (error) {
        return {
            status: 'offline',
            responseTime: Date.now() - startTime,
            lastChecked: new Date().toISOString()
        };
    }
}

// Check all services
async function checkAllServices() {
    console.log('Checking all services...');
    
    for (let service of services) {
        const result = await checkService(service);
        service.status = result.status;
        service.responseTime = result.responseTime;
        service.lastChecked = result.lastChecked;
        
        // Update uptime calculation (simplified)
        if (result.status === 'online') {
            service.uptime = Math.min(100, service.uptime + 0.1);
        } else {
            service.uptime = Math.max(0, service.uptime - 5);
        }
    }
}

// Schedule checks based on interval from .env
const cronPattern = `*/${CHECK_INTERVAL} * * * * *`;
cron.schedule(cronPattern, () => {
    checkAllServices();
});

// Initial check
checkAllServices();

// API Routes
app.get('/api/status', (req, res) => {
    res.json({
        services: services,
        timestamp: new Date().toISOString()
    });
});

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`✅ Status Monitor running at http://localhost:${PORT}`);
    console.log(`📊 Monitoring ${services.length} services`);
});
