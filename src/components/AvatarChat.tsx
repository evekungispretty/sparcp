import { useState, useRef, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Send, Mic, MicOff, RotateCcw, User, Bot, Loader2, Volume2, VolumeX } from "lucide-react";
import { sendChatMessage, convertToOpenAIFormat } from "../services/litellm";
import { textToSpeech, playAudio } from "../services/elevenlabs";

//define what a chat message object looks like
interface Message {
  id: string; //must be a string
  sender: "user" | "avatar"; //only these stringa
  content: string;
  timestamp: Date;
  clearComponents?: string[];
  audioUrl?: string;
  isPlaying?: boolean;
}

interface Scenario {
  id: string;
  title: string;
  description: string;
  parentProfile: {
    name: string;
    age: number;
    childAge: number;
    concerns: string[];
  };
}

interface AvatarChatProps {
  selectedScenarioId: string | null;
  selectedFocus?: string[];   
}

const scenarios: Scenario[] = [
  {
    id: "hpv-initial",
    title: "Initial HPV Discussion",
    description: "First time discussing HPV vaccine with a parent",
    parentProfile: {
      name: "Anne Palmer",
      age: 37,
      childAge: 10,
      concerns: ["vaccine safety", "necessity at young age"]
    }
  },
  {
    id: "vaccine-hesitant",
    title: "Vaccine Hesitant Parent",
    description: "Parent with strong reservations about vaccines",
    parentProfile: {
      name: "Maya Pena",
      age: 29,
      childAge: 9,
      concerns: ["safety concerns", "too many shots", "infertility fears"]
    }
  },
  {
    id: "clear-coach",
    title: "C-LEAR Coach Agent",
    description: "AI evaluator and feedback provider for clinical communication skills",
    parentProfile: {
      name: "C-LEAR Coach",
      age: 0,
      childAge: 0,
      concerns: ["communication skills", "clinical feedback", "performance evaluation"]
    }
  },
  {
    id: "sparc-supervisor",
    title: "SPARC-P Supervisor Agent", 
    description: "Central orchestrator and safety guardian for clinical simulation",
    parentProfile: {
      name: "SPARC-P Supervisor",
      age: 0,
      childAge: 0,
      concerns: ["simulation safety", "protocol enforcement", "security monitoring"]
    }
  }
];

