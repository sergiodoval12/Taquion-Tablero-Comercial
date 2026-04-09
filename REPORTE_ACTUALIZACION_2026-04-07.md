# Reporte de Actualización — Tablero Comercial Taquion
**Fecha:** 7 de abril de 2026
**Estado:** ⚠️ ACTUALIZACIÓN NO REALIZADA — Datos incompletos

---

## Resumen Ejecutivo

La tarea programada de actualización del tablero comercial (`index.html`) **no pudo completarse** porque el conector de Notion disponible (búsqueda semántica) no permite extraer datos completos de las bases de datos Forecast y Funnel/Oportunidades. Los datos extraídos son severamente incompletos en comparación con lo que ya contiene el dashboard, por lo que **no se sobreescribió el archivo** para evitar pérdida de información.

---

## Diagnóstico Técnico

### Limitación del conector Notion
El MCP de Notion disponible ofrece **búsqueda semántica** (máx. 25 resultados por consulta), pero **no soporta queries con filtros por propiedades** (ej: filtrar por "Año Facturación" = "2026" AND "Tipo" = "Real"). Esto hace imposible extraer el dataset completo de facturación.

### Base de datos Forecast (`collection://43f5c1d6-5c6e-464f-8aed-27d4d5c4b9eb`)
- **Registros encontrados:** ~40 páginas únicas (de probablemente 200+ registros)
- **Problema:** Todos los registros se titulan "FACTURACIÓN", por lo que la búsqueda semántica no puede diferenciarlos por mes, tipo o año
- **Datos parciales 2026 Real extraídos:**
  - Enero–Marzo: 0 registros encontrados (el dashboard actual muestra $168M, $137M, $228M)
  - Abril: $44.98M (vs. $169.88M en dashboard actual)
  - Mayo–Diciembre: datos parciales, claramente incompletos
- **Datos 2026 Target:** 0 registros encontrados
- **Datos 2026 Costos:** 0 registros encontrados
- **Datos 2025 Real:** solo 2 registros encontrados (Nov: $9.5M)

### Base de datos Funnel (`collection://905f0e56-021d-4976-9e1c-8c73c2f1b4b3`)
- **Won encontrados:** 4 oportunidades (vs. 25 cuentas activas en dashboard actual)
- **Pipeline encontrado:** ~7 oportunidades (vs. 10 en dashboard actual)
- **Datos claramente incompletos** para actualizar el funnel o las cuentas activas

---

## Datos Parciales Extraídos (para referencia)

### Nuevas oportunidades Won detectadas (no estaban en el dashboard anterior)
| Oportunidad | $ Total Estimado | Tipo |
|---|---|---|
| Upselling+ San Luis 2026 | $233M ARS | Recurrente |
| Upselling + Enfoque Federal | $330M ARS | Recurrente |

### Pipeline activo detectado
| Oportunidad | Estado | $ Total Estimado |
|---|---|---|
| Comunidad AI + GCBA | Upside | $150M ARS |
| Estrategia + Restart | Upside | $150M ARS |
| Pet Food Saladillo | Upside | $100M ARS |
| Social Listening + LOTBA | Forecast | $150M ARS |
| Investigacion + Partido Politico | Upside | $10M ARS |
| Talk About + IPlan | Lead | $0 (sin valorizar) |

---

## Recomendación

Para que la actualización automática funcione, se necesita **una de estas soluciones:**

1. **Exportar datos desde Notion manualmente** — Exportar las vistas filtradas de Forecast y Funnel como CSV, y procesarlas con un script
2. **Usar la API de Notion directamente** — Crear un MCP server custom que use la API de Notion con filtros de database query (no búsqueda semántica)
3. **Actualizar el skill** — Modificar la tarea programada para usar un método de extracción que soporte filtros por propiedades

---

## Estado del Dashboard Actual
El archivo `index.html` **no fue modificado**. Mantiene los datos de la última actualización manual (Abril 2026) con:
- 25 cuentas activas
- Revenue mensual Ene–Dic con datos reales de Q1 y proyecciones Q2–Q4
- Pipeline Q2 con 10 oportunidades
- Target anual: $4,200M ARS
