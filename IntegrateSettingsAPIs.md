# Goal: Integrate Settings APIs

Implement API integration for the following features under:

`@src/screens/authorised/settings`

## Scope

### 1. Logout

Integrate the logout API to support:

- Log out from the current device only.
- Clear all locally stored authentication/session data after successful logout.
- Redirect the user to the login screen.
- Handle API errors and edge cases gracefully.

---

### 2. Update Password

Implement the complete password reset/update flow using the provided APIs:

#### Step 1: Request Password Reset OTP

- Trigger the API to send a password-reset OTP to the user's registered email address.
- Add proper loading states, validations, and error handling.

#### Step 2: Verify Password Reset OTP

- Verify the OTP entered by the user.
- Exchange the verified OTP for a single-use reset token.
- Store and use the reset token only for the password reset flow.

#### Step 3: Reset/Update Password

- Complete the password update process using the reset token and the new password.
- Handle success and failure scenarios appropriately.
- Maintain the existing UI unless API integration requires minor adjustments.

---

### 3. Add Device

Implement device registration functionality.

#### Register Device

- Integrate the API to register a device for the authenticated customer.
- Ensure all required request parameters are passed correctly.
- Handle loading, success, and failure states.

#### List Devices

- Integrate the API to fetch all devices associated with the authenticated customer.
- Display the device list in the appropriate screen/component.
- Support refresh/update after a new device is registered.

---

## Implementation Requirements

### Analysis First

Before making any changes:

1. Deeply analyze the API documentation.
2. Deeply analyze the existing Settings module structure.
3. Review all related screens, hooks, services, navigation flows, state management, and dependencies.
4. Understand the current password update flow, logout flow, and add-device flow before implementing any changes.

### Development Guidelines

- Do not break any existing functionality.
- Reuse existing API/service patterns wherever possible.
- Follow the project's existing architecture, coding style, and naming conventions.
- Avoid unnecessary refactoring.
- Keep the implementation clean, minimal, and production-ready.
- Ensure proper validation, loading states, error handling, and success handling.
- Maintain backward compatibility with the current application flow.
- Update navigation and state management only where required.
- Verify all related flows end-to-end after implementation.

### Expected Outcome

- Logout API fully integrated and working.
- Password reset/update flow fully integrated with OTP verification and reset token handling.
- Device registration API integrated and functional.
- Device listing API integrated and displayed correctly.
- No regressions in existing Settings functionality.
- Production-safe implementation following current project patterns.

## Important Constraints

- Do not break any existing functionality.
- Review all related dependencies, validation logic, form state management, and submission flows before implementation.
- Avoid unnecessary refactoring.
- Keep the implementation minimal, clean, maintainable, and production-safe.
- Ensure all existing flows continue to work exactly as before.
