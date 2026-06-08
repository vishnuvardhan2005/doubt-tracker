const doubtService = require('../services/doubtService');

/*
 * PHASE 3 TEMPORARY: the actor (userId + role) is resolved by validateActor from
 * the request body/query and stashed on req.actor. Phase 4 replaces that with the
 * verified JWT, per the security rule "never trust client-sent userId".
 */

const submitDoubt = async (req, res, next) => {
  const { userId, role } = req.actor;
  const { question, subject, priority } = req.body;
  if (role !== 'STUDENT') {
    return res
      .status(403)
      .json({ error: 'Only students can submit doubts', code: 'FORBIDDEN' });
  }
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
  const { userId, role } = req.actor;
  if (role !== 'STUDENT') {
    return res
      .status(403)
      .json({ error: 'Only students can view their doubts', code: 'FORBIDDEN' });
  }
  try {
    const doubts = await doubtService.getDoubtsByStudent(userId);
    return res.json(doubts);
  } catch (err) {
    return next(err);
  }
};

const getAllDoubts = async (req, res, next) => {
  const { role } = req.actor;
  if (role !== 'TEACHER') {
    return res
      .status(403)
      .json({ error: 'Only teachers can view all doubts', code: 'FORBIDDEN' });
  }
  try {
    const doubts = await doubtService.getAllDoubts();
    return res.json(doubts);
  } catch (err) {
    return next(err);
  }
};

const resolveDoubt = async (req, res, next) => {
  const { role, userId } = req.actor;
  const { id } = req.params;
  if (role !== 'TEACHER') {
    return res
      .status(403)
      .json({ error: 'Only teachers can resolve doubts', code: 'FORBIDDEN' });
  }
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
