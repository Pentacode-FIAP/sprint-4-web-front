import { Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { CameraLayout } from './components/layout/CameraLayout';
import { CameraApp } from './features/camera/CameraApp';
import { ConfigScreen } from './features/camera/ConfigScreen';
import { ProgressoPlaceholder } from './features/progresso/ProgressoPlaceholder';
import { EstudarScreen } from './features/estudar/EstudarScreen';
import { ChatScreen } from './features/chat/ChatScreen';
import { GaleriaScreen } from './features/galeria/GaleriaScreen';
import { CalendarioScreen } from './features/calendario/CalendarioScreen';
import { NaoEncontrada } from './features/nao-encontrada/NaoEncontrada';

export default function App() {
  return (
    <Routes>
      <Route element={<CameraLayout />}>
        <Route path="/" element={<CameraApp />} />
        <Route path="/camera/modos" element={<ConfigScreen />} />
      </Route>
      <Route element={<AppLayout />}>
        <Route path="/progresso" element={<ProgressoPlaceholder />} />
        <Route path="/estudar" element={<EstudarScreen />} />
        <Route path="/chat" element={<ChatScreen />} />
        <Route path="/galeria" element={<GaleriaScreen />} />
        <Route path="/calendario" element={<CalendarioScreen />} />
      </Route>
      <Route path="*" element={<NaoEncontrada />} />
    </Routes>
  );
}
