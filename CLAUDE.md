# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MiRemover is a React-based web application for background removal from images using AI. The app supports multiple processing modes including AI background removal, image resizing, and head cropping functionality. It features user authentication, usage limits, and group management capabilities.

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **State Management**: Zustand
- **Authentication & Database**: Supabase
- **UI Components**: Lucide React icons, Framer Motion animations
- **File Processing**: JSZip for batch downloads
- **Backend**: Flask (Python) with unified processing API

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Preview production build
npm run preview

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage
```

## Architecture Overview

### Core Application Flow
1. **Image Upload**: Users drag/drop or select images via `ImageUploader`
2. **Processing Options**: Configure via `ModelSelector` dropdown menu with:
   - **Dimension Controls**: Custom width/height inputs (default: 1000×1500)
   - **Treatment Checkboxes**: AI removal, resize, head cropping
   - **Smart Combinations**: Automatic mode detection based on selected options
   - **LocalStorage Cache**: User preferences saved between sessions
3. **Background Processing**: Images processed via unified Flask backend using Bria API for AI operations
4. **Results Display**: Processed images shown in `ImagePreview` components with:
   - **Compact Dimensions**: Large dimensions formatted (1600×2400 → 1.6k×2.4k)
   - **Processing Status**: Visual indicators for pending/processing/completed states
5. **Batch Download**: Results downloadable as ZIP with JPG conversion

### State Management (Zustand Stores)

- **`authStore`**: User authentication state and methods
- **`usageStore`**: Usage tracking, limits, and group restrictions
- **`adminSettingsStore`**: Admin panel settings and configuration

### Key Services

#### API Service (`src/services/api.ts`)
Main image processing service with retry logic and request queuing that communicates with the unified Flask backend:

**Backend Integration:**
- Development: `http://localhost:5000` (direct Flask backend)
- Production: Direct Flask backend deployment (no external API needed)
- Unified endpoint: `POST /process?mode={mode}&width={width}&height={height}`

**Processing Flow:**
- Frontend sends images to Flask backend `/process` endpoint
- Backend uses Bria API for AI background removal operations
- Backend handles image optimization, format conversion, and error handling
- All image processing now centralized through the Python backend

**Processing Modes:**
- `ai` - Background removal only
- `resize` - Resizing only
- `both` - Background removal + resize
- `crop-head` - Head cropping (+ optional resize)
- `all` - Head cropping → resize → AI background removal (pipeline)

#### Usage Service (`src/stores/usageStore.ts`)
Main usage tracking and quota management:
- `logProcessingOperation()` - Tracks individual operations (bg_removal, resize, head_crop)
- `canProcess()` - Checks if user can process more images
- `remainingProcesses()` - Returns remaining quota
- Uses Supabase RPC functions: `log_processing_operation`, `check_user_quota`

### Authentication & Limits

#### User Types
- **Anonymous**: Limited to `maxFreeImages` (default: 10)  
- **Authenticated**: Personal `image_limit` from user_stats table

#### Limit Checking Logic
1. Anonymous users: Simple local counter check against `maxFreeImages`
2. Authenticated users: Real-time Supabase RPC calls to check quotas

### Component Structure

#### Core Components
- **`App.tsx`**: Main routing and application state with real-time stats updates
- **`Header.tsx`**: Navigation with group/individual stats display and live refresh
- **`ImageUploader.tsx`**: Drag/drop file input interface
- **`ModelSelector.tsx`**: Advanced dropdown menu with:
  - Dimension configuration (cached in localStorage)
  - Multiple treatment selection via checkboxes
  - Intelligent mode combination logic
  - Real-time preview of selected options
- **`ImagePreview.tsx`**: Individual image display with:
  - Compact dimension formatting for large sizes
  - Responsive design optimizations
  - Processing status animations

#### Modal Components
- **`AuthModal.tsx`**: Login/registration interface
- **`LimitModal.tsx`**: Usage limit notifications
- **`QuickGuideModal.tsx`**: User help/instructions
- **`ResizeModal.tsx`**: Dimension configuration
- **`GroupLimitModal.tsx`**: Group-specific limit warnings  
- **`UserMenu.tsx`**: User profile and settings dropdown
- **`AdvancedStatsModal.tsx`**: Detailed usage statistics

### Backend Architecture (Python Flask)

Located in `/backend/` directory with unified processing system:

#### Core Architecture
- **`app_unified.py`**: Main Flask application with unified `/process` endpoint
- **`bria_processor.py`**: Handles AI background removal via **Bria API** (primary image processing)
- **`resize_processor.py`**: Image resizing with Pillow/ImageMagick 
- **`crop_processor.py`**: Face detection and head cropping with OpenCV

#### Bria API Integration
The application now uses **Bria API** as the primary image processing service:
- **Endpoint**: `https://engine.prod.bria-api.com/v1/background/remove`
- **Authentication**: API token via `bria_api_token` environment variable
- **Features**: Professional AI background removal with content moderation
- **Optimization**: Automatic image resize before API call (configurable max size: 1500px)
- **Error Handling**: Exponential backoff retry logic with specific error handling
- **Rate Limiting**: Intelligent handling of 429 responses with extended backoff

