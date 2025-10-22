# 🪝 Hook de Socket.IO para Next.js

Solución al problema de **múltiples conexiones** en el hook `useSocketRoomListener`.

## 🔧 Problema Original

Tu hook original creaba una nueva conexión Socket.IO en cada render porque:
1. `useMemo` no es suficiente para mantener una instancia singleton del socket
2. El cleanup desconectaba el socket en cada re-render
3. Cada componente creaba su propia instancia del socket

## ✅ Solución

El nuevo hook usa un **patrón singleton** que mantiene una única instancia del socket por URL:

### Características principales:

- ✅ **Una sola conexión** por URL (compartida entre todos los componentes)
- ✅ **Subscribe/Unsubscribe** a rooms sin desconectar
- ✅ **Auto-reconexión** configurada
- ✅ **Cleanup inteligente** que solo desuscribe del room
- ✅ **Refs** para evitar re-renders innecesarios

## 📦 Instalación

1. Copia `useSocketRoomListener.ts` a tu proyecto Next.js:
   ```bash
   cp useSocketRoomListener.ts tu-proyecto/hooks/
   ```

2. Asegúrate de tener las dependencias:
   ```bash
   npm install socket.io-client
   # o
   pnpm add socket.io-client
   ```

## 🚀 Uso

### Ejemplo básico

```tsx
import { useSocketRoomListener } from '@/hooks/useSocketRoomListener';

function MyComponent() {
  const [data, setData] = useState(null);

  useSocketRoomListener({
    room: 'orders',
    event: 'order-updated',
    setData,
  });

  return <div>{JSON.stringify(data)}</div>;
}
```

### Múltiples rooms (misma conexión)

```tsx
function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Ambos usan la misma conexión socket
  useSocketRoomListener({
    room: 'orders',
    event: 'order-updated',
    setData: setOrders,
  });

  useSocketRoomListener({
    room: 'notifications',
    event: 'notification',
    setData: setNotifications,
  });

  return (
    <div>
      <div>Órdenes: {orders.length}</div>
      <div>Notificaciones: {notifications.length}</div>
    </div>
  );
}
```

### Deshabilitación condicional

```tsx
function UserProfile({ userId }: { userId: string | null }) {
  const [profile, setProfile] = useState(null);

  // Solo se conecta si hay userId
  useSocketRoomListener({
    room: `user-${userId}`,
    event: 'profile-updated',
    setData: setProfile,
    disable: !userId, // 👈 Deshabilita la suscripción
  });

  return <div>{JSON.stringify(profile)}</div>;
}
```

### Hook de estado de conexión

```tsx
import { useSocketConnection } from '@/hooks/useSocketRoomListener';

function ConnectionStatus() {
  const isConnected = useSocketConnection();

  return (
    <div>
      {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
    </div>
  );
}
```

### Desconectar al hacer logout

```tsx
import { disconnectAllSockets } from '@/hooks/useSocketRoomListener';

function LogoutButton() {
  const handleLogout = () => {
    disconnectAllSockets(); // 👈 Limpia todas las conexiones
    // ... resto del logout
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

## 🔌 Servidor

El servidor ahora soporta:

### 1. Subscribe a rooms
```javascript
socket.emit('subscribe', 'room-name');
```

### 2. Unsubscribe de rooms
```javascript
socket.emit('unsubscribe', 'room-name');
```

### 3. Emitir eventos desde REST API

```bash
curl -X POST http://localhost:3000/api/emit \
  -H "Content-Type: application/json" \
  -d '{
    "room": "orders",
    "event": "order-updated",
    "data": { "orderId": 123, "status": "completed" }
  }'
```

## 📝 Variables de entorno

Asegúrate de tener configurada la URL de tu API en `.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_NODE_ENV=development
```

## 🔍 Diferencias con el hook original

| Aspecto | Hook Original | Hook Mejorado |
|---------|--------------|---------------|
| Conexiones por componente | ❌ Nueva por cada uso | ✅ Una compartida (singleton) |
| Cleanup | ❌ Desconecta el socket | ✅ Solo desuscribe del room |
| Re-renders | ❌ Puede causar múltiples | ✅ Usa refs para evitarlos |
| Reconexión | ❌ No configurada | ✅ Automática con retry |
| Estado de conexión | ❌ No disponible | ✅ Hook separado |

## 🧪 Probar

1. Inicia el servidor:
   ```bash
   pnpm dev
   ```

2. En tu app Next.js, usa el hook

3. Verifica en las DevTools → Network → WS que solo hay **una conexión WebSocket**

4. Prueba emitir eventos desde la API:
   ```bash
   curl -X POST http://localhost:3000/api/emit \
     -H "Content-Type: application/json" \
     -d '{"room":"test","event":"test-event","data":{"hello":"world"}}'
   ```

## 🐛 Debugging

Activa los logs en desarrollo:
```env
NEXT_PUBLIC_NODE_ENV=development
```

Verás mensajes como:
- `📡 Subscribed to room: orders`
- `📡 Unsubscribed from room: orders`
- `📦 Event 'order-updated' received for orders: {...}`

## 💡 Tips

1. **No desconectes el socket manualmente** a menos que sea logout o unmount completo
2. **Usa `disable`** para control condicional, no desmontes el componente
3. **El singleton es por URL**, si usas múltiples APIs necesitas diferentes instancias
4. **Los rooms son la clave**, permite múltiples suscripciones sin múltiples conexiones

## 📚 Ver ejemplos completos

Revisa `example-usage.tsx` para ver casos de uso más avanzados.
