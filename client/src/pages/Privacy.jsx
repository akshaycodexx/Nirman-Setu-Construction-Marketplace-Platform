import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-400 text-sm mb-8">Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

        <div className="space-y-6 text-sm text-gray-600 leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Kaun sa Data Collect Hota Hai</h2>
            <p>Hum sirf wo data collect karte hain jo service provide karne ke liye zaroori hai:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li><strong>Personal:</strong> Naam, phone number, email address</li>
              <li><strong>Location:</strong> Delivery address, city, pincode</li>
              <li><strong>Order Data:</strong> Items, quantities, dates</li>
              <li><strong>Usage:</strong> Platform usage patterns (anonymized)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Data Kaise Use Hota Hai</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Order process aur delivery arrange karne ke liye</li>
              <li>Quote aur updates bhejne ke liye (SMS/WhatsApp)</li>
              <li>Customer support ke liye</li>
              <li>Platform improve karne ke liye (anonymized analytics)</li>
            </ul>
            <p className="mt-2 font-medium text-gray-800">Hum tumhara data kisi third party ko sell nahi karte.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Phone Number Protection</h2>
            <p>Tumhara phone number:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Suppliers ko kabhi share nahi kiya jaata</li>
              <li>Database mein encrypted store hota hai</li>
              <li>Display mein masked format mein dikhta hai (98XXXXX890)</li>
              <li>Sirf admin (hum) ko access hota hai order process ke liye</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Data Sharing</h2>
            <p>Hum data sirf in cases mein share karte hain:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li><strong>Delivery ke liye:</strong> Partial address supplier ko (no contact info)</li>
              <li><strong>Payment:</strong> Razorpay (secure payment gateway)</li>
              <li><strong>Legal requirement:</strong> Court order ya government request pe</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Data Security</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>HTTPS encrypted connections</li>
              <li>JWT-based secure authentication</li>
              <li>Regular security audits</li>
              <li>Role-based access control</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Cookies</h2>
            <p>Hum session aur preference store karne ke liye minimal cookies use karte hain. Advertising cookies use nahi karte.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Tumhare Rights</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Apna data access karne ka right</li>
              <li>Data correction request</li>
              <li>Account delete karne ka right</li>
              <li>Marketing communications se opt-out</li>
            </ul>
            <p className="mt-2">In rights ke liye: <a href="mailto:support@nirmansetu.in" className="text-orange-500 hover:underline">support@nirmansetu.in</a></p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Data Retention</h2>
            <p>Order data 3 saal tak retain hota hai (tax/legal requirements). Account delete karne ke baad personal data 30 din mein remove hota hai.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">9. Policy Updates</h2>
            <p>Policy change hone pe registered users ko email notification milega. Continued use = acceptance of new terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">10. Contact</h2>
            <p>Privacy concerns ke liye: <a href="mailto:support@nirmansetu.in" className="text-orange-500 hover:underline">support@nirmansetu.in</a></p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
