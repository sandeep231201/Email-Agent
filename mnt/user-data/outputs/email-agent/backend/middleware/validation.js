const Joi = require('joi');
const logger = require('../config/logger');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map(d => ({
        field: d.path.join('.'),
        message: d.message,
      }));
      logger.warn('Validation error', { details });
      return res.status(400).json({ error: 'Validation failed', details });
    }

    req.validatedData = value;
    next();
  };
};

const schemas = {
  register: Joi.object({
    name: Joi.string().required().min(2).max(100),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(8).max(128),
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  analyzeEmails: Joi.object({
    emailIds: Joi.array().items(Joi.string()).optional(),
  }),
  draftReply: Joi.object({
    emailId: Joi.string().required(),
    tone: Joi.string().valid('professional', 'friendly', 'concise', 'formal').default('professional'),
  }),
  askQuestion: Joi.object({
    emailId: Joi.string().required(),
    question: Joi.string().required().min(1).max(1000),
  }),
};

module.exports = { validateRequest, schemas };
