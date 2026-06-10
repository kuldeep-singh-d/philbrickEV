# Goal: Add Current Control Slider in Settings Screen

Add a new current control view at the end of the Settings screen, after all existing buttons/options.

## Feature Requirement

Create a mobile-style tap-and-drag control similar to how users adjust device volume or brightness.

The user should be able to increase or decrease the current value by dragging horizontally:

- Swipe/drag left: decrease current
- Swipe/drag right: increase current

## Current Range

- Minimum current: `1A`
- Maximum current: `32A`
- Default/current value example: `16A`

## UI Requirement

- Add this view at the bottom of the Settings screen, after all buttons.
- The view UI should match the existing Settings button/card style.
- Apply `LinearGradient` to this view.
- Show the current selected value in the center of the view, for example:

`16 A`

## Interaction Requirement

- User should be able to tap and drag on the view.
- Current value should update smoothly based on horizontal drag movement.
- Clamp the value between `1A` and `32A`.
- The value should never go below `1A` or above `32A`.

## Important Requirements

- First analyze the existing Settings screen UI and component structure.
- Reuse the existing button/card styling pattern as much as possible.
- Do not break any existing Settings functionality.
- Avoid unnecessary refactoring.
- Keep the implementation minimal, clean, and production-safe.
