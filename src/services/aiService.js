const supabase = require('../config/supabase');
const envelopeService = require('./envelopeService');

const getFinancialAdvice = async (userId, userMessage, history = []) => {
    try {
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();

        await envelopeService.ensureMonthlyBudgets(userId, currentMonth, currentYear);

        const [profileReq, acctsReq, envsReq, goalsReq, txsReq] = await Promise.all([
            supabase.from('profiles').select('user_settings(language)').eq('id', userId).single(),
            supabase.from('accounts').select('name, balance, type, is_hidden').eq('user_id', userId),
            supabase.from('budget_envelopes')
                .select('budget_amount, actual_spent, categories(name)')
                .eq('user_id', userId)
                .eq('period_month', currentMonth)
                .eq('period_year', currentYear),
            supabase.from('goals').select('name, target_amount, saved_already').eq('user_id', userId).eq('status', 'active'),
            supabase.from('transactions')
                .select('amount, type, date, categories(name)')
                .eq('user_id', userId)
                .order('date', { ascending: false })
                .limit(10)
        ]);

        const userLanguage = profileReq.data?.user_settings?.[0]?.language || 'es';

        // --- FUNCIÓN DE FORMATEO ---
        const fmt = (num) => Math.round(Number(num)).toLocaleString('en-US');

        // --- PROCESAMIENTO MATEMÁTICO ---
        const rawDisponible = (acctsReq.data || [])
            .filter(a => !a.is_hidden)
            .reduce((acc, a) => acc + Math.round(Number(a.balance)), 0);

        const rawBovedas = (acctsReq.data || [])
            .filter(a => a.is_hidden)
            .reduce((acc, a) => acc + Math.round(Number(a.balance)), 0);

        // Convertimos a String con comas (Ej: "59,141")
        const totalDisponible = fmt(rawDisponible);
        const totalBovedas = fmt(rawBovedas);

        const accountsClean = (acctsReq.data || []).map(a =>
            `- ${a.name}: **RD$ ${fmt(a.balance)}** (${a.is_hidden ? 'Bóveda' : 'Disponible'})`
        ).join('\n');

        const presupuestosTexto = (envsReq.data || []).map(env => {
            const presupuesto = Math.round(Number(env.budget_amount));
            const gastado = Math.round(Number(env.actual_spent));
            const disponible = presupuesto - gastado;
            return `- ${env.categories?.name || 'General'}: Presupuesto **RD$ ${fmt(presupuesto)}**, Gastado REAL **RD$ ${fmt(gastado)}**, Disponible **RD$ ${fmt(disponible)}**.`;
        }).join('\n');

        const systemInstruction = {
            parts: [{
                text: `Eres "Financial Guard AI", un Coach Financiero experto.
Idioma: ${userLanguage}.

REGLAS DE ORO DE PRECISIÓN:
1. El balance TOTAL DISPONIBLE es exactamente: **RD$ ${totalDisponible}**.
2. El balance en BÓVEDAS/AHORRO es exactamente: **RD$ ${totalBovedas}**.
3. Usa SIEMPRE el formato de moneda con comas (Ej: 1,018 en lugar de 1018).
4. No intentes sumar nada. Los montos que te paso ya incluyen todos los movimientos.

CONTEXTO FINANCIERO:
--- BALANCE GENERAL ---
Total disponible: RD$ ${totalDisponible}
Reserva en Bóvedas: RD$ ${totalBovedas}

--- DETALLE POR CUENTA ---
${accountsClean}

--- ESTADO DE PRESUPUESTOS ---
${presupuestosTexto}

--- ÚLTIMOS MOVIMIENTOS ---
${JSON.stringify(txsReq.data || [])}

Instrucciones:
- Responde de forma breve y natural.
- Usa negritas para los montos: **RD$ ${totalDisponible}**.`
            }]
        };

        const formattedHistory = Array.isArray(history) ? history.slice(-6).map(msg => ({
            role: (msg.role === 'model' || msg.role === 'assistant') ? 'model' : 'user',
            parts: [{ text: msg.content || msg.text || "" }]
        })) : [];

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${process.env.GEMINI_API_KEY}`;

        const payload = {
            system_instruction: systemInstruction,
            contents: [...formattedHistory, { role: 'user', parts: [{ text: userMessage }] }]
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);

        return data.candidates[0].content.parts[0].text;

    } catch (error) {
        console.error("Error AI Service:", error.message);
        throw error;
    }
};

module.exports = { getFinancialAdvice };