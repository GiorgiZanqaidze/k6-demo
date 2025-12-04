// server.js
const express = require('express');
const app = express();

app.use(express.json());

// Order count tracking for bottleneck simulation
let orderCount = 0;

// 1. Fast endpoint (Static content)
app.get('/products', (req, res) => {
    res.json([{ id: 1, name: "Gaming Mouse" }, { id: 2, name: "Keyboard" }]);
});

// 2. Slow endpoint (Simulates DB Read)
app.get('/product/:id', (req, res) => {
    // Artificial delay of 200ms
    setTimeout(() => {
        res.json({ id: req.params.id, name: "Gaming Mouse", stock: 100 });
    }, 200);
});

// 3. Flaky endpoint (The Crash Target)
app.post('/checkout', (req, res) => {
    orderCount++;
    
    // BUG: If we get more than 50 orders rapidly, the server "locks up"
    // We simulate this by increasing delay based on traffic
    const delay = orderCount > 50 ? 2000 : 50;

    setTimeout(() => {
        if (orderCount > 100) {
            // Server crashes/errors out under high load
            return res.status(503).send("Service Unavailable: Database Locked");
        }
        res.status(200).json({ status: "Order placed" });
    }, delay);
});

// Reset simulation every 30 seconds
setInterval(() => { orderCount = 0; console.log("--- Traffic Reset ---"); }, 30000);

app.listen(3000, () => console.log('Victim server running on port 3000'));

