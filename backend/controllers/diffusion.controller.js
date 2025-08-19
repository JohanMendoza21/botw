// controllers/diffusion.controller.js
const Diffusion = require('../models/DiffusionBox');
const Card = require('../models/Card');

// Crear una nueva difusión
exports.createDiffusion = async (req, res) => {
  try {
    const { title, send = false } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'El título es obligatorio' });
    }

    const newDiffusion = new Diffusion({ title: title.trim(), send });
    await newDiffusion.save();

    res.status(201).json(newDiffusion);
  } catch (err) {
    console.error('Error en createDiffusion:', err);
    res.status(500).json({ error: 'Error al crear la difusión', details: err.message });
  }
};

// Obtener todas las difusiones
exports.getAllDiffusions = async (req, res) => {
  try {
    const diffusions = await Diffusion.find()
      .populate('cards')
      .sort({ createdAt: -1 })
      .lean();

    res.json(diffusions);
  } catch (err) {
    console.error('Error en getAllDiffusions:', err);
    res.status(500).json({ error: 'Error al obtener las difusiones', details: err.message });
  }
};

// Obtener solo las difusiones marcadas para enviar
exports.getDiffusionsToSend = async (req, res) => {
  try {
    const diffusions = await Diffusion.find({ send: true })
      .populate('cards')
      .sort({ createdAt: -1 })
      .lean();

    res.json(diffusions);
  } catch (err) {
    console.error('Error en getDiffusionsToSend:', err);
    res.status(500).json({ error: 'Error al obtener las difusiones activas', details: err.message });
  }
};

// Obtener una difusión por ID
exports.getDiffusionById = async (req, res) => {
  try {
    const diffusion = await Diffusion.findById(req.params.id).populate('cards');
    if (!diffusion) {
      return res.status(404).json({ error: 'Difusión no encontrada' });
    }
    res.json(diffusion);
  } catch (err) {
    console.error('Error en getDiffusionById:', err);
    res.status(500).json({ error: 'Error al buscar la difusión', details: err.message });
  }
};

// Actualizar una difusión (título y estado "send")
exports.updateDiffusion = async (req, res) => {
  try {
    const { title, send } = req.body;

    if (title && (typeof title !== 'string' || title.trim() === '')) {
      return res.status(400).json({ error: 'El título no puede estar vacío' });
    }

    const updated = await Diffusion.findByIdAndUpdate(
      req.params.id,
      {
        ...(title !== undefined && { title: title.trim() }),
        ...(send !== undefined && { send })
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Difusión no encontrada' });
    }

    res.json(updated);
  } catch (err) {
    console.error('Error en updateDiffusion:', err);
    res.status(500).json({ error: 'Error al actualizar difusión', details: err.message });
  }
};

// Agregar una tarjeta a una difusión (Opción A – adaptado al FRONT)
exports.addCardToDiffusion = async (req, res) => {
  try {
    const { id } = req.params;

    // El front envía:
    const { name, gender, price, image, message, send = false } = req.body;

    // Validaciones mínimas
    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'La tarjeta debe incluir una imagen (base64 o URL)' });
    }
    if (!price || String(price).trim() === '') {
      return res.status(400).json({ error: 'La tarjeta debe incluir un precio' });
    }
    if (!gender || !['hombre', 'dama', 'ambas'].includes(gender)) {
      return res.status(400).json({ error: 'Género inválido. Use: hombre | dama | ambas' });
    }

    const diffusion = await Diffusion.findById(id);
    if (!diffusion) {
      return res.status(404).json({ error: 'Difusión no encontrada' });
    }

    const newCard = new Card({
      name: name ?? '',
      gender,
      price: String(price),
      image,                      // base64 o URL, tal como llega del front
      message: message ?? '',
      send: !!send,
      diffusionBoxId: id
    });

    await newCard.save();

    // Enlazar a la difusión
    diffusion.cards.push(newCard._id);
    await diffusion.save();

    res.status(201).json(newCard);
  } catch (err) {
    console.error('Error en addCardToDiffusion:', err);
    res.status(500).json({ error: 'Error al agregar tarjeta', details: err.message });
  }
};

// Actualizar una tarjeta específica (acepta los campos del FRONT)
exports.updateCardInDiffusion = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { name, gender, price, image, message, send } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (gender !== undefined) {
      if (!['hombre', 'dama', 'ambas'].includes(gender)) {
        return res.status(400).json({ error: 'Género inválido. Use: hombre | dama | ambas' });
      }
      updates.gender = gender;
    }
    if (price !== undefined) updates.price = String(price);
    if (image !== undefined) updates.image = image;
    if (message !== undefined) updates.message = message;
    if (send !== undefined) updates.send = !!send;

    const updatedCard = await Card.findByIdAndUpdate(cardId, updates, { new: true });
    if (!updatedCard) {
      return res.status(404).json({ error: 'Tarjeta no encontrada' });
    }

    res.json(updatedCard);
  } catch (err) {
    console.error('Error en updateCardInDiffusion:', err);
    res.status(500).json({ error: 'Error al actualizar tarjeta', details: err.message });
  }
};

// Eliminar una tarjeta
exports.deleteCardFromDiffusion = async (req, res) => {
  try {
    const { diffusionId, cardId } = req.params;

    const diffusion = await Diffusion.findById(diffusionId);
    if (!diffusion) {
      return res.status(404).json({ error: 'Difusión no encontrada' });
    }

    // Remover referencia de forma atómica
    await Diffusion.updateOne(
      { _id: diffusionId },
      { $pull: { cards: cardId } }
    );

    // Borrar la tarjeta
    await Card.findByIdAndDelete(cardId);

    res.json({ message: 'Tarjeta eliminada correctamente' });
  } catch (err) {
    console.error('Error en deleteCardFromDiffusion:', err);
    res.status(500).json({ error: 'Error al eliminar tarjeta', details: err.message });
  }
};

// Eliminar difusión (y sus tarjetas asociadas)
exports.deleteDiffusion = async (req, res) => {
  try {
    const diffusion = await Diffusion.findById(req.params.id);
    if (!diffusion) {
      return res.status(404).json({ error: 'Difusión no encontrada' });
    }

    const deletedCards = await Card.deleteMany({ _id: { $in: diffusion.cards } });
    await diffusion.deleteOne();

    res.json({
      message: 'Difusión y tarjetas eliminadas correctamente',
      deletedCards: deletedCards.deletedCount
    });
  } catch (err) {
    console.error('Error en deleteDiffusion:', err);
    res.status(500).json({ error: 'Error al eliminar difusión', details: err.message });
  }
};
