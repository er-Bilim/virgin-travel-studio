import express from 'express';
import AboutUs from '@/model/aboutUs/AboutUs.js';

const aboutUsRouter = express.Router();

aboutUsRouter.get('/', async (req, res, next) => {
    try {
        const content = await AboutUs.find();

        if (!content) {
            return res.status(404).send({ error: 'Контент не найден' });
        }

        res.send(content);
    } catch (e) {
        next(e);
    }
});