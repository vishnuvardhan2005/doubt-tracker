const express = require('express');
const cookieParser = require('cookie-parser');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(express.json());
app.use(cookieParser());

// Health check — no auth, no DB.
app.use('/health', require('./routes/health'));

app.use('/api/doubts', require('./routes/doubts'));

// Feature routes are mounted here as the app grows. See /routes.
// e.g. app.use('/api/auth', require('./routes/auth'));

// 404 + central error handler must stay last.
app.use(notFound);
app.use(errorHandler);

module.exports = app;
