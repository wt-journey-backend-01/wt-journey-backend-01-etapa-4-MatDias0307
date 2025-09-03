require("dotenv").config();
const authMiddleware = require("./middlewares/authMiddleware.js");

const express = require("express");
const app = express();
const port = 3000;

const authRoutes = require("./routes/authRoutes.js");
const agentesRoutes = require("./routes/agentesRoutes.js");
const casosRoutes = require("./routes/casosRoutes.js");

const setupSwagger = require("./docs/swagger.js");
const { errorHandler } = require("./utils/errorHandler.js");

app.use(express.json());

app.use(authRoutes);
app.use("/agentes", authMiddleware, agentesRoutes);
app.use("/casos", authMiddleware, casosRoutes);

setupSwagger(app);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`\nServidor do departamento de polícia rodando em http://localhost:${port}`);
});
