const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');

const generateHash = async (password) => {
    try {
        const salt = await bcrypt.genSalt(10);
        console.log('salt=',salt);
        const hash = await bcrypt.hash(password,salt);
        console.log('hash=',hash);
        return hash;
    } catch (error) {
        throw "Unable to salt and hash password!";
    }
};

const secret = 'secret';

const generateAuthToken = (id,access) => {
    const token = jwt.sign({id,access},secret).toString();
    console.log('token= ',token);
    return token;
};

const verifyAuthToken = (token) => {
    var decoded = jwt.verify(token,secret);
    console.log('decoded = ',decoded);
    return decoded;
};

module.exports = {generateHash,generateAuthToken,verifyAuthToken};
