import { useEffect, useState } from "react";

const useUserEmail = (name: string) => {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!name) return;
    setLoading(true);
    fetch(`/api/user-by-name?name=${encodeURIComponent(name)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.email) {
          setEmail(data.email);
          setError(null);
        } else {
          setEmail(null);
          setError(data.error || "User not found");
        }
      })
      .catch((err) => {
        setEmail(null);
        setError("Fetch error");
      })
      .finally(() => setLoading(false));
  }, [name]);

  return { email, loading, error };
};

export default useUserEmail;