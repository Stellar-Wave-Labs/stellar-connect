# Contributing to StellarConnect

First off, thank you for considering contributing to StellarConnect! It's people like you that make open source such a great community.

## How to Contribute

### 1. Branching Strategy

We use a feature-branch workflow. When creating a new branch, please follow this naming convention:
- `feat/feature-name` for new features
- `fix/bug-name` for bug fixes
- `docs/doc-name` for documentation updates
- `refactor/refactor-name` for code refactoring

Example: `git checkout -b feat/stellar-wallet-kit-integration`

### 2. Local Development

To run the project locally:

1. Fork the repository and clone it to your local machine.
2. Run `npm install` to install dependencies.
3. Create a `.env` file based on the setup instructions in the `README.md`.
4. Run `npm run dev` to start the development server.

### 3. Commit Messages

We adhere to the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification. This helps us maintain a readable history and automate changelog generation.

**Format:**
```
<type>(<optional scope>): <description>
```

**Examples:**
- `feat: add stellar chain provider`
- `fix(ui): resolve overflow on mobile wallet display`
- `docs: update setup instructions`

### 4. Pull Requests

- Ensure your code passes all linting (`npm run lint`) and build (`npm run build`) checks before opening a PR.
- Fill out the Pull Request template completely.
- Link any relevant issues in your PR description (e.g., `Closes #12`).

We look forward to reviewing your PRs!
