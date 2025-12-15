// monetization.js - Handles subscriptions, pro features, white labeling, and ordering
import { FeatureManager } from './shared/index.js';

export class Monetization {
  constructor(options = {}) {
    this.user = null;
    this.isPro = false;
    this.whiteLabel = options.whiteLabel || false;
    this.apiBase = options.apiBase || '/api';
    this.init();
  }

  async init() {
    // Optionally check user session or subscription status
    await this.checkUserStatus();
  }

  async checkUserStatus() {
    // Placeholder: Replace with real API call
    // Example: fetch(`${this.apiBase}/user/status`)
    this.user = { name: 'Guest', isPro: false };
    this.isPro = this.user.isPro;
  }

  isLocked(studioId, featureId) {
    return FeatureManager.isLocked(studioId, featureId, this.user);
  }

  showProHero(container) {
    if (!container) return;
    container.innerHTML = `
      <section class="pro-hero">
        <h2 class="pro-title">Unlock <span class="pro-gradient">Pro Features</span></h2>
        <p class="pro-desc">Access advanced studios, unlimited exports, white labeling, and priority support.</p>
        <button class="pro-cta" id="upgrade-pro-btn">Upgrade to Pro</button>
      </section>
    `;
    document.getElementById('upgrade-pro-btn').onclick = () => this.openUpgradeModal();
  }

  openUpgradeModal(featureName = 'Pro Features') {
    // Show a modal or redirect to payment/upgrade page
    alert(`Upgrade to Pro to unlock ${featureName}!`);
  }

  showWhiteLabelBanner(container) {
    if (!container || !this.whiteLabel) return;
    container.innerHTML += `
      <div class="white-label-banner">Your Brand Here – Powered by BlockForge</div>
    `;
  }

  showOrderButton(container, productId) {
    if (!container) return;
    container.innerHTML += `
      <button class="order-btn" onclick="window.monetization.orderProduct('${productId}')">Order This Build</button>
    `;
  }

  orderProduct(productId) {
    // Placeholder: Integrate with e-commerce or order API
    alert(`Ordering product: ${productId}`);
  }
}

// Attach to window for global access if needed
window.monetization = new Monetization();
