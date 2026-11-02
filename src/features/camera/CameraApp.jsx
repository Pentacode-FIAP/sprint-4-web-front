import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingScreen } from './OnboardingScreen';
import { CameraScreen } from './CameraScreen';

const CHAVE_ONBOARDING = 'jovi_onboarding_visto';

export function CameraApp() {
  const navigate = useNavigate();
  const [onboarding, setOnboarding] = useState(
    () => !localStorage.getItem(CHAVE_ONBOARDING),
  );

  function concluirOnboarding() {
    localStorage.setItem(CHAVE_ONBOARDING, '1');
    setOnboarding(false);
  }

  if (onboarding) {
    return <OnboardingScreen onConcluir={concluirOnboarding} />;
  }
  return <CameraScreen onAbrirConfig={() => navigate('/camera/modos')} />;
}
