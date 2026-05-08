import { NextFunction, Request, Response, RequestHandler } from 'express';
import { UserFields } from '@/types/users.types.js';
import { HydratedDocument } from 'mongoose';
import User from '@/model/user/User.js';
import jwt from 'jsonwebtoken';
import config from '@/config.js';

export interface RequestWithUser extends Request {
  user: HydratedDocument<UserFields>;
}

export const authOrNot: RequestHandler = async (
  expressReq: Request,
  res: Response,
  next: NextFunction,
) => {
  const req = expressReq as RequestWithUser;
  const jwtToken = req.cookies.accessToken;

  if (!jwtToken) {
    return next();
  }

  try {
    const decoded = jwt.verify(jwtToken, config.accessJWTSecret) as {
      _id: string;
    };
    const user = await User.findOne({ _id: decoded._id });

    if (!user) {
      return res.send({ error: "Недействительный access token", status: 401 });
    }

    req.user = user;
    next();
  } catch (e) {
    console.log(e);
    if (e instanceof jwt.TokenExpiredError) {
      return res.status(401).send({ error: "Токен истёк" });
    } else {
      return res
        .status(401)
        .send({ error: "Пожалуйста, авторизуйтесь. Неверный access token" });
    }
  }
};

const auth: RequestHandler = async (
  expressReq: Request,
  res: Response,
  next: NextFunction,
) => {
  await authOrNot(expressReq, res, () => {
    const req = expressReq as RequestWithUser;
    if (!req.user) {
      return res.status(401).send({ error: "Не авторизован" });
    }
    next();
  });
};

export default auth;
