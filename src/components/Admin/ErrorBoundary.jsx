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
        <div style={{padding: 20}}>
          <h3>Something went wrong</h3>
          <p className="muted">{convexMissing ? (
            <>
              The Convex backend is not responding or a required function is missing.<br />
              Try running <code>npx convex dev</code> or <code>npx convex deploy</code> to publish functions.
            </>
          ) : (
            <>An unexpected error occurred. Check the console for details.</>
          )}</p>
          <details style={{marginTop: 12, whiteSpace: 'pre-wrap'}}>
            <summary className="muted">Error details</summary>
            <div style={{marginTop:8, color:'#f7f7f7'}}>{msg}</div>
          </details>
        </div>
      )
    }

    return this.props.children
  }
}
