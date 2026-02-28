const supabase = require('../config/supabase');

const goalService = {
    createGoal: async(userId, goalData) => {
        const { data, error } = await supabase
            .from('goals')
            .insert([{...goalData, user_id: userId }])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    getGoals: async(userId) => {
        const { data, error } = await supabase
            .from('goals')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    // Lógica de "Tachar el día" (Aporte a la meta)
    contributeToGoal: async(goalId, userId, amount) => {
        // 1. Obtenemos la meta actual
        const { data: goal, error: fError } = await supabase
            .from('goals')
            .select('*')
            .eq('id', goalId)
            .eq('user_id', userId)
            .single();

        if (fError || !goal) throw new Error("Meta no encontrada");

        // 2. Calculamos nuevo ahorro y actualizamos fecha de contribución
        const newSaved = parseFloat(goal.saved_already) + parseFloat(amount);
        const today = new Date().toISOString().split('T')[0];

        const { data: updatedGoal, error: uError } = await supabase
            .from('goals')
            .update({
                saved_already: newSaved,
                last_contribution_date: today,
                status: newSaved >= goal.target_amount ? 'completed' : 'active'
            })
            .eq('id', goalId)
            .select()
            .single();

        if (uError) throw uError;
        return updatedGoal;
    },

    deleteGoal: async(goalId, userId) => {
        const { error } = await supabase
            .from('goals')
            .delete()
            .eq('id', goalId)
            .eq('user_id', userId);
        if (error) throw error;
        return true;
    },

    getGoalAnalytics: async (goalId, userId) => {
        const { data: goal, error } = await supabase
            .from('goals')
            .select('*')
            .eq('id', goalId)
            .eq('user_id', userId)
            .single();

        if (error || !goal) throw new Error("Meta no encontrada");

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let lastContributionDate = null;
        if (goal.last_contribution_date) {
            // Using ISO date to prevent timezone shift
            lastContributionDate = new Date(goal.last_contribution_date + 'T00:00:00');
            lastContributionDate.setHours(0, 0, 0, 0);
        }

        const createdAt = new Date(goal.created_at || new Date());
        createdAt.setHours(0, 0, 0, 0);

        const msPerDay = 1000 * 60 * 60 * 24;
        const daysSinceCreation = Math.floor((today - createdAt) / msPerDay);

        let daysRemaining = null;
        if (goal.deadline) {
            const deadlineDate = new Date(goal.deadline + 'T00:00:00');
            deadlineDate.setHours(0, 0, 0, 0);
            daysRemaining = Math.max(0, Math.floor((deadlineDate - today) / msPerDay));
        }

        let percentage = 0;
        if (goal.target_amount && goal.target_amount > 0) {
            percentage = (parseFloat(goal.saved_already || 0) / parseFloat(goal.target_amount)) * 100;
        }
        percentage = parseFloat(percentage.toFixed(2));

        const daysSinceLastContribution = lastContributionDate
            ? Math.floor((today - lastContributionDate) / msPerDay)
            : null;

        const isTodayPaid = daysSinceLastContribution === 0;

        // Current Streak Calculation
        let currentStreak = goal.current_streak || 0;
        if (currentStreak === 0 && lastContributionDate) {
            if (daysSinceLastContribution <= 1) {
                // If they haven't missed a day, simulate streak from creation
                currentStreak = Math.max(1, Math.floor((lastContributionDate - createdAt) / msPerDay) + 1);
            } else {
                currentStreak = 0;
            }
        }

        // Next Payment Calculation
        let nextPaymentAmount = 0;
        if (goal.is_piggy_bank && goal.piggy_type === 'daily') {
            const startAlg = parseFloat(goal.start_amount || 0);
            const incAlg = parseFloat(goal.increment_amount || 0);
            nextPaymentAmount = startAlg + (daysSinceCreation * incAlg);
        } else if (goal.deadline) {
            const remainingAmount = Math.max(0, parseFloat(goal.target_amount || 0) - parseFloat(goal.saved_already || 0));
            const remainingMonths = daysRemaining / 30; // Approx
            nextPaymentAmount = remainingMonths > 0 ? remainingAmount / remainingMonths : remainingAmount;
        }
        nextPaymentAmount = parseFloat(nextPaymentAmount.toFixed(2));

        // Status Health Check
        let statusMessage = 'On Track';
        let statusHealth = 'A tiempo';

        if (goal.notify_on_risk && goal.notify_inactivity_days !== null && goal.notify_inactivity_days !== undefined) {
            if (daysSinceLastContribution !== null && daysSinceLastContribution > goal.notify_inactivity_days) {
                statusMessage = 'At Risk';
                statusHealth = 'En riesgo';
            }
        }

        if (goal.is_piggy_bank && goal.piggy_type === 'daily') {
            if (daysSinceLastContribution !== null && daysSinceLastContribution > 1) {
                statusMessage = 'At Risk';
                statusHealth = 'Atrasado';
            }
        }

        // Projection Simulation
        let projection = parseFloat(goal.saved_already || 0);
        if (goal.is_piggy_bank && goal.piggy_type === 'daily') {
            if (daysRemaining !== null && daysRemaining > 0) {
                const a = nextPaymentAmount;
                const d = parseFloat(goal.increment_amount || 0);
                const n = daysRemaining;
                // Sum of arithmetic sequence
                const projectedSum = (n / 2) * (2 * a + (n - 1) * d);
                projection += projectedSum;
                projection = parseFloat(projection.toFixed(2));
            } else if (daysRemaining === null) {
                projection = null;
            }
        } else {
            // Para las metas 'open' o que no son diarias, la proyección es llegar al target_amount
            projection = parseFloat(parseFloat(goal.target_amount || 0).toFixed(2));
        }

        // Idea Pro: Progresión Aritmética (Next 7 days plan)
        let arithmeticProgression = [];
        if (goal.is_piggy_bank && goal.piggy_type === 'daily') {
            const startAlg = parseFloat(goal.start_amount || 0);
            const incAlg = parseFloat(goal.increment_amount || 0);
            for (let i = 0; i < 7; i++) {
                const projectedDay = new Date(today);
                projectedDay.setDate(today.getDate() + i);
                const dayIndex = daysSinceCreation + i;
                const amount = startAlg + (dayIndex * incAlg);
                arithmeticProgression.push({
                    date: projectedDay.toISOString().split('T')[0],
                    amount: parseFloat(amount.toFixed(2))
                });
            }
        }

        // Idea Pro: Salvavidas (Streak Freeze)
        let streakFreezeAvailable = false;
        if (currentStreak >= 30) {
            streakFreezeAvailable = true;
        }

        return {
            analytics: {
                currentStreak,
                nextPaymentAmount,
                daysRemaining,
                percentage,
                statusHealth,
                statusMessage,
                projection,
                streakFreezeAvailable,
                arithmeticProgression,
                isTodayPaid,
                currency: goal.currency || 'USD'
            }
        };
    }
};

module.exports = goalService;