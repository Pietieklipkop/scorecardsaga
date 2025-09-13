# Rebuilding Scoreboard Saga with SvelteKit

This document provides a comprehensive guide for rebuilding the "Scoreboard Saga" application using the SvelteKit framework. It outlines the equivalent technologies and provides a step-by-step process for development.

## Tech Stack Translation

Here is a comparison of the original Next.js tech stack and the recommended SvelteKit equivalents:

| Category          | Next.js Stack                               | SvelteKit Equivalent                              | Notes                                                                                             |
| ----------------- | ------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Framework**     | Next.js                                     | **SvelteKit**                                     | SvelteKit is a full-stack framework built on Svelte and Vite.                                     |
| **UI Library**    | React                                       | **Svelte**                                        | A radical new approach to building user interfaces.                                               |
| **Backend**       | Firebase                                    | **Firebase**                                      | The Firebase JS SDK is framework-agnostic and works great with SvelteKit.                         |
| **Styling**       | Tailwind CSS                                | **Tailwind CSS**                                  | Integrates seamlessly with SvelteKit.                                                             |
| **Messaging**     | Twilio                                      | **Twilio**                                        | The Twilio Node.js SDK can be used in SvelteKit's server routes.                                  |
| **UI Components** | Radix UI                                    | **shadcn-svelte** / **Bits UI**                   | `shadcn-svelte` is a port of `shadcn/ui` to Svelte, built on top of Bits UI (a Radix UI port).   |
| **Forms**         | React Hook Form                             | **Superforms**                                    | A SvelteKit-first library for building forms that work with and without JavaScript.               |
| **Validation**    | Zod                                         | **Zod**                                           | Zod is framework-agnostic and integrates perfectly with Superforms.                               |
| **Testing**       | Vitest                                      | **Vitest**                                        | SvelteKit comes with Vitest pre-configured.                                                       |

---

## Step-by-Step Rebuilding Guide

### 1. Initialize SvelteKit Project

Start by creating a new SvelteKit project.

```bash
npm create svelte@latest scoreboard-saga-sveltekit
cd scoreboard-saga-sveltekit
```

When prompted, select the following options:
- **Which Svelte app template?**: Skeleton project
- **Add type checking with TypeScript?**: Yes, using TypeScript syntax
- **Select additional options**: ESLint, Prettier, Playwright, Vitest

Then, install the dependencies:
```bash
npm install
```

### 2. Setup Tailwind CSS

You can use the `svelte-add` utility to quickly set up Tailwind CSS.

```bash
npx svelte-add@latest tailwindcss
npm install
```

This will create the necessary configuration files (`tailwind.config.cjs`, `postcss.config.cjs`) and add the required CSS directives to `src/app.css`.

### 3. Firebase Integration

Create a new Firebase project and get your credentials.

**Environment Variables:**
In SvelteKit, you manage environment variables in `.env`. Public variables (exposed to the browser) are prefixed with `PUBLIC_`, while private variables are not.

Create a `.env` file:
```
# Public Firebase credentials
PUBLIC_FIREBASE_API_KEY=your_api_key
PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
PUBLIC_FIREBASE_PROJECT_ID=your_project_id
PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
PUBLIC_FIREBASE_APP_ID=your_app_id

# Private Firebase Admin credentials (for server-side code)
# You'll need to generate a service account key in your Firebase project
FIREBASE_PROJECT_ID="..."
FIREBASE_CLIENT_EMAIL="..."
FIREBASE_PRIVATE_KEY="..."

# Private Twilio credentials
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
```

**Firebase Client:**
Create a file at `src/lib/firebase/client.ts` to initialize Firebase for the client-side.

```typescript
// src/lib/firebase/client.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import {
  PUBLIC_FIREBASE_API_KEY,
  PUBLIC_FIREBASE_AUTH_DOMAIN,
  PUBLIC_FIREBASE_PROJECT_ID,
  PUBLIC_FIREBASE_STORAGE_BUCKET,
  PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  PUBLIC_FIREBASE_APP_ID
} from '$env/static/public';

const firebaseConfig = {
  apiKey: PUBLIC_FIREBASE_API_KEY,
  authDomain: PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: PUBLIC_FIREBASE_APP_ID
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
```

