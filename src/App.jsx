import { useState } from "react";
import "./index.css";
import Navbar from "./components/Navbar";
import Manager from "./components/Manager";
import Signin from "./components/Signin";
import Signup from "./components/Signup";

function App() {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem("token");
    return token ? { username: "user" } : null;
  });
  const [showSignup, setShowSignup] = useState(false);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    setAuth(null);
  };

  return (
    <>
      <Navbar auth={auth} onSignOut={handleSignOut} />
      {!auth ? (
        showSignup ? (
          <Signup onSwitch={() => setShowSignup(false)} />
        ) : (
          <Signin setAuth={setAuth} onSwitch={() => setShowSignup(true)} />
        )
      ) : (
        <Manager username={auth.username} />
      )}
    </>
  );
}

export default App;
