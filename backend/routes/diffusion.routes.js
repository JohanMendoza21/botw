// routes/diffusion.routes.js
const express = require('express');
const router = express.Router();
const diffusionController = require('../controllers/diffusion.controller');

router.post('/', diffusionController.createDiffusion);
router.get('/', diffusionController.getAllDiffusions);
router.get('/:id', diffusionController.getDiffusionById);
router.put('/:id', diffusionController.updateDiffusion);
router.delete('/:id', diffusionController.deleteDiffusion);
router.post('/:id/cards', diffusionController.addCardToDiffusion);
router.put('/:diffusionId/cards/:cardId', diffusionController.updateCardInDiffusion);
router.delete('/:diffusionId/cards/:cardId', diffusionController.deleteCardFromDiffusion);

module.exports = router;
