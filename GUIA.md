# NeonData - Guía de Uso

## Descripción General

NeonData es una aplicación web para administrar y analizar bases de datos PostgreSQL. Proporciona una interfaz intuitiva para explorar estructuras de bases de datos, ejecutar consultas SQL, mantener un historial de consultas y crear gráficas de análisis de datos.

## Características

### 1. **Dashboard** (Data Warehouse)
Dashboard orientado a la toma de decisiones con KPIs clave:

**Métricas Principales:**
- **Estado del Sistema**: Verde = BD operativa (indicador en tiempo real con pulso)
- **Total de Tablas**: Número de tablas en la BD
- **Total de Columnas**: Número total de columnas en todas las tablas
- **Total de Registros**: Volumen total de datos en la BD

**Gráficas de Análisis (KPIs):**
Cada gráfica incluye descripción clara sobre para qué sirve:

1. **Casos Atendidos por Enfermedad** - Gráfica de barras
   - Identifica enfermedades prevalentes
   - Útil para asignación de recursos médicos

2. **Tendencia Quirúrgica** - Gráfica de línea (últimos 6 meses)
   - Muestra evolución mensual de cirugías
   - Ayuda a predecir picos de actividad

3. **Segmentación Demográfica** - Gráfica de pastel
   - Distribución de pacientes por género
   - Útil para planificación demográfica

4. **Eficiencia de Recursos** - Gráfica de barras apiladas
   - Ocupación de camas por piso (rojo=ocupadas, verde=disponibles)
   - Optimiza la asignación de recursos hospitalarios

### 2. **Estructura DB**
- Explora todas las tablas de tu base de datos
- Para cada tabla, puedes ver:
  - Lista de columnas con sus tipos de datos
  - Los primeros 5 registros de datos
- Haz clic en una tabla para expandir/contraer los detalles

### 3. **Consola SQL**
- Ejecuta consultas SELECT en tu base de datos
- El editor de consultas te permite escribir SQL personalizado
- Resultados mostrados en formato de tabla
- **Nota**: Solo se permiten consultas SELECT por seguridad
- Cada consulta ejecutada se guarda automáticamente en el historial

### 4. **Historial**
- Visualiza todas las consultas SQL que has ejecutado
- Características:
  - Timestamp de cuándo se ejecutó cada consulta
  - Botón para copiar la consulta al portapapeles
  - Opción para eliminar consultas individuales
  - Botón para limpiar todo el historial
- Los datos del historial se guardan en localStorage del navegador

### 5. **Gráficas** (Visualización Inteligente)
Crea visualizaciones profesionales de tus datos con análisis detallado:

**Proceso Simplificado:**
1. Selecciona una consulta del historial
2. Elige el tipo de gráfica que prefieras
3. ¡La gráfica se genera automáticamente!

**Tipos de Gráficas Disponibles:**
- **Barras**: Compara valores entre categorías
- **Línea**: Muestra tendencias a lo largo del tiempo
- **Pastel**: Visualiza proporciones y distribuciones
- **Área**: Representa magnitudes con áreas rellenas
- **Dispersión**: Identifica correlaciones en datos
- **Radar**: Compara múltiples variables simultáneamente
- **Compuesta**: Combina barras y líneas para análisis profundo
- **Árbol**: Visualiza proporciones relativas jerárquicamente
- **Embudo**: Muestra procesos con etapas decrecientes

**Exportación a PDF:**
- **Botón "Descargar como PDF"**: Disponible debajo de cada gráfica
- El PDF incluye:
  - La gráfica en alta resolución
  - Estadísticas completas: suma, promedio, máximo, mínimo
  - Detalles de cada elemento con porcentajes
  - Interpretación automatizada según el tipo de gráfica
  - Fecha y hora de generación
  - Consulta SQL utilizada

