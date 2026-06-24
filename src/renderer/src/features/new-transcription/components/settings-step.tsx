import { useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  ChevronDown,
  Info,
  Cpu,
  Zap,
  Star,
  Globe,
  Brain,
  Users,
  Volume2,
  Waves
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const MODELS = [
  {
    value: 'tiny',
    label: 'Tiny',
    speed: '~75x',
    accuracy: 'Lower',
    vram: '1 GB',
    desc: 'Fastest, good for drafts'
  },
  {
    value: 'base',
    label: 'Base',
    speed: '~50x',
    accuracy: 'Fair',
    vram: '1 GB',
    desc: 'Quick transcriptions'
  },
  {
    value: 'small',
    label: 'Small',
    speed: '~32x',
    accuracy: 'Good',
    vram: '2 GB',
    desc: 'Balanced choice'
  },
  {
    value: 'medium',
    label: 'Medium',
    speed: '~16x',
    accuracy: 'High',
    vram: '5 GB',
    desc: 'Professional quality'
  },
  {
    value: 'large-v3',
    label: 'Large-v3',
    speed: '~8x',
    accuracy: 'Best',
    vram: '10 GB',
    desc: 'Maximum accuracy',
    recommended: true
  }
]

const LANGUAGES = [
  { value: 'auto', label: 'Auto-detect' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'zh', label: 'Chinese' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'it', label: 'Italian' },
  { value: 'ru', label: 'Russian' },
  { value: 'ar', label: 'Arabic' }
]

export interface TranscriptionSettings {
  compute: string
  diarization: boolean
  language: string
  model: string
  noiseReduction: boolean
  removeSilence: boolean
  translate: boolean
  wordTimestamps: boolean
}

interface SettingRowProps {
  children: ReactNode
  description: string
  icon: typeof Globe
  label: string
  tooltip?: string
}

function SettingRow({
  icon: Icon,
  label,
  description,
  children,
  tooltip
}: SettingRowProps): JSX.Element {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-medium">{label}</span>
            {tooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3 h-3 text-muted-foreground/50" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[240px] text-xs">
                    {tooltip}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          {description && <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}

interface StepSettingsProps {
  settings: TranscriptionSettings
  setSettings: Dispatch<SetStateAction<TranscriptionSettings>>
}

export default function StepSettings({ settings, setSettings }: StepSettingsProps): JSX.Element {
  const [advancedOpen, setAdvancedOpen] = useState(false)

  const update = (key: keyof TranscriptionSettings, value: boolean | string): void =>
    setSettings({ ...settings, [key]: value })

  return (
    <div className="space-y-6">
      {/* Recommended Banner */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/5 border border-primary/10">
        <Star className="w-4 h-4 text-primary shrink-0 text-warning" />
        <p className="text-[12px] text-muted-foreground">
          <span className="text-foreground font-medium">Recommended settings applied.</span>{' '}
          Large-v3 model with GPU for maximum accuracy. Estimated speed: ~8x real-time.
        </p>
      </div>

      {/* Core Settings */}
      <div className="glass-panel rounded-xl divide-y divide-border/50">
        <div className="px-5">
          <SettingRow
            icon={Globe}
            label="Language"
            description="Source audio language"
            tooltip="Auto-detect works well for most languages. Select manually for better accuracy."
          >
            <Select value={settings.language} onValueChange={(v) => update('language', v)}>
              <SelectTrigger className="w-[180px] h-9 text-[13px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value} className="text-[13px]">
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingRow>
        </div>

        <div className="px-5">
          <SettingRow
            icon={Brain}
            label="Model"
            description="Accuracy vs speed tradeoff"
            tooltip="Larger models are more accurate but slower. Large-v3 is recommended for professional use."
          >
            <Select value={settings.model} onValueChange={(v) => update('model', v)}>
              <SelectTrigger className="w-[180px] h-9 text-[13px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODELS.map((m) => (
                  <SelectItem key={m.value} value={m.value} className="text-[13px]">
                    <div className="flex items-center gap-2">
                      {m.label}
                      {m.recommended && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                          Recommended
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingRow>
        </div>

        {/* Model Details */}
        {settings.model && (
          <div className="px-5 py-3">
            <div className="grid grid-cols-4 gap-4">
              {(() => {
                const m = MODELS.find((x) => x.value === settings.model)
                return m ? (
                  <>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">
                        Speed
                      </span>
                      <span className="text-[13px] font-mono font-medium">{m.speed}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">
                        Accuracy
                      </span>
                      <span className="text-[13px] font-medium">{m.accuracy}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">
                        VRAM
                      </span>
                      <span className="text-[13px] font-mono font-medium">{m.vram}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">
                        Note
                      </span>
                      <span className="text-[12px] text-muted-foreground">{m.desc}</span>
                    </div>
                  </>
                ) : null
              })()}
            </div>
          </div>
        )}

        <div className="px-5">
          <SettingRow
            icon={Cpu}
            label="Compute"
            description="Processing hardware"
            tooltip="GPU is significantly faster. Falls back to CPU if no compatible GPU is found."
          >
            <div className="flex items-center gap-2 p-1 rounded-lg bg-secondary">
              {['cpu', 'gpu'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => update('compute', mode)}
                  className={`px-4 py-1.5 rounded-md text-[12px] font-medium transition-all
                    ${
                      settings.compute === mode
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  {mode.toUpperCase()}
                </button>
              ))}
            </div>
          </SettingRow>
        </div>
      </div>

      {/* Toggles */}
      <div className="glass-panel rounded-xl divide-y divide-border/50">
        <div className="px-5">
          <SettingRow
            icon={Zap}
            label="Word Timestamps"
            description="Precise timing for each word"
            tooltip="Enables word-level timing data, useful for subtitle editing."
          >
            <Switch
              checked={settings.wordTimestamps}
              onCheckedChange={(v) => update('wordTimestamps', v)}
            />
          </SettingRow>
        </div>
        <div className="px-5">
          <SettingRow
            icon={Users}
            label="Speaker Diarization"
            description="Identify who's speaking"
            tooltip="Automatically labels different speakers. Works best with 2–6 speakers."
          >
            <Switch
              checked={settings.diarization}
              onCheckedChange={(v) => update('diarization', v)}
            />
          </SettingRow>
        </div>
      </div>

      {/* Advanced */}
      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors w-full">
          <ChevronDown
            className={`w-4 h-4 transition-transform ${advancedOpen ? 'rotate-0' : '-rotate-90'}`}
          />
          Advanced Settings
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          <div className="glass-panel rounded-xl divide-y divide-border/50">
            <div className="px-5">
              <SettingRow
                icon={Globe}
                label="Translate to English"
                description="Translate non-English audio to English"
              >
                <Switch
                  checked={settings.translate}
                  onCheckedChange={(v) => update('translate', v)}
                />
              </SettingRow>
            </div>
            <div className="px-5">
              <SettingRow
                icon={Volume2}
                label="Remove Silence"
                description="Strip silent segments from output"
              >
                <Switch
                  checked={settings.removeSilence}
                  onCheckedChange={(v) => update('removeSilence', v)}
                />
              </SettingRow>
            </div>
            <div className="px-5">
              <SettingRow
                icon={Waves}
                label="Noise Reduction"
                description="Pre-process audio to reduce background noise"
              >
                <Switch
                  checked={settings.noiseReduction}
                  onCheckedChange={(v) => update('noiseReduction', v)}
                />
              </SettingRow>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
