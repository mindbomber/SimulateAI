/* eslint-disable no-console */
/**
 * Test script for validating confetti timing fix
 * This script can be run in the browser console to verify proper event flow
 */

// Test event sequence logging
function testConfettiTimingFix() {
  console.log('🧪 Testing Confetti Timing Fix...');
  
  const events = [];
  
  // Listen for scenario completion events
  document.addEventListener('scenario-completed', (event) => {
    events.push({
      type: 'scenario-completed',
      timestamp: Date.now(),
      data: event.detail
    });
    console.log('✅ scenario-completed event received:', event.detail);
  });
  
  // Listen for scenario modal closed events
  document.addEventListener('scenario-modal-closed', (event) => {
    events.push({
      type: 'scenario-modal-closed', 
      timestamp: Date.now(),
      data: event.detail
    });
    console.log('✅ scenario-modal-closed event received:', event.detail);
    
    // Calculate timing
    const completedEvent = events.find(e => e.type === 'scenario-completed');
    if (completedEvent) {
      const delay = events[events.length - 1].timestamp - completedEvent.timestamp;
      console.log(`⏱️ Time between events: ${delay}ms`);
      
      if (delay > 1000) {
        console.log('✅ SUCCESS: Modal properly closed before badge check (delay > 1000ms)');
      } else {
        console.log('❌ WARNING: Events too close together, modal may not be fully closed');
      }
    }
  });
  
  console.log('👀 Event listeners attached. Complete a scenario to test the timing.');
  
  // Return function to check results
  return {
    getEvents: () => events,
    clearEvents: () => events.length = 0
  };
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  window.confettiTimingTest = testConfettiTimingFix();
  console.log('Run window.confettiTimingTest.getEvents() to see captured events');
}