**Manejo Inteligente de Datos:**
- Detecta automáticamente columnas de categoría y numéricas
- Si no hay datos válidos, muestra un mensaje claro indicando qué ajustar
- Ordena automáticamente gráficas de embudo de mayor a menor
- Soporta cualquier número de registros

## Configuración Inicial

### Variables de Entorno Necesarias

Asegúrate de tener configuradas estas variables de entorno en tu proyecto:

```
DB1_HOST=tu_host_postgresql
DB1_USER=tu_usuario
DB1_PASSWORD=tu_contraseña
DB1_NAME=nombre_base_datos
DB1_SSL=true
```

En v0, puedes agregar estas variables en la sección "Vars" de la barra lateral.

## Consejos de Uso y Mejores Prácticas

### Seguridad
- Solo se permiten consultas SELECT
- Las consultas de inserción, actualización o eliminación serán rechazadas automáticamente
- Tu base de datos está protegida en todo momento

### Consultas Efectivas para Gráficas
- Incluye al menos una columna de **texto** (categoría) y una **numérica** (valor)
- Ejemplo: `SELECT enfermedad, COUNT(*) as casos FROM pacientes GROUP BY enfermedad`
- Limita resultados a 100-1000 registros para gráficas claras
- Ordena por categoría o fecha para mejores visualizaciones

### Gráficas Inteligentes
- La detección de columnas es automática
- Elige el tipo de gráfica según tu objetivo:
  - **Tendencias**: Usa Línea
  - **Comparación**: Usa Barras
  - **Proporciones**: Usa Pastel o Árbol
  - **Procesos**: Usa Embudo
  - **Análisis complejo**: Usa Radar o Compuesta

### Exportación a PDF
- Los PDFs incluyen análisis estadístico automático
- Perfectos para reportes ejecutivos y presentaciones
- Cada PDF contiene interpretación de los datos

### Almacenamiento de Historial
- El historial se guarda en localStorage de tu navegador
- Las consultas se guardan automáticamente
- Si borras datos del navegador, perderás el historial
- Descarga PDFs para mantener copias permanentes

### Data Warehouse
- El dashboard está diseñado para la toma de decisiones
- Usa los KPIs para identificar tendencias
- Exporta reportes PDF para presentaciones
- Combina múltiples gráficas para análisis completos
- Frecuencia recomendada: revisa KPIs semanalmente

## Solución de Problemas

### La aplicación no conecta a la BD
- Verifica que las variables de entorno estén configuradas correctamente
- Comprueba que el host, puerto y credenciales sean válidos
- Asegúrate de tener acceso a la base de datos desde tu ubicación
- En v0, revisa la sección "Vars" de la barra lateral

### Las gráficas no se generan - "No se puede generar la gráfica"
**Causa común**: La consulta no devuelve datos válidos
- **Solución**: Verifica que tengas:
  - Al menos UNA columna de texto (nombres, categorías)
  - Al menos UNA columna numérica (números, valores)
- **Ejemplo correcto**: `SELECT nombre, valor FROM tabla`
- **Ejemplo incorrecto**: `SELECT nombre FROM tabla` (solo texto, sin números)
- **Ejemplo incorrecto**: `SELECT numero1, numero2 FROM tabla` (solo números, sin categorías)

### Error al descargar PDF
- Asegúrate de tener una gráfica generada
- Intenta con un navegador moderno (Chrome, Firefox, Edge)
- Verifica que tu navegador permita descargas
- El PDF se genera en tu navegador, no requiere conexión a internet

### El historial está vacío después de actualizar
- El historial se guarda en localStorage del navegador
- Si borraste los datos del navegador, el historial se perdió
- Ejecuta nuevas consultas para construir un nuevo historial
- **Recomendación**: Descarga PDFs importantes para mantener registro permanente

### Gráfica con pocos datos
- Si tienes menos de 5 registros, la gráfica puede parecer vacía
- Intenta con una consulta que devuelva más registros
- Usa LIMIT para ajustar el número de resultados
- Las gráficas funcionan mejor con 5-50 registros
