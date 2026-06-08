# Task: Move MQTT Logic from `App.tsx` to Reusable `useMqtt` Hook

## Goal

There is some MQTT-related code currently commented out in `App.tsx`. Move that MQTT logic into a reusable custom hook:

`src/hooks/useMqtt.ts`

Then use this hook in the Dashboard screen and anywhere else it may be needed in the future.

## Requirements

### 1. Analyze Existing Flow

- First, carefully analyze the currently commented MQTT code in `App.tsx`.
- Understand its purpose, dependencies, state handling, connection flow, topic subscription, message handling, cleanup/disconnect logic, and any side effects.
- Also check how Dashboard currently works before integrating the hook.

### 2. Create/Update MQTT Hook

- Create or update:

`src/hooks/useMqtt.ts`

- Move the MQTT connection logic from `App.tsx` into this hook.
- The hook should be reusable and cleanly structured.
- It should expose only the required states/functions, for example:

  - connection status
  - received message/data
  - connect function
  - disconnect function
  - subscribe function, if needed
  - publish function, if needed
  - error state, if needed

### 3. Dashboard Integration

- Import and use `useMqtt` in the Dashboard screen.
- Ensure Dashboard uses MQTT data/functionality from the hook instead of directly depending on `App.tsx`.
- Keep the integration minimal and aligned with the existing Dashboard flow.

### 4. Future Reusability

- The hook should be designed so it can be reused in other screens later without duplicating MQTT logic.
- Avoid hardcoding screen-specific logic inside the hook unless it already exists in the current MQTT flow.
- Keep configuration, topics, and callbacks flexible where appropriate.

### 5. Cleanup `App.tsx`

- Remove the commented MQTT code from `App.tsx` after moving it to the hook.
- Keep `App.tsx` clean and focused only on app-level setup/routing/providers.
- Do not remove or modify unrelated logic.

### 6. Safety Requirements

- Do not break any existing functionality or navigation flow.
- Do not introduce unnecessary refactoring.
- Keep the implementation minimal, clean, and production-safe.
- Preserve the existing MQTT behavior exactly unless a small change is required to make it reusable.
- Ensure proper cleanup is handled to avoid duplicate MQTT connections, memory leaks, or repeated subscriptions.
- Verify that the app still starts and works correctly after the change.

### 7. Testing Checklist

- App launches successfully.
- Existing app flow remains unchanged.
- Dashboard works as before.
- MQTT connects correctly using the moved logic.
- MQTT messages are received correctly.
- MQTT disconnect/cleanup works correctly.
- No duplicate connections or subscriptions are created.
- No unrelated files or features are impacted.
