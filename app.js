require("dotenv").config();
const express = require("express");
const fileRoutes = require("./routes/fileRoutes");

const app = express();

app.use(express.json());
app.use("/api/files", fileRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});