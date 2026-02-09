import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Caught error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      const err = this.state.error
      const msg = err && err.message ? err.message : String(err)

      // provide specific guidance if Convex function missing
      const convexMissing = msg && msg.includes("Could not find public function")

      return (
        <div className="p-5 text-center">
          <h3 className="text-xl font-bold mb-4 font-cal-sans text-red-500">Something went wrong</h3>
          <p className="text-white/60 mb-4">{convexMissing ? (
            <>
              The Convex backend is not responding or a required function is missing.<br />
              <div className="mt-2 text-sm">Try running <code className="bg-white/10 px-1 rounded">npx convex dev</code> or <code className="bg-white/10 px-1 rounded">npx convex deploy</code> to publish functions.</div>
            </>
          ) : (
            <>An unexpected error occurred. Check the console for details.</>
          )}</p>
          <details className="mt-4 text-left bg-white/5 p-4 rounded text-sm text-white/50 border border-white/10">
            <summary className="cursor-pointer hover:text-white">Error details</summary>
            <div className="mt-2 text-red-400 font-mono whitespace-pre-wrap">{msg}</div>
          </details>
        </div>
      )
    }

    return this.props.children
  }
}
