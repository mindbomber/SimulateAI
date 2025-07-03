// Demo for CardComponent
import CardComponent from '../components/card-component.js';

document.addEventListener('DOMContentLoaded', () => {
  // Demo card in lower left
  const demoCard = CardComponent.create({
    header: 'Reusable Card Demo',
    content:
      'This is a reusable card component. Use it for simulations, resources, analytics, and more.',
    actions: [
      {
        label: 'Show Toast',
        onClick: () =>
          window.NotificationToast.success(
            'Card Action',
            'You clicked the card action button!'
          ),
      },
      {
        label: 'Show Modal',
        onClick: () => {
          const modal = new window.ModalUtility({
            title: 'Card Modal',
            content:
              '<p>This modal was triggered from a card action button.</p>',
            footer:
              '<button id="card-modal-ok" class="btn btn-primary">OK</button>',
          });
          modal.open();
          setTimeout(() => {
            const okBtn = document.getElementById('card-modal-ok');
            if (okBtn) okBtn.addEventListener('click', () => modal.close());
          }, 100);
        },
      },
    ],
  });
  demoCard.style =
    'position:fixed;bottom:130px;left:20px;z-index:9999;max-width:320px;box-shadow:0 4px 16px rgba(59,130,246,0.12);';
  document.body.appendChild(demoCard);
});
