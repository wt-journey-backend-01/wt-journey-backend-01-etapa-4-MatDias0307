require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

const authRoutes = require("./routes/authRoutes");
const agentesRoutes = require("./routes/agentesRoutes");
const casosRoutes = require("./routes/casosRoutes");
const authMiddleware = require("./middlewares/authMiddleware");
const setupSwagger = require("./docs/swagger");
const { errorHandler } = require("./utils/errorHandler");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRoutes);

app.use("/agentes", authMiddleware, agentesRoutes);
app.use("/casos", authMiddleware, casosRoutes);

setupSwagger(app);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});