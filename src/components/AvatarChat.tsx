import { useState, useRef, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Send, Mic, MicOff, RotateCcw, User, Bot } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "avatar";
  content: string;
  timestamp: Date;
  clearComponents?: string[];
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

const scenarios: Scenario[] = [
  {
    id: "1",
    title: "Initial HPV Discussion",
    description: "First time discussing HPV vaccine with a parent",
    parentProfile: {
      name: "Sarah Johnson",
      age: 42,
      childAge: 11,
      concerns: ["vaccine safety", "necessity at young age"]
    }
  },
  {
    id: "2",
    title: "Vaccine Hesitant Parent",
    description: "Parent with strong reservations about vaccines",
    parentProfile: {
      name: "Michael Chen",
      age: 38,
      childAge: 12,
      concerns: ["side effects", "too many vaccines", "natural immunity"]
    }
  }
];

export function AvatarChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const startSession = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setSessionActive(true);
    const initialMessage: Message = {
      id: Date.now().toString(),
      sender: "avatar",
      content: `Hi Doctor, I'm ${scenario.parentProfile.name}. I'm here with my ${scenario.parentProfile.childAge}-year-old for their check-up. I have some questions about vaccines...`,
      timestamp: new Date(),
    };
    setMessages([initialMessage]);
  };

  const sendMessage = () => {
    if (!currentMessage.trim() || !selectedScenario) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      content: currentMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage("");

    // Simulate AI response with C-LEAR component detection
    setTimeout(() => {
      const responses = [
        "I appreciate you taking the time to explain that. But I'm still worried about the side effects I've read about online...",
        "That makes sense, but my child is still so young. Do they really need this vaccine now?",
        "I understand what you're saying, but I've heard that this vaccine might not be necessary if my child isn't sexually active yet.",
        "Thank you for listening to my concerns. Can you tell me more about how this vaccine actually works?"
      ];

      const clearComponents = detectClearComponents(currentMessage);
      
      const avatarResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: "avatar",
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
        clearComponents,
      };

      setMessages(prev => [...prev, avatarResponse]);
    }, 1500);
  };

  const detectClearComponents = (message: string): string[] => {
    const components = [];
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes("recommend") || lowerMessage.includes("suggest")) components.push("Counsel");
    if (lowerMessage.includes("understand") || lowerMessage.includes("hear")) components.push("Listen");
    if (lowerMessage.includes("feel") || lowerMessage.includes("concern")) components.push("Empathize");
    if (lowerMessage.includes("what") || lowerMessage.includes("tell me")) components.push("Explore");
    if (lowerMessage.includes("so you") || lowerMessage.includes("let me")) components.push("Restate");
    if (lowerMessage.includes("valid") || lowerMessage.includes("normal")) components.push("Acknowledge");
    
    return components;
  };

  const resetSession = () => {
    setMessages([]);
    setSelectedScenario(null);
    setSessionActive(false);
  };

  if (!sessionActive) {
    return (
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
                    (Age {scenario.parentProfile.age}, Child: {scenario.parentProfile.childAge}yo)
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
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Practice Session</h1>
          <p className="text-muted-foreground">{selectedScenario?.title}</p>
        </div>
        <Button variant="outline" onClick={resetSession} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          New Session
        </Button>
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
                        {message.content}
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
                <Button onClick={sendMessage}>
                  <Send className="w-4 h-4" />
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
              <div><strong>Acknowledge:</strong> Recognize concerns</div>
              <div><strong>Restate:</strong> Summarize understanding</div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3">Parent Profile</h3>
            <div className="space-y-2 text-sm">
              <div><strong>Name:</strong> {selectedScenario?.parentProfile.name}</div>
              <div><strong>Age:</strong> {selectedScenario?.parentProfile.age}</div>
              <div><strong>Child Age:</strong> {selectedScenario?.parentProfile.childAge}</div>
              <div>
                <strong>Concerns:</strong>
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
  );
}