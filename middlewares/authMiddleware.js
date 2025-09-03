const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ 
        status: 500, 
        message: "Erro de configuração do servidor" 
      });
    }

    const authHeader = req.headers["authorization"];
    const headerToken = authHeader && authHeader.split(" ")[1];

    const token = headerToken;

    if (!token) {
      return res.status(401).json({ status: 401, message: "Token não fornecido" });
    }

    const usuario = jwt.verify(token, jwtSecret);
    req.user = usuario;

    next();
  } catch (erro) {
    return res.status(401).json({ status: 401, message: "Token Inválido" });
  }
}

module.exports = authMiddleware;