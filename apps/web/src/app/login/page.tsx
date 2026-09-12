import { authConfiguration } from "@/lib/auth-config";
import { bridgeConfig } from "@/lib/server/bridge-config";
export const dynamic = "force-dynamic";
export default async function Login({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const retry = (await searchParams).notice === "retry";
  const auth = authConfiguration();
  return <main className="signin-page"><section className="signin-card"><p className="eyebrow">STARTS FORWARD</p><h1>Your next step starts with connection.</h1><p>Sign in to work with STARTS Bridge, develop projects and connect evidence to action.</p>
    {retry && <p role="alert">Your sign-in could not be completed. The link may have expired or opened in a different browser. Start again below and finish in this same browser. The sign-in button will use this application’s configured address.</p>}
    {auth.ready ? <><a className="primary-button" href={new URL("/auth/login", process.env.APP_BASE_URL!).toString()}>Sign in with Auth0 →</a><p>New here? You can create an account on the secure login page if registration is enabled.</p></> : <><h2>Account connection needed</h2><p>The login integration is installed. The project owner must connect an Auth0 Regular Web Application before users can sign in.</p>{!auth.enabled && <a className="primary-button" href="/">Explore the guided demo →</a>}</>}
    <p>STARTS Bridge: {bridgeConfig().live ? "model configured; a successful conversation confirms access" : "guided demo; model API key needed for live conversation"}.</p>
  </section></main>;
}
