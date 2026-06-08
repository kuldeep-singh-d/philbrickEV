# Task: Develop Settings, Add Device, and Update Password Screens

## Goal

Develop the following screens and implement the initial/basic functionality:

1. Settings Screen
2. Add Device Screen
3. Update Password Screen

## UI References

Use the provided design references for implementation:

- Setting: `@Setting.png`
- Add Device: `@Add device.png`
- Update Password: `@Updated Password.png`

## Development Requirements

### 1. UI Implementation

- Build the UI to closely match the provided design references.
- Ensure all screens are fully responsive across different device sizes and orientations.
- Follow existing design patterns, spacing, typography, colors, and component usage already present in the project.

### 2. Code Structure & Standards

- Before implementation, thoroughly analyze the existing codebase structure.

- Use `@src/screens/unauthorised` as the reference implementation for:

  - Folder structure
  - File organization
  - Coding style
  - Component patterns
  - Form handling patterns
  - Navigation patterns
  - Validation patterns
  - State management approach

- Follow the same code conventions and architecture used throughout the project.

- New screens should be implemented within the already-created folders under:

  - `@src/screens/authorised`

### 3. Basic Functionality

Implement initial/basic functionality only:

#### Settings Screen

- Display UI as per design.
- Implement navigation to related screens where applicable.
- Add placeholder handlers for future API integrations.

#### Add Device Screen

- Implement all UI elements shown in the design.
- Add form validations where required.
- Implement basic submit flow.
- Add placeholder logic for future backend/API integration.

#### Update Password Screen

- Implement:

  - Current Password
  - New Password
  - Confirm Password

- Add validations:

  - Required field validation
  - Password matching validation
  - Basic password rules validation (if already followed elsewhere in the project)

- Implement basic submit flow with local validation.

- Keep the implementation ready for future API integration.

### 4. Navigation

- Configure navigation between screens as required by the design and existing application flow.
- Ensure navigation follows the same patterns used throughout the project.

### 5. Quality Requirements

- Deeply analyze existing implementations before making changes.
- Do not break any existing functionality.
- Avoid unnecessary refactoring.
- Reuse existing components and utilities wherever possible.
- Keep the implementation clean, scalable, maintainable, and production-ready.
- Follow the project's existing coding standards and best practices.

### 6. Validation & Testing

- Verify all screen flows manually.
- Test all validation scenarios.
- Test navigation scenarios.
- Ensure responsive behavior across different screen sizes.
- Confirm that no existing functionality is impacted by the new implementation.

## Important Constraints

- Do not break any existing functionality.
- Review all related dependencies, validation logic, form state management, and submission flows before implementation.
- Avoid unnecessary refactoring.
- Keep the implementation minimal, clean, maintainable, and production-safe.
- Ensure all existing flows continue to work exactly as before.
