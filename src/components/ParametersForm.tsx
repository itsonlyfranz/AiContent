import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlignLeft } from 'lucide-react';
import { MessageSquare, Sparkles, Briefcase, Heart, Lightbulb, Users, Target, Info, Building, Users2Icon, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export type FormParameters = {
  tone: string;
  length: string;
  campaign: string;
  targetAudience: string;
}

const lengthPresets = [
  { label: 'Short', value: '280 chars' },
  { label: 'Medium', value: '1000 chars' },
  { label: 'Long', value: '2500 chars' },
];

// Predefined tone options with icons and descriptions
const tonePresets = [
  { icon: Briefcase, label: 'Professional', value: 'professional', description: 'Formal and business-like' },
  { icon: Sparkles, label: 'Creative', value: 'creative', description: 'Imaginative and engaging' },
  { icon: Heart, label: 'Friendly', value: 'friendly', description: 'Warm and approachable' },
  { icon: Lightbulb, label: 'Informative', value: 'informative', description: 'Educational and clear' },
] as const;

const audiencePresets = [
  { 
    icon: Briefcase,
    label: 'Professionals',
    value: 'Business professionals and executives',
    description: 'Corporate decision-makers and industry experts'
  },
  { 
    icon: Building,
    label: 'Entrepreneurs',
    value: 'Startup founders and business owners',
    description: 'Innovative leaders and business creators'
  },
  { 
    icon: Users2Icon,
    label: 'Marketers',
    value: 'Marketing professionals and strategists',
    description: 'Digital marketing specialists and brand managers'
  },
  { 
    icon: GraduationCap,
    label: 'Students',
    value: 'College and university students',
    description: 'Academic learners and young professionals'
  }
];

export function ParametersForm({ 
  parameters,
  onChange 
}: {
  parameters: FormParameters;
  onChange: (params: FormParameters) => void;
}) {
  const [showTonePresets, setShowTonePresets] = useState(false);
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([]);

  const handleAudienceSelect = (value: string) => {
    const newAudiences = selectedAudiences.includes(value)
      ? selectedAudiences.filter(a => a !== value)
      : [...selectedAudiences, value];
    
    setSelectedAudiences(newAudiences);
    onChange({
      ...parameters,
      targetAudience: newAudiences.join(', ')
    });
  };

  return (
    <div className="space-y-8 p-6 rounded-2xl bg-gradient-to-br from-white/80 to-purple-50/50 dark:from-gray-900/80 dark:to-purple-900/20 backdrop-blur-lg border border-purple-100/20 dark:border-purple-800/20 shadow-xl">
      <div className="relative group">
        <Label htmlFor="campaign" className="text-sm font-medium inline-flex items-center gap-2 text-purple-700 dark:text-purple-300">
          <Target className="h-4 w-4" />
          Campaign Name
        </Label>
        <Input
          id="campaign"
          value={parameters.campaign}
          onChange={(e) => onChange({ ...parameters, campaign: e.target.value })}
          placeholder="Enter campaign name"
          className="mt-2 bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm border-purple-100/50 dark:border-purple-800/50 
            focus:border-purple-300 dark:focus:border-purple-600 focus:ring-2 focus:ring-purple-200/50 dark:focus:ring-purple-800/50
            transition-all duration-200"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-100/50 to-blue-100/50 dark:from-purple-900/20 dark:to-blue-900/20 
          opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="targetAudience" className="text-sm font-medium inline-flex items-center gap-2 text-purple-700 dark:text-purple-300">
            <Users className="h-4 w-4" />
            Target Audience
          </Label>
          <Info className="h-4 w-4 text-purple-500/70 dark:text-purple-400/70" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {audiencePresets.map((preset) => {
            const isSelected = selectedAudiences.includes(preset.value);
            return (
              <Button
                key={preset.label}
                variant="outline"
                onClick={() => handleAudienceSelect(preset.value)}
                className={cn(
                  "h-auto p-4 flex items-start gap-3 justify-start text-left relative overflow-hidden group",
                  "border-purple-100/50 dark:border-purple-800/50 hover:border-purple-200 dark:hover:border-purple-700",
                  "bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm",
                  "transition-all duration-200",
                  isSelected && "border-purple-300 dark:border-purple-600 bg-purple-50/50 dark:bg-purple-900/50"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg bg-gradient-to-br",
                  isSelected ? "from-purple-500 to-blue-500" : "from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900",
                  "transition-colors duration-200"
                )}>
                  <preset.icon className={cn(
                    "h-4 w-4",
                    isSelected ? "text-white" : "text-purple-600 dark:text-purple-400"
                  )} />
                </div>
                <div>
                  <div className="font-medium text-sm">{preset.label}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1">
                    {preset.description}
                  </div>
                </div>
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-100/50 to-blue-100/50 dark:from-purple-900/20 dark:to-blue-900/20 
                  opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
              </Button>
            );
          })}
        </div>

        {selectedAudiences.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {selectedAudiences.map((audience) => (
              <Badge
                key={audience}
                variant="secondary"
                className="bg-purple-50 text-purple-600 hover:bg-purple-100"
              >
                {audience}
                <button
                  onClick={() => handleAudienceSelect(audience)}
                  className="ml-1 hover:text-purple-800"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        )}

        <Input
          id="targetAudience"
          value={parameters.targetAudience}
          onChange={(e) => onChange({ ...parameters, targetAudience: e.target.value })}
          placeholder="Enter custom target audience"
          className="bg-white/50 backdrop-blur-sm focus:ring-2 ring-purple-200"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="tone" className="text-sm font-medium inline-flex items-center gap-2 text-purple-700 dark:text-purple-300">
            <MessageSquare className="h-4 w-4" />
            Tone
          </Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTonePresets(!showTonePresets)}
            className="text-xs text-purple-600 dark:text-purple-300 hover:text-purple-700 
              hover:bg-purple-50/50 dark:hover:bg-purple-900/20 dark:hover:text-purple-200"
          >
            {showTonePresets ? 'Hide presets' : 'Show presets'}
          </Button>
        </div>

        {showTonePresets && (
          <div className="grid grid-cols-2 gap-3 mb-3">
            {tonePresets.map((preset) => {
              const isSelected = parameters.tone === preset.value;
              return (
                <Button
                  key={preset.label}
                  variant="outline"
                  onClick={() => onChange({ ...parameters, tone: preset.value })}
                  className={cn(
                    "h-auto p-4 flex items-start gap-3 justify-start text-left relative overflow-hidden group",
                    "border-purple-100/50 dark:border-purple-800/50 hover:border-purple-200 dark:hover:border-purple-700",
                    "bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm",
                    "transition-all duration-200",
                    isSelected && "border-purple-300 dark:border-purple-600 bg-purple-50/50 dark:bg-purple-900/50"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg bg-gradient-to-br",
                    isSelected ? "from-purple-500 to-blue-500" : "from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900",
                    "transition-colors duration-200"
                  )}>
                    <preset.icon className={cn(
                      "h-4 w-4",
                      isSelected ? "text-white" : "text-purple-600 dark:text-purple-400"
                    )} />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{preset.label}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {preset.description}
                    </div>
                  </div>
                  <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-100/50 to-blue-100/50 dark:from-purple-900/20 dark:to-blue-900/20 
                    opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
                </Button>
              );
            })}
          </div>
        )}

        <Input
          id="tone"
          value={parameters.tone}
          onChange={(e) => onChange({ ...parameters, tone: e.target.value })}
          placeholder="Enter desired tone"
          className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm border-purple-100/50 dark:border-purple-800/50 
            focus:border-purple-300 dark:focus:border-purple-600 focus:ring-2 focus:ring-purple-200/50 dark:focus:ring-purple-800/50
            transition-all duration-200"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="length" className="text-sm font-medium inline-flex items-center gap-2 text-purple-700 dark:text-purple-300">
            <AlignLeft className="h-4 w-4" />
            Length
          </Label>
        </div>

        <div className="flex gap-2 mb-3">
          {lengthPresets.map((preset) => {
            const isSelected = parameters.length === preset.value;
            return (
              <Button
                key={preset.label}
                variant="outline"
                onClick={() => onChange({ ...parameters, length: preset.value })}
                className={cn(
                  "flex-1 relative overflow-hidden group",
                  "border-purple-100/50 dark:border-purple-800/50 hover:border-purple-200 dark:hover:border-purple-700",
                  "bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm",
                  "transition-all duration-200",
                  isSelected && "border-purple-300 dark:border-purple-600 bg-purple-50/50 dark:bg-purple-900/50"
                )}
              >
                {preset.label}
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-100/50 to-blue-100/50 dark:from-purple-900/20 dark:to-blue-900/20 
                  opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
              </Button>
            );
          })}
        </div>

        <Input
          id="length"
          value={parameters.length}
          onChange={(e) => onChange({ ...parameters, length: e.target.value })}
          placeholder="Enter desired length"
          className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm border-purple-100/50 dark:border-purple-800/50 
            focus:border-purple-300 dark:focus:border-purple-600 focus:ring-2 focus:ring-purple-200/50 dark:focus:ring-purple-800/50
            transition-all duration-200"
        />
      </div>
    </div>
  );
}