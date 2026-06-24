# Docker Image Build Notes - Complete Lifecycle

## Docker Lifecycle

```text
Application Code
      ↓
Dockerfile
      ↓
Build
      ↓
Image
      ↓
Run
      ↓
Container
      ↓
Logs / Reports
```

---

# Step 1: Create Dockerfile

Example:

```dockerfile
FROM cypress/included:15.17.0

WORKDIR /app

COPY . .

RUN npm install

ENTRYPOINT []

CMD ["npm","run","cy:run:all"]
```

---

# Step 2: Create docker-compose.yml

Example:

```yaml
services:
  cypress-tests:

    build:
      context: .
      dockerfile: Dockerfile

    image: cypress-tests-1

    volumes:
      - ./cypress/reports:/app/cypress/reports
```

---

# Step 3: Build Image

Command:

```bash
docker compose build
```

Result:

```text
Dockerfile
     ↓
Image Created
     ↓
cypress-tests-1:latest
```

Verify:

```bash
docker images
```

Example:

```text
REPOSITORY        TAG
cypress-tests-1   latest
```

---

# Step 4: Run Container

Command:

```bash
docker compose up
```

or

```bash
docker run cypress-tests-1
```

Result:

```text
Image
   ↓
Container Created
   ↓
Cypress Tests Executed
```

Verify Running Containers:

```bash
docker ps
```

Verify All Containers:

```bash
docker ps -a
```

---

# Step 5: View Logs

Command:

```bash
docker compose logs
```

or

```bash
docker logs <container-id>
```

Example:

```bash
docker logs conduit-api-framework-cypress-tests-1
```

---

# Step 6: Access Container

Get Container ID:

```bash
docker ps
```

Enter Container:

```bash
docker exec -it <container-id> sh
```

Example:

```bash
docker exec -it conduit-api-framework-cypress-tests-1 sh
```

Check Reports:

```bash
ls -R /app/cypress/reports
```

Exit:

```bash
exit
```

---

# Step 7: Stop Container

```bash
docker compose down
```

Result:

```text
Container Removed
Image Remains
```

---

# Step 8: Rebuild Image

After changing:

* Dockerfile
* package.json
* Source Code

Run:

```bash
docker compose build
```

Docker:

```text
Checks Cache
      ↓
Rebuilds Changed Layers
      ↓
Updates Image
```

---

# Docker Cache

Build Output:

```text
=> CACHED [2/4]
```

Meaning:

```text
Docker reused existing layers
```

Faster build.

---

# Build Without Cache

```bash
docker compose build --no-cache
```

Use when:

* Dependency issues
* Dockerfile changes
* Cache corruption

---

# Image vs Container

## Image

Blueprint / Template

```text
Dockerfile
     ↓
Build
     ↓
Image
```

Example:

```text
cypress-tests-1:latest
```

View:

```bash
docker images
```

---

## Container

Running Instance

```text
Image
   ↓
Run
   ↓
Container
```

View:

```bash
docker ps
```

---

# Image Naming

docker-compose.yml

```yaml
image: cypress-tests-1
```

Build:

```bash
docker compose build
```

Creates:

```text
cypress-tests-1:latest
```

---

# Rebuilding Existing Image

Before:

```text
cypress-tests-1:latest
```

Run:

```bash
docker compose build
```

After:

```text
cypress-tests-1:latest
```

Same name.

Docker updates the image.

---

# Create Separate Image

Change:

```yaml
image: cypress-tests-v2
```

Build:

```bash
docker compose build
```

Result:

```text
cypress-tests-1:latest
cypress-tests-v2:latest
```

Two images.

---

# Volume Mapping

docker-compose.yml

```yaml
volumes:
  - ./cypress/reports:/app/cypress/reports
```

Meaning:

```text
Host Machine
      ↓
./cypress/reports

Container
      ↓
/app/cypress/reports
```

Reports generated inside container become visible on host machine.

---

# Cypress Docker Binary Issue

Problem:

```text
Cypress executable not found
```

Cause:

```text
node_modules exists
Cypress Binary missing
```

Solution:

```dockerfile
FROM cypress/included:15.17.0
```

Contains:

```text
Node.js
npm
Cypress Binary
Chrome
Electron
Dependencies
```

---

# Docker Volume EBUSY Issue

Problem:

```text
EBUSY: resource busy or locked
```

Wrong:

```json
"delete:reports": "rimraf cypress/reports"
```

Reason:

```text
Mounted folders cannot be deleted
```

Correct:

```json
"delete:reports": "rimraf cypress/reports/**/*"
```

Delete files only.

---

# Useful Commands

## Build Image

```bash
docker compose build
```

## Build Without Cache

```bash
docker compose build --no-cache
```

## Run Container

```bash
docker compose up
```

## Run in Background

```bash
docker compose up -d
```

## Stop Container

```bash
docker compose down
```

## List Images

```bash
docker images
```

## List Running Containers

```bash
docker ps
```

## List All Containers

```bash
docker ps -a
```

## View Logs

```bash
docker compose logs
```

## Enter Container

```bash
docker exec -it <container-id> sh
```

## Remove Unused Images

```bash
docker image prune
```

## Remove All Stopped Containers

```bash
docker container prune
```

---

# Interview Summary

```text
Dockerfile
      ↓
docker compose build
      ↓
Image
      ↓
docker compose up
      ↓
Container
      ↓
Execute Cypress Tests
      ↓
Generate Reports
      ↓
Volume Mapping
      ↓
Reports Available On Host Machine
```

## Memory Trick

```text
Dockerfile
     ↓
Build
     ↓
Image
     ↓
Run
     ↓
Container
     ↓
Logs / Reports
```
