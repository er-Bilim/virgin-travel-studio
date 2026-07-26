import type { NextFunction, Request, Response } from 'express';
import type { RequestWithUser } from './auth.js';

const permit = (...roles: string[]) => {
  return (expressReq: Request, res: Response, next: NextFunction) => {
    const req = expressReq as RequestWithUser;

    if (!req.user) {
      return res.status(401).send({ message: "Не аутентифицирован" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).send({ error: "Доступ запрещён" });
    }

    next();
  };
};

export default permit;
