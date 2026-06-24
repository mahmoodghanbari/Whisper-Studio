import { Fragment, useState } from 'react'
import { useNavigate } from '@/app/navigation'
import { motion, AnimatePresence } from '@/lib/motion'
import { Button } from '@/components/ui/button'
import StepFiles, { type TranscriptionFile } from './components/files-step'
import StepSettings, { type TranscriptionSettings } from './components/settings-step'
import StepOutput from './components/output-step'
import Processing from './components/processing-step'
import { ArrowLeft, ArrowRight, ChevronRight, Sparkles } from 'lucide-react'

const STEPS = [
  { id: 1, label: 'Select Files', description: 'Choose audio or video files' },
  { id: 2, label: 'Settings', description: 'Configure transcription' },
  { id: 3, label: 'Output', description: 'Format & export options' },
  { id: 4, label: 'Processing', description: 'Transcribe selected files' }
]

export default function NewTranscription() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [files, setFiles] = useState<TranscriptionFile[]>([
    { name: 'board_meeting_2024_q4.mp4', size: '342 MB', duration: '2h 10m', type: 'video' },
    { name: 'customer_interview_sarah.wav', size: '128 MB', duration: '42m 15s', type: 'audio' }
  ])
  const [settings, setSettings] = useState<TranscriptionSettings>({
    language: 'auto',
    model: 'large-v3',
    compute: 'gpu',
    wordTimestamps: true,
    diarization: true,
    translate: false,
    removeSilence: false,
    noiseReduction: true
  })
  const [outputFormats, setOutputFormats] = useState<string[]>(['srt', 'txt'])
  const [exportMode, setExportMode] = useState('single')

  return (
    <div className="p-8 max-w-[900px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate('/')}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">New Transcription</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure and start your transcription job
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <Fragment key={s.id}>
            <button
              onClick={() => setStep(s.id)}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-lg transition-all text-left
                ${
                  step === s.id
                    ? 'bg-primary/10 border border-primary/20'
                    : step > s.id
                      ? 'bg-secondary/50 border border-transparent'
                      : 'border border-transparent opacity-50'
                }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold
                ${step === s.id ? 'bg-primary text-primary-foreground' : step > s.id ? 'bg-success text-white' : 'bg-secondary text-muted-foreground'}`}
              >
                {step > s.id ? '✓' : s.id}
              </div>
              <div>
                <p
                  className={`text-[13px] font-medium ${step === s.id ? 'text-foreground' : 'text-muted-foreground'}`}
                >
                  {s.label}
                </p>
                <p className="text-[10px] text-muted-foreground hidden sm:block">{s.description}</p>
              </div>
            </button>
            {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground/30" />}
          </Fragment>
        ))}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {step === 1 && <StepFiles files={files} setFiles={setFiles} />}
          {step === 2 && <StepSettings settings={settings} setSettings={setSettings} />}
          {step === 3 && (
            <StepOutput
              outputFormats={outputFormats}
              setOutputFormats={setOutputFormats}
              exportMode={exportMode}
              setExportMode={setExportMode}
            />
          )}
          {step === 4 && <Processing />}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      {step < 4 && (
      <div className="flex items-center justify-between mt-8 pt-6">
        <Button
          variant="ghost"
          onClick={() => (step > 1 ? setStep(step - 1) : navigate('/'))}
          className="gap-2 text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          {step > 1 ? 'Back' : 'Cancel'}
        </Button>
        <div className="flex items-center gap-3">
          {step < 3 && (
            <Button onClick={() => setStep(step + 1)} className="gap-2">
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          )}
          {step === 3 && (
            <Button onClick={() => setStep(4)} className="gap-2 glow-primary">
              <Sparkles className="w-4 h-4" />
              Start Transcription
            </Button>
          )}
        </div>
      </div>
      )}
    </div>
  )
}
