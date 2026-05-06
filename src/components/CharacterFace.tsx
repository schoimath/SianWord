import { useEffect, useState } from "react";
import curiousFace from "../../img/chr_curious_small.jpg";
import goodFace from "../../img/chr_good_small.jpg";
import normalFace from "../../img/chr_normal_small.jpg";

export type CharacterMood = "normal" | "curious" | "good";

type Props = {
  mood: CharacterMood;
  className?: string;
  alternateMood?: CharacterMood;
  animate?: boolean;
};

const faceByMood: Record<CharacterMood, string> = {
  normal: normalFace,
  curious: curiousFace,
  good: goodFace,
};

const labelByMood: Record<CharacterMood, string> = {
  normal: "문제를 기다리는 주인공",
  curious: "궁금해하는 주인공",
  good: "잘했다고 응원하는 주인공",
};

export function CharacterFace({ mood, className = "", alternateMood, animate = false }: Props) {
  const [useAlternate, setUseAlternate] = useState(false);
  const visibleMood = animate && alternateMood && useAlternate ? alternateMood : mood;

  useEffect(() => {
    setUseAlternate(false);
    if (!animate || !alternateMood) return;
    const timer = window.setInterval(() => {
      setUseAlternate((value) => !value);
    }, 1900);
    return () => window.clearInterval(timer);
  }, [animate, alternateMood, mood]);

  return (
    <img
      className={`character-face ${className}`}
      src={faceByMood[visibleMood]}
      alt={labelByMood[visibleMood]}
      draggable={false}
    />
  );
}
