export default function Footer() {
  return (
    <footer style={{ background: '#172337', color: '#fff', padding: 24, marginTop: 40 }}>
      <div className="container row between" style={{ flexWrap: 'wrap' }}>
        <div>
          <h4>ABOUT</h4>
          <p className="muted">Contact Us · About Us · Careers</p>
        </div>
        <div>
          <h4>HELP</h4>
          <p className="muted">Payments · Shipping · Returns · FAQ</p>
        </div>
        <div>
          <h4>POLICY</h4>
          <p className="muted">Privacy · Terms · Security</p>
        </div>
        <div>
          <h4>SOCIAL</h4>
          <p className="muted">Twitter · Facebook · Instagram</p>
        </div>
      </div>
      <p style={{ textAlign: 'center', marginTop: 20 }} className="muted">© 2026 ShopKart Demo</p>
    </footer>
  );
}
