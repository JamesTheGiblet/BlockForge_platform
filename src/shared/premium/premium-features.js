// src/shared/premium-features.js

export const PREMIUM_FEATURES = {
    'qr-studio': {
        'stylized_finders': {
            id: 'stylized_finders',
            label: 'Stylized Finders',
            description: 'Unlock custom corner patterns for your QR codes.',
            tier: 'pro'
        },
        'export_instructions': {
            id: 'export_instructions',
            label: 'Instruction Booklet',
            description: 'Generate professional step-by-step build guides.',
            tier: 'pro'
        },
        'export_csv': {
            id: 'export_csv',
            label: 'CSV Parts List',
            description: 'Export a compatible parts list for BrickLink.',
            tier: 'pro'
        },
        'safety_override': {
            id: 'safety_override',
            label: 'Safety Override',
            description: 'Bypass scan safety checks for artistic freedom.',
            tier: 'pro'
        }
    }
};

export class FeatureManager {
    /**
     * Check if a feature is locked for the current user
     * @param {string} studioId 
     * @param {string} featureId 
     * @param {object} user 
     * @returns {boolean} true if locked
     */
    static isLocked(studioId, featureId, user) {
        const studioFeatures = PREMIUM_FEATURES[studioId];
        if (!studioFeatures) return false;
        const feature = studioFeatures[featureId];
        if (!feature) return false;
        return feature.tier === 'pro' && (!user || !user.isPro);
    }
}