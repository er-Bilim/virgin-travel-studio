import type { RequestHandler } from 'express';
import mongoose from 'mongoose';

const validateObjectId = (paramName = 'id',isOptional = false): RequestHandler => {
    return (req, res, next) => {
        const id = req.params[paramName] || req.query[paramName];

        if (isOptional && !id) {
            return next();
        }

        if (typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({ error: 'Неверный ID' });
        }

        next();
    };
};

export default validateObjectId;