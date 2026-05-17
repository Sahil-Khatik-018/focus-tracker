const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  // 1. Header se token nikalna
  const token = req.header("Authorization")?.split(" ")[1];

  if(!token)
    return res.status(401).json({ message: "No token, authorization denied" });

  try {
    // 2. verify the token
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    // Example: decoded = { id: "101", name: "Sahil" }

    // 3. Put User id in request object to use in future
    req.user = decode;
    // We will create "user" name property in request object
    
    next(); // "Next" matlab Guard ne jane diya, ab main function chalega
  } catch(err) {
    res.status(401).json({ message: "Token is not valid" });
  }
}

module.exports = auth;