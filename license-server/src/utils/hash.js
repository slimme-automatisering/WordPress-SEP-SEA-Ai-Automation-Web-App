const argon2 = require('argon2');

/**
 * Hash een wachtwoord met Argon2
 * @param {string} password - Het wachtwoord om te hashen
 * @returns {Promise<string>} De gehashte waarde
 */
async function hashPassword(password) {
  try {
    return await argon2.hash(password);
  } catch (error) {
    throw new Error('Fout bij het hashen van wachtwoord');
  }
}

/**
 * Verifieer een wachtwoord tegen een hash
 * @param {string} hash - De gehashte waarde
 * @param {string} password - Het wachtwoord om te verifiëren
 * @returns {Promise<boolean>} True als het wachtwoord correct is
 */
async function verifyPassword(hash, password) {
  try {
    return await argon2.verify(hash, password);
  } catch (error) {
    throw new Error('Fout bij het verifiëren van wachtwoord');
  }
}

module.exports = {
  hashPassword,
  verifyPassword
};
