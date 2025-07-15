/**
 * Simple Donation Button
 * A minimal donation button that can be embedded anywhere
 */

function createDonationButton(container, options = {}) {
  const defaultOptions = {
    title: '🎓 Support Research',
    subtitle: 'Quick donation via Stripe',
    theme: 'blue', // blue, green, purple
    size: 'medium', // small, medium, large
    showAmounts: true,
  };

  const config = { ...defaultOptions, ...options };

  const themes = {
    blue: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    green: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)',
    purple: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  };

  const sizes = {
    small: { padding: '12px 16px', fontSize: '0.85em' },
    medium: { padding: '16px 24px', fontSize: '1em' },
    large: { padding: '20px 32px', fontSize: '1.1em' },
  };

  const buttonHTML = `
    <div class="simple-donation-button" style="
      background: ${themes[config.theme]};
      color: white;
      border-radius: 8px;
      padding: ${sizes[config.size].padding};
      text-align: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: all 0.2s ease;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: ${sizes[config.size].fontSize};
      user-select: none;
      display: inline-block;
      margin: 10px 0;
    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.2)'"
       onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)'"
       onclick="openDonationModal()">
      <div style="font-weight: 600; margin-bottom: 4px;">
        ${config.title}
      </div>
      <div style="font-size: 0.9em; opacity: 0.9;">
        ${config.subtitle}
      </div>
      ${
        config.showAmounts
          ? `
        <div style="margin-top: 8px; font-size: 0.85em; opacity: 0.8;">
          $5 • $10 • $20
        </div>
      `
          : ''
      }
    </div>
  `;

  if (typeof container === 'string') {
    document.querySelector(container).innerHTML = buttonHTML;
  } else {
    container.innerHTML = buttonHTML;
  }
}

function openDonationModal() {
  // Create modal overlay
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    backdrop-filter: blur(5px);
  `;

  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 30px;
    max-width: 400px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    position: relative;
  `;

  modalContent.innerHTML = `
    <button onclick="this.closest('.modal-overlay').remove()" style="
      position: absolute;
      top: 15px;
      right: 15px;
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #999;
    ">&times;</button>
    
    <h2 style="margin: 0 0 20px 0; color: #2c3e50; text-align: center;">
      🎓 Support AI Ethics Research
    </h2>
    
    <p style="color: #6c757d; text-align: center; margin-bottom: 25px;">
      Choose your support level for a secure one-time donation via Stripe
    </p>
    
    <div class="modal-donation-tiers" style="
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
      margin-bottom: 20px;
    ">
      <button class="modal-donation-btn" data-tier="1" style="
        background: linear-gradient(135deg, #cd7f32 0%, #cd7f32 100%);
        border: none;
        border-radius: 8px;
        padding: 16px;
        color: white;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <span>🥉 Bronze Support</span>
        <span style="font-size: 1.2em;">$5</span>
      </button>

      <button class="modal-donation-btn" data-tier="2" style="
        background: linear-gradient(135deg, #c0c0c0 0%, #c0c0c0 100%);
        border: none;
        border-radius: 8px;
        padding: 16px;
        color: white;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <span>🥈 Silver Support</span>
        <span style="font-size: 1.2em;">$10</span>
      </button>

      <button class="modal-donation-btn" data-tier="3" style="
        background: linear-gradient(135deg, #ffd700 0%, #ffd700 100%);
        border: none;
        border-radius: 8px;
        padding: 16px;
        color: #333;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <span>🏆 Gold Support</span>
        <span style="font-size: 1.2em;">$20</span>
      </button>
    </div>

    <input 
      type="email" 
      id="modal-donor-email" 
      placeholder="Email (optional - for receipt)"
      style="
        width: 100%;
        padding: 12px;
        border: 2px solid #e9ecef;
        border-radius: 6px;
        font-size: 1em;
        box-sizing: border-box;
        margin-bottom: 20px;
      "
    >

    <div class="modal-status" style="
      min-height: 20px;
      text-align: center;
      font-size: 0.9em;
      margin-bottom: 15px;
      color: #6c757d;
    "></div>

    <div style="text-align: center; font-size: 0.85em; color: #999;">
      🔒 Secure payment processing by Stripe<br>
      No account creation required
    </div>
  `;

  modal.appendChild(modalContent);
  modal.className = 'modal-overlay';
  document.body.appendChild(modal);

  // Add event listeners to modal buttons
  const modalButtons = modal.querySelectorAll('.modal-donation-btn');
  const modalStatus = modal.querySelector('.modal-status');

  modalButtons.forEach(button => {
    button.addEventListener('click', async e => {
      const { tier } = e.target.closest('button').dataset;
      const donorEmail = modal.querySelector('#modal-donor-email').value;

      // Disable buttons and show loading
      modalButtons.forEach(btn => (btn.disabled = true));
      modalStatus.innerHTML = '⏳ Creating secure checkout...';

      try {
        await processModalDonation(tier, donorEmail);
      } catch (error) {
        console.error('Donation error:', error);
        modalStatus.innerHTML = '❌ Error creating checkout. Please try again.';
        modalButtons.forEach(btn => (btn.disabled = false));
      }
    });
  });

  // Close modal when clicking outside
  modal.addEventListener('click', e => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

async function processModalDonation(tier, donorEmail = '') {
  if (!window.firebase) {
    throw new Error('Firebase not initialized');
  }

  const priceIds = {
    1: 'price_1RkyADJDA3nPZHAFQJr2ySBR', // $5 Bronze
    2: 'price_1RkyADJDA3nPZHAFXasv2dM0', // $10 Silver
    3: 'price_1RkyADJDA3nPZHAFoyRLGmpQ', // $20 Gold
  };

  const createAnonymousCheckout = firebase
    .functions()
    .httpsCallable('createAnonymousCheckout');

  const result = await createAnonymousCheckout({
    priceId: priceIds[tier],
    tier,
    donorEmail: donorEmail.trim(),
  });

  if (result.data.url) {
    // Redirect to Stripe Checkout
    window.location.href = result.data.url;
  } else {
    throw new Error('No checkout URL received');
  }
}

// Make functions available globally
window.createDonationButton = createDonationButton;
window.openDonationModal = openDonationModal;
