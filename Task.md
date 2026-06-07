# Task: Implement Email Verification Flow on Registration Screen

## Existing Registration Screen Fields

- Email
- OTP (Boolean/Verification Status)
- Username
- Password
- Confirm Password
- Mobile Number

## Requirements

### 1. Email Verification UI

- Add a **"Verify"** label/button on the right side of the Email input field.
- The **Verify** label should only be visible when the user enters a valid email address.
- If the email is invalid or empty, the Verify label should remain hidden.

### 2. Email OTP Flow (Temporary Local Implementation)

- When the user clicks the **Verify** label:

  - Simulate sending an OTP to the entered email address.
  - No backend/API integration is required at this stage.
  - Manage the entire OTP flow locally for now.
  - Structure the implementation so that real API integration can be added later with minimal changes.

### 3. OTP Verification UI

- After clicking the Email Verify button:

  - Display the OTP input field.
  - Add a **"Verify"** label/button on the right side of the OTP input field.

### 4. OTP Verification Logic

- When the user clicks the OTP Verify button:

  - Simulate OTP verification locally.
  - Once OTP verification succeeds:

    - Hide the OTP input field.
    - Remove the Verify label/button from the Email field.
    - Display a green verification indicator (checkmark/icon/text) next to the Email field to indicate that the email has been successfully verified.

### 5. Future API Integration Readiness

- Design the implementation so that:

  - Email OTP generation API can be integrated later.
  - OTP verification API can be integrated later.
  - Existing UI and business logic require minimal modification when APIs are added.

## Important Constraints

- Do not break any existing functionality.
- Analyze the current Registration Screen implementation thoroughly before making changes.
- Review all related dependencies, validation logic, form state management, and submission flows before implementation.
- Avoid unnecessary refactoring.
- Keep the implementation minimal, clean, maintainable, and production-safe.
- Ensure all existing validation and registration flows continue to work exactly as before.
- Verify that the registration process behaves correctly in all possible scenarios after the changes are applied.
