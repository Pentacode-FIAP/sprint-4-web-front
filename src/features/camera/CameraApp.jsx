import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Onboarding } from './Onboarding';
import { Camera } from './Camera';

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
    return <Onboarding onConcluir={concluirOnboarding} />;
  }
  return (
    <Camera
      onAbrirConfig={() => navigate('/camera/modos')}
      onAbrirEstudos={(aba) => navigate(`/${aba}`)}
    />
  );
}
