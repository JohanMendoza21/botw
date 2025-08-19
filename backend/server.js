// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const diffusionRoutes = require('./routes/diffusion.routes');
const waRoutes = require('./routes/wa.routes');
const botRoutes = require('./routes/bot.routes');
const { initClient } = require('./services/openwa');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());

// Aumentar límite de carga para imágenes grandes (por ejemplo 10MB)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/diffusions', diffusionRoutes);
app.use('/api/wa', waRoutes);
app.use('/api/bot', botRoutes);

initClient()
  .then(() => console.log('📲 OpenWA listo o esperando QR'))
  .catch((e) => console.warn('OpenWA no inició al boot. Se intentará al primer uso.', e?.message));



// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ Conectado a MongoDB Atlas');
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
})
.catch((err) => {
  console.error('❌ Error al conectar con MongoDB:', err);
});
