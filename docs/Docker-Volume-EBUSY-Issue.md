# Docker Volume EBUSY Issue

## Problem

Error:

```text
EBUSY: resource busy or locked
rmdir '/app/cypress/reports'
```

Current Setup:

```yaml
volumes:
  - ./cypress/reports:/app/cypress/reports
```

Script:

```json
"delete:reports": "rimraf cypress/reports"
```

---

## Root Cause

Docker volume is mounted:

```text
Host Folder
      ↓
./cypress/reports
      ↓
Mounted As
      ↓
/app/cypress/reports
```

A mounted folder cannot be deleted.

```text
❌ rimraf cypress/reports
```

Results in:

```text
EBUSY = Resource Busy
```

---

## Solution

Delete only the contents inside the folder.

```json
"delete:reports": "rimraf cypress/reports/**/*"
```

or

```json
"delete:reports": "rimraf cypress/reports/*"
```

---

## Execution Flow

```text
Delete Reports Folder
       ↓
EBUSY Error
       ↓
Cypress Not Executed
       ↓
JUnit Folder Not Created
       ↓
junit-merge Failed
```

Error:

```text
ENOENT: no such file or directory
scandir 'cypress/reports/junit'
```

---

## Fix Summary

❌ Wrong

```json
"delete:reports": "rimraf cypress/reports"
```

✅ Correct

```json
"delete:reports": "rimraf cypress/reports/**/*"
```

---

## Memory Trick

```text
Mounted Folder
      ↓
Cannot Delete Folder

Can Delete Files Inside Folder
```

```text
❌ rimraf cypress/reports

✅ rimraf cypress/reports/*
✅ rimraf cypress/reports/**/*
```
