# Independent-user validation protocol — MohandesYar AI 2.0

This protocol is the minimum external validation evidence required before the
software-paper submission is finalized. The tester must not be the software
author and should not have participated in the development workflow.

## Test environment

- Tester name or public identifier: Independent user; name not provided
- Relationship to project: independent user outside the development workflow
- Device: Windows computer; exact device not provided
- Operating system and version: Windows; exact version not provided
- Browser and version: Not provided
- Test date: Not provided
- Release/tag tested: MohandesYar AI 2.0 pre-release/public PWA
- Application URL: https://y0bahrambeigi.github.io/bhb/mohandesyar-ai/
- Evidence reference: successful independent Windows test confirmed by the author on 10 September 2026; no non-sensitive screenshot/log supplied

## Procedure

1. Open the published MohandesYar AI 2.0 application while online.
2. Install it as a PWA where the platform supports installation.
3. Create a synthetic project named `DEMO-RC-B01-INDEPENDENT`.
4. Add at least two non-sensitive synthetic images.
5. Confirm that SHA-256 metadata are shown for the evidence files.
6. Export a backup.
7. Remove the local test project and restore the backup.
8. Confirm that the project and evidence are restored.
9. Generate the Persian report and confirm that it is readable and contains the
   expected project/evidence information.
10. Disable network connectivity, close the application, and reopen it.
11. Confirm that the restored project remains accessible offline.

## Acceptance record

The author confirmed that an independent user completed the Windows validation successfully.
The individual sub-checks below were not separately recorded at the time of the test, so they
are not reconstructed or invented after the fact.

| Check | Result | Notes |
|---|---|---|
| Overall Windows PWA validation | PASS (user-confirmed) | Performed by an independent user |
| Individual protocol sub-checks | Not separately recorded | Do not infer missing detail |

## Independent-user statement

The tester's signed statement or public identifier was not supplied. The author
confirmed on 10 September 2026 that the Windows test was performed successfully
by another user who was independent of the development workflow. This is
reported as author-confirmed independent-user evidence and is not represented
as a signed third-party certification.

Do not include private project records, precise private GPS coordinates,
credentials, or personal media in the repository.


## Release gate status

Change this line only after an independent tester has completed the procedure
and the evidence record above is complete:

`INDEPENDENT_TEST_STATUS: PASS`
