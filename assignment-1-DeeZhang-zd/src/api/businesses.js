const express = require('express');
const router = express.Router();

// Mock data - this would typically be replaced with a database
let businesses = require('../../data/businesses.json');

router.post('/', (req, res) => {
    const business = req.body;
    business.id = businesses.length + 1; // Simple ID assignment
    businesses.push(business);
    res.status(201).send(business);
});

router.get('/', (req, res) => {
    res.status(200).send(businesses);
});

router.get('/:id', (req, res) => {
    const business = businesses.find(b => b.id == req.params.id);
    if (!business) {
        return res.status(404).send();
    }
    res.status(200).send(business);
});

router.put('/:id', (req, res) => {
    const index = businesses.findIndex(b => b.id == req.params.id);
    if (index === -1) {
        return res.status(404).send();
    }
    businesses[index] = { ...businesses[index], ...req.body };
    res.status(200).send(businesses[index]);
});

router.delete('/:id', (req, res) => {
    const index = businesses.findIndex(b => b.id == req.params.id);
    if (index !== -1) {
        businesses.splice(index, 1);
    }
    res.status(204).send();
});

module.exports = router;
