import dayjs from 'dayjs';

interface Payment {
    month: string;
    year: number;
    amount: number;
    dueDate: string;
}

interface GenerateMonthlyPaymentsParams {
    startDate: string; // formato ISO: 'YYYY-MM-DD'
    months: number;
    amount: number;
    dueDay?: number; // día del mes para el vencimiento, por defecto 1
}

/**
 * Genera una lista de pagos mensuales a partir de una fecha inicial.
 */
export function generateMonthlyPayments({
    startDate,
    months,
    amount,
    dueDay = 1,
}: GenerateMonthlyPaymentsParams): Payment[] {
    const payments: Payment[] = [];
    let current = dayjs(startDate);

    for (let i = 0; i < months; i++) {
        const dueDate = current.date(dueDay).format('YYYY-MM-DD');
        payments.push({
            month: current.format('MMMM'),
            year: current.year(),
            amount,
            dueDate,
        });
        current = current.add(1, 'month');
    }

    return payments;
}