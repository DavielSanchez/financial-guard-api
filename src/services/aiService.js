// const { GoogleGenerativeAI } = require("@google/generative-ai");
// const supabase = require('../config/supabase');

// // 1. Inicializar con la versión v1 explícitamente
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// const getFinancialAdvice = async(userId, userMessage) => {
//     try {
//         const { data: accounts } = await supabase.from('accounts').select('name, balance').eq('user_id', userId);
//         const { data: goals } = await supabase.from('goals').select('name, target_amount, saved_already').eq('user_id', userId);

//         // 2. Especificamos la versión v1 para evitar el 404 de la v1beta
//         const model = genAI.getGenerativeModel({
//             model: "gemini-1.5-flash",
//             apiVersion: 'v1'
//         });

//         const prompt = `Eres un coach financiero. Datos: ${JSON.stringify({accounts, goals})}. Pregunta: ${userMessage}`;

//         const result = await model.generateContent(prompt);
//         return result.response.text();

//     } catch (error) {
//         // Si sigue dando 404, imprimimos la URL completa que intenta usar la librería
//         console.error("ERROR DETALLADO:");
//         console.log("- Status:", error.status);
//         console.log("- Message:", error.message);
//         throw new Error("Error de conexión con el Coach IA");
//     }
// };

// module.exports = { getFinancialAdvice };

const supabase = require('../config/supabase');

const getFinancialAdvice = async(userId, userMessage) => {
    try {
        const { data: accounts } = await supabase.from('accounts').select('name, balance').eq('user_id', userId);
        const { data: goals } = await supabase.from('goals').select('name, target_amount, saved_already').eq('user_id', userId);

        const prompt = `Actúa como Coach Financiero. Contexto: Cuentas ${JSON.stringify(accounts)}, Metas ${JSON.stringify(goals)}. Pregunta: ${userMessage}`;

        // Probamos con gemini-pro que es el más compatible universalmente
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("DEBUG - Error de Google:", data.error);
            throw new Error(data.error.message);
        }

        return data.candidates[0].content.parts[0].text;

    } catch (error) {
        console.error("Error AI Service:", error.message);
        throw new Error("No se pudo contactar al Coach.");
    }
};

module.exports = { getFinancialAdvice };