# Cypress Reporting - Interview Revision Notes

## What is Cypress Reporting?

Cypress reporting is used to generate execution results in HTML/XML format and publish them in Jenkins, Azure DevOps, GitHub Actions, or other CI/CD tools.

---

# Reporting Flow

```text
Delete Old Reports
        ↓
Run Cypress Tests
        ↓
Generate XML Reports
        ↓
Merge XML Reports
        ↓
Publish Results in Jenkins
```

---

# Required Packages

```bash
npm install --save-dev mocha-junit-reporter
npm install --save-dev junit-merge
npm install --save-dev rimraf
```

---

# Package Purpose

| Package              | Purpose                              |
| -------------------- | ------------------------------------ |
| mocha-junit-reporter | Generates JUnit XML reports          |
| junit-merge          | Merges multiple XML reports into one |
| rimraf               | Deletes old reports before execution |

---

# Cypress Configuration

## cypress.config.ts

```typescript
reporter: 'mocha-junit-reporter',
reporterOptions: {
  mochaFile: 'cypress/results/results-[hash].xml'
}
```

---

# package.json Scripts

```json
{
  "scripts": {
    "delete:reports": "rimraf cypress/results",
    "prereport": "npm run delete:reports",
    "cy:run": "cypress run",
    "junit:merge": "npx junit-merge -d cypress/results -o cypress/results/results.xml"
  }
}
```

---

# Execution Commands

## Delete Existing Reports

```bash
npm run delete:reports
```

---

## Execute Cypress Tests

```bash
npx cypress run
```

Generates:

```text
cypress/results/
 ├── result1.xml
 ├── result2.xml
 ├── result3.xml
```

---

## Merge XML Reports

```bash
npm run junit:merge
```

Generates:

```text
cypress/results/results.xml
```

---

# Verify Reports

```powershell
dir cypress\results
```

Expected:

```text
results.xml
```

---

# Jenkins Integration

## Publish JUnit Report

```text
Post Build Action
    ↓
Publish JUnit Test Result Report
    ↓
cypress/results/results.xml
```

Benefits:

* Pass/Fail Summary
* Historical Trends
* Test Statistics
* Build Stability Metrics

---

# Common Errors

## Error

```text
rm is not recognized
```

### Reason

Linux command used on Windows.

### Fix

```json
"delete:reports": "rimraf cypress/results"
```

---

## Error

```text
ENOENT: no such file or directory
```

### Reason

Results folder does not exist.

### Fix

```powershell
mkdir cypress\results
```

or run Cypress again to generate reports.

---

## Error

```text
Illegal characters in path
```

### Reason

Using wildcard:

```text
cypress/results/*
```

with rimraf on Windows.

### Fix

```json
"delete:reports": "rimraf cypress/results"
```

---

# Interview Question

## How do you implement reporting in Cypress?

Answer:

We use the mocha-junit-reporter package to generate JUnit XML reports. Before execution, old reports are cleaned using rimraf. Cypress execution generates multiple XML files under the cypress/results folder. We then use junit-merge to combine all XML reports into a single results.xml file. Finally, Jenkins publishes the merged JUnit report to provide execution statistics, trends, and pass/fail metrics.

---

# Quick Revision Commands

```bash
# Install Packages
npm install --save-dev mocha-junit-reporter
npm install --save-dev junit-merge
npm install --save-dev rimraf

# Delete Reports
npm run delete:reports

# Run Tests
npx cypress run

# Merge Reports
npm run junit:merge

# Verify Reports
dir cypress\results
```



# Cypress + TypeScript + ESM vs CommonJS Notes

## Overview

While configuring a Cypress TypeScript framework, a common error occurs when using modern ES Modules (ESM) together with older CommonJS-based plugins such as `cypress-mochawesome-reporter`.

---

# TypeScript vs Module System

Many engineers confuse these concepts.

## TypeScript

TypeScript provides:

* Static Typing
* IntelliSense
* Compile-Time Error Checking
* Better Refactoring Support

Example:

```typescript
let username: string = "Abhishek";
```

TypeScript does NOT determine how files communicate.

---

## Module System

A module system determines how files share code.

### CommonJS

Uses:

```javascript
const fs = require("fs");

module.exports = {};
```

Commonly used in older Node.js projects.

---

### ES Modules (ESM)

Uses:

```typescript
import fs from "fs";

export default {};
```

Modern JavaScript and TypeScript standard.

---

# package.json Configuration

## CommonJS Project

```json
{
  "type": "commonjs"
}
```

or simply omit the `type` field.

Allows:

```javascript
require()
module.exports
```

---

## ES Module Project

```json
{
  "type": "module"
}
```

Allows:

```typescript
import
export
```

---

# Why the Error Occurred

Project configuration:

```json
{
  "type": "module"
}
```

Cypress configuration:

```typescript
require("cypress-mochawesome-reporter/plugin")(on);
```

Result:

```text
ReferenceError: require is not defined
```

Reason:

```text
ESM Project
+
CommonJS require()
=
Runtime Error
```

---

# Solution Using createRequire()

Node.js provides a compatibility bridge:

```typescript
import { createRequire } from "module";

const require = createRequire(import.meta.url);
```

This recreates `require()` inside an ESM project.

---

# Working Cypress Configuration

```typescript
import { defineConfig } from "cypress";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

export default defineConfig({

  reporter: "cypress-multi-reporters",

  reporterOptions: {
    configFile: "reporter-config.json",
  },

  e2e: {
    baseUrl: "https://api.realworld.io/api",

    setupNodeEvents(on, config) {

      require("cypress-mochawesome-reporter/plugin")(on);

      return config;
    },
  },
});
```

---

# Why createRequire() Works

Normal ESM:

```typescript
import fs from "fs";
```

No access to:

```javascript
require()
```

Using:

```typescript
const require = createRequire(import.meta.url);
```

creates a CommonJS-style loader inside an ESM project.

---

# Real-World QA Automation Example

Modern Framework:

```text
TypeScript
+
ES Modules
+
Cypress
```

Legacy Plugin:

```text
cypress-mochawesome-reporter
```

Bridge:

```text
createRequire()
```

Result:

```text
Modern Framework
      +
Legacy Plugin
      =
Compatible
```

---

# Interview Question

## Q: Why did require() fail after adding "type":"module"?

### Answer

When `"type": "module"` is added to `package.json`, Node.js treats the project as an ES Module project. ES Modules support `import/export` syntax and do not expose the CommonJS `require()` function. To consume legacy CommonJS libraries inside an ESM project, Node.js provides `createRequire()` from the `module` package, which acts as a compatibility bridge.

---





# Memory Tricks



## TypeScript vs Module System

```text
TypeScript
    ↓
Type Safety

Module System
    ↓
File Communication
```

---

## CommonJS

```javascript
require()
module.exports
```

---

## ESM

```typescript
import
export
```

---

## Compatibility Rule

```text
ESM + CommonJS Library
            ↓
      createRequire()
```

---

# Key Takeaway

Do NOT downgrade a modern TypeScript framework to CommonJS just because one library uses `require()`.

Instead:

```typescript
import { createRequire } from "module";

const require = createRequire(import.meta.url);
```

This allows a modern ESM-based Cypress framework to consume legacy CommonJS plugins safely.


