# Flujo de subida de imagen de perfil a AWS S3

## Por qué las imágenes van a S3 y no a la base de datos

Las bases de datos como Firestore están optimizadas para almacenar texto estructurado: nombres, fechas, IDs, configuraciones. Guardar una imagen directamente en una base de datos implica convertirla a Base64 (aumentando su tamaño un 33 %), penalizar cada lectura del documento aunque no se necesite la imagen, y saturar los límites de tamaño por documento.

AWS S3 es un servicio de almacenamiento de objetos diseñado exactamente para esto: archivos grandes, acceso por URL pública, entrega rápida mediante CDN y coste proporcional al almacenamiento real. El patrón correcto es guardar el archivo en S3 y almacenar únicamente la URL resultante en Firestore.

---

## Qué es una Presigned URL

Una Presigned URL es una URL de S3 firmada criptográficamente por el backend que autoriza una única operación (en este caso, un PUT) sobre un objeto concreto, durante un tiempo limitado (por ejemplo, 5 minutos). Pasado ese tiempo, la URL expira y no puede reutilizarse.

### Por qué es más seguro que subir desde el backend

La alternativa sería que la app enviara la imagen al backend, y que el backend la subiera a S3. Esto tiene dos problemas:

- **La imagen viaja dos veces por la red**: app → backend → S3. Más latencia, más coste de ancho de banda en el servidor.
- **Las credenciales de AWS deben vivir en el servidor**: si el backend sube a S3, necesita la `AWS_SECRET_ACCESS_KEY`. Eso es aceptable siempre que las credenciales nunca salgan del servidor.

Con Presigned URLs el backend genera una URL firmada y se la pasa a la app. La app sube directamente a S3 sin pasar por el backend. El servidor nunca toca los bytes de la imagen, y las credenciales de AWS siguen sin exponerse al cliente. El cliente solo recibe un permiso temporal y acotado para escribir un objeto específico.

---

## Flujo paso a paso

```
Usuario
  │
  ▼
[1] Pulsa "Cambiar foto de perfil"
  │
  ▼
[2] expo-image-picker abre la galería
    El usuario selecciona y recorta la imagen (1:1).
    La app obtiene la URI local del archivo y su tipo MIME.
  │
  ▼
[3] La app pide una Presigned URL al backend
    POST https://noteflow-api-three.vercel.app/api/upload/presigned-url
    Body:    { fileName, fileType }
    Header:  Authorization: Bearer <JWT de Firebase>

    El backend verifica el token JWT con Firebase Admin SDK.
    Si el token es válido, usa el AWS SDK para generar una
    Presigned URL de tipo PUT válida por 5 minutos.
    Devuelve: { signedUrl, publicUrl }
  │
  ▼
[4] La app sube la imagen directamente a S3
    PUT <signedUrl>
    Body:   blob de la imagen
    Header: Content-Type: image/jpeg (o el tipo real del archivo)

    S3 valida la firma de la URL y almacena el objeto.
    No interviene el backend en esta transferencia.
  │
  ▼
[5] La app guarda la URL pública en Firestore
    firestore().collection('users').doc(uid).update({ avatarUrl: publicUrl })

    publicUrl es la URL permanente del objeto en S3, del tipo:
    https://noteflow-avatars-dam.s3.eu-central-1.amazonaws.com/avatars/<uid>/avatar.jpg
  │
  ▼
[6] La imagen se renderiza en pantalla
    El listener onSnapshot de Firestore detecta el cambio en el
    documento del usuario y actualiza el estado de React.
    El componente <Image source={{ uri: avatarUrl }} /> carga
    la imagen directamente desde S3 mediante su URL pública.
```

---

## Por qué se usa el token JWT de Firebase para autenticar la petición al backend

El endpoint `/api/upload/presigned-url` no puede ser público: cualquiera que lo llamara podría generar URLs firmadas y llenar el bucket de S3 con archivos arbitrarios. Es necesario verificar que quien pide la URL es un usuario autenticado de la app.

Firebase emite un JWT (JSON Web Token) firmado por Google cada vez que un usuario inicia sesión. Este token contiene el UID del usuario y tiene una vida corta (1 hora). El backend, usando Firebase Admin SDK, puede verificar la firma del token sin hacer ninguna petición a Firebase: simplemente valida la firma criptográfica con la clave pública de Google.

Si el token es válido, el backend sabe con certeza quién es el usuario y puede:

- Autorizar la generación de la Presigned URL.
- Nombrar el objeto en S3 incluyendo el UID del usuario (`avatars/<uid>/avatar.jpg`), garantizando que cada usuario solo sobreescribe su propio archivo.

Si el token falta o está caducado, el backend devuelve 401 y la subida no se inicia.

Este mecanismo evita añadir un sistema de autenticación propio al backend: Firebase ya lo gestiona, y el JWT es la prueba de identidad que viaja con cada petición.
