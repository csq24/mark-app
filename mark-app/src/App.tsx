import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { ForumThreadPage } from './pages/ForumThreadPage'
import { ForumsPage } from './pages/ForumsPage'
import { LogBookPage } from './pages/LogBookPage'
import { LoginPage } from './pages/LoginPage'
import { MapPage } from './pages/MapPage'
import { MarketplacePage } from './pages/MarketplacePage'
import { NewCatchPage } from './pages/NewCatchPage'
import { SettingsPage } from './pages/SettingsPage'
import { SpeciesPage } from './pages/SpeciesPage'

export default function App() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/map" replace />} />
        <Route path="map" element={<MapPage />} />
        <Route path="species" element={<SpeciesPage />} />
        <Route path="marketplace" element={<MarketplacePage />} />
        <Route path="forums" element={<ForumsPage />} />
        <Route path="forums/:postId" element={<ForumThreadPage />} />
        <Route path="logbook" element={<LogBookPage />} />
        <Route path="new-catch" element={<NewCatchPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/map" replace />} />
    </Routes>
  )
}
