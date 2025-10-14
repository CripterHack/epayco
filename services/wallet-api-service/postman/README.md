# EPayco Wallet - Colecciones de Postman

Este directorio contiene todas las colecciones y entornos de Postman para probar y monitorear el ecosistema EPayco Wallet.

## 📁 Archivos Incluidos

### Colecciones
- **`epayco-wallet-api.postman_collection.json`** - Colección principal con todos los endpoints de la API
- **`epayco-wallet-health-checks.postman_collection.json`** - Colección específica para verificaciones de salud

### Entornos
- **`epayco-wallet-local.postman_environment.json`** - Configuración para desarrollo local
- **`epayco-wallet-testing.postman_environment.json`** - Configuración para ambiente de testing/staging
- **`epayco-wallet-production.postman_environment.json`** - Configuración para ambiente de producción

## 🚀 Configuración Inicial

### 1. Importar en Postman
1. Abrir Postman
2. Hacer clic en "Import"
3. Seleccionar todos los archivos `.json` de este directorio
4. Confirmar la importación

### 2. Configurar Entorno
1. Seleccionar el entorno apropiado en el dropdown superior derecho
2. Para desarrollo local, usar "EPayco Wallet - Local Development"
3. Verificar que las URLs base estén correctas

## 📋 Uso de las Colecciones

### Colección Principal (epayco-wallet-api)

Esta colección incluye todos los endpoints principales:

#### Flujo Recomendado de Pruebas
1. **Health Check** - Verificar que la API esté funcionando
2. **Registrar Cliente** - Crear un nuevo cliente
3. **Recargar Billetera** - Añadir fondos a la billetera
4. **Consultar Saldo** - Verificar el saldo actual
5. **Iniciar Pago** - Crear una sesión de pago
6. **Confirmar Pago** - Completar el pago con el token recibido por email

#### Variables Automáticas
- `customerId` - Se actualiza automáticamente al registrar un cliente
- `sessionId` - Se actualiza automáticamente al iniciar un pago
- `currentBalance` - Se actualiza automáticamente al consultar saldo

#### Variables Manuales
- `token6` - Debe actualizarse manualmente con el token recibido por email

### Colección de Health Checks

Esta colección verifica el estado de todos los servicios:
- **API Service Health** - Puerto 3000
- **DB Service Health** - Puerto 3001
- **Frontend Service Health** - Puerto 5173

## 🔧 Configuración de Entornos

### Local Development
```
API: http://localhost:3000/api
DB: http://localhost:3001
Frontend: http://localhost:5173
```

### Testing/Staging
```
API: https://staging-api.epayco-wallet.com/api
DB: https://staging-db.epayco-wallet.com
Frontend: https://staging.epayco-wallet.com
```

### Production
```
API: https://api.epayco-wallet.com/api
DB: https://db.epayco-wallet.com
Frontend: https://epayco-wallet.com
```

## 🧪 Ejecutar Pruebas

### Pruebas Individuales
1. Seleccionar una request
2. Hacer clic en "Send"
3. Verificar la respuesta y los tests automáticos

### Pruebas de Colección Completa
1. Hacer clic en la colección
2. Seleccionar "Run collection"
3. Configurar las opciones de ejecución
4. Hacer clic en "Run EPayco Wallet API"

### Pruebas Automatizadas
Cada endpoint incluye tests automáticos que verifican:
- Códigos de estado HTTP correctos
- Estructura de respuesta esperada
- Validación de datos
- Tiempos de respuesta aceptables

## 📝 Notas Importantes

### Para Confirmación de Pagos
1. Ejecutar "Iniciar Pago" primero
2. Revisar el email configurado para obtener el token de 6 dígitos
3. Actualizar manualmente la variable `token6` en el entorno
4. Ejecutar "Confirmar Pago"

### Para Desarrollo Local
- Asegurarse de que todos los servicios estén ejecutándose:
  - `pnpm start:dev` en wallet-api-service (puerto 3000)
  - `pnpm start:dev` en wallet-db-service (puerto 3001)
  - `pnpm dev` en wallet-frontend (puerto 5173)

### Para Ambientes Remotos
- Actualizar las URLs base en los entornos correspondientes
- Configurar datos de prueba apropiados para cada ambiente
- Verificar conectividad de red y permisos

## 🔍 Troubleshooting

### Error 404 en Health Checks
- Verificar que los servicios estén ejecutándose
- Confirmar los puertos correctos
- Revisar las URLs base en el entorno seleccionado

### Error 400 en Registro de Cliente
- Verificar que todos los campos requeridos estén completos
- Confirmar formato de email válido
- Revisar que el documento no esté ya registrado

### Error 4010 en Confirmación de Pago
- Verificar que el token de 6 dígitos sea correcto
- Confirmar que la sesión de pago no haya expirado
- Revisar el email para obtener el token más reciente

## 📞 Soporte

Para problemas o preguntas sobre las colecciones de Postman:
1. Revisar los logs de los servicios
2. Verificar la configuración del entorno
3. Consultar la documentación de la API
4. Contactar al equipo de desarrollo

---

**Última actualización:** 2025-01-08
**Versión de Postman recomendada:** 10.20.0 o superior