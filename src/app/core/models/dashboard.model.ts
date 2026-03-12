export interface DashboardData {
  monthlyTurnover: number;
  annualTurnover: number;
  pendingPayments: number;
  revenueHistory: { month: string; paid: number; sent: number }[];
  clientDistribution: { clientName: string; amount: number }[];
  overdueInvoices: { id: number; clientName: string; amount: number; dueDate: Date; daysOverdue: number }[];
  expiringMissions: { id: number; title: string; clientName: string; endDate: Date }[];
  nextTaxDeadline: { amountToPay: number; deadline: Date; label: string };
}
