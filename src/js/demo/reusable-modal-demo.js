// Demo for ModalUtility (new modal system)
import ModalUtility from '../components/modal-utility.js';

document.addEventListener('DOMContentLoaded', () => {
    // Add demo button
    const demoBtn = document.createElement('button');
    demoBtn.textContent = 'Show Demo Modal';
    demoBtn.style = 'position:fixed;bottom:70px;left:20px;z-index:9999;padding:10px 18px;background:#3b82f6;color:#fff;border:none;border-radius:5px;cursor:pointer;font-size:14px;';
    document.body.appendChild(demoBtn);

    demoBtn.addEventListener('click', () => {
        const modal = new ModalUtility({
            title: 'Modal Utility Demo',
            content: '<p>This is the new modal utility using the advanced-ui-components.css modal system. This replaces the old ReusableModal for better consistency.</p>',
            footer: '<button id="modal-ok-btn" class="btn btn-primary">OK</button>',
            onClose: () => {
                if (window.NotificationToast) {
                    window.NotificationToast.info('Modal Closed', 'You closed the demo modal.');
                }
            }
        });
        modal.open();
        setTimeout(() => {
            const okBtn = document.getElementById('modal-ok-btn');
            if (okBtn) okBtn.addEventListener('click', () => modal.close());
        }, 100);
    });
});
