import { useEffect } from 'react';
export default function Custom404() {
  useEffect(() => {
    const timer = setTimeout(() => { window.location.href = '/'; }, 5000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',background:'#f7fafc'}}>
      <div style={{textAlign:'center',background:'#fff',padding:'40px 32px',borderRadius:'16px',boxShadow:'0 2px 16px #0001'}}>
        <img src="/images/icon/logo.png" alt="Fullfilment FBB" width="80" style={{marginBottom:'1.5em'}} />
        <h1 style={{fontSize:'5rem',color:'#e53e3e',marginBottom:'0.5em'}}>404</h1>
        <h2 style={{fontSize:'2rem',color:'#2d3748',marginBottom:'1em'}}>Halaman Tidak Ditemukan</h2>
        <p style={{color:'#4a5568',marginBottom:'2em'}}>Maaf, halaman yang Anda cari tidak tersedia.<br />Anda akan diarahkan ke halaman utama dalam 5 detik.</p>
        <a href="/" style={{display:'inline-block',background:'#3182ce',color:'#fff',padding:'0.75em 2em',borderRadius:'8px',textDecoration:'none',fontWeight:'bold'}}>Kembali ke Beranda</a>
      </div>
    </div>
  );
} 