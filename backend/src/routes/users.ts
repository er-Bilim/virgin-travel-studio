import express from "express";
import mongoose from "mongoose";
import User from "@/model/User.js";
import auth from "@/middlewares/auth.js";
import permit from "@/middlewares/peermit.js";

const usersRouter = express.Router();

usersRouter.post("/", async (req, res, next) => {
    try {
        const { phone } = req.body;

        const existingUser = await User.findOne({ phone });

        if (existingUser) {
            return res.status(409).send({
                "error_code": "USER_ALREADY_EXISTS",
            });
        }

        const newUser = new User({
            fullName: req.body.fullName,
            phone: req.body.phone,
            password: req.body.password,
        });

        const savedUser = await newUser.save();

        res.send({
            message: "USER_CREATED",
            user: savedUser,
        });
    } catch (e) {
        if (
            typeof e === "object" &&
            e !== null &&
            "code" in e &&
            (e as { code?: number }).code === 11000
        ) {
            return res.status(409).send({
                error_code: "USER_ALREADY_EXISTS",
            });
        }
        if (e instanceof mongoose.Error.ValidationError) {
            return res.status(400).send({
                error_code: "VALIDATION_ERROR",
                details: e.errors,
            });
        }
        next(e);
    }
});

usersRouter.post("/sessions", async (req, res, next) => {
    try {
        const { phone, password } = req.body;

        const user = await User.findOne({ phone }).select("+password");

        if (!user) {
            return res.status(401).send({
                error_code: "INVALID_CREDENTIALS",
            });
        }

        const isMatch = await user.checkPassword(password);

        if (!isMatch) {
            return res.status(401).send({
                error_code: "INVALID_CREDENTIALS",
            });
        }

        res.send({
            message: "SESSION_CREATED",
            user,
        });
    } catch (e) {
        next(e);
    }
});

usersRouter.patch("/:id/status", auth, permit("ADMIN"), async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
        return res.status(400).send({
            error_code: "INVALID_USER_ID",
        });
    }

    try {
        const allowedStatuses = ["active", "banned"];

        if (!req.body.status) {
            return res.status(400).send({
                error_code: "STATUS_REQUIRED",
            });
        }

        if (!allowedStatuses.includes(req.body.status)) {
            return res.status(400).send({
                error_code: "INVALID_STATUS",
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { status: req.body.status },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).send({
                error_code: "USER_NOT_FOUND",
            });
        }

        res.send({
            message: "USER_UPDATED",
            user: updatedUser,
        });
    } catch (e) {
        next(e);
    }
});

export default usersRouter;