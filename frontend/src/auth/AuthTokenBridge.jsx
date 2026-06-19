import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { setTokenGetter } from "../api/axios";
import { syncUser } from "../api/userApi";

function AuthTokenBridge() {
  const { getAccessTokenSilently, isAuthenticated, user } = useAuth0();

  useEffect(() => {
    setTokenGetter(async () => {
      return await getAccessTokenSilently();
    });
  }, [getAccessTokenSilently]);

  useEffect(() => {
    const runSync = async () => {
      try {
        if (!user) return;

        const data = await syncUser({
          email: user.email,
          name: user.name,
        });

        console.log("USER SYNCED:", data);
      } catch (error) {
        console.error("SYNC USER ERROR:", error);
      }
    };

    if (isAuthenticated) {
      runSync();
    }
  }, [isAuthenticated, user]);

  return null;
}

export default AuthTokenBridge;