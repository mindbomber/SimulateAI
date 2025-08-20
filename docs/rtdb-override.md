# Realtime Database Override

If Firebase Hosting does not inject `databaseURL` (rare) or you need to temporarily force a specific Realtime Database endpoint, you can set a global override without rebuilding:

```html
<script>
  // Force RTDB endpoint
  window.SIMULATEAI_RTDB_URL =
    "https://simulateai-research-default-rtdb.firebaseio.com";
</script>
```

This is honored by:

- `src/js/services/firebase-service.js` during initial `getDatabase` setup
- `src/js/services/realtime-classroom-service.js` when it initializes its own database handle

When unset, the app will use:

1. Hosting-injected `databaseURL` from `/__/firebase/init.json`
2. Derived fallback: `https://<projectId>-default-rtdb.firebaseio.com`
3. Fallback mode (localStorage) if neither is available

Remove the override after validation.
