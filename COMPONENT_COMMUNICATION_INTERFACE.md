# Component Communication Interface

This document defines how components communicate in the SimulateAI application using the centralized event dispatcher system.

## Overview

The application uses a centralized event dispatcher to manage communication between components, reducing coupling and improving maintainability.

## Event Dispatcher

**Location:** `src/js/utils/event-dispatcher.js`

### Key Features:

- Centralized event management
- Event type constants for type safety
- Debugging support
- Automatic cleanup
- Global event broadcasting

### Usage:

```javascript
import eventDispatcher, { AUTH_EVENTS } from "../utils/event-dispatcher.js";

// Listen for events
eventDispatcher.on(AUTH_EVENTS.USER_SIGNED_IN, (event) => {
  console.log("User signed in:", event.detail);
});

// Emit events
eventDispatcher.emit(AUTH_EVENTS.SESSION_EXTENDED, {
  timestamp: Date.now(),
});
```

## Authentication Events

### AUTH_EVENTS Constants:

#### User Authentication

- `USER_SIGNED_IN` - User successfully signed in
- `USER_SIGNED_OUT` - User signed out
- `AUTH_STATE_CHANGED` - Authentication state changed

#### Profile Management

- `PROFILE_UPDATED` - User profile information updated
- `PROFILE_CUSTOMIZED` - User customized their profile

#### Session Management

- `SESSION_STARTED` - New session started
- `SESSION_EXTENDED` - Session extended/renewed
- `SESSION_WARNING` - Session about to expire
- `SESSION_EXPIRED` - Session has expired

#### Logout Events

- `LOGOUT_REQUESTED` - Logout requested by user
- `INTENTIONAL_LOGOUT_REQUESTED` - Specific logout with reason
- `LOGOUT_COMPLETED` - Logout process completed

#### Security Events

- `SECURITY_VIOLATION` - Security issue detected
- `SUSPICIOUS_ACTIVITY` - Suspicious user activity

## Component Communication Patterns

### AuthService ↔ IntentionalLogoutManager

**Communication Flow:**

1. AuthService sets up logout event listeners
2. IntentionalLogoutManager emits logout requests
3. AuthService handles logout and emits completion events

**Events Used:**

- `INTENTIONAL_LOGOUT_REQUESTED` - Logout manager → Auth service
- `SESSION_EXTENDED` - Both directions for session management
- `LOGOUT_COMPLETED` - Auth service → Logout manager

**Code Example:**

```javascript
// In AuthService
setupLogoutEventListeners() {
  eventDispatcher.on(AUTH_EVENTS.INTENTIONAL_LOGOUT_REQUESTED, (event) => {
    const { reason, data } = event.detail;
    this.performLogout(reason, data);
  });
}

// In IntentionalLogoutManager
performLogout() {
  eventDispatcher.emit(AUTH_EVENTS.INTENTIONAL_LOGOUT_REQUESTED, {
    reason: 'intentional_logout',
    data: { timestamp: Date.now() }
  });
}
```

### Session Management Communication

**Pattern:** Event-driven session monitoring

- Components listen for session events
- Session extensions broadcast to all listeners
- Session warnings trigger appropriate UI responses

### Error Handling Communication

**Pattern:** Centralized error broadcasting

- Components emit error events with context
- Error handlers listen globally
- UI components can respond to specific error types

## Benefits of This Architecture

### 1. Loose Coupling

- Components don't need direct references
- Easy to add/remove listeners
- Flexible event handling

### 2. Type Safety

- Event constants prevent typos
- Clear event interface definition
- IDE autocomplete support

### 3. Debugging Support

- Centralized event logging
- Debug mode with URL parameter
- Event tracking and monitoring

### 4. Scalability

- Easy to add new event types
- Components can be developed independently
- Clear communication contracts

## Best Practices

### 1. Event Naming

- Use descriptive, action-based names
- Follow consistent naming patterns
- Group related events by domain

### 2. Event Data

- Include relevant context in event detail
- Use timestamp for tracking
- Add source information for debugging

### 3. Error Handling

- Always handle event listener errors
- Use try-catch in event handlers
- Provide fallback mechanisms

### 4. Performance

- Avoid excessive event emissions
- Clean up listeners when components unmount
- Use background events for non-critical updates

## Testing Communication

### Event Testing Strategy

1. Mock the event dispatcher
2. Verify events are emitted with correct data
3. Test event listener responses
4. Validate event flow between components

### Example Test:

```javascript
// Test event emission
const mockEmit = jest.spyOn(eventDispatcher, "emit");
component.performAction();
expect(mockEmit).toHaveBeenCalledWith(AUTH_EVENTS.USER_SIGNED_IN, expectedData);

// Test event listening
const mockHandler = jest.fn();
eventDispatcher.on(AUTH_EVENTS.SESSION_EXTENDED, mockHandler);
component.triggerEvent();
expect(mockHandler).toHaveBeenCalled();
```

## Debugging Events

### Enable Debug Mode

Add `?debug=events` to the URL to see all event activity in the console.

### Event Inspector

Access `window.eventDispatcher.getEventTypes()` in the console to see all registered event types.

### Manual Event Testing

```javascript
// Test event emission in console
window.eventDispatcher.emit("testEvent", { test: true });

// Listen for events in console
window.eventDispatcher.on("testEvent", (e) =>
  console.log("Received:", e.detail),
);
```

## Future Enhancements

### Planned Improvements

1. Event replay for debugging
2. Event persistence for critical events
3. Cross-tab communication via BroadcastChannel
4. Event analytics and monitoring
5. Automatic event documentation generation

### Migration Path

1. Update existing components gradually
2. Maintain backward compatibility during transition
3. Add type definitions for TypeScript support
4. Create automated tests for event flows
