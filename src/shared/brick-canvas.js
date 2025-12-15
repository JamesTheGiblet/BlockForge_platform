// src/shared/brick-canvas.js
// Shared brick drawing utility for all studios (Sign, Mosaic, QR, etc)

export function drawBrick(ctx, x, y, studSize, color) {
    // Draw base with rounded corners
    roundRect(ctx, x + 1, y + 1, studSize - 2, studSize - 2, 4);
    ctx.fillStyle = color;
    ctx.fill();

    // Draw stud shadow
    const centerX = x + studSize / 2;
    const centerY = y + studSize / 2;
    const radius = studSize * 0.35;
    ctx.beginPath();
    ctx.arc(centerX + 1.5, centerY + 1.5, radius - 0.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fill();

    // Draw stud base with gradient
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    const studGradient = ctx.createRadialGradient(
        centerX - radius/3, centerY - radius/3, 1,
        centerX, centerY, radius
    );
    studGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    studGradient.addColorStop(1, color);
    ctx.fillStyle = studGradient;
    ctx.fill();

    // Stud highlight
    ctx.beginPath();
    ctx.arc(centerX - radius/3, centerY - radius/3, radius/3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fill();

    // Subtle border
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 0.5;
    roundRect(ctx, x + 1, y + 1, studSize - 2, studSize - 2, 4);
    ctx.stroke();
}

export function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}
