# Diseño: Tests Unitarios (Backend + Frontend)

## Objetivo
Agregar tests **unitarios** para backend (`server.js`) y frontend (`public/script.js`) usando **Vitest** como único runner, sin cambiar comportamiento funcional.

## Alcance
- **Incluye**
  - Backend: validación de URL, normalización, validación de shortCode, generación de shortCode (fallback incluido).
  - Frontend: helpers puros de UI/render y validaciones simples desacopladas del DOM real.
- **No incluye**
  - Tests de integración (DB/HTTP real)
  - Tests E2E (navegador completo)

## Estrategia
1. **Extraer funciones puras** del backend a módulos en `src/utils/`.
2. **Extraer helpers puros** del frontend a `public/js/utils.js`.
3. Usar **Vitest** con:
   - `environment: "node"` para backend
   - `environment: "jsdom"` para frontend
4. Configurar scripts:
   - `npm test`
   - `npm run test:backend`
   - `npm run test:frontend`
   - `npm run test:coverage` (cobertura separada)

## Estructura de archivos
```
/tests
  /backend
    urlValidation.test.js
    shortCode.test.js
    normalizeUrl.test.js
  /frontend
    domHelpers.test.js
    renderFlow.test.js
```

## Cambios mínimos al código
- `server.js`: solo importará funciones desde `src/utils/*`.
- `public/script.js`: solo importará helpers desde `public/js/utils.js`.
- No se modifica el flujo de ejecución ni API.

## Consideraciones
- La cobertura se ejecuta **solo** en `test:coverage`.
- Se evita tocar lógica de Auth0/DB en tests unitarios.

## Criterios de aceptación
- `npm test` corre backend + frontend unitarios.
- No se rompe el comportamiento actual.
- Tests claros y aislados, sin mocks pesados ni DB real.
