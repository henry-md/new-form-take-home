import { useEffect, useState } from "react";

const useUserEmail = (name: string) => {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!name) return;
    setLoading(true);
    (async () => {
      try {
        // const res = await fetch(`https://new-form-take-home.vercel.app/api/user-by-name?name=Henry`);
        const res = await fetch(`/api/user-by-name?name=${encodeURIComponent(name)}`);
        const data = await res.json();
        if (data.email) {
          setEmail(data.email);
          setError(null);
        } else {
          setEmail(null);
          setError(data.error || "User not found");
        }
      } catch (err: unknown) {
        setEmail(null);
        if (err instanceof Error) {
          console.log(`Error: ${err.message}`);
        } else {
          console.log('Unknown error', err);
        }
        setError("Fetch error");
      } finally {
        setLoading(false);
      }
    })();
  }, [name]);

  return { email, loading, error };
};

export default useUserEmail;