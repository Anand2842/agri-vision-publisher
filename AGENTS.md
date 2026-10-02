# Architecture decisions

- Keep authentication email delivery in Lovable's managed email routes and templates, not an app-owned queue, because the platform owns sending and retries.
- Resolve the email template renderer's `entities` imports to the compatible installed version, because mixed transitive versions break server rendering.