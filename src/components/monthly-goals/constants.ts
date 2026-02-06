import { CheckCircle2, Clock, Target, AlertCircle } from "lucide-react";

export const MONTH_NAMES = [
  "Gennaio",
  "Febbraio",
  "Marzo",
  "Aprile",
  "Maggio",
  "Giugno",
  "Luglio",
  "Agosto",
  "Settembre",
  "Ottobre",
  "Novembre",
  "Dicembre",
];

export const MONTH_MOTTOS: Record<number, string> = {
  1: "L'Inizio",
  2: "Il Raccolto",
  3: "Il Risveglio",
  4: "La Fioritura",
  5: "L'Espansione",
  6: "La Maturit\u00e0",
  7: "La Riflessione",
  8: "La Rigenerazione",
  9: "Il Rinnovamento",
  10: "La Raccolta",
  11: "La Profondit\u00e0",
  12: "Il Compimento",
};

export const STATUS_CONFIG = {
  completed: { label: "Completato", color: "#22c55e", icon: CheckCircle2 },
  in_progress: { label: "In Corso", color: "#f59e0b", icon: Clock },
  pending: { label: "In Attesa", color: "#6b7280", icon: Target },
  failed: { label: "Fallito", color: "#ef4444", icon: AlertCircle },
};
