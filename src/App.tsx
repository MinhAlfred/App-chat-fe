import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import Login from './screens/Login';
import Chat from './screens/Chat';
import Settings from './screens/Settings';
import Contacts from './screens/Contacts';
import CreateGroup from './screens/CreateGroup';
import { useAuth } from './auth/AuthContext';
import { Screen, screenPath } from './navigation/routes';

export default function App() {
  const { isAuthenticated, isInitializing } = useAuth();
  const routerNavigate = useNavigate();

  const navigate = (screen: Screen) => {
    if (!isAuthenticated && screen !== 'login') {
      routerNavigate(screenPath.login);
      return;
    }

    routerNavigate(screenPath[screen]);
  };

  if (isInitializing) {
    return (
      <div className="h-screen w-full font-sans text-slate-900 antialiased flex items-center justify-center bg-slate-50">
        <p className="text-sm font-semibold text-slate-500">Checking session...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full font-sans text-slate-900 antialiased selection:bg-primary/30">
      {!isAuthenticated ? (
        <Routes>
          <Route path={screenPath.login} element={<Login onNavigate={navigate} />} />
          <Route path="*" element={<Navigate to={screenPath.login} replace />} />
        </Routes>
      ) : (
        <Routes>
          <Route path={screenPath.chat} element={<Chat onNavigate={navigate} />} />
          <Route path={screenPath.settings} element={<Settings onNavigate={navigate} />} />
          <Route path={screenPath.contacts} element={<Contacts onNavigate={navigate} />} />
          <Route path={screenPath.createGroup} element={<CreateGroup onNavigate={navigate} />} />
          <Route path={screenPath.login} element={<Navigate to={screenPath.chat} replace />} />
          <Route path="/" element={<Navigate to={screenPath.chat} replace />} />
          <Route path="*" element={<Navigate to={screenPath.chat} replace />} />
        </Routes>
      )}
    </div>
  );
}
