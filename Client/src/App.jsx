import { Toaster } from "react-hot-toast";
import AppRouter from "./app/router";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <AppRouter />
    </ErrorBoundary>
  );
}

export default App;