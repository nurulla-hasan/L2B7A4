import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

const createToken = (
    payload: JwtPayload,
    secret: string,
    expiresIn: string | number
) => {
    const token = jwt.sign(payload, secret, {
        expiresIn: expiresIn as SignOptions["expiresIn"],
    });
    return token;
};

const verifyToken = (token: string, secret: string) => {
    const decoded = jwt.verify(token, secret);
    return decoded as JwtPayload;
};

export { createToken, verifyToken };


export const jwtUtils = {
    createToken,
    verifyToken
}