export function AvatarChat({ selectedScenarioId, selectedFocus = [] }: AvatarChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

// this will start a new session if a scenario is selected
  useEffect(() => {
    if (selectedScenarioId && !sessionActive) {
      const scenario = scenarios.find(s => s.id === selectedScenarioId);
      if (scenario) {
        startSession(scenario);
      }
    }
  }, [selectedScenarioId, sessionActive]);

  const startSession = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setSessionActive(true);
    
    let initialContent = "";
    if (scenario.parentProfile.age > 0) {
      // Parent scenarios
      initialContent = `Hi Doctor, I'm ${scenario.parentProfile.name}. I'm here with my ${scenario.parentProfile.childAge}-year-old for their check-up. I have some questions about vaccines...`;
    } else {
      // Agent scenarios - use appropriate initial messages
      if (scenario.id === 'clear-coach') {
        initialContent = "Hello! I'm the C-LEAR Coach. I'm here to help you practice your clinical communication skills. How can I assist you today?";
      } else if (scenario.id === 'sparc-supervisor') {
        initialContent = "Hello! I'm the SPARC-P Supervisor. I'm here to help manage the simulation environment. What would you like to discuss?";
      } else {
        initialContent = `Hi Doctor, I'm ${scenario.parentProfile.name}. How can I help you today?`;
      }
    }
    
    const initialMessage: Message = {
      id: Date.now().toString(),
      sender: "avatar",
      content: initialContent,
      timestamp: new Date(),
    };
    setMessages([initialMessage]);
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || !selectedScenario || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      content: currentMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = currentMessage;
    setCurrentMessage("");
    setIsLoading(true);

    try {
      // Convert existing messages to OpenAI format (excluding the current user message)
      const conversationHistory = convertToOpenAIFormat(messages);
      
      // Call LiteLLM API
      const response = await sendChatMessage(conversationHistory, messageToSend, selectedScenario.id);
      
      const clearComponents = detectClearComponents(messageToSend);
      
      const avatarResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: "avatar",
        content: response.content,
        timestamp: new Date(),
        clearComponents,
      };

      setMessages(prev => [...prev, avatarResponse]);

      // Generate and play audio for Anne and Maya
      if (isAudioEnabled && (selectedScenario.id === 'hpv-initial' || selectedScenario.id === 'vaccine-hesitant')) {
        try {
          const character = selectedScenario.id === 'hpv-initial' ? 'anne' : 'maya';
          const audioResponse = await textToSpeech(response.content, character);
          
          // Update the message with audio URL
          setMessages(prev => prev.map(msg => 
            msg.id === avatarResponse.id 
              ? { ...msg, audioUrl: audioResponse.audioUrl }
              : msg
          ));

          // Play the audio
          setCurrentlyPlayingId(avatarResponse.id);
          await playAudio(audioResponse.audioUrl);
          setCurrentlyPlayingId(null);
        } catch (error) {
          console.error('Error generating or playing audio:', error);
          // Continue without audio if there's an error
        }
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Fallback response if API fails
      const fallbackResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: "avatar",
        content: "I'm sorry, I'm having trouble responding right now. Could you please try again?",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const detectClearComponents = (message: string): string[] => {
    const components = [];
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes("recommend") || lowerMessage.includes("suggest")) components.push("Counsel");
    if (lowerMessage.includes("understand") || lowerMessage.includes("hear")) components.push("Listen");
    if (lowerMessage.includes("feel") || lowerMessage.includes("concern")) components.push("Empathize");
    if (lowerMessage.includes("what") || lowerMessage.includes("tell me")) components.push("Explore");
    if (lowerMessage.includes("so you") || lowerMessage.includes("let me")) components.push("Restate");
    if (lowerMessage.includes("valid") || lowerMessage.includes("normal")) components.push("Answer");
    
    return components;
  };

  const resetSession = () => {
    // Clean up any blob URLs before resetting
    messages.forEach(message => {
      if (message.audioUrl && message.audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(message.audioUrl);
      }
    });
    
    setMessages([]);
    setSelectedScenario(null);
    setSessionActive(false);
    setCurrentlyPlayingId(null);
  };

  const replayAudio = async (messageId: string, audioUrl: string) => {
    if (currentlyPlayingId === messageId) return; // Already playing
    
    try {
      setCurrentlyPlayingId(messageId);
      await playAudio(audioUrl);
    } catch (error) {
      console.error('Error replaying audio:', error);
    } finally {
      setCurrentlyPlayingId(null);
    }
  };

  // Cleanup blob URLs when component unmounts
  useEffect(() => {
    return () => {
      messages.forEach(message => {
        if (message.audioUrl && message.audioUrl.startsWith('blob:')) {
          URL.revokeObjectURL(message.audioUrl);
        }
      });
    };
  }, []);

  if (!sessionActive) {
    return (
      <div>
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-semibold">AI Avatar Practice</h1>
            <p className="text-muted-foreground mt-1">
              Practice HPV conversations with AI-powered parent avatars
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scenarios.map((scenario) => (
              <Card key={scenario.id} className="p-6 cursor-pointer hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-lg mb-2">{scenario.title}</h3>
                <p className="text-muted-foreground mb-4">{scenario.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="font-medium">{scenario.parentProfile.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {scenario.parentProfile.age > 0 ? `(Age ${scenario.parentProfile.age}, Child: ${scenario.parentProfile.childAge}yo)` : '(AI Agent)'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {scenario.parentProfile.concerns.map((concern, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {concern}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Button onClick={() => startSession(scenario)} className="w-full">
                  Start Practice Session
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Practice Session</h1>
            <p className="text-muted-foreground">{selectedScenario?.title}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              className="gap-2"
            >
              {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              {isAudioEnabled ? 'Audio On' : 'Audio Off'}
            </Button>
            <Button variant="outline" onClick={resetSession} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              New Session
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <div className="p-4 border-b">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {selectedScenario?.parentProfile.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="font-medium">{selectedScenario?.parentProfile.name}</span>
                    <p className="text-sm text-muted-foreground">AI Avatar • Parent</p>
                  </div>
                </div>
              </div>

              <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.sender === "user" ? "flex-row-reverse" : ""}`}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>
                          {message.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`flex-1 max-w-[80%] ${message.sender === "user" ? "text-right" : ""}`}>
                      <div
                        className={`p-3 rounded-lg ${
                          message.sender === "user"
                            ? "bg-primary text-primary-foreground ml-auto"
                            : "bg-muted"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="flex-1">{message.content}</span>
                          {message.sender === "avatar" && message.audioUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => replayAudio(message.id, message.audioUrl!)}
                              disabled={currentlyPlayingId === message.id}
                              className="h-6 w-6 p-0 flex-shrink-0"
                            >
                              {currentlyPlayingId === message.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Volume2 className="w-3 h-3" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                      {message.clearComponents && message.clearComponents.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {message.clearComponents.map((component, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {component}
                            </Badge>
                          ))}
                        </div>
                      )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>
                          <Bot className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 max-w-[80%]">
                        <div className="p-3 rounded-lg bg-muted">
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm text-muted-foreground">{selectedScenario?.parentProfile.name} is thinking...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="Type your response as the pediatrician..."
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  />
                  <Button
                    onClick={() => setIsRecording(!isRecording)}
                    variant="outline"
                    size="icon"
                    className={isRecording ? "bg-red-100 border-red-300" : ""}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                  <Button onClick={sendMessage} disabled={isLoading || !currentMessage.trim()}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </Card>
          </div>

        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-3">C-LEAR Guide</h3>
            <div className="space-y-2 text-sm">
              <div><strong>Counsel:</strong> Provide guidance</div>
              <div><strong>Listen:</strong> Show active listening</div>
              <div><strong>Empathize:</strong> Show understanding</div>
              <div><strong>Answer:</strong> Answer their questions</div>
              <div><strong>Restate:</strong> Summarize understanding</div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3">{selectedScenario?.parentProfile?.age && selectedScenario.parentProfile.age > 0 ? 'Parent Profile' : 'Agent Profile'}</h3>
            <div className="space-y-2 text-sm">
              <div><strong>Name:</strong> {selectedScenario?.parentProfile?.name}</div>
              {selectedScenario?.parentProfile?.age && selectedScenario.parentProfile.age > 0 && (
                <>
                  <div><strong>Age:</strong> {selectedScenario.parentProfile.age}</div>
                  <div><strong>Child Age:</strong> {selectedScenario.parentProfile.childAge}</div>
                </>
              )}
              {selectedScenario?.parentProfile?.age === 0 && (
                <div><strong>Type:</strong> AI Agent</div>
              )}
              <div>
                <strong>Focus Areas:</strong>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedScenario?.parentProfile.concerns.map((concern, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {concern}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
        </div>
      </div>
    </div>
  );
}