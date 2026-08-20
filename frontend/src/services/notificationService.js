let socket = null;

export const connectNotifications = (onMessage) => {
  // Prevent creating multiple connections
  if (
    socket &&
    socket.readyState === WebSocket.OPEN
  ) {
    return socket;
  }

  socket = new WebSocket(
    "ws://localhost:8000/ws/notifications"
  );

  socket.onopen = () => {
    console.log(
      "Notification WebSocket connected"
    );
  };

  socket.onmessage = (event) => {
    try {
      const notification = JSON.parse(
        event.data
      );

      console.log(
        "Notification received:",
        notification
      );

      onMessage(notification);
    } catch (error) {
      console.error(
        "Notification parsing error:",
        error
      );
    }
  };

  socket.onerror = (error) => {
    console.error(
      "Notification WebSocket error:",
      error
    );
  };

  socket.onclose = (event) => {
    console.log(
      "Notification WebSocket disconnected",
      event.code,
      event.reason
    );

    socket = null;
  };

  return socket;
};


export const disconnectNotifications = (
  currentSocket = null
) => {
  const socketToClose =
    currentSocket || socket;

  if (
    socketToClose &&
    socketToClose.readyState !==
      WebSocket.CLOSED &&
    socketToClose.readyState !==
      WebSocket.CLOSING
  ) {
    socketToClose.close();
  }

  if (
    socketToClose === socket
  ) {
    socket = null;
  }
};