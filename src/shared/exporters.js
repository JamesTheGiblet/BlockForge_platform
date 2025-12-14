// src/shared/exporters.js
export const Exporters = {
    toCSV(brickLayout) {
        console.log('Stub: Generating CSV');
        return "Color,Quantity,Part";
    },

    toHTML(brickLayout) {
        console.log('Stub: Generating HTML');
        return "<html><body><h1>Instructions</h1></body></html>";
    }
};