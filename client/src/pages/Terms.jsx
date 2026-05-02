import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms & Conditions</h1>
        <p className="text-gray-400 text-sm mb-8">Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

        <div className="prose prose-gray max-w-none space-y-6 text-sm text-gray-600 leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Platform ka Role (Intermediary)</h2>
            <p>Nirman Setu ek <strong>intermediary platform</strong> hai jo customers aur construction material suppliers ke beech connection provide karta hai. Hum khud directly koi material manufacture, stock ya sell nahi karte.</p>
            <p className="mt-2">IT Act 2000 ke Section 79 ke under, Nirman Setu ek intermediary ki tarah kaam karta hai aur third-party content ke liye directly liable nahi hai.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Service Use</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Platform sirf lawful purposes ke liye use karna hai</li>
              <li>Fake orders ya misleading information dena prohibited hai</li>
              <li>Ek person ka ek hi account hona chahiye</li>
              <li>Account credentials share mat karo</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Orders & Quotes</h2>
            <p>Order request submit karne se quote milta hai — ye confirmation nahi hai. Order tab confirm hota hai jab:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Tum quote accept karo</li>
              <li>Advance payment complete ho</li>
            </ul>
            <p className="mt-2">Hum best price ki koshish karte hain lekin market rates fluctuate ho sakti hain.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Payment</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Advance payment (30-50%) order confirm karne ke liye zaroori hai</li>
              <li>Remaining amount delivery ke time ya baad mein</li>
              <li>Sabhi payments Razorpay ke through secure hain</li>
              <li>Supplier ko direct payment mat karo platform bypass karke</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Cancellation & Refund</h2>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Confirm se pehle cancel:</strong> Full refund</li>
              <li><strong>Dispatch se pehle cancel:</strong> 80% refund</li>
              <li><strong>Dispatch ke baad cancel:</strong> Refund nahi</li>
              <li><strong>Wrong material deliver:</strong> Full refund ya replacement</li>
              <li><strong>Delivery delay (24+ hrs):</strong> Partial refund (case-by-case)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Supplier Responsibility</h2>
            <p>Nirman Setu verified suppliers ke saath kaam karta hai lekin guarantee nahi deta ki:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Material exactly same quality hoga jaisa listed hai</li>
              <li>Delivery date 100% guaranteed hai (force majeure events me)</li>
            </ul>
            <p className="mt-2">Kisi bhi issue ke liye hum supplier se mediation karenge.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Prohibited Activities</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Supplier ya customer ko platform bypass karna</li>
              <li>Illegal material (illegally mined sand, duplicate cement) ki demand</li>
              <li>Fake reviews ya ratings</li>
              <li>Platform hacking ya data scraping</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Liability Limitation</h2>
            <p>Nirman Setu ki maximum liability kisi bhi case mein us order ki value se zyada nahi hogi. Indirect, consequential ya special damages ke liye hum liable nahi hain.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">9. Governing Law</h2>
            <p>Ye terms Jharkhand, India ke laws ke under govern hoti hain. Disputes ke liye jurisdiction Ranchi, Jharkhand hoga.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">10. Contact</h2>
            <p>Koi sawaal hai toh: <a href="mailto:support@nirmansetu.in" className="text-orange-500 hover:underline">support@nirmansetu.in</a></p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
