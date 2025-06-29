const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// tasks: Almacena las tareas programadas. Mantener esto persistente en memoria para este ejemplo.
// En una aplicación real, usarías una base de datos.
let tareas = [];

app.get("/", (req, res) => {
  res.send("Servidor activo desde Render 🚀");
});

// Endpoint para agregar nuevas tareas
app.post("/agregar", (req, res) => {
  const newTask = req.body;
  // Añadir la tarea solo si no existe ya para evitar duplicados en la lista del servidor
  const existingTask = tareas.find(t => t.id === newTask.id);
  if (existingTask) {
    console.log(`[Server] Tarea con ID ${newTask.id} ya existe, actualizando.`);
    // Opcional: actualizar la tarea existente si se reenvía.
    Object.assign(existingTask, newTask);
  } else {
    tareas.push(newTask);
    console.log(`[Server] Tarea agregada: ID ${newTask.id}`);
  }
  res.send({ status: "ok", tareas });
});

// Endpoint para obtener todas las tareas activas
// IMPORTANTE: NO limpiar el array 'tareas' aquí para permitir la persistencia.
app.get("/tareas", (req, res) => {
  console.log(`[Server] Solicitud de tareas. Enviando ${tareas.length} tareas.`);
  res.send(tareas); // Enviar todas las tareas actuales
});

// NUEVO ENDPOINT: Para eliminar una tarea por su ID
app.post("/eliminar", (req, res) => {
  const taskIdToDelete = req.body.id;
  if (!taskIdToDelete) {
    return res.status(400).send({ status: "error", message: "ID de tarea requerido para eliminar." });
  }

  const initialLength = tareas.length;
  // Filtrar el array para remover la tarea con el ID dado
  tareas = tareas.filter(task => task.id !== taskIdToDelete);

  if (tareas.length < initialLength) {
    console.log(`[Server] Tarea con ID ${taskIdToDelete} eliminada.`);
    res.send({ status: "ok", message: `Tarea con ID ${taskIdToDelete} eliminada.` });
  } else {
    console.log(`[Server] Tarea con ID ${taskIdToDelete} no encontrada.`);
    res.status(404).send({ status: "not_found", message: `Tarea con ID ${taskIdToDelete} no encontrada.` });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor escuchando en el puerto", PORT));

