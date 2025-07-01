const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// tasks: Almacena las tareas programadas. Mantener esto persistente en memoria para este ejemplo.
// En una aplicación real, usarías una base de datos.
let tareas = [];

// Objeto para almacenar la configuración del control remoto de la extensión
// NEW: Añadir useRemoteConfigForExtension
let remoteControlSettings = {
  onlineControl: true, // Por defecto, el control remoto está activo
  useRemoteConfigForExtension: false, // NEW: Por defecto, la extensión usará su configuración local
  remoteCheckHours: 0,
  remoteCheckMinutes: 5,
  remoteCheckSeconds: 0,
  lowPowerMode: false,
  idleDays: 0,
  idleHours: 0,
  idleMinutes: 30,
  lowPowerCheckHours: 0,
  lowPowerCheckMinutes: 1,
  lowPowerCheckSeconds: 0,
  shutdownTriggeredByForm: false // NEW: Variable para indicar si el apagado fue iniciado desde el formulario
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
app.get("/tareas", (req, res) => {
  console.log(`[Server] Solicitud de tareas. Enviando ${tareas.length} tareas.`);
  res.send(tareas);
});

// ENDPOINT: Para eliminar una tarea por su ID
app.post("/eliminar", (req, res) => {
  const taskIdToDelete = req.body.id;
  if (!taskIdToDelete) {
    return res.status(400).send({ status: "error", message: "ID de tarea requerido para eliminar." });
  }

  const initialLength = tareas.length;
  tareas = tareas.filter(task => task.id !== taskIdToDelete);

  if (tareas.length < initialLength) {
    console.log(`[Server] Tarea con ID ${taskIdToDelete} eliminada.`);
    res.send({ status: "ok", message: `Tarea con ID ${taskIdToDelete} eliminada.` });
  } else {
    console.log(`[Server] Tarea con ID ${taskIdToDelete} no encontrada.`);
    res.status(404).send({ status: "not_found", message: `Tarea con ID ${taskIdToDelete} no encontrada.` });
  }
});

// ENDPOINT: Para actualizar la configuración de control remoto
app.post("/remote_settings/update", (req, res) => {
  const updatedSettings = req.body;

  // Fusiona las configuraciones recibidas con las existentes
  // Asegúrate de que shutdownTriggeredByForm se actualice solo si está presente en updatedSettings
  Object.assign(remoteControlSettings, updatedSettings);

  // Si shutdownTriggeredByForm no está presente en updatedSettings, asegúrate de que se restablezca a false
  // Esto es importante para que la señal no persista si no se envía explícitamente.
  if (updatedSettings.shutdownTriggeredByForm === undefined) {
      remoteControlSettings.shutdownTriggeredByForm = false;
  }

  console.log("[Server] Configuración de control remoto actualizada:", remoteControlSettings);
  res.send({ status: "ok", settings: remoteControlSettings });
});

// ENDPOINT: Para obtener la configuración de control remoto
app.get("/remote_settings", (req, res) => {
  console.log("[Server] Solicitud de configuración de control remoto. Enviando:", remoteControlSettings);
  res.send(remoteControlSettings);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor escuchando en el puerto", PORT));
