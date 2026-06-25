# Legal Workflow Platform

A no-code workflow builder for lawyers that allows creating embeddable forms, customizing them visually, and collecting secure submissions through webhooks.

The system includes an admin dashboard, a dynamic embeddable widget, and a fully serverless backend deployed on Google Cloud Run.

---

## Features

### 1. No-Code Workflow Builder
- Create forms with text, email, select, and radio fields
- Add/remove fields dynamically
- Configure webhook endpoints
- Live theme customization (colors, radius, typography)

### 2. Embedded Widget
- Single script (`widget.js`)
- Embeddable in any external website
- Dynamically fetches workflow configuration
- Renders form at runtime
- Reflects changes instantly without redeployment

### 3. Secure Backend
- API routes for workflows and submissions
- Firestore database for storage
- Domain validation per workflow
- HMAC-signed webhook delivery

---

## Project Structure
- app/ Next.js routes (admin + APIs)
- components/ UI components
- features/ Workflow logic + schema
- lib/ Firebase setup
- public/ Static assets (widget.js)
- terraform/ Infrastructure as Code (GCP Cloud Run)

---

## Local Development

### 1. Install dependencies
```bash

npm install
```
### 2. Setup environment variables

Create .env:

NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_app_measurement_id
### 3. Run development server
```bash

npm run dev
```
App runs at:

http://localhost:3000

## Widget Usage

Embed the workflow in any external website:
```bash

<div
  data-workflow-id="WORKFLOW_ID"
  data-api-base="https://app-domain.com"
/>

<script src="https://app-domain.com/widget.js"></script>
```

### How It Works
#### Runtime Flow
- Browser downloads widget.js
- Widget.js runs
- Widget detects data-workflow-id 
- Fetches workflow config from backend
- Dynamically renders form fields
- Applies stored theme
- Submits data to backend API
## Security Model

### 1. Domain Validation

Each workflow is restricted to the allowed domain stored in Firestore.  
The domain is defined by the user during workflow creation.

---

### 2. HMAC Webhook Signing

When a workflow is created, the system generates a **unique secret key** for that workflow.

- The secret is shown **only once** in a modal after creation
- The user must store it securely, as it will not be displayed again

This secret is used to sign all outgoing webhook requests.

#### Signing process

Each webhook payload is signed using:

- HMAC-SHA256
- Workflow secret key
- Timestamp (to prevent replay attacks)
  signature = HMAC_SHA256(secret, payload + timestamp)
-
---

### 3. Input Validation

All submissions are validated server-side before processing.

---

## Deployment (Google Cloud Run + Terraform)

### 1. Build Docker image

```bash
docker build -t gcr.io/PROJECT_ID/workflow-platform .
```

### 2. Push image

```bash
docker push gcr.io/PROJECT_ID/workflow-platform```
```

### 3. Deploy infrastructure

```bash
cd terraform
terraform init
terraform apply
```

### Infrastructure (Terraform)

The Terraform configuration:

- Deploys a single Cloud Run service
- Configures public access for widget usage
- Injects environment variables
- Outputs the deployed URL