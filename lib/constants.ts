export const TICKET_STATUS = {
  valid: { label: "Valid", color: "#22c55e" }, // Green
  used: { label: "Checked In", color: "#64748b" }, // Slate
  refunded: { label: "Refunded", color: "#ef4444" }, // Red
  cancelled: { label: "Cancelled", color: "#000000" }, // Black
} as const;
