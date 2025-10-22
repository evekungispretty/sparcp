# SPARC-P Clinical Communication Training Platform

A React + TypeScript + Vite application for clinical communication training using AI-powered chatbots with voice capabilities.

## 🎯 Overview

SPARC-P (Simulated Patient Avatar for Realistic Clinical Practice) is a clinical communication training platform that provides:

- **AI-Powered Chatbots**: Interactive conversations with simulated patients and clinical agents
- **Voice Integration**: Text-to-speech capabilities using ElevenLabs for realistic patient interactions
- **Multiple Scenarios**: Practice with different patient personas and clinical situations
- **Real-time Feedback**: CLEAR communication components tracking

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- API keys for Navigator Toolkit and ElevenLabs (see API Setup section)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sparcp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys (see API Setup section)
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔑 API Setup

This application requires API keys from two services:

### 1. UF Navigator Toolkit API

The Navigator Toolkit provides access to GPT models through LiteLLM proxy.

**Get your API key:**
1. Visit [UF Navigator API Keys](https://api.ai.it.ufl.edu/ui/?login=success&page=api-keys)
2. Log in with your UF credentials
3. Generate a new API key
4. Copy the API key and base URL

**Environment Variables:**
```env
VITE_NAVIGATOR_API_KEY=your-navigator-api-key-here
VITE_NAVIGATOR_BASE_URL=https://api.ai.it.ufl.edu
```

**About Navigator Toolkit:**
- **Service**: [Navigator Toolkit API](https://api.ai.it.ufl.edu/)
- **Technology**: Built on [LiteLLM](https://docs.litellm.ai/docs/) for OpenAI-compatible API access
- **Models**: Access to GPT models through UF's infrastructure
- **Documentation**: [LiteLLM Documentation](https://docs.litellm.ai/docs/)

### 2. ElevenLabs Text-to-Speech API

ElevenLabs provides high-quality voice synthesis for the chatbot responses.

**Get your API key:**
1. Visit [ElevenLabs API Keys](https://elevenlabs.io/app/developers/api-keys)
2. Sign up or log in to your ElevenLabs account
3. Navigate to the API Keys section
4. Generate a new API key
5. Copy the API key

**Environment Variables:**
```env
VITE_ELEVENLABS_API_KEY=your-elevenlabs-api-key-here
VITE_ELEVENLABS_ANNE_VOICE_ID=21m00Tcm4TlvDq8ikWAM
VITE_ELEVENLABS_MAYA_VOICE_ID=EXAVITQu4vr4xnSDxMaL
```

**Voice Configuration:**
- **Anne Palmer**: Professional, mature female voice (Rachel)
- **Maya Pena**: Warm, friendly female voice (Bella)

## 🎭 Available Scenarios

### Patient Personas
- **Anne Palmer**: 37-year-old legal guardian with HPV vaccine concerns
- **Maya Pena**: 29-year-old mother with vaccine safety questions

### Clinical Agents
- **C-LEAR Coach Agent**: Communication skills coach
- **SPARC-P Supervisor Agent**: Simulation environment supervisor

## 🎵 Voice Features

- **Auto-play**: Audio automatically plays when chatbots respond
- **Replay**: Click speaker icons to replay any message
- **Mute Control**: Toggle audio on/off as needed
- **Distinct Voices**: Each character has a unique voice personality

## 🏗️ Technical Architecture

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** for accessible components

### AI Integration
- **OpenAI SDK** for LiteLLM API communication
- **ElevenLabs SDK** for text-to-speech conversion
- **Dynamic Prompts** loaded from text files

### Key Services
- `src/services/litellm.ts` - Navigator API integration
- `src/services/elevenlabs.ts` - Voice synthesis
- `src/services/prompts.ts` - System prompt management

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── AvatarChat.tsx  # Main chat interface
│   ├── Navigation.tsx  # Sidebar navigation
│   ├── StatusBar.tsx   # Connection status
│   └── ui/             # Reusable UI components
├── services/           # API services
│   ├── litellm.ts      # Navigator API client
│   ├── elevenlabs.ts   # Voice synthesis
│   └── prompts.ts      # System prompts
├── prompts/            # System prompt files
│   ├── parent-anne-text-system-prompt.txt
│   ├── parent-maya-text-system-prompt.txt
│   ├── coach-individual-prompt.txt
│   └── supervisor-individual-prompt.txt
└── assets/             # Static assets
```

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your API keys:

```env
# UF Navigator API Configuration
VITE_NAVIGATOR_API_KEY=your-navigator-api-key-here
VITE_NAVIGATOR_BASE_URL=https://api.ai.it.ufl.edu

# ElevenLabs API Configuration
VITE_ELEVENLABS_API_KEY=your-elevenlabs-api-key-here
VITE_ELEVENLABS_ANNE_VOICE_ID=21m00Tcm4TlvDq8ikWAM
VITE_ELEVENLABS_MAYA_VOICE_ID=EXAVITQu4vr4xnSDxMaL
```

## 🔧 Troubleshooting

### Common Issues

1. **401 Authentication Error**
   - Check your Navigator API key
   - Verify the base URL is correct

2. **Audio Not Playing**
   - Check your ElevenLabs API key
   - Ensure browser allows audio playback
   - Check browser console for errors

3. **Chatbot Not Responding**
   - Check Navigator API connection in status bar
   - Verify API key permissions
   - Check network connectivity

### Status Indicators

The status bar shows:
- **HiperGator Status**: Connection to UF Navigator API
- **Model**: Current AI model being used
- **Last Checked**: Connection status timestamp

## 📚 Additional Resources

- [UF Navigator Toolkit](https://api.ai.it.ufl.edu/)
- [LiteLLM Documentation](https://docs.litellm.ai/docs/)
- [ElevenLabs API Documentation](https://elevenlabs.io/docs)
- [React + TypeScript + Vite](https://vitejs.dev/guide/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of the SPARC-P clinical communication training initiative.

---

**Note**: This application requires valid API keys for both Navigator Toolkit and ElevenLabs to function properly. Make sure to set up your environment variables before running the application.