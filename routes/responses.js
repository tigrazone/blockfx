function invalidCredentials401(res) {
    return res.status(401).json({ errors: [{ msg: "Invalid Credentials" }] });
}

function serverError500(res) {
    res.status(500).send("Server Error");
}

function notFoundForThisUser404(res, entityLabel){
    return res.status(404).json({ errors: [{ msg: entityLabel+" by this id for this user not found" }] });
}

function validationError400(res, errors){
    return res.status(400).json({ errors: errors.array() });
}

function alreadyExists409(res, entityLabel){
    return res.status(409).json({ errors: [{ msg: entityLabel+" already exists" }] });
}

export {
    invalidCredentials401,
    serverError500,
    notFoundForThisUser404,
    validationError400,
    alreadyExists409
}