const bcrypt = require('bcrypt');

module.exports = async (password, saltRounds = 10) => {
    return await bcrypt.hash(password, saltRounds);
}