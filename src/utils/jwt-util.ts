import jwt from "jsonwebtoken";

function sign(payload: any) {
    return jwt.sign(payload, process.env.JWT_SECRET as string);
}

function verify(token: string) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET as string);
    } catch (error) {
        console.error(`JWT verification failed with token:\n${token}`);
        throw error;
    }
}

export default { sign, verify };
