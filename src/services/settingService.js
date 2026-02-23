const supabase = require('../config/supabase');

const updateUserSettings = async(userId, updateData) => {
    const {...settingsUpdates } = updateData;

    if (Object.keys(settingsUpdates).length > 0) {
        const { data, error: settingsError } = await supabase
            .from('user_settings')
            .update({
                ...settingsUpdates,
                updated_at: new Date()
            })
            .eq('user_id', userId)
            .select()
            .single();

        if (settingsError) throw new Error(`Settings update failed: ${settingsError.message}`);
        return data;
    }

    return { updated: true };
}

module.exports = { updateUserSettings }