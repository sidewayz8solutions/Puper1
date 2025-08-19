const joi = require('joi');

const validateRegistration = (req, res, next) => {
    const schema = joi.object({
        username: joi.string().alphanum().min(3).max(30).required(),
        email: joi.string().email().required(),
        password: joi.string().min(6).required(),
        displayName: joi.string().max(100)
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};

const validateLogin = (req, res, next) => {
    const schema = joi.object({
        username: joi.string().required(),
        password: joi.string().required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};

module.exports = { validateRegistration, validateLogin };
