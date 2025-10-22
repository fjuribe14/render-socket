import Fastify from "fastify";
import { config } from "dotenv";
import cors from "@fastify/cors";
import { Server } from "socket.io";

config();
const PORT = process.env.PORT || 3000;

// Crear instancia de Fastify
const fastify = Fastify({
	logger: false,
});

// Registrar CORS
await fastify.register(cors, {
	origin: "*",
});

// Ruta REST de ejemplo
fastify.get("/api/health", async (request, reply) => {
	return {
		status: "ok",
		timestamp: new Date().toISOString(),
		message: "Servidor funcionando correctamente",
	};
});

// Ruta para emitir eventos a un room específico
fastify.post<{
	Body: { room: string; event: string; data: any };
}>("/api/emit", async (request, reply) => {
	const { room, event, data } = request.body;
	
	if (!room || !event) {
		return reply.status(400).send({
			error: "Se requieren los campos 'room' y 'event'",
		});
	}

	// Emitir el evento al room
	io.to(room).emit(event, {
		room,
		data,
		timestamp: new Date().toISOString(),
	});

	console.log(`📤 Evento '${event}' emitido al room '${room}'`);

	return {
		success: true,
		room,
		event,
		timestamp: new Date().toISOString(),
	};
});

// Iniciar servidor y obtener el servidor HTTP nativo
await fastify.listen({ port: Number(PORT), host: "0.0.0.0" });

// Configurar Socket.IO
const io = new Server(fastify.server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
});

// Manejo de conexiones Socket.IO
io.on("connection", (socket) => {
	console.log(`🔌 Cliente conectado: ${socket.id}`);

	// Sistema de Rooms - Subscribe
	socket.on("subscribe", (room: string) => {
		socket.join(room);
		console.log(`📍 Socket ${socket.id} se unió al room: ${room}`);
		socket.emit("subscribed", { room, socketId: socket.id });
	});

	// Sistema de Rooms - Unsubscribe
	socket.on("unsubscribe", (room: string) => {
		socket.leave(room);
		console.log(`📍 Socket ${socket.id} salió del room: ${room}`);
		socket.emit("unsubscribed", { room, socketId: socket.id });
	});

	// Evento de ejemplo: echo
	socket.on("message", (data) => {
		console.log("📨 Mensaje recibido:", data);
		socket.emit("response", {
			received: data,
			timestamp: new Date().toISOString(),
			socketId: socket.id,
		});
	});

	// Evento de broadcast a todos los clientes
	socket.on("broadcast", (data) => {
		console.log("📢 Broadcast:", data);
		io.emit("broadcast", {
			message: data,
			from: socket.id,
			timestamp: new Date().toISOString(),
		});
	});

	// Desconexión
	socket.on("disconnect", () => {
		console.log(`❌ Cliente desconectado: ${socket.id}`);
	});
});

console.log(`🚀 Servidor REST en http://localhost:${PORT}`);
console.log(`🔌 Socket.IO escuchando en ws://localhost:${PORT}`);
