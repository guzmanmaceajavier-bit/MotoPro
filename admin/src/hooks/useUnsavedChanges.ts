import { useEffect, useCallback } from "react";

export function useUnsavedChanges(unsaved: boolean) {
  useEffect(() => {
    if (!unsaved) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [unsaved]);
}

export function useBeforeLeave(unsaved: boolean) {
  const handler = useCallback((e: PopStateEvent) => {
    if (unsaved && !window.confirm("Tienes cambios sin guardar. ¿Estás seguro de querer salir?")) {
      window.history.pushState(null, "", window.location.href);
    }
  }, [unsaved]);

  useEffect(() => {
    if (!unsaved) return;
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [unsaved, handler]);
}
