import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router"
import { ConversationProvider } from "@/context/ConversationContext"
import { ChatProvider } from "@/context/ChatContext"
import App from "./App"
import ChatPage from "@/pages/ChatPage"
import HistoryPage from "@/pages/HistoryPage"
import AboutPage from "@/pages/AboutPage"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ConversationProvider>
        <ChatProvider>
          <Routes>
            <Route element={<App />}>
              <Route index element={<ChatPage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="about" element={<AboutPage />} />
            </Route>
          </Routes>
        </ChatProvider>
      </ConversationProvider>
    </BrowserRouter>
  </StrictMode>
)
