/**
 * Utility function to apply UpperCase to all string fields of a model.
 * To be used in Sequelize hooks (beforeCreate, beforeUpdate).
 */
const normalizeStrings = (instance) => {
    if (!instance || !instance.constructor || typeof instance.constructor.getAttributes !== 'function') {
        return;
    }
    const attributes = instance.constructor.getAttributes();
    for (const key in attributes) {
        if (attributes[key].type.constructor.name === 'STRING' || 
            attributes[key].type.constructor.name === 'TEXT') {
            const value = instance.getDataValue(key);
            if (typeof value === 'string') {
                instance.setDataValue(key, value.toUpperCase().trim());
            }
        }
    }
};

module.exports = {
    normalizeStrings
};
