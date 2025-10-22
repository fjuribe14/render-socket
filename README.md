# API REST + Socket.IO con Fastify y tsup

Servidor sencillo que combina una API REST usando Fastify con Socket.IO, compilado y ejecutado con tsup.

## 🚀 Características

- **Fastify**: Framework web rápido y eficiente
- **Socket.IO**: Comunicación en tiempo real bidireccional
- **TypeScript**: Tipado estático para mayor seguridad
- **tsup**: Compilación rápida con recarga en caliente

## 📦 Instalación

```bash
pnpm install
```

## 🔧 Uso

### Desarrollo (con recarga automática)

```bash
pnpm dev
```

### Compilar para producción

```bash
pnpm build
```

### Ejecutar en producción

```bash
pnpm start
```

## 🛠️ API REST

### GET /api/health

Endpoint de salud del servidor.

**Respuesta:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-21T23:17:00.000Z",
  "message": "Servidor funcionando correctamente"
}
```

**Ejemplo:**
```bash
curl http://localhost:3000/api/health
```

### POST /api/emit

Emite un evento a un room específico desde el backend.

**Body:**
```json
{
  "room": "nombre-del-room",
  "event": "nombre-del-evento",
  "data": { "cualquier": "dato" }
}
```

**Respuesta:**
```json
{
  "success": true,
  "room": "orders",
  "event": "order-updated",
  "timestamp": "2025-10-21T23:17:00.000Z"
}
```

**Ejemplo:**
```bash
curl -X POST http://localhost:3000/api/emit \
  -H "Content-Type: application/json" \
  -d '{
    "room": "orders",
    "event": "order-updated",
    "data": { "orderId": 123, "status": "completed" }
  }'
```

## 🔌 Socket.IO

### Sistema de Rooms

#### `subscribe` - Unirse a un room
Suscribe el cliente a un room específico para recibir eventos.

**Ejemplo:**
```javascript
socket.emit('subscribe', 'orders');

socket.on('subscribed', (data) => {
  console.log(data); // { room: "orders", socketId: "..." }
});
```

#### `unsubscribe` - Salir de un room
Desuscribe el cliente de un room.

**Ejemplo:**
```javascript
socket.emit('unsubscribe', 'orders');

socket.on('unsubscribed', (data) => {
  console.log(data); // { room: "orders", socketId: "..." }
});
```

### Eventos tradicionales

#### `message` (cliente → servidor)
Envía un mensaje al servidor y recibe una respuesta.

**Ejemplo cliente:**
```javascript
socket.emit('message', 'Hola servidor');

socket.on('response', (data) => {
  console.log(data);
  // { received: "Hola servidor", timestamp: "...", socketId: "..." }
});
```

#### `broadcast` (cliente → todos los clientes)
Envía un mensaje a todos los clientes conectados.

**Ejemplo cliente:**
```javascript
socket.emit('broadcast', 'Mensaje para todos');

socket.on('broadcast', (data) => {
  console.log(data);
  // { message: "...", from: "socketId", timestamp: "..." }
});
```

## 🧪 Probar Socket.IO

Puedes probar el servidor Socket.IO con este cliente HTML:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Test Socket.IO</title>
  <script src="https://cdn.socket.io/4.7.5/socket.io.min.js"></script>
</head>
<body>
  <h1>Socket.IO Test Client</h1>
  <button onclick="sendMessage()">Enviar Mensaje</button>
  <button onclick="sendBroadcast()">Broadcast</button>
  <div id="messages"></div>

  <script>
    const socket = io('http://localhost:3000');
    
    socket.on('connect', () => {
      console.log('Conectado:', socket.id);
      addMessage('✅ Conectado al servidor');
    });

    socket.on('response', (data) => {
      addMessage('📨 Respuesta: ' + JSON.stringify(data));
    });

    socket.on('broadcast', (data) => {
      addMessage('📢 Broadcast: ' + JSON.stringify(data));
    });

    function sendMessage() {
      socket.emit('message', 'Hola desde el cliente');
    }

    function sendBroadcast() {
      socket.emit('broadcast', 'Mensaje para todos');
    }

    function addMessage(msg) {
      const div = document.getElementById('messages');
      div.innerHTML += '<p>' + msg + '</p>';
    }
  </script>
</body>
</html>
```

## 📝 Variables de entorno

- `PORT`: Puerto del servidor (por defecto: 3000)

## 🪝 Hook para Next.js

Si estás usando Next.js, revisa **[HOOK-README.md](./HOOK-README.md)** para:

- ✅ Hook `useSocketRoomListener` que **previene múltiples conexiones**
- ✅ Patrón singleton para compartir una conexión entre componentes
- ✅ Ejemplos completos de uso en Next.js
- ✅ Sistema de rooms con subscribe/unsubscribe

Archivos incluidos:
- `useSocketRoomListener.ts` - Hook principal
- `example-usage.tsx` - Ejemplos de uso
- `HOOK-README.md` - Documentación completa

## 📄 Licencia

ISC