### 4. Component Library (shadcn-svelte)

Initialize `shadcn-svelte` in your project.

```bash
npx shadcn-svelte@latest init
```

You can now add components as needed. For example, to add a button:
```bash
npx shadcn-svelte@latest add button
```
This will add a `Button.svelte` component to `src/lib/components/ui/button`.

### 5. Routing

SvelteKit uses a file-based routing system similar to Next.js. Create folders under `src/routes` to define your pages. For example:
- `src/routes/+page.svelte` -> `/`
- `src/routes/scoreboard/+page.svelte` -> `/scoreboard`
- `src/routes/login/+page.svelte` -> `/login`

### 6. Form Handling with Superforms & Zod

This is a powerful combination for handling forms in SvelteKit.

**Installation:**
```bash
npm install sveltekit-superforms zod
```

**Example: Add Player Form**

1.  **Create a Zod Schema** (`src/lib/schemas.ts`):
    ```typescript
    import { z } from 'zod';

    export const playerSchema = z.object({
      name: z.string().min(2, 'Name must be at least 2 characters.'),
      surname: z.string().min(2, 'Surname must be at least 2 characters.'),
      email: z.string().email('Invalid email address.'),
      phone: z.string().min(10, 'Invalid phone number.')
    });
    ```

2.  **Create a Form Action** (`src/routes/add-player/+page.server.ts`):
    ```typescript
    import { superValidate } from 'sveltekit-superforms/server';
    import { playerSchema } from '$lib/schemas';
    import { fail } from '@sveltejs/kit';

    export const load = async () => {
      const form = await superValidate(playerSchema);
      return { form };
    };

    export const actions = {
      default: async ({ request }) => {
        const form = await superValidate(request, playerSchema);
        if (!form.valid) {
          return fail(400, { form });
        }

        // TODO: Add player to Firestore database
        console.log(form.data);

        return { form };
      }
    };
    ```

3.  **Create the Svelte Form** (`src/routes/add-player/+page.svelte`):
    ```html
    <script lang="ts">
      import { superForm } from 'sveltekit-superforms/client';
      import * as Card from '$lib/components/ui/card';
      import { Button } from '$lib/components/ui/button';
      import { Input } from '$lib/components/ui/input';
      import { Label } from '$lib/components/ui/label';

      export let data;

      const { form, enhance } = superForm(data.form);
    </script>

    <Card.Root>
      <Card.Header>
        <Card.Title>Add New Player</Card.Title>
      </Card.Header>
      <Card.Content>
        <form method="POST" use:enhance>
          <div>
            <Label for="name">Name</Label>
            <Input name="name" id="name" bind:value={$form.name} />
          </div>
          <!-- Add other form fields here -->
          <Button type="submit">Add Player</Button>
        </form>
      </Card.Content>
    </Card.Root>
    ```

### 7. API Routes (Twilio)

Create an API route at `src/routes/api/send-whatsapp/+server.ts`.

```typescript
// src/routes/api/send-whatsapp/+server.ts
import { json } from '@sveltejs/kit';
import twilio from 'twilio';
import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } from '$env/static/private';

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

export async function POST({ request }) {
  const { to, body } = await request.json();

  try {
    await client.messages.create({
      from: 'whatsapp:+14155238886', // Twilio Sandbox Number
      to: `whatsapp:${to}`,
      body: body
    });
    return json({ success: true });
  } catch (error) {
    return json({ success: false, error: error.message }, { status: 500 });
  }
}
```

This guide provides a solid foundation for rebuilding Scoreboard Saga in SvelteKit. The combination of SvelteKit's features with powerful libraries like Superforms and shadcn-svelte allows for a modern, efficient, and enjoyable development experience.
