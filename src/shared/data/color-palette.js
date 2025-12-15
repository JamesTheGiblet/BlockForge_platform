
// --- LEGO Color Definitions and Utilities ---
export const LEGO_COLORS = [
    { id: 'white', name: 'White', hex: '#FFFFFF', isCurrent: true, family: 'neutral', category: 'basic', yearIntroduced: 1949 },
    { id: 'black', name: 'Black', hex: '#1B1B1B', isCurrent: true, family: 'neutral', category: 'basic', yearIntroduced: 1957 },
    { id: 'brightRed', name: 'Bright Red', hex: '#E53935', isCurrent: true, family: 'red', category: 'bright', yearIntroduced: 1949 },
    { id: 'brightBlue', name: 'Bright Blue', hex: '#1565C0', isCurrent: true, family: 'blue', category: 'bright', yearIntroduced: 1949 },
    { id: 'brightYellow', name: 'Bright Yellow', hex: '#FFD500', isCurrent: true, family: 'yellow', category: 'bright', yearIntroduced: 1949 },
    { id: 'brightGreen', name: 'Bright Green', hex: '#4CAF50', isCurrent: true, family: 'green', category: 'bright', yearIntroduced: 1993 },
    { id: 'darkGreen', name: 'Dark Green', hex: '#237841', isCurrent: true, family: 'green', category: 'earth', yearIntroduced: 1997 },
    { id: 'darkBlue', name: 'Dark Blue', hex: '#203A70', isCurrent: true, family: 'blue', category: 'earth', yearIntroduced: 2001 },
    { id: 'darkRed', name: 'Dark Red', hex: '#A21317', isCurrent: true, family: 'red', category: 'earth', yearIntroduced: 1997 },
    { id: 'tan', name: 'Tan', hex: '#E4CD9A', isCurrent: true, family: 'yellow', category: 'earth', yearIntroduced: 1998 },
    { id: 'brown', name: 'Brown', hex: '#582A12', isCurrent: true, family: 'brown', category: 'earth', yearIntroduced: 1976 },
    { id: 'lightBluishGray', name: 'Light Bluish Gray', hex: '#A3A2A4', isCurrent: true, family: 'gray', category: 'neutral', yearIntroduced: 2004 },
    { id: 'darkBluishGray', name: 'Dark Bluish Gray', hex: '#635F61', isCurrent: true, family: 'gray', category: 'neutral', yearIntroduced: 2004 },
    { id: 'orange', name: 'Orange', hex: '#FF800D', isCurrent: true, family: 'orange', category: 'bright', yearIntroduced: 2001 },
    { id: 'mediumAzure', name: 'Medium Azure', hex: '#36C3DD', isCurrent: true, family: 'blue', category: 'bright', yearIntroduced: 2011 },
    { id: 'lime', name: 'Lime', hex: '#D0E650', isCurrent: true, family: 'green', category: 'bright', yearIntroduced: 2001 },
    { id: 'sandGreen', name: 'Sand Green', hex: '#A0BCAC', isCurrent: true, family: 'green', category: 'earth', yearIntroduced: 2000 },
    { id: 'sandBlue', name: 'Sand Blue', hex: '#7A99AB', isCurrent: true, family: 'blue', category: 'earth', yearIntroduced: 2001 },
    { id: 'nougat', name: 'Nougat', hex: '#E2B07A', isCurrent: true, family: 'brown', category: 'earth', yearIntroduced: 1978 },
    { id: 'mediumNougat', name: 'Medium Nougat', hex: '#B67B50', isCurrent: true, family: 'brown', category: 'earth', yearIntroduced: 2001 },
    { id: 'darkOrange', name: 'Dark Orange', hex: '#A95500', isCurrent: true, family: 'orange', category: 'earth', yearIntroduced: 2003 },
    { id: 'darkTan', name: 'Dark Tan', hex: '#958A73', isCurrent: true, family: 'yellow', category: 'earth', yearIntroduced: 2004 },
    { id: 'lightPink', name: 'Light Pink', hex: '#F5C3C6', isCurrent: true, family: 'pink', category: 'bright', yearIntroduced: 2004 },
    { id: 'magenta', name: 'Magenta', hex: '#C8187B', isCurrent: true, family: 'pink', category: 'bright', yearIntroduced: 1991 },
    { id: 'mediumLavender', name: 'Medium Lavender', hex: '#AC78BA', isCurrent: true, family: 'purple', category: 'bright', yearIntroduced: 2012 },
    { id: 'lavender', name: 'Lavender', hex: '#E1D5ED', isCurrent: true, family: 'purple', category: 'bright', yearIntroduced: 2012 },
    { id: 'springYellowishGreen', name: 'Spring Yellowish Green', hex: '#E5F774', isCurrent: true, family: 'green', category: 'bright', yearIntroduced: 2017 },
    { id: 'mediumStoneGray', name: 'Medium Stone Gray', hex: '#A3A2A4', isCurrent: true, family: 'gray', category: 'neutral', yearIntroduced: 2004 },
    { id: 'darkStoneGray', name: 'Dark Stone Gray', hex: '#635F61', isCurrent: true, family: 'gray', category: 'neutral', yearIntroduced: 2004 },
    { id: 'brightOrange', name: 'Bright Orange', hex: '#FF800D', isCurrent: true, family: 'orange', category: 'bright', yearIntroduced: 2001 },
    { id: 'mediumBlue', name: 'Medium Blue', hex: '#6C8EBF', isCurrent: true, family: 'blue', category: 'bright', yearIntroduced: 2001 },
    { id: 'mediumGreen', name: 'Medium Green', hex: '#7C9055', isCurrent: true, family: 'green', category: 'earth', yearIntroduced: 2001 },
    { id: 'darkBrown', name: 'Dark Brown', hex: '#352100', isCurrent: true, family: 'brown', category: 'earth', yearIntroduced: 2011 },
    { id: 'oliveGreen', name: 'Olive Green', hex: '#9B9A5A', isCurrent: true, family: 'green', category: 'earth', yearIntroduced: 2011 },
    { id: 'sandYellow', name: 'Sand Yellow', hex: '#D6C59A', isCurrent: true, family: 'yellow', category: 'earth', yearIntroduced: 2004 },
    { id: 'sandRed', name: 'Sand Red', hex: '#D07D6A', isCurrent: true, family: 'red', category: 'earth', yearIntroduced: 2001 },
    { id: 'mediumDarkPink', name: 'Medium Dark Pink', hex: '#F785B1', isCurrent: true, family: 'pink', category: 'bright', yearIntroduced: 2004 },
    { id: 'aqua', name: 'Aqua', hex: '#B3D7D1', isCurrent: true, family: 'blue', category: 'bright', yearIntroduced: 2001 },
    { id: 'lightAqua', name: 'Light Aqua', hex: '#D9F3E6', isCurrent: true, family: 'blue', category: 'bright', yearIntroduced: 2012 },
    { id: 'mediumYellow', name: 'Medium Yellow', hex: '#FFF07A', isCurrent: true, family: 'yellow', category: 'bright', yearIntroduced: 2010 },
    { id: 'brightLightOrange', name: 'Bright Light Orange', hex: '#FFD67B', isCurrent: true, family: 'orange', category: 'bright', yearIntroduced: 2004 },
    { id: 'brightLightBlue', name: 'Bright Light Blue', hex: '#9FC3E9', isCurrent: true, family: 'blue', category: 'bright', yearIntroduced: 2004 },
    { id: 'brightLightYellow', name: 'Bright Light Yellow', hex: '#FFF07A', isCurrent: true, family: 'yellow', category: 'bright', yearIntroduced: 2004 },
    { id: 'brightLightGreen', name: 'Bright Light Green', hex: '#B6D042', isCurrent: true, family: 'green', category: 'bright', yearIntroduced: 2012 },
    { id: 'springGreen', name: 'Spring Green', hex: '#C7D23C', isCurrent: true, family: 'green', category: 'bright', yearIntroduced: 2004 },
    { id: 'mediumLime', name: 'Medium Lime', hex: '#D9E650', isCurrent: true, family: 'green', category: 'bright', yearIntroduced: 2012 },
    { id: 'mediumOrange', name: 'Medium Orange', hex: '#FFA70B', isCurrent: true, family: 'orange', category: 'bright', yearIntroduced: 2004 },
    { id: 'mediumLavender', name: 'Medium Lavender', hex: '#AC78BA', isCurrent: true, family: 'purple', category: 'bright', yearIntroduced: 2012 },
    { id: 'lavender', name: 'Lavender', hex: '#E1D5ED', isCurrent: true, family: 'purple', category: 'bright', yearIntroduced: 2012 }
];

