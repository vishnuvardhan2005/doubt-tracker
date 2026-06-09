const doubtService = require('../services/doubtService');

/*
 * Identity always comes from req.user (set by the authenticate middleware from
 * the verified JWT) — never from the request body. Role authorization is
 * enforced at the route level via requireRole, so controllers only deal with
 * the action itself.
 */

const submitDoubt = async (req, res, next) => {
  const { userId } = req.user;
  const { question, subject, priority } = req.body;
  try {
    const doubt = await doubtService.createDoubt({
      question,
      subject,
      priority,
      studentId: userId,
    });
    return res.status(201).json(doubt);
  } catch (err) {
    return next(err);
  }
};

const getMyDoubts = async (req, res, next) => {
  const { userId } = req.user;
  const sortByPriority = req.query.sort === 'priority';
  try {
    const doubts = await doubtService.getDoubtsByStudent(userId, {
      sortByPriority,
    });
    return res.json(doubts);
  } catch (err) {
    return next(err);
  }
};

const getAllDoubts = async (req, res, next) => {
  const { priority, status } = req.query;
  try {
    const doubts = await doubtService.getAllDoubts({ priority, status });
    return res.json(doubts);
  } catch (err) {
    return next(err);
  }
};

const resolveDoubt = async (req, res, next) => {
  const { userId } = req.user;
  const { id } = req.params;
  try {
    const existing = await doubtService.getDoubtById(id);
    if (!existing) {
      return res
        .status(404)
        .json({ error: 'Doubt not found', code: 'NOT_FOUND' });
    }
    if (existing.status === 'RESOLVED') {
      return res
        .status(409)
        .json({ error: 'Doubt is already resolved', code: 'ALREADY_RESOLVED' });
    }
    const updated = await doubtService.resolveDoubt(id, userId);
    return res.json(updated);
  } catch (err) {
    return next(err);
  }
};

module.exports = { submitDoubt, getMyDoubts, getAllDoubts, resolveDoubt };
