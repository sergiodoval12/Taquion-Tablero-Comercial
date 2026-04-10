// ─── OPPORTUNITIES / FUNNEL DATA FROM NOTION CRM (Actualizado 2026-04-09) ──
// Fuente: Base "Funnel / Oportunidades" en Notion, vista "Funnel Abierto".
// Nota: Etapa "Lead" (14 opps) excluida del tablero — no son pipeline activo.
// Campos añadidos: originador, bo (Business Owner de la vertical)

export const OPPORTUNITIES = [
  // FORECAST (2)
  { nombre: "Social Listening + LOTBA", stage: "Forecast", total: 150000000, industria: "Hype / Public Affairs", upselling: false, cerrador: "Diego Kupferberg", originador: "Sergio Doval", bo: "Sergio Doval", duracion: "" },
  { nombre: "Personal Pay", stage: "Forecast", total: 25000000, industria: "Banca & Fintech", upselling: false, cerrador: "Diego Kupferberg", originador: "Diego Kupferberg", bo: "Sol Rios Brinatti", duracion: "" },
  // UPSIDE (7)
  { nombre: "Comunidades + RESTART", stage: "Upside", total: 45000000, industria: "Tecnología / IA", upselling: false, cerrador: "Diego Kupferberg", originador: "Sergio Doval", bo: "Sergio Doval", duracion: "" },
  { nombre: "Comunidad + Lotba", stage: "Upside", total: 70000000, industria: "Hype / Public Affairs", upselling: false, cerrador: "Diego Kupferberg", originador: "Sergio Doval", bo: "Sergio Doval", duracion: "" },
  { nombre: "Investigación + Lotba", stage: "Upside", total: 41000000, industria: "Hype / Public Affairs", upselling: false, cerrador: "Diego Kupferberg", originador: "Sergio Doval", bo: "Sergio Doval", duracion: "" },
  { nombre: "Mapa Fintech + Alianza Fintech Iberoamérica", stage: "Upside", total: 150000000, industria: "Banca & Fintech", upselling: false, cerrador: "Diego Kupferberg", originador: "Sol Rios Brinatti", bo: "Sol Rios Brinatti", duracion: "" },
  { nombre: "Upselling + Finadina", stage: "Upside", total: 0, industria: "Banca & Fintech", upselling: true, cerrador: "Diego Kupferberg", originador: "Diego Kupferberg", bo: "Sol Rios Brinatti", duracion: "" },
  { nombre: "MAPA + CUF (Cámara Uruguaya Fintech)", stage: "Upside", total: 63000000, industria: "Banca & Fintech", upselling: false, cerrador: "Diego Kupferberg", originador: "Diego Kupferberg", bo: "Sol Rios Brinatti", duracion: "Campaña" },
  { nombre: "Estrategia + Creatividad + Ejecución + Restart", stage: "Upside", total: 150000000, industria: "Tecnología / IA", upselling: false, cerrador: "Diego Kupferberg", originador: "Sergio Doval", bo: "Sergio Doval", duracion: "" },
  // PIPELINE (16)
  { nombre: "Exploración + Provincia Net", stage: "Pipeline", total: 0, industria: "Banca & Fintech", upselling: false, cerrador: "Diego Kupferberg", originador: "Diego Kupferberg", bo: "Sol Rios Brinatti", duracion: "" },
  { nombre: "Investigación + Restart", stage: "Pipeline", total: 60000000, industria: "Tecnología / IA", upselling: false, cerrador: "Diego Kupferberg", originador: "Sergio Doval", bo: "Sergio Doval", duracion: "" },
  { nombre: "Campaña + AFA", stage: "Pipeline", total: 75000000, industria: "Entretenimiento / Deportes", upselling: false, cerrador: "Diego Kupferberg", originador: "Sergio Doval", bo: "Sergio Doval", duracion: "" },
  { nombre: "Exploración + Supervielle", stage: "Pipeline", total: 0, industria: "Banca & Fintech", upselling: false, cerrador: "Diego Kupferberg", originador: "Diego Kupferberg", bo: "Sol Rios Brinatti", duracion: "" },
  { nombre: "Exploración + IRSA Marketing", stage: "Pipeline", total: 0, industria: "Real Estate", upselling: false, cerrador: "Diego Kupferberg", originador: "Sergio Doval", bo: "Sergio Doval", duracion: "" },
  { nombre: "Exploración + IRSA PA", stage: "Pipeline", total: 0, industria: "Hype / Public Affairs", upselling: false, cerrador: "Diego Kupferberg", originador: "Sergio Doval", bo: "Sergio Doval", duracion: "" },
  { nombre: "Exploración + Huawei", stage: "Pipeline", total: 0, industria: "Tecnología / IA", upselling: false, cerrador: "Diego Kupferberg", originador: "Sol Rios Brinatti", bo: "Sol Rios Brinatti", duracion: "" },
  { nombre: "Campaña + Naranja X", stage: "Pipeline", total: 0, industria: "Banca & Fintech", upselling: false, cerrador: "Diego Kupferberg", originador: "Sol Rios Brinatti", bo: "Sol Rios Brinatti", duracion: "" },
  { nombre: "Exploración + Farmapay", stage: "Pipeline", total: 0, industria: "Laboratorios", upselling: false, cerrador: "Diego Kupferberg", originador: "Sol Rios Brinatti", bo: "Sol Rios Brinatti", duracion: "" },
  { nombre: "Exploración + Al Mundo", stage: "Pipeline", total: 25000000, industria: "Turismo", upselling: false, cerrador: "Diego Kupferberg", originador: "Sergio Doval", bo: "Sergio Doval", duracion: "" },
  { nombre: "Upselling + Bind", stage: "Pipeline", total: 67000000, industria: "Banca & Fintech", upselling: true, cerrador: "Diego Kupferberg", originador: "Diego Kupferberg", bo: "Sol Rios Brinatti", duracion: "" },
  { nombre: "Solución B&F + Personal Pay", stage: "Pipeline", total: 30000000, industria: "Banca & Fintech", upselling: false, cerrador: "Diego Kupferberg", originador: "Diego Kupferberg", bo: "Sol Rios Brinatti", duracion: "" },
  { nombre: "Campaña Concientización + ALEA", stage: "Pipeline", total: 25000000, industria: "Hype / Public Affairs", upselling: false, cerrador: "Diego Kupferberg", originador: "Sol Rios Brinatti", bo: "Sol Rios Brinatti", duracion: "" },
  { nombre: "Comunidad + Grupo Gaman", stage: "Pipeline", total: 100000000, industria: "Seguros", upselling: false, cerrador: "Diego Kupferberg", originador: "Sergio Doval", bo: "Ciro Garcia Resta", duracion: "" },
  { nombre: "Comunidades + Corrientes", stage: "Pipeline", total: 0, industria: "Hype / Public Affairs", upselling: false, cerrador: "Diego Kupferberg", originador: "Sergio Doval", bo: "Sergio Doval", duracion: "" },
  { nombre: "Comunidades + Agencia Nac. Inversiones", stage: "Pipeline", total: 0, industria: "Hype / Public Affairs", upselling: false, cerrador: "Diego Kupferberg", originador: "Sol Rios Brinatti", bo: "Sol Rios Brinatti", duracion: "" },
];

