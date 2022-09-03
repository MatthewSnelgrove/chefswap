import bcrypt from "bcryptjs";

export function hashPassword(password, salt){
    return bcrypt.hashSync(password, salt);
}

export function generateHashedPassword(password){
    const salt = bcrypt.genSaltSync();
    return { passhash:bcrypt.hashSync(password, salt), salt:salt };
}