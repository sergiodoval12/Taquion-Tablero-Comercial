# Observaciones Reunión Funnel & Forecast — 27 Abril 2026

**Participantes**: Sergio Doval, Martin Villanueva (+ mención a Diego, Santiago Estrada/CFO)

---

## A. TABLERO FINANCIERO — Pedidos para Santiago (CFO)

### A1. Vista de Forecast/Commit mes a mes (NUEVO — pedido principal)

Santiago necesita ver la distribución mensual del ingreso proyectado, separado en 3 capas:

| Capa | Qué representa | Ponderación |
|------|---------------|-------------|
| **Commit** | Deals prácticamente cerrados, falta firma/PO | 90% |
| **Forecast** | Deals avanzados, el cliente quiere pero hay variables | 75% |
| **Upside** | Potencial real pero lejos de cierre | 40% |

**Implementación sugerida**: Debajo de la pantalla principal del dashboard financiero, agregar una sección con:
- Chart de barras apiladas mes a mes (Ene-Dic 2026) con las 3 capas + Won
- Tabla con los montos por mes por capa
- Total ponderado por mes = Won×100% + Commit×90% + Forecast×75% + Upside×40%

**Por qué lo necesita Santi**: Para proyectar cashflow. Hoy solo ve el Won (real) pero no sabe cuánto viene en los próximos meses como proyectado. Necesita la distribución por mes del commit y forecast para planificar pagos, nómina, y deuda.

> "Esto es un pedido que necesito que ahora o vos generes, te lo pido a vos, le puedo hablar directamente a ella... la distribución por mes del commit, forecast y pipeline, para que él le sirve como proyección para el tablero financiero." — Sergio (00:07:55)

### A2. Separar Won de Facturado

- Los $511M de Q1 son **facturados**, no solo ganados
- Hay clientes ganados en 2024 que siguen corriendo y facturando en 2026 — esos cuentan como Won corriendo
- Para el financiero importa separar: (a) lo que se ganó este año vs (b) lo que se está facturando (incluye arrastres)

> "Los 511 creo que son facturados... ya en el CR no es todo ganado, es proyectado." — Martin (00:16:41)

### A3. Contratos con gatillos de cobro

- Un contrato cerrado de $200M puede tener gatillos de cobro por etapa (delivery aceptado o por defecto temporal)
- La cámara de medio pago, por ejemplo: medio pago + potencial contrato → decidir si se divide en 3 tarjetas o no
- Impacta cómo se carga el revenue mensual en el forecast

### A4. Pauta de medios = ítem separado

- La inversión en medios (pauta) es aparte del fee de Taquion
- El cliente paga directo al medio desde su propio Business Manager
- Taquion cobra un fee por gestión (a partir de $10M de pauta: 5% de la inversión)
- Esto NO debe sumarse al revenue de servicios de Taquion

---

## B. TABLERO COMERCIAL — Observaciones de diseño y operativas

### B1. Limpiar oportunidades viejas/stale

- Hay tarjetas en Notion muy viejas que siguen apareciendo en el pipeline
- Antes de cualquier análisis: actualizar tarjetas perdidas, dar de baja las que corresponda
- Si una oportunidad estaba en Pipeline desde octubre 2024 y no avanzó → eliminarla o moverla a Lost/Nurturing

> "Antes hay que actualizar las tarjetas, de hay que ponerlas perdidas, toma todo." — Martin (00:00:00)

### B2. Extender a 18 meses rolling (incluir 2027)

- Sugerencia de Diego: en lugar de ver solo los 4 quarters del año, tomar 18 meses para ya ver un poco del 2027
- Útil como driver de expectativa de crecimiento
- Los proyectos que cortan en mayo/junio 2027 ya empiezan a ser relevantes

### B3. Target anual verificado: $4,200M ARS

- Desglose: Q1 $511M (real) + Q2 $850M + Q3 $1,280M + Q4 $1,580M = ~$4,221M
- El % de cumplimiento por Q se calcula automáticamente contra este target
- Q1 real = 79%, Q2 actual = 74% → se va despegando a futuro

### B4. Recuperación ponderada en el Q

- La recuperación (lo que falta) se tira homogéneamente como ponderada en el Q
- Si te perdiste algo, se distribuye proporcionalmente en lo que queda del quarter, no se acumula todo en un mes

### B5. Asignación de Business Owners a verticales

| Persona | Vertical |
|---------|----------|
| Mariana | Consumo masivo |
| Ciro | Real estate / Urbanismo |
| Pablo | Banking / Vintage |
| Diego | En tratativas (no cerrado aún) |

> "Mariana en consumo masivo. Ciro en real estate urbanismo. Pablo está asignado en Banking Vintage." — Sergio (00:04:48)

### B6. Referrals como usuarios de Notion

