const supabase = require('../config/supabase');
const formatChartData = require('../utils/formatChartData');
const getDateRanges = require('../utils/getDateRanges');
const getDeltaLabel = require('../utils/getDeltaLabel');


// const dashboardService = {
//   getStats: async (userId) => {
//     const today = new Date();
//     const firstDayMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

//     const [accounts, transactions, goals] = await Promise.all([
//       // 1. Balance total (Cuentas no ocultas)
//       supabase.from('accounts').select('balance').eq('user_id', userId).eq('is_hidden', false),

//       // 2. Movimientos del mes actual para Cashflow
//       supabase.from('transactions')
//         .select('amount, type')
//         .eq('user_id', userId)
//         .gte('date', firstDayMonth),

//       // 3. Metas para verificar racha/riesgo
//       supabase.from('goals').select('*').eq('user_id', userId).eq('status', 'active')
//     ]);

//     // Procesar Cuentas
//     const netWorth = accounts.data?.reduce((acc, curr) => acc + parseFloat(curr.balance), 0) || 0;

//     // Procesar Cashflow (Ingresos vs Gastos del mes)
//     const stats = transactions.data?.reduce((acc, curr) => {
//       if (curr.type === 'income') acc.income += parseFloat(curr.amount);
//       else acc.expense += parseFloat(curr.amount);
//       return acc;
//     }, { income: 0, expense: 0 }) || { income: 0, expense: 0 };

//     // Procesar Metas en Riesgo (Si no ha aportado en los días de gracia)
//     const goalsAtRisk = goals.data?.filter(goal => {
//       if (!goal.last_contribution_date) return true;
//       const lastDate = new Date(goal.last_contribution_date);
//       const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
//       return diffDays >= goal.notify_inactivity_days;
//     }) || [];

//     return {
//       net_worth: netWorth,
//       monthly_cashflow: stats,
//       goals_overview: {
//         total_active: goals.data?.length || 0,
//         at_risk: goalsAtRisk.length,
//         risk_list: goalsAtRisk.map(g => ({ id: g.id, name: g.name }))
//       }
//     };
//   }
// };

const dashboardService = {
    getStats: async(userId, period = 'Day') => {
        const { start, end, prevStart, prevEnd } = getDateRanges(period);

        const [accounts, currentTrans, prevTrans] = await Promise.all([
            supabase.from('accounts').select('balance').eq('user_id', userId).eq('is_hidden', false),
            supabase.from('transactions').select('amount, type, date').eq('user_id', userId).gte('date', start).lte('date', end),
            supabase.from('transactions').select('amount, type').eq('user_id', userId).gte('date', prevStart).lte('date', prevEnd)
        ]);

        const netWorth = accounts.data?.reduce((acc, curr) => acc + parseFloat(curr.balance), 0) || 0;

        // Separar transacciones por tipo para los gráficos
        const incomeTransactions = currentTrans.data?.filter(t => t.type === 'income') || [];
        const expenseTransactions = currentTrans.data?.filter(t => t.type === 'expense') || [];

        // Generar los 3 gráficos independientes
        // 1. Gráfico de Ingresos
        const chartIncome = formatChartData(incomeTransactions, period, start, end);
        
        // 2. Gráfico de Gastos
        const chartExpense = formatChartData(expenseTransactions, period, start, end);
        
        // 3. Gráfico de Balance (Neto por punto en el tiempo)
        // Nota: formatChartData debe ser capaz de manejar la resta si le pasas todo, 
        // o creas una versión que calcule el acumulado.
        const chartBalance = formatChartData(currentTrans.data || [], period, start, end, true, netWorth);

        // Cálculo de totales y delta (tu lógica actual)
        const stats = currentTrans.data?.reduce((acc, curr) => {
            curr.type === 'income' ? acc.income += parseFloat(curr.amount) : acc.expense += parseFloat(curr.amount);
            return acc;
        }, { income: 0, expense: 0 }) || { income: 0, expense: 0 };

        // Procesar Totales Anteriores (Para calcular el % de cambio)
        const prevStats = prevTrans.data?.reduce((acc, curr) => {
          if (curr.type === 'income') acc.income += parseFloat(curr.amount);
          else acc.expense += parseFloat(curr.amount);
          return acc;
        }, { income: 0, expense: 0 }) || { income: 0, expense: 0 };

        // Calcular Delta % (Ejemplo basado en Balance del periodo)
        const currentBalance = stats.income - stats.expense;
        const prevBalance = prevStats.income - prevStats.expense;
        const delta = prevBalance === 0 ? 0 : ((currentBalance - prevBalance) / Math.abs(prevBalance)) * 100;

        // Generar datos para la Gráfica (Agrupamos por día/mes según el periodo)
        const chartData = formatChartData(currentTrans.data || [], period, start, end);

        return {
          balance: netWorth, // El total de las cuentas
          income: stats.income,
          expense: stats.expense,
          delta: parseFloat(delta.toFixed(1)),
          deltaLabel: getDeltaLabel(period),
          chartBalance,
          chartIncome,
          chartExpense
        };
    }
};

module.exports = dashboardService;