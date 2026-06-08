const express = require('express');
const cookieParser = require('cookie-parser');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(express.json());
app.use(cookieParser());

// Health check — no auth, no DB.
app.use('/health', require('./routes/health'));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/doubts', require('./routes/doubts'));

// 404 + central error handler must stay last.
app.use(notFound);
app.use(errorHandler);

module.exports = app;
