import express from "express";
import mongoose from "mongoose";
import User from "@/model/User.js";
import auth from "@/middlewares/auth.js";
import permit from "@/middlewares/peermit.js";
import config from "@/config.js";
import jwt from "jsonwebtoken";


const usersRouter = express.Router();

const createAccessToken = (userId: string) => {
  return jwt.sign({_id: userId}, config.accessJWTSecret, {expiresIn: '15m'});
}

const createRefreshToken = (userId: string) => {
  return jwt.sign({_id: userId}, config.refreshJWTSecret, {expiresIn: '7d'});
}

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

    newUser.token = createRefreshToken(newUser.id)
    await newUser.save();

    res.cookie('refreshToken', newUser.token, {
      'httpOnly': true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.cookie('accessToken', createAccessToken(newUser.id), {
      'httpOnly': true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    })

    res.send({
      message: "USER_CREATED",
      user: newUser,
    });
  } catch (e) {
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

    user.token = createRefreshToken(user.id);
    await user.save();
    res.cookie('refreshToken', user.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });


    res.cookie('accessToken', createAccessToken(user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    res.send({
      message: "SESSION_CREATED",
      user,
    });
  } catch (e) {
    next(e);
  }
});

usersRouter.delete("/sessions", async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      const user = await User.findOne({token: refreshToken});
      if (user) {
        user.token = '';
        await user.save();
      }
    }
  } catch (e) {
    return next(e);
  }

  res.clearCookie('accessToken', {
    httpOnly: true,
    sameSite: 'strict',
  });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    sameSite: 'strict',
  });
  res.send({message: 'Logged out successfully'});
})

usersRouter.post("/token", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).send({error: 'No refresh token present'});
    }

    const decoded = jwt.verify(refreshToken, config.refreshJWTSecret) as {
      _id: string
    };
    const user = await User.findOne({_id: decoded._id, token: refreshToken});

    if (!user) {
      return res.status(401).send({error: 'Invalid refresh token'});
    }

    user.token = createRefreshToken(user.id);
    const accessToken = createAccessToken(user.id);

    await user.save();
    res.cookie('refreshToken', user.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });


    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });


    res.send({message: 'Access token refreshed successfully'});
  } catch (e) {
    res.clearCookie('accessToken', {
      httpOnly: true,
      sameSite: 'strict',
    });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'strict',
    });
    res.status(401).send({error: 'Invalid or expired refresh token'})
  }
})

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