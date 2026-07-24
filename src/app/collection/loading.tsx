export default function Loading() {
  return (
    <div className="wrap border-box" style={{ minHeight: '100vh', paddingBottom: '80px', paddingTop: '150px' }}>
      <div className="section-head">
        <h2>Loading archive...</h2>
        <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
             <div style={{ width: '40px', height: '10px', background: 'var(--line-on-linen-bright)', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
             <div style={{ width: '40px', height: '10px', background: 'var(--line-on-linen-bright)', animation: 'pulse 1.5s infinite ease-in-out', animationDelay: '0.2s' }}></div>
             <div style={{ width: '40px', height: '10px', background: 'var(--line-on-linen-bright)', animation: 'pulse 1.5s infinite ease-in-out', animationDelay: '0.4s' }}></div>
        </div>
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
