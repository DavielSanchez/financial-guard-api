const settingService = require('../services/settingService')

const updatUserSettings = async(req, res) => {
    try {
        const userId = req.user.id;
        const updateData = req.body;

        const result = await settingService.updateUserSettings(userId, updateData);

        return res.status(200).json({
            success: true,
            message: 'Settings updated successfully',
            data: result
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

module.exports = { updatUserSettings }