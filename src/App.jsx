import { Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { CameraLayout } from './components/layout/CameraLayout';
import { CameraApp } from './features/camera/CameraApp';
import { ConfigScreen } from './features/camera/ConfigScreen';
import { ProgressoPlaceholder } from './features/progresso/ProgressoPlaceholder';
import { EstudarTemporario } from './features/estudar/EstudarTemporario';
import { Chat } from './features/chat/Chat';
import { Galeria } from './features/galeria/Galeria';
import { Calendario } from './features/calendario/Calendario';
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
        <Route path="/estudar" element={<EstudarTemporario />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/galeria" element={<Galeria />} />
        <Route path="/calendario" element={<Calendario />} />
      </Route>
      <Route path="*" element={<NaoEncontrada />} />
    </Routes>
  );
}
