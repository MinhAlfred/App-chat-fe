import { useState } from 'react';
import Login from './screens/Login';
import Chat from './screens/Chat';
import Settings from './screens/Settings';
import Contacts from './screens/Contacts';
import CreateGroup from './screens/CreateGroup';

export type Screen = 'login' | 'chat' | 'settings' | 'contacts' | 'createGroup';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');

  const navigate = (screen: Screen) => setCurrentScreen(screen);

  return (
    <div className="h-screen w-full font-sans text-slate-900 antialiased selection:bg-primary/30">
      {currentScreen === 'login' && <Login onNavigate={navigate} />}
      {currentScreen === 'chat' && <Chat onNavigate={navigate} />}
      {currentScreen === 'settings' && <Settings onNavigate={navigate} />}
      {currentScreen === 'contacts' && <Contacts onNavigate={navigate} />}
      {currentScreen === 'createGroup' && <CreateGroup onNavigate={navigate} />}
    </div>
  );
}
