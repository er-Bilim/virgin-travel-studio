import express from "express";
import mongoose from "mongoose";
import News from "@/model/New/News.js";
import auth, {authOrNot, type RequestWithUser} from "@/middlewares/auth.js";
import permit from "@/middlewares/permit.js";
import {imagesUpload} from "@/middlewares/multer.js";
import type {NewsFields} from "@/types/news.types.js";
import validateObjectId from "@/middlewares/validateObjectId.js";

const newsRouter = express.Router();

newsRouter.get("/", authOrNot, async (req, res, next) => {
    const {user} = req as RequestWithUser;
    const isAdminOrManager =
        user?.role === "ADMIN" || user?.role === "MANAGER";
    try {
        const query: {
            isPublished?: boolean;
            tags?: { $in: string[] };
        } = {};

        if (!isAdminOrManager) {
            query.isPublished = true;
        }

        const tags = req.query.tags;

        if (typeof tags === "string" && tags.length > 0) {
            const parsedTags = tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean);

            if (parsedTags.length > 0) {
                query.tags = {$in: parsedTags};
            }
        }

        const news = await News.find(query)
            .sort({createdAt: -1})
            .populate("author", "fullName");

        res.send(news);
    } catch (e) {
        next(e);
    }
});

newsRouter.get(
    "/:id",
    authOrNot,
    validateObjectId(),
    async (req, res, next) => {
        const {id} = req.params;

        const {user} = req as RequestWithUser;
        const isAdminOrManager =
            user?.role === "ADMIN" || user?.role === "MANAGER";

        try {
            const filter =
                isAdminOrManager
                    ? {_id: id}
                    : {_id: id, isPublished: true};

            const infoNew = await News.findOne(filter);

            if (!infoNew) {
                return res.status(404).send({
                    error: "Новость не найдена",
                });
            }

            res.send(infoNew);
        } catch (error) {
            next(error);
        }
    },
);

newsRouter.post(
    "/",
    auth,
    permit("ADMIN", "MANAGER"),
    imagesUpload.single("image"),
    async (req, res, next) => {
        try {
            const {title, content, tags} = req.body;

            const {user} = req as RequestWithUser;

            const parsedTags =
                typeof tags === "string"
                    ? tags
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean)
                    : [];

            const news = new News({
                title,
                content,
                image: req.file ? "images/" + req.file.filename : null,
                tags: parsedTags,
                author: user._id,
            });

            const savedNews = await news.save();

            res.send({
                message: "НОВОСТЬ СОЗДАНА",
                news: savedNews,
            });
        } catch (e) {
            if (e instanceof mongoose.Error.ValidationError) {
                return res.status(400).send({
                    error: "Ошибка валидации",
                    details: e.errors,
                });
            }
            next(e);
        }
    },
);

newsRouter.delete(
    "/:id",
    auth,
    permit("ADMIN", "MANAGER"),
    validateObjectId(),
    async (req, res, next) => {
        const {id} = req.params;

        try {
            const {deletedCount} = await News.deleteOne({_id: id});
            if (!deletedCount) {
                return res.status(404).send({
                    error: "Новость не найдена",
                });
            }

            return res.send({
                message: "Новость удалена",
            });
        } catch (e) {
            next(e);
        }
    },
);

newsRouter.patch(
    "/:id/isPublished",
    auth,
    permit("ADMIN", "MANAGER"),
    validateObjectId(),
    async (req, res, next) => {
        const {id} = req.params;

        try {
            const news = await News.findById(id);
            if (!news) {
                return res.status(404).send({
                    error: "Новость не найдена",
                });
            }

            news.isPublished = !news.isPublished;
            await news.save();
            return res.send(news);
        } catch (e) {
            next(e);
        }
    },
);

newsRouter.patch(
    "/:id/edit",
    auth,
    permit("ADMIN", "MANAGER"),
    validateObjectId(),
    imagesUpload.single("image"),
    async (req, res, next) => {
        const {id} = req.params;

        try {
            const news = await News.findById(id);

            if (!news) {
                return res.status(404).send({
                    error: "Новость не найдена",
                });
            }

            const {title, content, tags} = req.body;

            const updateData: Partial<NewsFields> = {};

            if (title) updateData.title = title;
            if (content) updateData.content = content;

            if (typeof tags === "string") {
                updateData.tags = tags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean);
            }

            if (req.file) {
                updateData.image = "images/" + req.file.filename;
            }

            const updated = await News.findByIdAndUpdate(id, updateData, {
                returnDocument: "after",
                runValidators: true,
            });

            res.send({
                message: "НОВОСТЬ ОБНОВЛЕНА",
                news: updated,
            });
        } catch (e) {
            next(e);
        }
    },
);

export default newsRouter;