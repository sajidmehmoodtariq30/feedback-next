export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center animate-fade-in">
          <h1 className="text-6xl font-bold mb-6 text-foreground">
            Anonymous Feedback
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-muted-foreground">
            Share your thoughts freely. Receive honest feedback anonymously. 
            Create a safe space for authentic communication.
          </p>
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <a
              href="/sign-up"
              className="btn-primary inline-block font-semibold px-8 py-3 rounded-xl hover-lift transition-all duration-300"
            >
              Get Started
            </a>
            <a
              href="/sign-in"
              className="btn-secondary inline-block border-2 font-semibold px-8 py-3 rounded-xl hover-lift transition-all duration-300"
            >
              Sign In
            </a>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8 text-foreground">
          <div className="text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Anonymous</h3>
            <p>Send messages without revealing your identity</p>
          </div>
          
          <div className="text-center">
            <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 616 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure</h3>
            <p>Your data is protected with industry-standard encryption</p>
          </div>
          
          <div className="text-center">
            <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Easy</h3>
            <p>Simple to use interface for seamless communication</p>
          </div>
        </div>
      </div>
    </div>
  );
}
