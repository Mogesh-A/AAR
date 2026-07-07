import { useEffect, useState } from "react";
import "./InstallPopup.css";

function InstallPopup() {
  const [showPopup, setShowPopup] = useState(true);
  const [showFab, setShowFab] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Show popup automatically
      setShowPopup(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) {
      alert("App is not ready to install yet.");
      return;
    }

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("Installed");
    }

    setDeferredPrompt(null);
    setShowPopup(false);
    setShowFab(false);
  };

  const closePopup = () => {
    setShowPopup(false);
    setShowFab(true);
  };

  return (
    <>
      {showPopup && (
        <div className="install-overlay">

          <div className="install-card">

            <img src="/icon-192.png" alt="logo" />

            <h2>Install Smartesion AR</h2>

            <p>
              Install Smartesion AR for a faster experience,
              offline support and one-tap access from your Home Screen.
            </p>

            <div className="buttons">

              <button className="install-btn" onClick={installApp}>
                Install Now
              </button>

              <button className="later-btn" onClick={closePopup}>
                Later
              </button>

            </div>

          </div>

        </div>
      )}

      {showFab && (
        <div className="install-fab" onClick={() => setShowPopup(true)}>
          <img src="/icon-192.png" alt="Install" />
        </div>
      )}
    </>
  );
}

export default InstallPopup;
