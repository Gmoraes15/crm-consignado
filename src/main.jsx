import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import CRMConsignado from './crm-consignado.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CRMConsignado />
  </StrictMode>
)