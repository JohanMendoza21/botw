// routes/bot.routes.js
const express = require('express');
const router = express.Router();
const botController = require('../controllers/bot.controller');

router.post('/start', botController.start);
router.post('/stop', botController.stop);
router.get('/status', botController.status);

module.exports = router;
