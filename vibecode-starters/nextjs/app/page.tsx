export default function Home() {
  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      fontFamily: 'system-ui, sans-serif',
      backgroundColor: '#0a0a0a',
      color: 'white',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>VibeCode Next.js</h1>
      <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>
        Edit <code style={{ background: '#333', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>app/page.tsx</code> to get started.
      </p>
    </div>
  );
}
