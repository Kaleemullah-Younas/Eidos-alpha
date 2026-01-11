# EIDOS Development Setup

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0 or higher ([Download](https://nodejs.org/))
- **npm** or **pnpm** package manager
- **MongoDB** instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Google AI Studio** API key ([Get API Key](https://makersuite.google.com/app/apikey))

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/eidos.git
cd eidos
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/eidos?retryWrites=true&w=majority"

# Authentication
BETTER_AUTH_SECRET="your-32-character-random-secret"
BETTER_AUTH_URL="http://localhost:3000"

# AI
GOOGLE_API_KEY="your-google-ai-studio-api-key"

# Optional: OAuth Providers
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
```

#### Generating BETTER_AUTH_SECRET

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use OpenSSL
openssl rand -hex 32
```

### 4. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push
```

### 5. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## Project Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Development Workflow

### Code Structure

```
eidos/
├── app/              # Pages and API routes
│   ├── api/         # Backend endpoints
│   └── [route]/     # Frontend pages
├── components/       # React components
├── lib/             # Utilities and services
├── prisma/          # Database schema
├── public/          # Static assets
└── docs/            # Documentation
```

### Making Changes

1. **Frontend**: Edit files in `app/` and `components/`
2. **Backend**: Add/modify routes in `app/api/`
3. **Database**: Update `prisma/schema.prisma`, then run:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
4. **Styles**: Use CSS Modules (`ComponentName.module.css`)

### Hot Reload

The development server automatically reloads when you save changes:
- **Pages & Components**: Instant refresh
- **API Routes**: Automatic restart
- **CSS**: Instant injection

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | MongoDB connection string |
| `BETTER_AUTH_SECRET` | Yes | Random secret for session encryption |
| `BETTER_AUTH_URL` | Yes | Base URL of the application |
| `GOOGLE_API_KEY` | Yes | Google AI Studio API key for Gemini |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| `GITHUB_CLIENT_ID` | No | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | No | GitHub OAuth client secret |

---

## Troubleshooting

### Database Connection Issues

```
Error: Can't reach database server
```

**Solution**: Check your `DATABASE_URL` and ensure:
- MongoDB cluster is running
- IP whitelist includes your IP (Atlas)
- Username/password are correct

### Prisma Client Not Found

```
Error: @prisma/client did not initialize yet
```

**Solution**: Run `npx prisma generate`

### API Key Errors

```
Error: API key not valid
```

**Solution**: 
- Verify `GOOGLE_API_KEY` in `.env`
- Check API key restrictions in Google Cloud Console
- Ensure Generative AI API is enabled

### Port Already in Use

```
Error: Port 3000 is already in use
```

**Solution**: 
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
npm run dev -- -p 3001
```

---

## Production Deployment

### Build

```bash
npm run build
```

### Environment

Set the following for production:
- `NODE_ENV=production`
- `BETTER_AUTH_URL` to your production URL
- Secure database credentials

### Hosting

Recommended platforms:
- **Vercel** (optimal for Next.js)
- **Railway**
- **Render**
- **AWS/GCP/Azure**

---

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Better-Auth Documentation](https://better-auth.com)
- [Google AI for Developers](https://ai.google.dev/)
