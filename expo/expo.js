import axios from 'axios';

export async function sendPushNotification(expoPushToken, title, body, id) {
  try {
    const message = {
      to: expoPushToken,
      sound: "default",
      title,
      body,
      data: { id },
    };

    const response = await axios.post("https://exp.host/--/api/v2/push/send", message, {
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
    });

    const data = response.data;

    if (Array.isArray(data.data)) {
      return data.data.every(item => item.status === "ok");
    }

    return false;
  } catch (error) {
    console.error("Error enviando notificación:", error);
    if (error.response) {
      console.error("Respuesta del servidor de Expo:", error.response.data);
    } else if (error.request) {
      console.error("No se recibió respuesta del servidor de Expo.");
    } else {
      console.error("Error de configuración de Axios:", error.message);
    }
    return false;
  }
}