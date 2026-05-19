import { useEffect, useMemo, useRef } from "react";

const useObjectUrl = (file: File | null | undefined): string | null => {
  const url = useMemo(
    () => (file instanceof File ? URL.createObjectURL(file) : null),
    [file],
  );
  const ref = useRef<string | null>(null);
  useEffect(() => {
    ref.current = url;
    return () => {
      if (ref.current) URL.revokeObjectURL(ref.current);
    };
  }, [url]);

  return url;
}

export default useObjectUrl;