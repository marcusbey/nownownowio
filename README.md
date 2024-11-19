# NOWNOWNOW

NOWNOWNOW is a versatile website widget designed to help you share live updates with your audience and build trust effortlessly. Whether you're managing a blog, an organization, or any interactive platform, NOWNOWNOW provides the tools you need to keep your audience engaged and informed in real-time.

## Features

- **Live Updates**: Share real-time updates seamlessly.
- **User Authentication**: Secure login with OAuth providers.
- **Prisma Integration**: Robust database management with Prisma.
- **Tailwind CSS**: Stylish and responsive design out of the box.
- **Email Integration**: Automated emails using Resend.
- **Stripe Integration**: Handle subscriptions and payments effortlessly.
- **Customizable Layouts**: Easily modify layouts to suit your brand.

## Tech Stack

- **Framework**: Next.js
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma with PostgreSQL
- **Authentication**: NextAuth.js
- **Email Service**: Resend
- **Payments**: Stripe
- **State Management**: Zustand
- **UI Components**: Radix UI, ShadCN UI
- **Other Tools**: UploadThing, Stream Chat

## Getting Started

### Prerequisites

- Node.js v20.14.0
- pnpm package manager

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/nownownow.git
   cd nownownow
   ```

2. **Install dependencies using pnpm:**

   ```bash
   pnpm install
   ```

3. **Set up environment variables:**

   Create a `.env` file in the root directory and add the following variables:

   ```env
   # Example .env file

   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   DATABASE_URL=your_database_url
   # Add other necessary environment variables here
   ```

   > **Note:** Replace placeholder values with your actual configuration details.

4. **Run Prisma migrations:**

   ```bash
   pnpm prisma migrate deploy
   ```

## Running the Development Server

Start the development server with:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application in action.

## Building for Production

To build the application for production:

```bash
pnpm build
```

Start the production server:

```bash
pnpm start
```

## Linting and Formatting

- **Lint the code:**

  ```bash
  pnpm lint
  ```

- **Format the code:**

  ```bash
  pnpm format
  ```

## Running Tests

Execute the test suite with:

```bash
pnpm test
```

## Scripts

Here's a quick overview of the available scripts:

- `pnpm dev` - Starts the development server.
- `pnpm build` - Builds the application for production.
- `pnpm start` - Runs the production server.
- `pnpm lint` - Runs ESLint to analyze code quality.
- `pnpm format` - Formats the codebase using Prettier.
- `pnpm ts` - Checks TypeScript types.
- `pnpm email` - Starts email development tools.
- `pnpm stripe-webhooks` - Listens to Stripe webhooks.
- `pnpm vercel-build` - Prepares the app for deployment on Vercel.
- `pnpm postinstall` - Generates Prisma client.
- `pnpm clean` - Fixes lint issues, checks types, and formats code.
- `pnpm knip` - Runs Knip for maintaining code snippets.

## Project Structure

Here's a high-level overview of the project's structure:

```
.
├── app
├── components
├── content
├── emails
├── prisma
├── public
├── src
├── .env.example
├── next.config.js
├── package.json
├── pnpm-lock.yaml
├── README.md
└── ...
```

## Configuration

### Environment Variables

Ensure all necessary environment variables are set in the `.env` file as outlined in the Installation section.

### Tailwind CSS

Tailwind is configured via `tailwind.config.js`. Customize the design tokens and extend the default theme as needed.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/YourFeature`.
3. Make your changes.
4. Commit your changes: `git commit -m 'Add some feature'`.
5. Push to the branch: `git push origin feature/YourFeature`.
6. Open a pull request.

## License

This project is licensed under the MIT License.

## Contact

For any questions or feedback, feel free to reach out at [contact@nownownow.io](mailto:contact@nownownow.io).

---

Built with ❤️ by BASE32 Inc.
