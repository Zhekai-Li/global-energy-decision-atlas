import { AtlasPage } from './AtlasPage'
import { guestRecords } from '../guest-data'
import { reconcileState } from '../state'
import type { DashboardState } from '../types'

export function GuestAtlasPage({ initialState, onStateChange, onSignIn }: { initialState: DashboardState; onStateChange: (state: DashboardState) => void; onSignIn: () => void }) {
  return <AtlasPage
    userId="guest"
    initialState={reconcileState(initialState, guestRecords)}
    records={guestRecords}
    isGuest
    onStateChange={onStateChange}
    onSignOut={onSignIn}
  />
}
