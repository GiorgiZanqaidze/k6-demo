// server.js
const express = require('express');
const app = express();

app.use(express.json());

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

// 3. Checkout endpoint (Basic implementation for Step 1)
app.post('/checkout', (req, res) => {
    res.status(200).json({ status: "Order placed" });
});

app.listen(3000, () => console.log('Victim server running on port 3000'));

