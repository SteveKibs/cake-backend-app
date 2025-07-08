// Reference Directory: /src/routes/customerFeedback.routes.js
const express = require('express');
const {
    createFeedback,
    getFeedback,
    getFeedbackById,
    updateFeedback,
    deleteFeedback
} = require('../controllers/customerFeedback.controller');
const validate = require('../middleware/validation.middleware');
const {
    createFeedbackSchema,
    updateFeedbackSchema,
    getFeedbackByIdSchema,
    getFeedbackSchema
} = require('../validations/customerFeedback.validation');

const router = express.Router();

router.post('/', validate({ body: createFeedbackSchema }), createFeedback); // Public if customers submit directly
router.get('/', validate({ query: getFeedbackSchema }), getFeedback); // Protected (admin view)
router.get('/:id', validate({ params: getFeedbackByIdSchema }), getFeedbackById); // Protected
router.put('/:id', validate({ params: getFeedbackByIdSchema, body: updateFeedbackSchema }), updateFeedback); // Protected
router.delete('/:id', validate({ params: getFeedbackByIdSchema }), deleteFeedback); // Protected

module.exports = router;