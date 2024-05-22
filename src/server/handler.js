const predictClassification = require('../services/inferenceService');
const crypto = require('crypto');
const storeData = require('../services/storeData');

async function postPredictHandler(request, h) {
    try {
        const { image } = request.payload;
        const { model } = request.server.app;
        
        if (!model) {
            throw new Error('Model is not loaded');
        }

        console.log('Received image:', image);
        
        const { label } = await predictClassification(model, image);
        console.log('Prediction result:', label);
        
        const id = crypto.randomUUID();
        const createdAt = new Date().toISOString();
        
        const data = {
            id: id,
            result: label,
            suggestion: label === 'Cancer' ? 'Segera periksa ke dokter!' : 'None',
            createdAt: createdAt
        };
        
        const response = h.response({
            status: 'success',
            message: 'Model is predicted successfully',
            data: data
        });

        await storeData(id, data);

        response.code(201);
        return response;
    } catch (error) {
        console.error('Error in postPredictHandler:', error);
        throw error;
    }
}

module.exports = { postPredictHandler };