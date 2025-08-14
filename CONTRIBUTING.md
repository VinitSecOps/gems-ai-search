# Contributing to GEMS AI Search

Thank you for your interest in contributing to GEMS AI Search! We welcome contributions from the community.

## How to Contribute

### 1. Fork the Repository
- Fork the project on GitHub
- Clone your fork locally

### 2. Set Up Development Environment
- Follow the setup instructions in the README.md
- Ensure all tests pass before making changes

### 3. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 4. Make Your Changes
- Follow the existing code style
- Add tests for new functionality
- Update documentation as needed

### 5. Test Your Changes
```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test

# Test the application manually
npm start
```

### 6. Submit a Pull Request
- Push your branch to your fork
- Create a pull request with a clear description
- Link any related issues

## Code Style Guidelines

### JavaScript/Node.js
- Use ES6+ features
- Follow ESLint configuration
- Use meaningful variable names
- Add JSDoc comments for functions

### React
- Use functional components with hooks
- Follow React best practices
- Use PropTypes or TypeScript for type checking

### CSS
- Use Tailwind CSS classes
- Follow mobile-first responsive design
- Keep custom CSS minimal

## Reporting Issues

When reporting issues, please include:
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, etc.)
- Relevant logs or screenshots

## Development Setup

### Backend Development
```bash
cd backend
npm run dev  # Starts with nodemon for auto-restart
```

### Frontend Development
```bash
cd frontend
npm start  # Starts with hot reload
```

### Database Changes
- Document any schema changes
- Provide migration scripts if needed
- Update the README with new table requirements

Thank you for contributing to GEMS AI Search!
