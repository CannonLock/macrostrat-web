import { render, redirect } from 'vite-plugin-ssr/abort'

export const guard = (pageContext) => {
  const { user } = pageContext

  console.log("User: ", user)

  if (user === undefined) {
    // Render the login page while preserving the URL. (This is novel technique
    // which we explain down below.)
    throw redirect(`${import.meta.env.VITE_MACROSTRAT_INGEST_API}/security/login?return_url=${pageContext.url}`)
    /* The more traditional way, redirect the user:
    throw redirect('/login')
    */
  }
  if (!user.groups.includes("admin")) {
    // Render the error page and show message to the user
    throw render(403, 'Only admins are allowed to access this page.')
  }
}