export const WON_2026 = [
  // Ene
  { nombre: "Upselling + Enfoque Federal", total: 330000000, cerrador: "Sergio Doval", originador: "Sergio Doval", bo: "Sergio Doval", industria: "Hype / Public Affairs", fecha: "2026-01" },
  { nombre: "Comunidad + Todo Un País", total: 66000000, cerrador: "Sergio Doval", originador: "Sergio Doval", bo: "Sergio Doval", industria: "Hype / Public Affairs", fecha: "2026-01" },
  // Feb
  { nombre: "Campaña + El Abrazo de Boca", total: 240000000, cerrador: "Sergio Doval", originador: "Sergio Doval", bo: "Sergio Doval", industria: "Entretenimiento / Deportes", fecha: "2026-02" },
  { nombre: "Exploración + BEM + Partnership", total: 18150000, cerrador: "Diego Kupferberg", originador: "Sol Rios Brinatti", bo: "Sol Rios Brinatti", industria: "Banca & Fintech", fecha: "2026-02" },
  { nombre: "Comunidades + San Luis Gobierno", total: 300000000, cerrador: "Sergio Doval", originador: "Sergio Doval", bo: "Sergio Doval", industria: "Hype / Public Affairs", fecha: "2026-02" },
  { nombre: "Investigación/Creatividad + Finadina", total: 120000000, cerrador: "Diego Kupferberg", originador: "Diego Kupferberg", bo: "Sol Rios Brinatti", industria: "Banca & Fintech", fecha: "2026-02" },
  { nombre: "Campaña Digital + San Luis", total: 12000000, cerrador: "Sergio Doval", originador: "Sergio Doval", bo: "Sergio Doval", industria: "Hype / Public Affairs", fecha: "2026-02" },
  { nombre: "Construcción Medio + Enfoque Federal", total: 168000000, cerrador: "Sergio Doval", originador: "Sergio Doval", bo: "Sergio Doval", industria: "Hype / Public Affairs", fecha: "2026-02" },
  { nombre: "Estrategia/Creatividad + Froneri", total: 96000000, cerrador: "Diego Kupferberg", originador: "Diego Kupferberg", bo: "Diego Kupferberg", industria: "Consumo Masivo", fecha: "2026-02" },
  // Mar
  { nombre: "Investigación+PR+campaña + Rosbaco", total: 8000000, cerrador: "Sergio Doval", originador: "Sergio Doval", bo: "Sergio Doval", industria: "Real Estate", fecha: "2026-03" },
  { nombre: "Estudios flash + GCBA", total: 0, cerrador: "Sergio Doval", originador: "Sergio Doval", bo: "Sergio Doval", industria: "Hype / Public Affairs", fecha: "2026-03" },
  { nombre: "Investigación electoral + GCBA", total: 22000000, cerrador: "Sergio Doval", originador: "Sergio Doval", bo: "Sergio Doval", industria: "Hype / Public Affairs", fecha: "2026-03" },
  { nombre: "La Fábrica", total: 30000000, cerrador: "Diego Kupferberg", originador: "Sergio Doval", bo: "Sergio Doval", industria: "Entretenimiento / Deportes", fecha: "2026-03" },
  { nombre: "Estrategia Stream + CEC", total: 15000000, cerrador: "Sergio Doval", originador: "Sergio Doval", bo: "Sergio Doval", industria: "Entretenimiento / Deportes", fecha: "2026-03" },
  { nombre: "Storytelling + Coca Cola", total: 9200000, cerrador: "Diego Kupferberg", originador: "Sol Rios Brinatti", bo: "Sol Rios Brinatti", industria: "Consumo Masivo", fecha: "2026-03" },
  { nombre: "Acompañamiento + Potrero Encanta", total: 21000000, cerrador: "Sergio Doval", originador: "Sergio Doval", bo: "Sergio Doval", industria: "Hype / Public Affairs", fecha: "2026-03" },
  { nombre: "Posicionamiento + Mercadolibre", total: 15000000, cerrador: "Diego Kupferberg", originador: "Sol Rios Brinatti", bo: "Sol Rios Brinatti", industria: "Tecnología / IA", fecha: "2026-03" },
  { nombre: "Propuesta Integral + Banco Ciudad", total: 40000000, cerrador: "Diego Kupferberg", originador: "Diego Kupferberg", bo: "Sol Rios Brinatti", industria: "Banca & Fintech", fecha: "2026-03" },
  { nombre: "Campaña venta tickets + Fenix", total: 9900000, cerrador: "Diego Kupferberg", originador: "Sergio Doval", bo: "Sergio Doval", industria: "Entretenimiento / Deportes", fecha: "2026-03" },
  { nombre: "Comunicación + Fenix Entertainment", total: 20000000, cerrador: "Diego Kupferberg", originador: "Sergio Doval", bo: "Sergio Doval", industria: "Entretenimiento / Deportes", fecha: "2026-03" },
  { nombre: "Nuevo proyecto + CEC", total: 12000000, cerrador: "Sergio Doval", originador: "Sergio Doval", bo: "Sergio Doval", industria: "Entretenimiento / Deportes", fecha: "2026-03" },
  { nombre: "Estudios cuantitativos + MELI", total: 0, cerrador: "Diego Kupferberg", originador: "Sol Rios Brinatti", bo: "Sol Rios Brinatti", industria: "Tecnología / IA", fecha: "2026-03" },
  { nombre: "Asesoramiento + JM", total: 0, cerrador: "Sergio Doval", originador: "Sergio Doval", bo: "Sergio Doval", industria: "Hype / Public Affairs", fecha: "2026-03" },
  { nombre: "SL & Comunidades + UATRE", total: 0, cerrador: "Sergio Doval", originador: "Sergio Doval", bo: "Sergio Doval", industria: "Hype / Public Affairs", fecha: "2026-03" },
  { nombre: "Investigación + GCABA", total: 0, cerrador: "Sergio Doval", originador: "Sergio Doval", bo: "Sergio Doval", industria: "Hype / Public Affairs", fecha: "2026-03" },
];
