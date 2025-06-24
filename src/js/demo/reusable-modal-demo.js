// Demo for ReusableModal
import ReusableModal from '../components/reusable-modal.js';

document.addEventListener('DOMContentLoaded', () => {
    // Add demo button
    const demoBtn = document.createElement('button');
    demoBtn.textContent = 'Show Demo Modal';
    demoBtn.style = 'position:fixed;bottom:70px;left:20px;z-index:9999;padding:10px 18px;background:#3b82f6;color:#fff;border:none;border-radius:5px;cursor:pointer;font-size:14px;';
    document.body.appendChild(demoBtn);

    demoBtn.addEventListener('click', () => {
        const modal = new ReusableModal({
            title: 'Reusable Modal Demo',
            content: '<p>This is a reusable modal/dialog component. You can use it for confirmations, alerts, forms, or any custom content.</p>',
            footer: '<button id="modal-ok-btn" style="background:#10b981;color:#fff;padding:8px 16px;border:none;border-radius:4px;cursor:pointer;">OK</button>',
            onClose: () => {
                window.NotificationToast.info('Modal Closed', 'You closed the demo modal.');
            }
        });
        modal.open();
        setTimeout(() => {
            const okBtn = document.getElementById('modal-ok-btn');
            if (okBtn) okBtn.addEventListener('click', () => modal.close());
        }, 100);
    });
});
