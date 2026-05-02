require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cron = require('node-cron');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const CHECK_INTERVAL = process.env.CHECK_INTERVAL || 30;
const SERVICES_FILE = path.join(__dirname, 'services.json');

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
            uptime: 100,
            checks: 0,
            failures: 0
        };
    }).filter(s => s.url);
}

function loadServicesFromFile() {
    try {
        if (fs.existsSync(SERVICES_FILE)) {
            const raw = fs.readFileSync(SERVICES_FILE, 'utf8');
            const parsed = JSON.parse(raw);
            // ensure fields exist
            return parsed.map((s, i) => ({
                id: s.id || i + 1,
                name: s.name || `Service ${i + 1}`,
                url: s.url || '',
                status: s.status || 'checking',
                responseTime: s.responseTime || null,
                lastChecked: s.lastChecked || null,
                uptime: typeof s.uptime === 'number' ? s.uptime : 100,
                checks: s.checks || 0,
                failures: s.failures || 0,
                history: Array.isArray(s.history) ? s.history.slice(0, 100) : []
            })).filter(s => s.url);
        }
    } catch (err) {
        console.error('Error loading services from file:', err);
    }

    return parseServicesFromEnv();
}

function saveServicesToFile() {
    try {
        fs.writeFileSync(SERVICES_FILE, JSON.stringify(services, null, 2), 'utf8');
    } catch (err) {
        console.error('Error saving services to file:', err);
    }
}

// Status data storage
let services = loadServicesFromFile();

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
            lastChecked: new Date().toISOString(),
            ok: response.status < 400
        };
    } catch (error) {
        return {
            status: 'offline',
            responseTime: Date.now() - startTime,
            lastChecked: new Date().toISOString(),
            ok: false
        };
    }
}

// Check all services
async function checkAllServices() {
    console.log('Checking all services...');

    // perform checks in parallel
    const results = await Promise.all(services.map(s => checkService(s)));

    for (let i = 0; i < services.length; i++) {
        const service = services[i];
        const result = results[i];

        service.status = result.status;
        service.responseTime = result.responseTime;
        service.lastChecked = result.lastChecked;

        // update counters for uptime
        service.checks = (service.checks || 0) + 1;
        if (!result.ok) service.failures = (service.failures || 0) + 1;

        // calculate uptime as success rate
        const success = service.checks - (service.failures || 0);
        service.uptime = service.checks > 0 ? (success / service.checks) * 100 : service.uptime || 100;
        
        // record history (most-recent-first), limit to 100 entries
        service.history = service.history || [];
        service.history.unshift({
            timestamp: service.lastChecked,
            status: service.status,
            responseTime: service.responseTime
        });
        if (service.history.length > 100) service.history.length = 100;
    }

    saveServicesToFile();
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

// (Add/Delete service endpoints intentionally removed per user request)

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Force check all services now
app.post('/api/force-check', async (req, res) => {
    try {
        await checkAllServices();
        return res.json({ ok: true, timestamp: new Date().toISOString() });
    } catch (err) {
        console.error('Error during force-check:', err);
        return res.status(500).json({ ok: false });
    }
});

// Service detail (including history)
app.get('/api/service/:id', (req, res) => {
    const id = Number(req.params.id);
    const svc = services.find(s => s.id === id);
    if (!svc) return res.status(404).json({ error: 'Not found' });
    return res.json({ service: svc });
});

app.listen(PORT, () => {
    console.log(`✅ Status Monitor running at http://localhost:${PORT}`);
    console.log(`📊 Monitoring ${services.length} services`);
});
