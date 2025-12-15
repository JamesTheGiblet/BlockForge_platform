// src/shared/studio-header.js
// Shared StudioHeader component for BlockForge studios
// Usage: StudioHeader.inject({ title, description, features })

export class StudioHeader {
    /**
     * Injects a visually rich, animated header into the app container.
     * @param {Object} opts
     * @param {string} opts.title - Main studio title
     * @param {string} opts.description - Brief description (HTML allowed)
     * @param {Array<{icon: string, label: string, color: string}>} [opts.features] - Feature badges
     * @param {string} [opts.id] - Optional DOM id for the header
     */
    static inject({ title, description, features = [], id = 'studio-main-header' }) {
        const appContainer = document.getElementById('app-container');
        if (!appContainer || document.getElementById(id)) return;
        const header = document.createElement('div');
        header.id = id;
        header.style.margin = '0 auto 2rem auto';
        header.style.maxWidth = '100%';
        header.innerHTML = `
            <div class="studio-gradient-banner"
                 style="background: linear-gradient(90deg, #FF5722 0%, #FFD500 100%); border-radius: 22px; box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06); padding: 2.7rem 4vw 2.2rem 4vw; margin-bottom: 2.5rem; text-align: center; position: relative; overflow: hidden; max-width: 1400px; margin-left: auto; margin-right: auto; border: 3px solid rgba(255,255,255,0.2);">
                <div class="pixel-corner" style="position: absolute; top: 10px; left: 10px; width: 40px; height: 40px; border-top: 4px solid rgba(255,255,255,0.3); border-left: 4px solid rgba(255,255,255,0.3);"></div>
                <div class="pixel-corner" style="position: absolute; bottom: 10px; right: 10px; width: 40px; height: 40px; border-bottom: 4px solid rgba(255,255,255,0.3); border-right: 4px solid rgba(255,255,255,0.3);"></div>
                <h1 style="font-family:'Space Mono',monospace;font-size:3.2rem;color:#fff;margin:0 0 1rem 0;letter-spacing:-1.5px;text-shadow:0 4px 12px rgba(0,0,0,0.2);position:relative;display:inline-block;">
                    <span class="title-text">${title}</span>
                    <span style="position: absolute; top: -10px; right: -25px; font-size: 1.8rem;">✨</span>
                </h1>
                <div style="font-size:1.3rem;color:rgba(255,255,255,0.95);max-width:700px;margin:0 auto 1.2rem auto;line-height:1.7;text-shadow:0 2px 6px rgba(0,0,0,0.15);background:rgba(0,0,0,0.1);padding:1rem 1.5rem;border-radius:12px;backdrop-filter:blur(4px);border:1px solid rgba(255,255,255,0.1);">
                    ${description}
                </div>
                <div style="display:flex;justify-content:center;gap:15px;flex-wrap:wrap;">
                    ${features.map(f => `
                        <div style="display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.15);padding:8px 16px;border-radius:20px;">
                            <div style="width:12px;height:12px;background:${f.color};border-radius:50%;"></div>
                            <span style="color:white;font-size:0.9rem;">${f.label}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        appContainer.prepend(header);
        StudioHeader.addStyles();
    }

    static addStyles() {
        if (document.getElementById('studio-header-style')) return;
        const style = document.createElement('style');
        style.id = 'studio-header-style';
        style.textContent = `
            @keyframes float { 0%,100%{transform:translateY(0px);} 50%{transform:translateY(-5px);} }
            @keyframes slideIn { from{transform:translateY(20px);opacity:0;} to{transform:translateY(0);opacity:1;} }
            .title-text { animation: float 3s ease-in-out infinite; }
            .studio-gradient-banner { animation: slideIn 0.8s ease-out; }
        `;
        document.head.appendChild(style);
    }
}
