import { createBrowserRouter, RouterProvider } from "react-router";
import Index from "./pages/Index.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import NotFound from "./pages/Error.jsx";
import { Toaster } from "./components/ui/sonner.jsx";
import { loader as indexLoader } from "./pages/Index.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ProjectsProvider } from "./context/ProjectsContext.jsx";
import { UIProvider } from "./context/UIContext.jsx";
import { HealthProvider } from "./context/HealthContext.jsx";
import { DocumentsProvider } from "./context/DocumentsContext.jsx";
import { ProgressProvider } from "./context/ProgressContext.jsx";
import { MessagesProvider } from "./context/MessagesContext.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Index />,
        loader: indexLoader,
      },
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

function App() {
  return (
    <AuthProvider>
      <HealthProvider>
        <ProjectsProvider>
          <UIProvider>
            <DocumentsProvider>
              <ProgressProvider>
                <MessagesProvider>
                  <Toaster />
                  <RouterProvider router={router} />
                </MessagesProvider>
              </ProgressProvider>
            </DocumentsProvider>
          </UIProvider>
        </ProjectsProvider>
      </HealthProvider>
    </AuthProvider>
  );
}

export default App;
