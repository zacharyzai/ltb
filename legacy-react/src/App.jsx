import { Navigate, Route, Routes } from 'react-router-dom'
import CaregiverLayout from './layouts/CaregiverLayout.jsx'
import StaffLayout from './layouts/StaffLayout.jsx'
import Dashboard from './pages/staff/Dashboard.jsx'
import StatusUpdate from './pages/staff/StatusUpdate.jsx'
import PostMoment from './pages/staff/PostMoment.jsx'
import StaffInquiries from './pages/staff/StaffInquiries.jsx'
import StaffVisits from './pages/staff/StaffVisits.jsx'
import StaffEvents from './pages/staff/StaffEvents.jsx'
import Home from './pages/Home.jsx'
import Moments from './pages/Moments.jsx'
import Visits from './pages/Visits.jsx'
import BookVisit from './pages/BookVisit.jsx'
import Community from './pages/Community.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<CaregiverLayout />}>
        <Route index element={<Home />} />
        <Route path="moments" element={<Moments />} />
        <Route path="visits" element={<Visits />} />
        <Route path="visits/book" element={<BookVisit />} />
        <Route path="community" element={<Community />} />
      </Route>
      <Route path="staff" element={<StaffLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="inquiries" element={<StaffInquiries />} />
        <Route path="visits" element={<StaffVisits />} />
        <Route path="events" element={<StaffEvents />} />
        <Route path="status" element={<StatusUpdate />} />
        <Route path="moment" element={<PostMoment />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
