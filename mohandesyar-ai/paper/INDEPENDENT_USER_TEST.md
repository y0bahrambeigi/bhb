# Independent-user validation protocol — MohandesYar AI 2.0

This protocol is the minimum external validation evidence required before the
software-paper submission is finalized. The tester must not be the software
author and should not have participated in the development workflow.

## Test environment

- Tester name or public identifier:
- Relationship to project: independent user
- Device:
- Operating system and version:
- Browser and version:
- Test date:
- Release/tag tested:
- Application URL:
- Evidence reference (non-sensitive screenshot/log):

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

| Check | Result | Notes |
|---|---|---|
| Application opened | [ ] PASS [ ] FAIL | |
| PWA installation/launch | [ ] PASS [ ] FAIL [ ] N/A | |
| Synthetic project creation | [ ] PASS [ ] FAIL | |
| Evidence persistence | [ ] PASS [ ] FAIL | |
| SHA-256 metadata present | [ ] PASS [ ] FAIL | |
| Backup export | [ ] PASS [ ] FAIL | |
| Backup restore | [ ] PASS [ ] FAIL | |
| Persian report generation | [ ] PASS [ ] FAIL | |
| Offline relaunch | [ ] PASS [ ] FAIL | |

## Independent-user statement

> I independently installed/opened MohandesYar AI 2.0 and followed the
> validation procedure above using only synthetic, non-sensitive data. I report
> the results shown in this record and did not participate in development of the
> tested release.

Tester/signature or verifiable public identifier:

Date:

Do not include private project records, precise private GPS coordinates,
credentials, or personal media in the repository.


## Release gate status

Change this line only after an independent tester has completed the procedure
and the evidence record above is complete:

`INDEPENDENT_TEST_STATUS: PENDING`
