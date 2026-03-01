const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const goalRoutes = require('./routes/goalRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const accountRoutes = require('./routes/accountRoutes')
const aiRoutes = require('./routes/aiRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes')
const categoriesRoutes = require('./routes/categoryRoutes')
const settingRoutes = require('./routes/settingRoutes')
const envelopeRoutes = require('./routes/envelopeRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');

const authenticate = require('./middlewares/auth');

const app = express();

app.use(cookieParser());
app.use(cors({
    origin: [
        'http://localhost:3001',
        'https://82fxd9nc-3001.use2.devtunnels.ms',
        'https://82fxd9nc-3000.use2.devtunnels.ms',
        'https://financial-guard-client.vercel.app',
        process.env.FRONTEND_URL // Dominio dinámico de producción
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-Tunnel-Skip-Anti-Phishing-Page']
}));
app.use(express.json());

// Ruta para la documentación
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Rutas Públicas
app.use('/api/auth', authRoutes);

// Registro de módulos
app.use('/api/goals', authenticate, goalRoutes);
app.use('/api/transactions', authenticate, transactionRoutes);
app.use('/api/accounts', authenticate, accountRoutes);
app.use('/api/coach', authenticate, aiRoutes);
app.use('/api/dashboard', authenticate, dashboardRoutes);
app.use('/api/categories', authenticate, categoriesRoutes);
app.use('/api/settings', authenticate, settingRoutes);
app.use('/api/budget/envelopes', authenticate, envelopeRoutes);
app.use('/api/budget/subscriptions', authenticate, subscriptionRoutes);

module.exports = app;