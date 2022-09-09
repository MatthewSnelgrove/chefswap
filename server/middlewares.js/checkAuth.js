export default async function checkAuth(req, res, next){
    const accountUid = req.session.accountUid;
    if(!accountUid){
        res.status(401).send("unauthorized");
    }
    next();
}