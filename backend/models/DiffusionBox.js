// models/DiffusionBox.js
const mongoose = require('mongoose');

const diffusionBoxSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    send: { type: Boolean, default: false },
    cards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Card' }]
  },
  { timestamps: true } // <- importante para el sort por createdAt
);

module.exports = mongoose.model('Diffusion', diffusionBoxSchema);
