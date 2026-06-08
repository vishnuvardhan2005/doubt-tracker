// Liveness check — no auth, no DB.
const getHealth = (req, res) => {
  res.json({ status: 'ok' });
};

module.exports = { getHealth };
