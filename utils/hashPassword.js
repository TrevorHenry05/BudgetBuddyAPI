const bcrypt = require('bcrypt');
const saltRounds = 10;

const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    console.error('Error hashing password', error);
  }
  return null;
};

module.exports = { hashPassword };
