const jwt = require("jsonwebtoken");

/**
 * Genereert een JWT token voor een licentie
 */
function generateToken(license) {
  return jwt.sign(
    {
      id: license.id,
      type: license.type,
      features: license.features,
    },
    process.env.JWT_SECRET,
    { expiresIn: "24h" },
  );
}

module.exports = {
  generateToken,
};
