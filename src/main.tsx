import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import App from './App.tsx'
import { RouterProvider } from "react-router-dom";
import router from "./routes/routes";
import '@mantine/core/styles.css';
// import { MantineProvider } from "@mantine/core";
import { store } from './redux/app/store.tsx'
import { Provider } from 'react-redux'
import { SettingsProvider } from './context/SettingsContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
 <Provider store={store}>
  <SettingsProvider>
    <RouterProvider router={router} />
  </SettingsProvider>
</Provider>
  </StrictMode>,
)

