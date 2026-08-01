# Pull Request Template

<!--
  Use this template for PRs that modify the admin UI structure or pages.
  Keep PRs small and focused. Provide clear acceptance criteria and smoke test steps.
-->

## Summary

<!-- Short description of the change -->


## Related issue

<!-- Reference the issue or epic this PR belongs to -->


## What changed

- 


## Checklist (required)

- [ ] No changes to backend APIs or database migrations
- [ ] Old routes remain accessible OR a clear migration banner/redirect is provided
- [ ] Reused shared components where appropriate (or justified why not)
- [ ] Smoke test steps included below
- [ ] Migration map included (what moved and where)
- [ ] sidebar.config.ts updated (if applicable)
- [ ] PR is small and focused (one logical change)


## Smoke test steps

1. Login as admin
2. Open admin and ensure the app loads
3. Navigate to the modules affected by this PR
4. Verify there are no console errors


## Acceptance criteria

- [ ] UI builds and runs locally
- [ ] No regressions in core flows affected by the change


## Notes / rollback plan