export const ColorFilters = {
    getCurrentColors: () => LEGO_COLORS.filter(color => color.isCurrent),
    getByFamily: (family) => LEGO_COLORS.filter(color => color.family === family),
    getByCategory: (category) => LEGO_COLORS.filter(color => color.category === category),
    getTransparentColors: () => LEGO_COLORS.filter(color => color.isTransparent),
    getMetallicColors: () => LEGO_COLORS.filter(color => color.isMetallic),
    getBasicColors: () => LEGO_COLORS.filter(color =>
        ['white', 'black', 'brightRed', 'brightBlue', 'brightYellow', 'brightGreen'].includes(color.id)
    ),
    getEarthTones: () => LEGO_COLORS.filter(color =>
        color.category === 'earth' || ['tan', 'sandGreen', 'sandBlue', 'sandRed'].includes(color.id)
    ),
    getBrightColors: () => LEGO_COLORS.filter(color => color.category === 'bright'),
    getByYearRange: (startYear, endYear) =>
        LEGO_COLORS.filter(color =>
            color.yearIntroduced >= startYear &&
            color.yearIntroduced <= endYear
        ),
    search: (query) => {
        const lowerQuery = query.toLowerCase();
        return LEGO_COLORS.filter(color =>
            color.name.toLowerCase().includes(lowerQuery) ||
            color.id.toLowerCase().includes(lowerQuery) ||
            color.family.toLowerCase().includes(lowerQuery) ||
            color.category.toLowerCase().includes(lowerQuery)
        );
    }
};

