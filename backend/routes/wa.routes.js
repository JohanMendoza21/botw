// routes/wa.routes.js
const express = require('express');
const router = express.Router();
const waController = require('../controllers/wa.controller');

router.get('/groups', waController.getGroups);

module.exports = router;
