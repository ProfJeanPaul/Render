const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// NOTA IMPORTANTE: Esta lista 'tareas' se guarda en la memoria del servidor.
// Si el servidor de Render se reinicia (por despliegues, inactividad, etc.),
// esta lista se borrará y las tareas programadas se perderán.
// Para una persistencia real, necesitarías una base de datos (como MongoDB, PostgreSQL, etc.).
let tareas = [];

app.get("/", (req, res) => {
  res.send("Servidor activo desde Render 🚀");
});

app.post("/agregar", (req, res) => {
  const nuevaTarea = req.body;
  tareas.push(nuevaTarea);
  console.log('Tarea agregada en el servidor:', nuevaTarea.id, 'Total:', tareas.length);
  res.send({ status: "ok", tareas });
});

app.get("/tareas", (req, res) => {
  // CORRECCIÓN: NO limpiar 'tareas' aquí.
  // La extensión ahora tiene la lógica para manejar duplicados basándose en los IDs y el estado.
  console.log('Solicitud GET /tareas. Enviando', tareas.length, 'tareas.');
  res.send(tareas);
});

// NUEVO ENDPOINT: Para eliminar una tarea por su ID
app.delete("/eliminar/:id", (req, res) => {
  const taskIdToDelete = req.params.id;
  const initialLength = tareas.length;
  tareas = tareas.filter(tarea => tarea.id !== parseInt(taskIdToDelete)); // Asume que el ID es un número
  
  if (tareas.length < initialLength) {
    console.log('Tarea eliminada del servidor:', taskIdToDelete, 'Restantes:', tareas.length);
    res.status(200).send({ status: "deleted", message: `Tarea ${taskIdToDelete} eliminada.` });
  } else {
    console.log('Intento de eliminar tarea no encontrada en el servidor:', taskIdToDelete, 'Restantes:', tareas.length);
    res.status(404).send({ status: "not_found", message: `Tarea ${taskIdToDelete} no encontrada.` });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor escuchando en el puerto", PORT));
