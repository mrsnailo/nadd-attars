export default function Loading() {
  return (
    <div className="wrap border-box" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <div style={{ width: '56px', height: '104px', background: 'var(--line-on-linen)', borderRadius: '2px 2px 10px 10px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
        <p style={{ color: 'var(--muted-on-linen)' }}>Fetching dossier...</p>
      </div>
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.3; }
          50% { opacity: 1; }
          100% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
