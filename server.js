const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

let tareas = [];

app.get("/", (req, res) => {
  res.send("Servidor activo desde Render 🚀");
});

app.post("/agregar", (req, res) => {
  tareas.push(req.body);
  res.send({ status: "ok", tareas });
});

app.get("/tareas", (req, res) => {
  const datos = [...tareas];
  tareas = []; // limpiar para evitar duplicados
  res.send(datos);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor escuchando en el puerto", PORT));
