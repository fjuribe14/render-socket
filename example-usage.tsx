import React from 'react';
import { useSocketRoomListener, useSocketConnection, disconnectAllSockets } from './useSocketRoomListener';

// Ejemplo 1: Uso básico con un solo room
function OrdersComponent() {
  const [orders, setOrders] = React.useState<any[]>([]);
  const isConnected = useSocketConnection();

  // El hook maneja la conexión y suscripción automáticamente
  useSocketRoomListener({
    room: 'orders',
    event: 'order-updated',
    setData: setOrders,
  });

  return (
    <div>
      <div>Estado: {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}</div>
      <h2>Órdenes</h2>
      <ul>
        {orders.map((order, i) => (
          <li key={i}>{JSON.stringify(order)}</li>
        ))}
      </ul>
    </div>
  );
}

// Ejemplo 2: Múltiples rooms en el mismo componente
function DashboardComponent() {
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [messages, setMessages] = React.useState<any[]>([]);
  const [stats, setStats] = React.useState<any>(null);

  // Todos comparten la misma conexión socket (singleton)
  useSocketRoomListener({
    room: 'notifications',
    event: 'notification',
    setData: setNotifications,
  });

  useSocketRoomListener({
    room: 'messages',
    event: 'message',
    setData: setMessages,
  });

  useSocketRoomListener({
    room: 'stats',
    event: 'stats-update',
    setData: setStats,
  });

  return (
    <div>
      <h2>Dashboard</h2>
      <div>Notificaciones: {notifications.length}</div>
      <div>Mensajes: {messages.length}</div>
      <div>Stats: {JSON.stringify(stats)}</div>
    </div>
  );
}

// Ejemplo 3: Deshabilitación condicional
function ConditionalComponent({ userId }: { userId: string | null }) {
  const [userData, setUserData] = React.useState(null);

  // Solo se conecta si hay userId
  useSocketRoomListener({
    room: `user-${userId}`,
    event: 'user-data',
    setData: setUserData,
    disable: !userId, // Se deshabilita si no hay userId
  });

  if (!userId) return <div>No user selected</div>;

  return (
    <div>
      <h2>User Data</h2>
      <pre>{JSON.stringify(userData, null, 2)}</pre>
    </div>
  );
}

// Ejemplo 4: Desconexión al hacer logout
function AppLayout({ children }: { children: React.ReactNode }) {
  const handleLogout = () => {
    // Limpiar todas las conexiones socket
    disconnectAllSockets();
    // ... resto de la lógica de logout
  };

  return (
    <div>
      <header>
        <button onClick={handleLogout}>Logout</button>
      </header>
      <main>{children}</main>
    </div>
  );
}

// Ejemplo 5: Acceso directo al socket (opcional)
function AdvancedComponent() {
  const [data, setData] = React.useState(null);

  // El hook retorna la instancia del socket
  const socket = useSocketRoomListener({
    room: 'advanced',
    event: 'data',
    setData,
  });

  const sendMessage = () => {
    // Enviar mensajes directamente al socket si es necesario
    socket?.emit('custom-event', { message: 'Hello' });
  };

  return (
    <div>
      <button onClick={sendMessage}>Enviar Mensaje</button>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export { OrdersComponent, DashboardComponent, ConditionalComponent, AppLayout, AdvancedComponent };
