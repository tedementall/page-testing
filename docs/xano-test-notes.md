# Notas de prueba de API (Xano)

Las siguientes peticiones usan las bases configuradas en `.env`:

- **Auth**: `${VITE_XANO_AUTH_BASE}`
- **Core**: `${VITE_XANO_CORE_BASE}`

Reemplaza `{{TOKEN}}`, `{{CART_ID}}`, `{{PRODUCT_ID}}` y otros marcadores según corresponda.

## Autenticación

### Signup

```bash
curl -X POST "${VITE_XANO_AUTH_BASE}/auth/signup" \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Jane Tester",
    "email": "jane@example.com",
    "password": "Secret123"
  }'
```

Respuesta esperada (`201`):

```json
{
  "authToken": "<token>",
  "user": {
    "id": 1,
    "name": "Jane Tester",
    "email": "jane@example.com"
  }
}
```

### Login

```bash
curl -X POST "${VITE_XANO_AUTH_BASE}/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "jane@example.com",
    "password": "Secret123"
  }'
```

Respuesta (`200`): incluye `authToken` utilizable en los headers `Authorization`.

### Auth Me

```bash
curl "${VITE_XANO_AUTH_BASE}/auth/me" \
  -H 'Authorization: Bearer {{TOKEN}}'
```

Devuelve el perfil autenticado.

## Productos

### Listado

```bash
curl "${VITE_XANO_CORE_BASE}/product?limit=12&page=1"
```

Respuesta (`200`): array de productos con campos `id`, `name`, `price`, `category`, `images`, etc.

### Detalle

```bash
curl "${VITE_XANO_CORE_BASE}/product/{{PRODUCT_ID}}"
```

### Relacionados

```bash
curl "${VITE_XANO_CORE_BASE}/product/{{PRODUCT_ID}}/related?n=4"
```

Debe devolver hasta 4 productos, priorizando la misma categoría y completando con aleatorios.

## Carro

### Obtener o crear

```bash
curl -X POST "${VITE_XANO_CORE_BASE}/cart" \
  -H 'Authorization: Bearer {{TOKEN}}'
```

Si hay usuario autenticado, devuelve su carro vigente. La respuesta mínima:

```json
{
  "id": 10,
  "user_id": 1
}
```

### Consultar carro

```bash
curl "${VITE_XANO_CORE_BASE}/cart/{{CART_ID}}" \
  -H 'Authorization: Bearer {{TOKEN}}'
```

Respuesta (`200`):

```json
{
  "id": 10,
  "user_id": 1,
  "items": [
    {
      "id": 25,
      "cart_id": 10,
      "product_id": 5,
      "quantity": 2,
      "product": {
        "id": 5,
        "name": "Auriculares PulseBeat Pro",
        "price": 74990,
        "category": "Audio",
        "stock": 12,
        "images": ["https://.../work2.png"],
        "description": "..."
      }
    }
  ]
}
```

### Agregar item

```bash
curl -X POST "${VITE_XANO_CORE_BASE}/cart_item" \
  -H 'Content-Type: application/json' \
  -d '{
    "cart_id": {{CART_ID}},
    "product_id": {{PRODUCT_ID}},
    "quantity": 1
  }'
```

### Actualizar cantidad

```bash
curl -X PATCH "${VITE_XANO_CORE_BASE}/cart_item/{{CART_ITEM_ID}}" \
  -H 'Content-Type: application/json' \
  -d '{ "quantity": 3 }'
```

### Eliminar item

```bash
curl -X DELETE "${VITE_XANO_CORE_BASE}/cart_item/{{CART_ITEM_ID}}"
```

Errores esperados:

- `400`: cantidad inválida (`quantity <= 0`).
- `403`: el carro no pertenece al usuario autenticado.
- `404`: producto o item inexistente.

## CORS

Asegúrate de habilitar en Xano los métodos `GET, POST, PATCH, DELETE, OPTIONS` para el dominio del frontend definido en la app (por ejemplo `https://thehub.example`).
