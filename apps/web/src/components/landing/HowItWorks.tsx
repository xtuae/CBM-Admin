const HowItWorks = () => {
  const steps = [
    { step: 'Create your account', desc: 'Sign up and verify your identity', icon: '👤' },
    { step: 'Choose a credit pack', desc: 'Browse and select the right pack', icon: '🛒' },
    { step: 'Checkout securely', desc: 'Complete payment with confidence', icon: '🔐' },
    { step: 'Process your order', desc: 'Credits are added to your balance', icon: '✅' }
  ];

  return (
    <section className="py-16">
      <div className="container-max">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Create and Use Credits</h2>
          <p className="text-gray-400">Get started in just a few simple steps</p>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((item, index) => (
            <div key={item.step} className="text-center">
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                {item.icon}
              </div>
              <div className="text-sm text-indigo-400 mb-2">Step {index + 1}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{item.step}</h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;