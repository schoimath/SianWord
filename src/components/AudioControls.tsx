import type { AudioSettings } from "../types/game";
import { initAudio, playToggleClick } from "../lib/audio";

type Props = {
  settings: AudioSettings;
  onMusic: (enabled: boolean) => void;
  onSfx: (enabled: boolean) => void;
};

export function AudioControls({ settings, onMusic, onSfx }: Props) {
  function toggleMusic() {
    initAudio();
    playToggleClick();
    onMusic(!settings.musicEnabled);
  }

  function toggleSfx() {
    initAudio();
    playToggleClick();
    onSfx(!settings.sfxEnabled);
  }

  return (
    <div className="audio-controls" aria-label="오디오 설정">
      <button onClick={toggleMusic} aria-label="배경음악 켜기 끄기">
        {settings.musicEnabled ? "음악 켜짐" : "음악 꺼짐"}
      </button>
      <button onClick={toggleSfx} aria-label="효과음 켜기 끄기">
        {settings.sfxEnabled ? "효과음 켜짐" : "효과음 꺼짐"}
      </button>
    </div>
  );
}
