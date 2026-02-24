require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const db = require('./models');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const doctorRoutes = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');
const consultationRoutes = require('./routes/consultations');
const messageRoutes = require('./routes/messages');
const uploadRoutes = require('./routes/uploads');
const availabilityRoutes = require('./routes/availability');
const reviewRoutes = require('./routes/reviews');
const dashboardRoutes = require('./routes/dashboard');
const specialtyRoutes = require('./routes/specialties');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/specialties', specialtyRoutes);

// serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// serve openapi file
app.get('/api/docs/openapi.yaml', (req, res) => {
  res.sendFile(path.join(__dirname, 'openapi.yaml'));
});

// Swagger UI
try {
  const swaggerDocument = YAML.load(path.join(__dirname, 'openapi.yaml'));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (err) {
  console.warn('Swagger UI not available:', err.message || err);
}

// centralized error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 4000;
db.sequelize.authenticate().then(() => {
  console.log('DB connected');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err=>{
  console.error('Unable to connect to DB:', err.message || err);
  app.listen(PORT, ()=> console.log(`Server running (DB failed) on port ${PORT}`));
});

module.exports = app;
