# Atelier de Norma · Checklist

Dos etapas: primero **entregar el demo** y después, si se usa de verdad, **lanzar**.
Lo marcado como 🎭 es a propósito para el demo: no se toca hasta el lanzamiento.

---

## Etapa 1 · Demo (para probar y mostrar)

### Se queda así a propósito 🎭
- [x] 🎭 WhatsApp de compras: va a mi número (Gisela), no al de Norma.
- [x] 🎭 PIN del taller: `1234`, y la pantalla lo muestra ("Para probar: 1234").
- [x] 🎭 "Me olvidé la clave" → llamada simulada a Goncy (no llama a nadie).
- [x] 🎭 Fotos del hero y tazas de muestra.

### Ya hecho
- [x] Publicado en Vercel, con datos en Upstash Redis y fotos en Vercel Blob.
- [x] Límite de 5 intentos de PIN y 15 minutos de espera (probado en la web publicada).
- [x] El taller se cierra solo si falta el PIN o el secreto en el servidor.
- [x] Hero en el celular: 2 fotos por fila.
- [x] Animaciones con versión tranquila para "menos movimiento".
- [x] Vista previa de cada taza al compartir el link (foto, nombre y precio): está programada.

### Falta antes de entregar el demo
- [ ] **Elegir el footer** (opción A, B o C) y publicarlo.
- [ ] **Probar la vista previa en WhatsApp de verdad**: mandarse el link de una taza y ver que aparezcan la foto y el precio.
- [ ] **Recorrer el taller entero en la web publicada**: subir una taza con foto del celular, cambiar un precio, marcarla vendida, borrarla.
- [ ] **Probar los avisos al celular** ("Probar aviso" en el taller) en un teléfono real.
- [ ] **Probar en un celular real**, no solo emulado: un iPhone y un Android.
- [x] **Copia de seguridad diaria** de los datos (ver "Cómo volver atrás" abajo).

---

## Etapa 2 · Lanzamiento real (cuando Norma lo use)

### Cambiar lo del demo 🎭 → real
- [ ] WhatsApp: poner el número de Norma (en `src/config.ts`).
- [ ] PIN: elegir uno de Norma y cargarlo en Vercel (`ADMIN_PIN`). Sacar el texto "Para probar: 1234".
- [ ] Secreto de sesión: cambiar `SESSION_SECRET` en Vercel por uno largo y al azar.
- [ ] "Me olvidé la clave": decidir qué pasa de verdad (ej.: un mensaje de WhatsApp real a quien la ayude).
- [ ] Fotos reales de Norma y su taller en el hero; borrar las tazas de muestra.
- [ ] Revisar el alias de transferencia y los textos de "Cómo comprar".

### Que Norma pueda sola
- [ ] **Prueba con Norma, en su celular y sin ayuda**: subir una taza, cambiar un precio, marcar una vendida. Anotar dónde duda.
- [ ] Ajustar lo que la trabe en esa prueba.
- [ ] Dejarle el taller abierto en su celular y el ícono en la pantalla de inicio.

### Datos y seguridad
- [x] Copia de seguridad diaria funcionando (restaurar probado en local).
- [ ] Guardar además una copia fuera de Upstash (hoy las copias viven en el mismo Redis).
- [ ] Evitar que dos cambios al mismo tiempo se pisen (hoy toda la tienda se guarda en un solo bloque).
- [ ] Que al borrar una taza se borre también su foto del almacenamiento.
- [ ] Revisar que el recordatorio automático (corre 1 vez por día a las 10 h) alcance.

### Confianza y ventas
- [ ] Dominio propio (ej.: ateliernorma.com.ar).
- [ ] Medir visitas y toques en "La quiero" (Vercel Analytics).
- [ ] Consultar qué pide la ley argentina para vender online (ej.: botón de arrepentimiento, datos del vendedor).

### Después, si funciona
- [ ] Varias fotos por taza.
- [ ] Formulario para encargos.
- [ ] Avisar "Volvió la taza" a quien preguntó por una sin stock.

---

**Cómo sabemos que salió bien:** Norma sube piezas sola cada semana, le llegan mensajes desde el sitio y nadie tiene que llamar a Goncy de verdad.

---

## Cómo volver atrás (copias de seguridad)

Todos los días a las 10 h se guarda una copia de la tienda entera (tazas, precios, estados).
Quedan las de los últimos 30 días. Las fotos no se copian: siguen en Vercel Blob.

La clave es `CRON_SECRET` (está en Vercel → Settings → Environment Variables).

Ver qué copias hay:

```bash
curl -H "Authorization: Bearer CLAVE" https://atelier-de-norma.vercel.app/api/respaldos
```

Hacer una copia ahora (por ejemplo, antes de un cambio grande):

```bash
curl -H "Authorization: Bearer CLAVE" -X POST -d '{"accion":"respaldar"}' https://atelier-de-norma.vercel.app/api/respaldos
```

Volver la tienda a una fecha:

```bash
curl -H "Authorization: Bearer CLAVE" -X POST -d '{"restaurar":"2026-11-17"}' https://atelier-de-norma.vercel.app/api/respaldos
```

Antes de restaurar, se guarda solo el estado actual como `antes-de-restaurar-…`.
Si restauraste por error, restaurás esa y queda todo como estaba.
