# Implementation Summary

The repository is configured for browser-only use.

Current active components:
- client/

Current runtime behavior:
- Authentication is stored in localStorage.
- Donations, notifications, feedback, and analytics are browser-backed.
- Reloads preserve state through the structured browser store.

Legacy backend and shared-package references have been removed from the runtime path.
