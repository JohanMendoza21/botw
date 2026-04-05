// models/Card.js
const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },            // opcional
    gender: { type: String, enum: ['hombre', 'dama', 'ambas'], required: true },
    price: { type: String, required: true },        // si prefieres Number, cámbialo a Number
    image: { type: String, required: true },        // base64 o URL
    message: { type: String, default: '' },
    send: { type: Boolean, default: false },        // si la card participa en el envío
    diffusionBoxId: { type: mongoose.Schema.Types.ObjectId, ref: 'Diffusion', required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Card', cardSchema);