- Cada referral que entra firma un acuerdo y se levanta como usuario de Notion (como los otros usuarios)
- Referral = tipo externo que trae networking/leads de una vertical
- No necesariamente de una sola vertical
- Win rate de referrals: ~95%

### B7. Notion como Source of Truth (dudas)

- Sergio no sabe cuánto va a durar Notion como SOT
- Si no tienen claro dónde está la información y con respecto a quién → problema
- Necesitan el seguimiento para poder rastrear qué pasa con cada oportunidad

### B8. Despliegue de AMs (Account Managers)

- Necesitan ver qué están haciendo los AMs: por si están laburando en upselling o si creen que hay una oportunidad
- Vista tipo despliegue de recursos para el segmento comercial

> "AM, ¿no? Necesitamos que haya un despliegue y ver lo que están trabajando." — Martin (00:17:52)

### B9. Pipeline Velocity — Dos métricas clave

1. **Velocity de etapas**: Cuánto tarda un deal en moverse entre Pipeline → Upside → Forecast → Commit → Won. Hoy está al 100% (nadie lo mira).
2. **Tasa de conversión**: De X oportunidades generadas, ¿cuántas se convierten en Won? Meta: medir por comercial y total.

> "Lo que yo me di ahí es Pipeline Velocity en relación a cuánto tarda de pasar de upside, de pipeline a upside para tener la cotización." — Sergio (00:20:26)

- El tiempo es variable (un comercial puede tardar 2 años en cerrar un lead)
- Lo importante es: volumen de propuestas activas × tasa de conversión = deals ganados esperados

### B10. Conversión por comercial

- Si un referral trae leads → win rate 95%
- Si un comercial abre y cierra → ¿cuál es la tasa?
- Sergio quiere saber: dado el volumen de propuestas laeling (en curso), ¿cuál hace más o menos que el promedio?
- Relación porcentual entre oportunidades generadas y ganadas, no solo el número absoluto

### B11. Business Intelligence auto-genera propuestas

- Si el BI dispara una propuesta → se carga como oportunidad en el pipeline automáticamente
- Taquion Brain guarda cada propuesta que se hace
- Propuestas generadas proactivamente (sin pedido del cliente) también se registran

### B12. Cotizador (herramienta en construcción)

- Se está armando un cotizador que cualquiera va a poder ejecutar
- Basado en los 5 modelos de producto (Strategic Landing, Growth Engine, Talk About, Comunidad Plus Market, Comunidad Plus Industria)
- Cada modelo tiene servicios en Entender/Pensar/Hacer con inicio en meses definidos
- El cotizador tiene: servicios profesionales, marca de prueba integrado, marca pauta, overhead de 35 puntos, presupuesto de modelo comercial, costo financiero, logística
- Distribución por servicio: cuánto vale cada uno, por cada mes
- Margen objetivo: 30% mínimo, ajustable hasta 60%
- El overhead está ponderado por recurso y producto

### B13. Tres perspectivas del cliente que hay que integrar

1. **Comercial** (Notion Funnel) — pipeline, deals, etapas
2. **Cuentas** (Notion con rollups) — vista operativa, AMs
3. **Administrativa** (Excel) — facturación, contable

> "Nosotros estamos mirando al cliente con tres perspectivas distintas... tenemos que integrar todo en un journey de cliente punta a punta." — Sergio (00:34:01)

### B14. Revenue: separar ganado de facturado de proyectado

- **Ganado (Won)**: deals que se cerraron, con WON DATE
- **Facturado**: lo que efectivamente se cobró/facturó (puede incluir deals won en años anteriores que siguen corriendo)
- **Proyectado**: ponderación del pipeline activo (Commit×90% + Forecast×75% + Upside×40%)

---

## C. ACCIONES CONCRETAS PARA IMPLEMENTAR

### Para el tablero financiero (prioridad Santi):

1. **Agregar sección "Proyección Mensual"** debajo de la pantalla principal:
   - Barras apiladas: Won + Commit + Forecast + Upside por mes
   - Tabla con montos y total ponderado
   - Fuente: FORECAST DB de Notion, filtrado por Estado Oportunidad Fórmula

2. **Separar Won real de Won proyectado**:
   - Won real = deals con WON DATE en 2026
   - Won corriendo = deals Won de años anteriores que siguen facturando

3. **Nota sobre pauta**: mostrar pero marcar claramente como ingreso de terceros, no revenue de Taquion

### Para el tablero comercial:

4. **Vista de AMs**: grid de qué AM tiene qué cuentas y si hay oportunidades de upselling
5. **Pipeline Velocity real**: calcular días promedio entre PIPELINE DATE → WON DATE
6. **Tasa de conversión**: Won / (Won + Lost) por comercial
7. **Rolling 18 meses**: extender eje temporal a incluir H1 2027
8. **Limpieza de stale deals**: alertar deals en Pipeline >30 días sin movimiento
