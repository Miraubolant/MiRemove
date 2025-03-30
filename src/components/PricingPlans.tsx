import React from 'react';
import { Check, CreditCard } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

const plans = [
  {
    name: 'Personal',
    price: '69€',
    period: '/MOIS',
    description: 'Idéal pour vos besoins ponctuels',
    features: [
      "jusqu'à 1000 photos traitées par mois en un clic",
      'Export PNG/JPG',
      'Support par email',
      '0,069€/photo'
    ],
    buttonText: 'Choisir Personal',
    popular: false,
    stripeLink: 'https://buy.stripe.com/test_00g5oqgGp6iHaaYcMM'
  },
  {
    name: 'Pro',
    price: '299€',
    period: '/MOIS',
    description: 'Boostez votre productivité',
    features: [
      '5000 photos transformées par mois sans effort',
      'Tous les formats d\'export',
      'Support prioritaire',
      '0,059€/photo'
    ],
    buttonText: 'Choisir Pro',
    popular: true,
    stripeLink: 'https://buy.stripe.com/test_8wMbMObm5cH5dnabIJ'
  },
  {
    name: 'Elite',
    price: '499€',
    period: '/MOIS',
    description: 'La solution ultime pour les volumétries importantes',
    features: [
      "jusqu'à 10 000 photos retouchées par mois",
      'Accès API illimité',
      'Support dédié 24/7',
      '0,0499€/photo'
    ],
    buttonText: 'Choisir Elite',
    popular: false,
    stripeLink: 'https://buy.stripe.com/test_5kAcQSbm5fTh5UI4gi'
  }
];

export function PricingPlans() {
  const { user } = useAuthStore();

  const handlePlanClick = (plan: typeof plans[0]) => {
    if (plan.stripeLink) {
      const baseUrl = plan.stripeLink.split('?')[0];
      const email = user?.email || '';
      const encodedEmail = encodeURIComponent(email);
      const finalUrl = `${baseUrl}?prefilled_email=${encodedEmail}`;
      window.location.href = finalUrl;
    }
  };

  return (
    <div className="py-12 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white">OFFRES ABONNEMENT</h2>
          <p className="mt-4 text-lg text-gray-300">
            Gagnez du temps avec notre solution de nettoyage photo automatisé.
          </p>
          <p className="mt-2 text-gray-400">
            Retirer l'arrière-plan de vos images en un clic grâce un outil en ligne ultra-performant. Simple, rapide et accessible à toute votre équipe, sans contrainte de licence.
          </p>
          <p className="mt-4 text-xl text-emerald-500 font-medium">
            Choisissez l'offre qui vous convient :
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border ${
                plan.popular
                  ? 'border-emerald-500 shadow-lg shadow-emerald-500/20'
                  : 'border-gray-700'
              } bg-slate-800/50 backdrop-blur-sm p-8 transform hover:scale-105 transition-all duration-300`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <div className="bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Le plus populaire
                  </div>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-4">{plan.name}</h3>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-5xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400 text-sm">{plan.period}</span>
                </div>
                <p className="text-gray-400 mt-4 min-h-[48px]">{plan.description}</p>
              </div>

              <ul className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePlanClick(plan)}
                className={`mt-8 w-full py-3 px-6 rounded-xl flex items-center justify-center gap-2 font-medium transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-gray-200'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-400">
            Tous les prix sont en euros (EUR) et incluent la TVA.
            <br />
            Des questions ? {' '}
            <a
              href="mailto:contact@miraubolant.com"
              className="text-emerald-500 hover:text-emerald-400 transition-colors"
            >
              Contactez-nous
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}