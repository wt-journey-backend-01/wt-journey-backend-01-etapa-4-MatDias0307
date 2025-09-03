require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = process.env.PORT || 3000;

const authRoutes = require("./routes/authRoutes");
const agentesRoutes = require("./routes/agentesRoutes");
const casosRoutes = require("./routes/casosRoutes");
const authMiddleware = require("./middlewares/authMiddleware");
const setupSwagger = require("./docs/swagger");
const { errorHandler } = require("./utils/errorHandler");

app.use(express.json());
app.use(cookieParser());

app.use("/agentes", authMiddleware, agentesRoutes);
app.use("/casos", authMiddleware, casosRoutes);
app.use('/auth', authRoutes);

setupSwagger(app);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Servidor do Departamento de Polícia rodando em http://localhost:${PORT}.`);
});