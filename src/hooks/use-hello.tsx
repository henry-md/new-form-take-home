import { useEffect, useState } from "react";

const useHello = () => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/hello")
      .then((res) => res.text())
      .then((data) => {
        setText(data);
        setLoading(false);
      })
      .catch(() => {
        setText("");
        setLoading(false);
      });
  }, []);

  return { loading, text };
};

export default useHello;