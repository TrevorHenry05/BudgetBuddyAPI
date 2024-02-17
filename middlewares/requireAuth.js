const jwt = require("jsonwebtoken");

const requireAuth = (req, res, next) => {
  // Get the token from the Authorization header
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  const token = authorization.split(" ")[1];

  try {
    // Verify the token
    const { userId, isAdmin } = jwt.verify(token, process.env.JWT_SECRET);

    req.user = { _id: userId, isAdmin: isAdmin };

    next();
  } catch (error) {
    return res.status(401).json({ error: "Request is not authorized" });
  }
};

module.exports = requireAuth;
