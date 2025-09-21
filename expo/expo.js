export async function sendPushNotification(expoPushToken, title, body, id) {
  try {
    const message = {
      to: expoPushToken,
      sound: "default",
      title,
      body,
      data: { id },
    };

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    const data = await response.json();

    if (Array.isArray(data.data)) {
      return data.data.every(item => item.status === "ok");
    }

    return false;
  } catch (error) {
    console.error("Error enviando notificación:", error);
    return false;
  }
}
