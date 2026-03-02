# NeonData - Data Warehouse Dashboard

Una aplicación web profesional para gestión, análisis y visualización de bases de datos PostgreSQL. Diseñada como un data warehouse con enfoque en la toma de decisiones a través de KPIs visuales.

## Características Principales

### 1. Dashboard Ejecutivo
- **KPIs en Tiempo Real**: Estado del sistema, tablas, columnas y registros
- **Gráficas de Análisis**: 4 visualizaciones pre-configuradas para decisiones inmediatas
- **Interfaz Intuitiva**: Cada métrica incluye descripción y utilidad
- **Colores Semánticos**: Verde = Bien, Rojo = Ocupado/Acción

### 2. Estructura de BD
- Explora todas las tablas automáticamente
- Visualiza columnas y tipos de datos
- Ve los primeros 5 registros de cada tabla
- Interfaz expandible para una mejor navegación

### 3. Consola SQL
- Editor de consultas SELECT integrado
- Seguridad: solo consultas SELECT permitidas
- Resultados en tabla interactiva
- Historial automático de consultas

### 4. Historial de Consultas
- Todas las consultas SQL guardadas localmente
- Copiar, eliminar o limpiar historial
- Timestamps de ejecución
- Acceso rápido a consultas frecuentes

### 5. Generador de Gráficas Avanzado
- **9 Tipos de Visualizaciones**:
  - Barras (comparación)
  - Línea (tendencias)
  - Pastel (proporciones)
  - Área (magnitudes)
  - Dispersión (correlaciones)
  - Radar (múltiples variables)
  - Compuesta (análisis profundo)
  - Árbol (jerárquico)
  - Embudo (procesos)

- **Exportación Profesional a PDF**:
  - Gráfica en alta resolución
  - Estadísticas: suma, promedio, máximo, mínimo
  - Porcentajes de cada elemento
  - Interpretación automatizada
  - Listo para presentaciones ejecutivas

- **Detección Automática**: Identifica columnas de categoría y numéricas
- **Manejo de Errores**: Mensajes claros si los datos no son válidos

## Instalación y Configuración

### Requisitos
- Node.js 18+
- PostgreSQL (local o remoto)

### Variables de Entorno

Configura estas variables en v0 (sección "Vars"):

```env
DB1_HOST=tu_host_postgresql
DB1_USER=tu_usuario
DB1_PASSWORD=tu_contraseña
DB1_NAME=tu_base_datos
DB1_SSL=true
```

### Instalación
```bash
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## Uso Rápido

### Dashboard
1. Accede a la página principal
2. Visualiza KPIs clave de tu BD
3. Usa el botón "Nueva Consulta" para explorar datos

### Crear Gráfica
1. Vaya a "Consola SQL" y ejecute una consulta
2. Vaya a "Gráficas" 
3. Seleccione la consulta del historial
4. Elige el tipo de gráfica
5. Descargue como PDF con análisis completo

### Ejemplo de Consulta Óptima
```sql
SELECT 
  enfermedad,
  COUNT(*) as casos
FROM pacientes
WHERE año = 2024
GROUP BY enfermedad
ORDER BY casos DESC
LIMIT 20
```

## Arquitectura

### Frontend
- React 19.2 con Next.js 16
- Recharts para gráficas
- Tailwind CSS para estilos
- ShadcnUI para componentes

### Backend
- Next.js API Routes (serverless)
- PostgreSQL con cliente `pg`
- Validación de consultas SQL

### Seguridad
- Solo consultas SELECT permitidas
- Conexión SSL/TLS a BD
- Variables de entorno para credenciales
- Validación en servidor

## Funcionalidades Avanzadas

### Exportación PDF
Cada gráfica puede descargarse como PDF que incluye:
- Imagen de la gráfica
- Estadísticas computadas
- Tabla de detalles
- Interpretación del tipo de gráfica

### Historial Persistente
- Almacenado en localStorage del navegador
- Sincronización automática
- Accesible desde cualquier dispositivo (con el mismo navegador)

### Inteligencia en Gráficas
- Detecta automáticamente qué columnas graficar
- Ordena datos de embudo automáticamente
- Maneja valores numéricos y texto
- Previene errores con mensajes claros

## Ejemplos de Casos de Uso

### Hospital / Salud
- Casos por enfermedad
- Tendencia de cirugías
- Ocupación de camas
- Distribución demográfica de pacientes

### E-commerce
- Ventas por categoría
- Tendencia mensual
- Distribución de clientes
- Tasa de conversión

### Finanzas
- Ingresos por departamento
- Tendencia de inversión
- Distribución de gastos
- ROI por proyecto

## Archivo de Configuración

Ver `GUIA.md` para:
- Guía completa de uso
- Tips y mejores prácticas
- Solución de problemas
- Recomendaciones de data warehouse

## Dependencias Principales

```json
{
  "next": "16.1.6",
  "react": "19.2.4",
  "recharts": "2.15.0",
  "pg": "^8.11.3",
  "html2canvas": "^1.4.1",
  "jspdf": "^2.5.1",
  "lucide-react": "^0.564.0"
}
```

## Soporte

Para problemas comunes:
1. Verifica variables de entorno
2. Consulta `GUIA.md` en la sección "Solución de Problemas"
3. Asegúrate de que la BD esté accesible
4. Revisa que las consultas sean válidas SELECT

## Roadmap

- [ ] Exportación a Excel
- [ ] Alertas de anomalías
- [ ] Predicción con ML
- [ ] Colaboración en tiempo real
- [ ] Dashboards personalizados

## Licencia

MIT - Libre para uso comercial y personal

---

**Desarrollado con ❤️ para data warehouse moderno**
