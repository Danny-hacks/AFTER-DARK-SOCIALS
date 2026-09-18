import { useEffect } from "react";

const SITE_NAME = "AFTR — After Dark Socials";

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  }, [title]);
}
