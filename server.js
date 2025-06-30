const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// tasks: Almacena las tareas programadas. Mantener esto persistente en memoria para este ejemplo.
// En una aplicación real, usarías una base de datos.
let tareas = [];

// NEW: Objeto para almacenar la configuración del control remoto de la extensión
// En una aplicación real, esto también debería persistirse en una base de datos o archivo.
let remoteControlSettings = {
  onlineControl: true, // Por defecto, el control remoto está activo
  remoteCheckHours: 0,
  remoteCheckMinutes: 5,
  remoteCheckSeconds: 0,
  lowPowerMode: false,
  idleDays: 0,
  idleHours: 0,
  idleMinutes: 30,
  lowPowerCheckHours: 0,
  lowPowerCheckMinutes: 1,
  lowPowerCheckSeconds: 0
};

app.get("/", (req, res) => {
  res.send("Servidor activo desde Render 🚀");
});

// Endpoint para agregar nuevas tareas
app.post("/agregar", (req, res) => {
  const newTask = req.body;
  // Añadir la tarea solo si no existe ya para evitar duplicados en la lista del servidor
  const existingTaskIndex = tareas.findIndex(t => t.id === newTask.id);
  if (existingTaskIndex !== -1) {
    console.log(`[Server] Tarea con ID ${newTask.id} ya existe, actualizando.`);
    // Opcional: actualizar la tarea existente si se reenvía.
    tareas[existingTaskIndex] = newTask;
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

// ENDPOINT: Para eliminar una tarea por su ID
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

// NEW ENDPOINT: Para actualizar la configuración de control remoto
app.post("/remote_settings/update", (req, res) => {
  const updatedSettings = req.body;
  // Fusiona las configuraciones recibidas con las existentes
  Object.assign(remoteControlSettings, updatedSettings);
  console.log("[Server] Configuración de control remoto actualizada:", remoteControlSettings);
  res.send({ status: "ok", settings: remoteControlSettings });
});

// NEW ENDPOINT: Para obtener la configuración de control remoto
app.get("/remote_settings", (req, res) => {
  console.log("[Server] Solicitud de configuración de control remoto. Enviando:", remoteControlSettings);
  res.send(remoteControlSettings);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor escuchando en el puerto", PORT));