export const ColorUtils = {
    hexToRgb: (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },
    getContrastColor: (hexColor) => {
        const rgb = ColorUtils.hexToRgb(hexColor);
        if (!rgb) return '#000000';
        const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
        return luminance > 0.5 ? '#000000' : '#FFFFFF';
    },
    findClosestColor: (targetHex) => {
        const targetRgb = ColorUtils.hexToRgb(targetHex);
        if (!targetRgb) return LEGO_COLORS[0];
        let closestColor = LEGO_COLORS[0];
        let minDistance = Infinity;
        for (const color of LEGO_COLORS) {
            const colorRgb = ColorUtils.hexToRgb(color.hex);
            if (!colorRgb) continue;
            const distance = Math.sqrt(
                Math.pow(colorRgb.r - targetRgb.r, 2) +
                Math.pow(colorRgb.g - targetRgb.g, 2) +
                Math.pow(colorRgb.b - targetRgb.b, 2)
            );
            if (distance < minDistance) {
                minDistance = distance;
                closestColor = color;
            }
        }
        return closestColor;
    },
    groupByFamily: () => {
        const groups = {};
        LEGO_COLORS.forEach(color => {
            if (!groups[color.family]) {
                groups[color.family] = [];
            }
            groups[color.family].push(color);
        });
        return groups;
    },
    getThemePalette: (theme) => {
        const themes = {
            'basic': ['white', 'black', 'brightRed', 'brightBlue', 'brightYellow', 'brightGreen'],
            'earth': ['tan', 'brown', 'darkGreen', 'sandGreen', 'sandBlue', 'oliveGreen'],
            'ocean': ['brightBlue', 'mediumBlue', 'lightBlue', 'sandBlue', 'darkAzure'],
            'forest': ['brightGreen', 'darkGreen', 'sandGreen', 'oliveGreen', 'springGreen'],
            'fire': ['brightRed', 'darkRed', 'brightOrange', 'darkOrange'],
            'ice': ['white', 'lightBlue', 'brightLightBlue', 'pastelBlue'],
            'neon': ['neonOrange', 'neonGreen', 'neonYellow', 'springGreen'],
            'transparent': ['transClear', 'transBlue', 'transRed', 'transGreen']
        };
        const themeIds = themes[theme] || themes['basic'];
        return LEGO_COLORS.filter(color => themeIds.includes(color.id));
    },
    getPrice: (hex) => {
        const color = LEGO_COLORS.find(c => c.hex.toLowerCase() === hex.toLowerCase());
        if (!color) return 0.10;
        // Simulated pricing based on category/rarity
        if (color.category === 'basic') return 0.05;
        if (color.category === 'neutral') return 0.08;
        if (color.category === 'earth') return 0.12;
        if (color.category === 'bright') return 0.15;
        return 0.10;
    }
};

export const COLOR_PALETTE_ARRAY = LEGO_COLORS.filter(color => color.isCurrent);
export const COLOR_FAMILIES = ColorUtils.groupByFamily();

export default {
    LEGO_COLORS,
    COLOR_PALETTE_ARRAY,
    COLOR_FAMILIES,
    ColorFilters,
    ColorUtils
};
