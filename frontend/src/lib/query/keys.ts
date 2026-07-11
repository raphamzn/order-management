export const queryKeys = {
  clients: { all: ["clients"] as const },
  transports: { all: ["transport-types"] as const },
  items: { all: ["items"] as const },
  orders: {
    all: ["orders"] as const,
    detail: (id: string) => ["orders", id] as const,
  },
  audit: { all: ["audit-logs"] as const },
};
