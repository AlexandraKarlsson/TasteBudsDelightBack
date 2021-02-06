const {tasteBudsPoolPromise}        = require('../data/connectionDb');
const {verifyAuthToken}             = require('./security');

const authenticate = async (request,response,next) => {
    console.log('Running authenticate');
    const token = request.header('x-auth');
    console.log('token=',token);

    try {
        verifyAuthToken(token);
        let rows = await tasteBudsPoolPromise.query(`SELECT user.id as id,username,email FROM user,token WHERE token='${token}' AND token.userid=user.id`);
        console.log('rows=',rows[0]);
        if(rows[0].length === 0) {
            throw `User not authenticated'!`; 
        }

        const id        = rows[0][0].id;
        const username  = rows[0][0].username;
        const email     = rows[0][0].email;
        const user      = {id,username,email};
        console.log('user ', user);
        request.user    = user;
        request.token   = token;
        next();
    } catch (error) {
        console.log(error);
        response.status(401).send(error);
    }
};

module.exports = {authenticate};