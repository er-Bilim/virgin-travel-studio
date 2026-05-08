import { NextFunction, Request, Response, RequestHandler } from "express";
import { UserFields } from "@/types/types.js";
import { HydratedDocument } from "mongoose";
import User from "@/model/User.js";
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import config from "@/config.js";


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
      return res
        .send({ error_code: 'INVALID_ACCESS_TOKEN', status: 401 });
    }

    req.user = user;
    next();
  } catch (e) {
    console.log(e);
    if (e instanceof TokenExpiredError) {
      return res.status(401).send({ error: "Your token expired" });
    } else {
      return res
        .status(401)
        .send({ error: "Please authenticate. Invalid access token" });
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
      return res.status(401).send({ error: 'Unauthorized' });
    }
    next();
  });
};


  
export default auth;