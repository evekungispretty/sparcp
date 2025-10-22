import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

// Initialize ElevenLabs client
const elevenlabs = new ElevenLabsClient({
  apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY,
});

// Voice configuration for different characters
export const VOICE_CONFIG = {
  'anne': {
    voiceId: '21m00Tcm4TlvDq8ikWAM', // Professional female voice for Anne Palmer (Rachel)
    name: 'Anne Palmer'
  },
  'maya': {
    voiceId: 'EXAVITQu4vr4xnSDxMaL', // Warm, friendly female voice for Maya Pena (Bella)
    name: 'Maya Pena'
  }
};

export interface AudioResponse {
  audioBlob: Blob;
  audioUrl: string;
  duration?: number;
}

/**
 * Convert text to speech using ElevenLabs API
 * @param text - Text to convert to speech
 * @param character - Character voice to use ('anne' or 'maya')
 * @returns Promise with audio blob and URL
 */
export async function textToSpeech(text: string, character: 'anne' | 'maya'): Promise<AudioResponse> {
  try {
    const voiceConfig = VOICE_CONFIG[character];
    
    // Generate audio using ElevenLabs API
    const audio = await elevenlabs.textToSpeech.convert(
      voiceConfig.voiceId,
      {
        text: text,
        model_id: 'eleven_multilingual_v2',
        output_format: 'mp3_44100_128',
        voice_settings: {
          stability: 0.6,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        }
      }
    );

    // Convert stream to blob
    const chunks = [];
    const reader = audio.getReader();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    
    const audioBlob = new Blob(chunks, { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(audioBlob);

    return {
      audioBlob,
      audioUrl
    };

  } catch (error) {
    console.error('Error generating speech:', error);
    throw new Error('Failed to generate speech');
  }
}

/**
 * Play audio from URL
 * @param audioUrl - URL of the audio to play
 * @returns Promise that resolves when audio starts playing
 */
export async function playAudio(audioUrl: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(audioUrl);
    
    // Set audio properties for better compatibility
    audio.preload = 'auto';
    audio.crossOrigin = 'anonymous';
    
    audio.onloadstart = () => {
      console.log('Audio loading started');
    };
    
    audio.oncanplay = () => {
      console.log('Audio can play');
      audio.play().then(() => {
        console.log('Audio started playing');
        resolve();
      }).catch((error) => {
        console.error('Failed to play audio:', error);
        reject(error);
      });
    };
    
    audio.onerror = (error) => {
      console.error('Audio playback error:', error);
      console.error('Audio src:', audioUrl);
      console.error('Audio readyState:', audio.readyState);
      reject(new Error('Audio playback failed'));
    };
    
    audio.onended = () => {
      console.log('Audio playback ended');
      // Don't revoke URL immediately - let it stay for replay functionality
      // URL.revokeObjectURL(audioUrl);
    };
    
    // Add timeout to prevent hanging
    setTimeout(() => {
      if (audio.readyState === 0) {
        console.error('Audio loading timeout');
        reject(new Error('Audio loading timeout'));
      }
    }, 10000); // 10 second timeout
  });
}

/**
 * Get voice configuration for a scenario
 * @param scenarioId - The scenario ID
 * @returns Voice configuration or null if not found
 */
export function getVoiceForScenario(scenarioId: string): { voiceId: string; name: string } | null {
  switch (scenarioId) {
    case 'hpv-initial':
      return VOICE_CONFIG.anne; // Anne Palmer
    case 'vaccine-hesitant':
      return VOICE_CONFIG.maya; // Maya Pena
    default:
      return null; // No voice for Coach/Supervisor agents
  }
}
