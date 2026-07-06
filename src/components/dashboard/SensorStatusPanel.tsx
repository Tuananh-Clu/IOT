import { Flame, BellRing, Type, Radio } from 'lucide-react'

interface SensorStatusPanelProps {
  flameDetected: boolean
  buzzerActive: boolean
  barrierOpen: boolean
  irActive: boolean
}

export function SensorStatusPanel({ flameDetected, buzzerActive, barrierOpen, irActive }: SensorStatusPanelProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Flame */}
      <div className={`p-4 rounded-xl flex items-center gap-3 border transition-colors ${flameDetected ? 'bg-sp-danger-dim border-sp-danger shadow-[0_0_12px_rgba(239,68,68,0.3)] animate-danger-flash' : 'bg-sp-elevated border-sp-border'}`}>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${flameDetected ? 'bg-sp-danger text-white' : 'bg-sp-surface text-sp-text-3'}`}>
          <Flame className={`w-5 h-5 ${flameDetected ? 'animate-pulse' : ''}`} />
        </div>
        <div>
          <div className="text-[11px] font-semibold text-sp-text-3 uppercase tracking-wider">Fire Sensor</div>
          <div className={`font-display font-bold ${flameDetected ? 'text-sp-danger' : 'text-sp-text'}`}>
            {flameDetected ? 'ALERT' : 'Normal'}
          </div>
        </div>
      </div>

      {/* Buzzer */}
      <div className={`p-4 rounded-xl flex items-center gap-3 border transition-colors ${buzzerActive ? 'bg-sp-warning/10 border-sp-warning/50' : 'bg-sp-elevated border-sp-border'}`}>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${buzzerActive ? 'bg-sp-warning text-white' : 'bg-sp-surface text-sp-text-3'}`}>
          <BellRing className={`w-5 h-5 ${buzzerActive ? 'animate-[wiggle_1s_ease-in-out_infinite]' : ''}`} />
        </div>
        <div>
          <div className="text-[11px] font-semibold text-sp-text-3 uppercase tracking-wider">Buzzer</div>
          <div className={`font-display font-bold ${buzzerActive ? 'text-sp-warning' : 'text-sp-text'}`}>
            {buzzerActive ? 'Active' : 'Off'}
          </div>
        </div>
      </div>

      {/* Barrier */}
      <div className={`p-4 rounded-xl flex items-center gap-3 border transition-colors ${barrierOpen ? 'bg-sp-brand-dim border-sp-brand/50' : 'bg-sp-elevated border-sp-border'}`}>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${barrierOpen ? 'bg-sp-brand text-white' : 'bg-sp-surface text-sp-text-3'}`}>
          <Type className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[11px] font-semibold text-sp-text-3 uppercase tracking-wider">Barrier</div>
          <div className={`font-display font-bold ${barrierOpen ? 'text-sp-brand' : 'text-sp-text'}`}>
            {barrierOpen ? 'Open' : 'Closed'}
          </div>
        </div>
      </div>

      {/* IR Sensor */}
      <div className={`p-4 rounded-xl flex items-center gap-3 border transition-colors ${irActive ? 'bg-sp-available-dim border-sp-available/50' : 'bg-sp-elevated border-sp-border'}`}>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${irActive ? 'bg-sp-available text-white' : 'bg-sp-surface text-sp-text-3'}`}>
          <Radio className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[11px] font-semibold text-sp-text-3 uppercase tracking-wider">IR Sensor</div>
          <div className={`font-display font-bold ${irActive ? 'text-sp-available' : 'text-sp-text'}`}>
            {irActive ? 'Detecting' : 'Clear'}
          </div>
        </div>
      </div>
    </div>
  )
}
