import { env } from "@/lib/env";

function SessionDebugger() {
  if (env.NODE_ENV !== "development") return null;

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          const checkForOrphanedSessions = () => {
            const cookies = document.cookie.split(';');
            const authCookies = cookies.filter(cookie => 
              cookie.trim().startsWith('next-auth.session-token=') || 
              cookie.trim().startsWith('__Secure-next-auth.session-token=')
            );
            
            if (authCookies.length > 0) {
              console.debug('Auth cookies found:', authCookies);
            }

            try {
              const sessionData = localStorage.getItem('next-auth.session-data');
              if (sessionData) {
                const parsed = JSON.parse(sessionData);
                if (!parsed.user || !parsed.user.id) {
                  console.warn('Possible orphaned session detected in localStorage', parsed);
                }
              }
            } catch (e) {}
          };
          
          checkForOrphanedSessions();
          let lastUrl = location.href;
          new MutationObserver(() => {
            if (location.href !== lastUrl) {
              lastUrl = location.href;
              checkForOrphanedSessions();
            }
          }).observe(document, {subtree: true, childList: true});
        `,
      }}
    />
  );
}
