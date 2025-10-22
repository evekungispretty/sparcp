import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  ArrowLeft, 
  User, 
  Clock, 
  Target, 
  Play,
  Settings,
  Users,
  MessageCircle
} from "lucide-react";

interface StartNewSessionProps {
    onBack: () => void;
    onStartSession: (scenarioId: string, focusAreas?: string[]) => void;
    
}

const scenarios = [
    {
        id: "hpv-initial",
        title: "Initial HPV Discussion",
        description: "First-time conversation about HPV vaccination with a concerned parent",
        difficulty: "Beginner",
        duration: "10-15 min",
        objectives: ["Build rapport", "Address safety concerns", "Provide clear recommendation"],
        parentProfile: {
          name: "Anne Palmer",
          age: 37,
          childAge: 10,
          background: "First-time parent, researched online",
          concerns: ["vaccine safety", "necessity at young age", "side effects"]
    }
},
{
    id: "vaccine-hesitant",
    title: "Vaccine Hesitant Parent",
    description: "Parent with strong reservations about vaccines in general",
    difficulty: "Intermediate", 
    duration: "15-20 min",
    objectives: ["Practice active listening", "Address misinformation", "Find common ground"],
    parentProfile: {
      name: "Michael Chen",
      age: 38,
      childAge: 12,
      background: "Previous negative vaccine experience",
      concerns: ["side effects", "too many vaccines", "natural immunity", "government trust"]
    }
  },
  {
    id: "religious-objection",
    title: "Religious/Cultural Concerns",
    description: "Family with religious or cultural objections to HPV vaccination",
    difficulty: "Advanced",
    duration: "20-25 min", 
    objectives: ["Respect cultural values", "Separate medical from moral issues", "Find acceptable solutions"],
    parentProfile: {
      name: "Fatima Al-Rashid",
      age: 35,
      childAge: 13,
      background: "Conservative religious family",
      concerns: ["religious beliefs", "cultural values", "community pressure", "appropriateness"]
    }
  },
  {
    id: "research-heavy",
    title: "The Research-Heavy Parent",
    description: "Parent who has done extensive research and challenges medical recommendations",
    difficulty: "Expert",
    duration: "25-30 min",
    objectives: ["Handle challenging questions", "Maintain authority while respecting research", "Guide to evidence-based conclusions"],
    parentProfile: {
      name: "Dr. Jennifer Martinez",
      age: 45,
      childAge: 11,
      background: "PhD in Biology, questions everything",
      concerns: ["study limitations", "long-term data", "alternative approaches", "risk-benefit analysis"]
    }
  }
];

const focusAreas = [
    { id: "listen", label: "Active Listening", icon: Users },
    { id: "empathy", label: "Empathy & Understanding", icon: MessageCircle }, 
    { id: "counsel", label: "Medical Counseling", icon: Target },
    { id: "communication", label: "Clear Communication", icon: Settings }
  ];

  export function StartNewSession({ onBack, onStartSession }: StartNewSessionProps) {
    const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
    const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([]);

    const handleFocusToggle = (focusId: string) => {
        setSelectedFocusAreas((prev) => 
            prev.includes(focusId) ? prev.filter(id => id !== focusId) : [...prev, focusId]
        );
    };


  const startSession = () => {
    if (selectedScenario) {
        onStartSession(selectedScenario, selectedFocusAreas); 
        }
  };

  const selectedScenarioData = scenarios.find(s => s.id === selectedScenario);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-semibold">Start New Practice Session</h1>
          <p className="text-muted-foreground mt-1">
            Choose a scenario and customize your practice session
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenario Selection */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Choose Your Scenario</h2>
          
          <div className="grid grid-cols-1 gap-4">
            {scenarios.map((scenario) => (
              <Card 
                key={scenario.id} 
                className={`p-6 cursor-pointer transition-all hover:shadow-md ${
                  selectedScenario === scenario.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedScenario(scenario.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{scenario.title}</h3>
                    <p className="text-muted-foreground text-sm">{scenario.description}</p>
                  </div>
                  <Badge variant={
                    scenario.difficulty === "Beginner" ? "secondary" :
                    scenario.difficulty === "Intermediate" ? "default" :
                    scenario.difficulty === "Advanced" ? "destructive" : "outline"
                  }>
                    {scenario.difficulty}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{scenario.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>{scenario.parentProfile.name}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">Learning Objectives:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {scenario.objectives.map((obj, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {obj}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium">Parent Concerns:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {scenario.parentProfile.concerns.map((concern, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {concern}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Session Configuration */}
        <div className="space-y-6">
          {/* Focus Areas */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Focus Areas (Optional)</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Select specific C-LEAR components to emphasize during this session
            </p>
            <div className="space-y-2">
              {focusAreas.map((area) => {
                const Icon = area.icon;
                return (
                  <button
                    key={area.id}
                    onClick={() => handleFocusToggle(area.id)}
                    className={`w-full p-3 rounded-lg border text-left transition-colors ${
                        selectedFocusAreas.includes(area.id) 
                        ? "bg-primary/10 border-primary" 
                        : "bg-muted/30 border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{area.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Selected Scenario Details */}
          {selectedScenarioData && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Session Preview</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium">Scenario:</span>
                  <p className="text-sm">{selectedScenarioData.title}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Parent:</span>
                  <p className="text-sm">{selectedScenarioData.parentProfile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedScenarioData.parentProfile.background}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium">Duration:</span>
                  <p className="text-sm">{selectedScenarioData.duration}</p>
                </div>
                {selectedFocusAreas.length > 0 && (
                  <div>
                    <span className="text-sm font-medium">Focus Areas:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedFocusAreas.map(focusId => {
                        const focus = focusAreas.find(f => f.id === focusId);
                        return (
                          <Badge key={focusId} variant="outline" className="text-xs">
                            {focus?.label}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Start Button */}
          <Button 
            onClick={startSession} 
            disabled={!selectedScenario}
            className="w-full gap-2"
            size="lg"
          >
            <Play className="w-4 h-4" />
            Start Practice Session
          </Button>
        </div>
      </div>
    </div>
  );
}