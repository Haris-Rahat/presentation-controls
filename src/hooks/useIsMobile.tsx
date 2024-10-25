import { useEffect, useState } from "react";

const size = {
  mobile: 830,
  tablet: 1024,
  desktop: 2560,
};

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (window.innerWidth <= size.mobile && !isMobile) setIsMobile(true);
    if (window.innerWidth >= size.mobile && isMobile) setIsMobile(false);
  }, [isMobile]);

  useEffect(() => {
    // Add event listener for window resize
    window.addEventListener("resize", () => {
      if (window.innerWidth <= size.mobile && !isMobile) {
        setIsMobile(true);
      } else if (window.innerWidth >= size.mobile && isMobile) {
        setIsMobile(false);
      }
    });
    return () => {
      window.removeEventListener("resize", () => {});
    };
  }, [isMobile]);

  return { isMobile };
};

export default useIsMobile;
