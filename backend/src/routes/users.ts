import express from "express";
import mongoose from "mongoose";
import User from "@/model/User.js";
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
    const {phone, email} = req.body;

    const existingUser = await User.findOne({
      $or: [{phone}, {email}],
    });

    if (existingUser) {
      return res.status(409).send({
        "error_code": "USER_ALREADY_EXISTS",
      });
    }

    const newUser = new User({
      fullName: req.body.fullName,
      phone: req.body.phone,
      email: req.body.email,
      password: req.body.password,
    });

    newUser.token = createRefreshToken(newUser.id)
    const savedUser = await newUser.save();

    res.cookie('refreshToken', savedUser.token, {
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
      user: savedUser,
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
    const {email, phone, password} = req.body;

    const user = await User.findOne({
      $or: [{email}, {phone}],
    }).select("+password");

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

    const userSave = await user.save();
    user.token = createRefreshToken(user.id);
    res.cookie('refreshToken', userSave.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });


    res.cookie('accessToken', createAccessToken(userSave.id), {
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
    next(e);
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

    const accessToken = createAccessToken(user.id);
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });
    res.send({message: 'Access token refreshed successfully'});
  } catch (e) {
    res.status(401).send({error: 'Invalid or expired refresh token'})
  }
})


export default usersRouter;