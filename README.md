# Virtual Try-On - AI Fashion Preview

A web-based virtual try-on tool that allows users to upload their photo and clothing images to generate AI-powered try-on previews.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (Radix UI)
- **Icons**: Lucide React
- **Package Manager**: pnpm
- **AI Provider**: Volcengine (火山方舟) dressing_diffusionV2 API

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Copy the example env file and add your Volcengine API credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:
```
VOLCENGINE_ACCESS_KEY=your_access_key
VOLCENGINE_SECRET_KEY=your_secret_key
```

Get your API credentials from: [Volcengine Console](https://console.volcengine.com/ark/region:ark+cn-beijing/apikey)

### 3. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to start using the app.

## Features

- **Image Upload**: Upload person photo and clothing photo
- **AI Try-On**: Generate try-on preview using Volcengine API
- **Session Reuse**: Person image is reused within the same session
- **Multiple Results**: View multiple AI-generated results with quality scores
- **Free Tier**: 5 free tries per session

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   └── tryon/         # Try-on API endpoints
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/
│   ├── ui/               # Base UI components
│   └── business/         # Business-specific components
├── contexts/             # React Context providers
├── lib/                  # Utility functions
├── services/             # External API clients
└── types/                # TypeScript type definitions
```

## API Endpoints

- `POST /api/tryon` - Submit a try-on task
- `GET /api/tryon/[taskId]` - Poll for try-on result

## License

MIT
