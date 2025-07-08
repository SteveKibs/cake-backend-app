// src/validations/cakeFlavor.validation.js
const Joi = require('joi');

const addFlavorToCakeSchema = Joi.object({
    cake_id: Joi.number().integer().min(1).required(),
    flavor_id: Joi.number().integer().min(1).required()
});

const removeFlavorFromCakeSchema = Joi.object({
    cake_id: Joi.number().integer().min(1).required(),
    flavor_id: Joi.number().integer().min(1).required()
});

const getFlavorsForCakeSchema = Joi.object({
    cake_id: Joi.number().integer().min(1).required()
});

const getCakesForFlavorSchema = Joi.object({
    flavor_id: Joi.number().integer().min(1).required()
});

module.exports = {
    addFlavorToCakeSchema,
    removeFlavorFromCakeSchema,
    getFlavorsForCakeSchema,
    getCakesForFlavorSchema
};