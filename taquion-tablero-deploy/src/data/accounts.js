// ─── CUENTAS ACTIVAS FROM NOTION CRM (Actualizado 2026-04-09) ──
// Fuente: Base "Clientes Activos" en Notion, vista "Activos".
// Enriquecido con indicadores comerciales del Modelo Comercial Taquion.
// tipo: "Recurrente" = ingreso periódico / "One Shot" = proyecto puntual / "Ejecución 2025" = arrastre
// udn: líneas de producto UDN (Inspire = estrategia/creatividad, Insights = investigación/data, Ignite = ejecución/campaña)

export const CUENTAS_ACTIVAS = [
  { nombre: "Aerolíneas Argentinas", industria: "Turismo", am: "Candela Naredo", tipo: "One Shot", ticketMes: 0, udn: ["Inspire"], cerrador: "Sergio Doval", originador: "Sergio Doval", fee: 0 },
  { nombre: "ALEA", industria: "Hype / Public Affairs", am: "Sol Rios Brinatti", tipo: "One Shot", ticketMes: 25000000, udn: ["Ignite"], cerrador: "Sin asignar", originador: "Sol Rios Brinatti", fee: 2.5 },
  { nombre: "Banco Galicia / Nave", industria: "Banca & Fintech", am: "Julian Cordoba Pivotto", tipo: "Recurrente", ticketMes: 15000000, udn: ["Insights", "Ignite"], cerrador: "Diego Kupferberg", originador: "Diego Kupferberg", fee: 7.5 },
  { nombre: "Boca", industria: "Deportes", am: "Sergio Doval", tipo: "One Shot", ticketMes: 80000000, udn: ["Inspire", "Ignite"], cerrador: "Sergio Doval", originador: "Sergio Doval", fee: 15 },
  { nombre: "CAEM", industria: "Mineria", am: "Martín Villanueva", tipo: "Recurrente", ticketMes: 1800000, udn: ["Insights"], cerrador: "Diego Kupferberg", originador: "Diego Kupferberg", fee: 7.5 },
  { nombre: "Cámara Argentina de Fintech (CAF)", industria: "Banca & Fintech", am: "Sol Rios Brinatti", tipo: "Recurrente", ticketMes: 10000000, udn: ["Inspire", "Insights"], cerrador: "Sin asignar", originador: "Sol Rios Brinatti", fee: 2.5 },
  { nombre: "CEC", industria: "Entretenimiento", am: "Julian Cordoba Pivotto", tipo: "Recurrente", ticketMes: 13500000, udn: ["Inspire"], cerrador: "Sin asignar", originador: "Sergio Doval", fee: 2.5 },
  { nombre: "Coca Cola", industria: "Consumo Masivo", am: "Martín Villanueva", tipo: "One Shot", ticketMes: 9200000, udn: ["Inspire"], cerrador: "Sin asignar", originador: "Sol Rios Brinatti", fee: 2.5 },
  { nombre: "Credicuotas", industria: "Banca & Fintech", am: "Julian Cordoba Pivotto", tipo: "Recurrente", ticketMes: 8000000, udn: ["Insights"], cerrador: "Diego Kupferberg", originador: "Diego Kupferberg", fee: 7.5 },
  { nombre: "Ecosistema San Luis", industria: "Hype / Public Affairs", am: "Julian Cordoba Pivotto", tipo: "One Shot", ticketMes: 104000000, udn: ["Inspire", "Ignite"], cerrador: "Sin asignar", originador: "Sergio Doval", fee: 2.5 },
  { nombre: "Farmapay", industria: "Laboratorios", am: "Sol Rios Brinatti", tipo: "One Shot", ticketMes: 0, udn: ["Insights"], cerrador: "Sin asignar", originador: "Sol Rios Brinatti", fee: 0 },
  { nombre: "Finadina", industria: "Banca & Fintech", am: "Julian Cordoba Pivotto", tipo: "Recurrente", ticketMes: 40000000, udn: ["Insights", "Ignite"], cerrador: "Sin asignar", originador: "Diego Kupferberg", fee: 7.5 },
  { nombre: "Froneri", industria: "Alimentaria", am: "Martín Villanueva", tipo: "One Shot", ticketMes: 32000000, udn: ["Inspire", "Ignite"], cerrador: "Diego Kupferberg", originador: "Diego Kupferberg", fee: 7.5 },
  { nombre: "GCBA", industria: "Hype / Public Affairs", am: "María Azul Alvarez", tipo: "Recurrente", ticketMes: 22000000, udn: ["Insights"], cerrador: "Sin asignar", originador: "Sergio Doval", fee: 2.5 },
  { nombre: "Getnet", industria: "Banca & Fintech", am: "Martín Villanueva", tipo: "Recurrente", ticketMes: 12000000, udn: ["Insights"], cerrador: "Sin asignar", originador: "Sol Rios Brinatti", fee: 2.5 },
  { nombre: "IGNIS (Pfizer)", industria: "Farmacéutica", am: "Julian Cordoba Pivotto", tipo: "Recurrente", ticketMes: 8000000, udn: ["Insights"], cerrador: "Sin asignar", originador: "Sol Rios Brinatti", fee: 0 },
  { nombre: "La Pampa", industria: "Hype / Public Affairs", am: "Sol Rios Brinatti", tipo: "One Shot", ticketMes: 0, udn: ["Inspire"], cerrador: "Sin asignar", originador: "Sol Rios Brinatti", fee: 0 },
  { nombre: "Naranja X", industria: "Banca & Fintech", am: "Martín Villanueva", tipo: "Recurrente", ticketMes: 20660000, udn: ["Insights", "Ignite"], cerrador: "Diego Kupferberg", originador: "Sol Rios Brinatti", fee: 7.5 },
  { nombre: "Potrero Encanta", industria: "Hype / Public Affairs", am: "Julian Cordoba Pivotto", tipo: "One Shot", ticketMes: 21000000, udn: ["Inspire"], cerrador: "Sin asignar", originador: "Sergio Doval", fee: 2.5 },
  { nombre: "Rosbaco", industria: "Real Estate", am: "Sol Rios Brinatti", tipo: "One Shot", ticketMes: 8000000, udn: ["Inspire", "Ignite"], cerrador: "Sergio Doval", originador: "Sergio Doval", fee: 15 },
  { nombre: "Suterh", industria: "Sindicatos", am: "Sol Rios Brinatti", tipo: "Recurrente", ticketMes: 15000000, udn: ["Insights"], cerrador: "Sin asignar", originador: "Sol Rios Brinatti", fee: 2.5 },
  { nombre: "YPF / YDi", industria: "Energía / Minería / Agua", am: "Sol Rios Brinatti", tipo: "Recurrente", ticketMes: 10000000, udn: ["Insights"], cerrador: "Sin asignar", originador: "Sol Rios Brinatti", fee: 2.5 },
];