#### Backend Configuration
- **Unified Endpoint**: `POST /process?mode={ai|resize|both|crop-head|all}&width=X&height=Y`
- **Configuration Source**: Supabase `admin_settings` table with 5-minute cache
- **Admin Controls**: Real-time config reload via `/admin/reload-config`
- **Health Check**: `/health` endpoint with mode status and Bria connection info

### Environment Variables Required

#### Frontend (.env)
```env
VITE_SUPABASE_URL=<supabase-project-url>
VITE_SUPABASE_ANON_KEY=<supabase-anon-key>
```

#### Backend (.env or environment)
```env
# Supabase (for configuration and admin settings)
VITE_SUPABASE_URL=<supabase-project-url>
VITE_SUPABASE_ANON_KEY=<supabase-anon-key>

# Bria API (primary image processing)
BRIA_API_TOKEN=<bria-api-token>

# Optional backend configuration
FLASK_ENV=development
PORT=5000
ADMIN_TOKEN=<admin-reload-token>
```

### Processing Pipeline Details

The app supports sophisticated image processing workflows via the unified Flask backend:

#### Processing Modes
1. **`ai`**: Pure background removal using Bria API
2. **`resize`**: Image resizing only (Pillow/ImageMagick)
3. **`both`**: Resize → AI background removal (configurable order)
4. **`crop-head`**: Face detection + crop below nose + optional resize
5. **`all`**: Complete pipeline: Crop → Resize → AI background removal

#### Pipeline Features
- **Intelligent Error Handling**: Continue processing on crop/resize failures, stop on Bria API failures
- **Auto-Optimization**: Large images automatically resized before Bria API calls
- **Format Management**: Automatic output format selection (PNG for transparency, JPG for resize)
- **Configuration-Driven**: All settings stored in Supabase `admin_settings` with live reload
- **Retry Logic**: Exponential backoff with specific handling for rate limits and server errors

### Database Schema (Key Tables)

- **`user_stats`**: User profiles, limits, processed counts, admin flags
- **RPC Functions**: 
  - `log_processing_operation` - Records usage and tracks quotas
  - `check_user_quota` - Validates processing limits
  - `create_user_profile_manual` - Creates user profiles

### File Structure Notes

- `/src/components/admin/` - Admin-only components (settings, group management)
- `/src/pages/` - Static pages (Privacy, Terms, GDPR)  
- `/src/stores/` - Zustand state management (auth, usage, admin settings)
- `/src/services/` - API integrations and image processing utilities
- `/src/types/` - TypeScript interfaces and type definitions
- `/src/contexts/` - React contexts for global state
- `/src/hooks/` - Custom React hooks for admin functionality
- `/src/tests/` - Unit tests with Jest and React Testing Library
- `/backend/` - Python Flask backend with image processing modules

### Testing Framework

The application uses **Jest** and **React Testing Library** for testing:

- **`/src/tests/components/`** - Component unit tests
- **`/src/tests/stores/`** - Store logic tests  
- **`/src/tests/utils.test.ts`** - Utility function tests
- **`jest.config.js`** - Test configuration
- **`/src/tests/setup.ts`** - Test environment setup

**Test Coverage:**
- ModelSelector dropdown interactions and localStorage caching
- ImagePreview dimension formatting and status display
- AuthStore state management
- Utility functions (dimension formatting, file size, processing modes)

### Recent Features & Improvements

#### UI/UX Enhancements
- **Integrated Dropdown Menu**: Replaced modal popup with inline dropdown for treatment options
- **Smart Dimension Formatting**: Large dimensions auto-format (1600×2400 → 1.6k×2.4k)
- **Persistent User Preferences**: LocalStorage caching for dimensions and treatment selections
- **Real-time Stats Updates**: Header stats refresh live during processing
- **Responsive Design**: Improved mobile interface and compact layouts

#### Processing Logic
- **Multiple Treatment Combinations**: Support for any combination of AI, resize, crop-head
- **Intelligent Mode Detection**: Automatic mode assignment based on selected treatments
- **Enhanced Error Handling**: Better support for crop-head + AI removal combinations
- **Default Dimensions**: Changed from 512×512 to 1000×1500 for better photo results

#### Performance & Cache
- **localStorage Integration**: User preferences persist between sessions
- **Optimized Rendering**: Improved performance for large image sets
- **Memory Management**: Better cleanup of object URLs and event listeners

### Development Considerations

#### Image Processing Architecture
- **Backend-First**: All image processing now handled by Flask backend using Bria API
- **Client-Side**: Only handles JPG conversion for downloads and white background application
- **Memory Management**: Proper cleanup of object URLs and event listeners
- **Proxy Configuration**: Vite proxies `/api` to production backend, direct localhost for development

#### Key Technical Points
- **Bria API Integration**: Professional AI background removal replaces previous API
- **Configuration Management**: Supabase `admin_settings` table provides real-time backend configuration
- **Authentication State**: Persisted and synchronized across browser tabs
- **Quota System**: Real-time limit checking prevents processing when quotas exceeded
- **Error Handling**: Comprehensive retry logic with specific Bria API error codes
- **Performance**: Request queue limits concurrent processing, auto-optimization for large images

#### Development Environment Setup
1. **Frontend**: `npm run dev` (React + Vite)
2. **Backend**: Python Flask server on localhost:5000 with Bria API credentials
3. **Database**: Supabase for authentication, usage tracking, and configuration
4. **External API**: Bria API for AI background removal processing