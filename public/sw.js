// Service worker del taller: recibe los avisos y abre el panel al tocarlos.
self.addEventListener("push", (event) => {
  const datos = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(datos.titulo || "Atelier de Norma", {
      body: datos.cuerpo || "",
      icon: "/icono-192.png",
      badge: "/icono-192.png",
      data: { url: datos.url || "/taller" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/taller";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((ventanas) => {
      for (const v of ventanas) if (v.url.includes("/taller")) return v.focus().then(() => v.navigate(url));
      return self.clients.openWindow(url);
    }),
  );
});
