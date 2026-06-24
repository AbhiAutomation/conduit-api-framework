# Cypress Docker Binary Missing Issue

## Problem Statement

While running Cypress tests inside a Docker container, the following error occurred:

```text
Cypress executable not found

You can run 'cypress install' to download the binary again.

Platform: linux-x64 (Debian GNU/Linux - 13)
Cypress Version: 15.17.0
```

Later, another error appeared:

```text
Error: ENOENT: no such file or directory,
scandir 'cypress/reports/junit'
```

---

# Root Cause Analysis

Many engineers assume that:

```bash
npm install cypress
```

installs everything required to run Cypress.

This is only partially true.

Cypress consists of two components:

## 1. Cypress NPM Package

Installed in:

```text
node_modules/cypress
```

Contains:

* Cypress CLI
* JavaScript libraries
* Cypress commands

Installed using:

```bash
npm install cypress --save-dev
```

---

## 2. Cypress Binary (Executable)

Stored separately.

### Linux

```text
/root/.cache/Cypress
```

### Windows

```text
C:\Users\<user>\AppData\Local\Cypress\Cache
```

### Mac

```text
~/Library/Caches/Cypress
```

Contains:

* Cypress executable
* Browser launcher
* Test runner engine

This binary is required to execute tests.

---

# What Happened in Docker?

Docker container contained:

```text
node_modules              ✅ Present
Cypress Binary            ❌ Missing
```

Execution flow:

```text
npm install
      ↓
node_modules created
      ↓
Cypress binary missing
      ↓
npx cypress run
      ↓
FAILED
```

---

# Why JUnit Merge Failed

Package.json Script:

```json
"cy:run:all":
"npm run prereport &&
 npx cypress run || true &&
 npm run junit:merge"
```

Execution Flow:

```text
Delete Reports Folder      ✅

Run Cypress               ❌
(Binary Missing)

|| true                   ✅
(Ignore Failure)

Run junit:merge           ❌
(No junit folder exists)
```

Since Cypress never executed successfully:

```text
cypress/reports/junit
```

was never created.

Therefore:

```text
ENOENT
=
Error NO ENTry
=
Folder does not exist
```

---

# Solution 1 - Install Cypress Binary

Add the following line to the Dockerfile:

```dockerfile
RUN npx cypress install
```

Example:

```dockerfile
FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npx cypress install

COPY . .

CMD ["npm","run","cy:run:all"]
```

---

# Solution 2 - Recommended (Official Cypress Image)

Use the official Cypress image:

```dockerfile
FROM cypress/included:15.17.0

WORKDIR /app

COPY . .

RUN npm install

CMD ["npm","run","cy:run:all"]
```

Benefits:

* Cypress pre-installed
* Browsers pre-installed
* Binary pre-installed
* Faster CI execution

---

# Verification Commands

Verify Cypress installation:

```bash
npx cypress verify
```

Expected output:

```text
Cypress verified successfully
```

---

# Architecture Flow

```text
Docker Build
      │
      ▼
npm install
      │
      ▼
node_modules
      │
      ▼
npx cypress install
      │
      ▼
Cypress Binary Downloaded
      │
      ▼
npx cypress run
      │
      ▼
JUnit Reports Generated
      │
      ▼
junit-merge
      │
      ▼
results.xml
```

---

# Interview Question

## Q: Why does Cypress fail inside Docker even though node_modules exists?

### Answer

Cypress consists of two separate components:

1. The npm package located in `node_modules`.
2. The Cypress executable binary stored in the Cypress cache directory.

In Docker or CI/CD environments, if only the npm package is installed but the binary is missing, `npx cypress run` fails because the executable cannot be found. The solution is to run `npx cypress install`, cache the Cypress binary, or use an official Cypress Docker image.

---

# Key Takeaway

```text
node_modules
      ↓
Cypress Package

/root/.cache/Cypress
      ↓
Cypress Executable

Need BOTH to execute tests successfully.
```
