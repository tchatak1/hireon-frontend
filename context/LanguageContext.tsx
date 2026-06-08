import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const TRANSLATIONS = {
  en: {
    // Profile
    profile: 'Profile', editProfile: 'Edit Profile', livesIn: 'Lives in',
    phone: 'Phone number', email: 'Email', accountSecurity: 'Account & Security',
    languages: 'Language', contactUs: 'Contact Us', inviteFriends: 'Invite Your Friends',
    logout: 'Logout', logoutConfirm: 'Are you sure you want to logout?',
    cancel: 'Cancel', confirm: 'Confirm', english: 'English', french: 'French',
    selectLanguage: 'Select Language', saveChanges: 'Save Changes', saving: 'Saving...',
    city: 'City', region: 'Region', category: 'Category / Skill', bio: 'Bio',
    availability: 'Available for hire', changePhoto: 'Change Photo', back: 'Back',
    profileUpdated: 'Profile updated successfully!', error: 'Error',
    // Chat
    messages: 'Messages', noConversations: 'No conversations yet',
    noConvSub: 'Visit a profile and tap Message to start chatting',
    typeMessage: 'Type a message...', sayHello: 'Say hello!', tapViewProfile: 'Tap to view profile',
    // Home
    recommended: 'Recommended for You', topPicks: 'Our Top picks', newPros: 'New professionals',
    seeAll: 'See all', searchPlaceholder: 'Search for Name, Category or location',
    results: 'Results', clear: 'Clear', noAvailable: 'No available', noNew: 'No new',
    yet: 'yet', loadingPros: 'Loading professionals...',
    // Notifications
    notifications: 'Notifications', thisWeek: 'This Week', noNotifs: 'No notifications yet',
    accept: 'Accept', refuse: 'Refuse', seeLocation: 'See location',
    markCompleted: 'Mark Completed & Rate', rateProvider: '⭐ Rate Provider',
    // Tabs
    home: 'Home', favourites: 'Favourites',
    // Sign In
    loginTitle: 'Login to your account', emailOrPhone: 'Email or Phone number',
    password: 'Password', rememberMe: 'Remember me', forgotPassword: 'Forgot Password?',
    signIn: 'Sign in', orSignInWith: '-Or sign in with-', noAccount: "Don't have an account? ",
    signUp: 'Sign up', loginFailed: 'Login Failed', fillFields: 'Please enter your email and password',
    // Sign Up
    createAccount: 'Create an account', fullName: 'Full Name', confirmPassword: 'Confirm Password',
    alreadyAccount: 'Already have an account? ', orSignUpWith: '-Or Sign Up with-',
    // Get Started
    letsGetStarted: "Let's Get Started", diveIn: "Let's Dive into your account",
    termsConditions: 'Terms and Conditions', privacyPolicy: 'Privacy Policy',
    // Forgot Password
    passwordForgotten: 'Password Forgotten?', enterEmail: 'Enter your registered Email',
    sendOtp: 'Send OTP', enterOtp: 'Enter OTP Code',
    // Card & Profile
    viewProfile: 'View Profile', hire: 'Hire', message: 'Message',
    about: 'About', reviews: 'Reviews', noReviews: 'No reviews yet',
    markCompleteBtn: 'Mark Completed', rate: 'Rate',
    // Hire Form
    hireTitle: 'Hire', describeJob: 'Describe the job',
    jobPlaceholder: 'E.g. I need electrical wiring fixed in my living room...',
    scheduledDate: 'Scheduled Date', scheduledTime: 'Scheduled Time',
    yourLocation: 'Your Location', sendHireRequest: 'Send Hire Request',
    sending: 'Sending...', locationRequired: 'Location is required. Please allow location access',
    describeRequired: 'Please describe the job',
    requestSent: 'Hire request sent!', failed: 'Failed',
    // Registration
    congratulations: 'Congratulations', accountCreated: 'Your Account has been Successfully Created',
    continueBtn: 'Continue', oopsSorry: 'Oops, Sorry',
    errorOccurred: 'An error occurred, please try again',
    // Profile Setup
    completeProfile: 'Complete your Profile', tapToUpload: 'Tap to upload photo',
    name: 'Name', emailAddress: 'Email Address', phoneCode: 'Phone code',
    phoneNumber: 'Phone Number', age: 'Age', skills: 'Skills',
    uploadCv: 'Upload your CV (PDF)', saveAndContinue: 'Save & Continue',
    bioPlaceholder: 'Upload your CV above to auto-generate, or type manually...',
    // Time
    justNow: 'Just now', yesterday: 'Yesterday', ago: 'ago',
    minsAgo: 'm ago', hoursAgo: 'h ago', daysAgo: 'd ago',
    minLong: 'min ago', minsLong: 'mins ago',
    hourLong: 'hour ago', hoursLong: 'hours ago',
    dayLong: 'day ago', daysLong: 'days ago',
    // Regions
    adamaoua: 'Adamaoua', centre: 'Centre', east: 'East', farNorth: 'Far North',
    littoral: 'Littoral', north: 'North', northWest: 'North West',
    south: 'South', southWest: 'South West',
    // Carousel skills
    painters: 'Painters', electrician: 'Electrician', mechanic: 'Mechanic',
    plumber: 'Plumber', carpenter: 'Carpenter', tiler: 'Tiler',
    // Notification messages
    notif_hire_request: '{name} wants to hire you on {date} at {time}',
    notif_request_accepted: '{name} accepted your hiring request',
    notif_request_refused: '{name} refused your hiring request',
    notif_job_completed: 'Job marked as completed',
    notif_unknown: 'New notification',
    // Subscription
    subscription: 'Subscription',
    subscribeToHireon: 'Subscribe to Hireon',
    renewYourPlan: 'Renew Your Plan',
    subscriptionActive: 'Subscription Active',
    subscriptionActiveSub: '{label} plan · Expires {date} · {days} days left',
    subscribeHeroSub: 'Get discovered by clients and receive hire requests. Pay via MTN MoMo or Orange Money.',
    allPlansInclude: 'All plans include',
    benefit1: 'Appear in search results',
    benefit2: 'Receive hire requests from clients',
    benefit3: 'Show up in Recommended section',
    benefit4: 'Access to in-app messaging',
    benefit5: 'Profile visible to all clients',
    choosePlan: 'Choose your plan',
    bestValue: 'BEST VALUE',
    perMonth: 'XAF/month',
    subscribe: 'Subscribe',
    payWithMomo: 'Pay with MoMo',
    waitingPayment: 'Waiting for payment...',
    approveOnPhone: 'Please approve the MoMo request on your phone.',
    momoNote: 'You will receive a push notification on your phone to confirm the payment.',
    enterMomoNumber: 'Enter your MTN or Orange MoMo number to pay',
    paymentSuccess: '✅ Payment Successful!',
    paymentSuccessMsg: 'Your {label} subscription is now active.',
    paymentFailed: '❌ Payment Failed',
    paymentFailedMsg: 'The payment was not approved. Please try again.',
    paymentTimeout: '⏱ Timeout',
    paymentTimeoutMsg: 'Payment not confirmed yet. Check back later in your profile.',
    enterMomoError: 'Please enter your MoMo phone number',
    subscriptionRequired: '⚠️ Subscription Required',
    subRequiredHire: 'You need an active subscription to send hire requests.',
    subRequiredAccept: 'You need an active subscription to accept hire requests.',
    subRequiredMessage: 'You need an active subscription to send messages.',
    subscribeBtn: '📋 Subscribe',
  },
  fr: {
    // Profile
    profile: 'Profil', editProfile: 'Modifier le profil', livesIn: 'Habite à',
    phone: 'Numéro de téléphone', email: 'Email', accountSecurity: 'Compte & Sécurité',
    languages: 'Langue', contactUs: 'Nous contacter', inviteFriends: 'Inviter des amis',
    logout: 'Déconnexion', logoutConfirm: 'Voulez-vous vraiment vous déconnecter?',
    cancel: 'Annuler', confirm: 'Confirmer', english: 'Anglais', french: 'Français',
    selectLanguage: 'Choisir la langue', saveChanges: 'Enregistrer', saving: 'Enregistrement...',
    city: 'Ville', region: 'Région', category: 'Catégorie / Compétence', bio: 'Bio',
    availability: 'Disponible pour embauche', changePhoto: 'Changer la photo', back: 'Retour',
    profileUpdated: 'Profil mis à jour avec succès!', error: 'Erreur',
    // Chat
    messages: 'Messages', noConversations: 'Aucune conversation',
    noConvSub: 'Visitez un profil et appuyez sur Message pour commencer',
    typeMessage: 'Écrire un message...', sayHello: 'Dites bonjour!', tapViewProfile: 'Voir le profil',
    // Home
    recommended: 'Recommandé pour vous', topPicks: 'Nos meilleurs choix', newPros: 'Nouveaux professionnels',
    seeAll: 'Voir tout', searchPlaceholder: 'Rechercher par nom, catégorie ou lieu',
    results: 'Résultats', clear: 'Effacer', noAvailable: 'Aucun(e)', noNew: 'Aucun(e) nouveau',
    yet: 'disponible', loadingPros: 'Chargement des professionnels...',
    // Notifications
    notifications: 'Notifications', thisWeek: 'Cette semaine', noNotifs: 'Aucune notification',
    accept: 'Accepter', refuse: 'Refuser', seeLocation: 'Voir le lieu',
    markCompleted: 'Marquer terminé & noter', rateProvider: '⭐ Noter le prestataire',
    // Tabs
    home: 'Accueil', favourites: 'Favoris',
    // Sign In
    loginTitle: 'Connectez-vous à votre compte', emailOrPhone: 'Email ou numéro de téléphone',
    password: 'Mot de passe', rememberMe: 'Se souvenir de moi', forgotPassword: 'Mot de passe oublié?',
    signIn: 'Se connecter', orSignInWith: '-Ou se connecter avec-', noAccount: 'Pas de compte? ',
    signUp: "S'inscrire", loginFailed: 'Connexion échouée', fillFields: 'Veuillez entrer votre email et mot de passe',
    // Sign Up
    createAccount: 'Créer un compte', fullName: 'Nom complet', confirmPassword: 'Confirmer le mot de passe',
    alreadyAccount: 'Déjà un compte? ', orSignUpWith: "-Ou s'inscrire avec-",
    // Get Started
    letsGetStarted: 'Commençons', diveIn: 'Connectez-vous à votre compte',
    termsConditions: 'Termes et conditions', privacyPolicy: 'Politique de confidentialité',
    // Forgot Password
    passwordForgotten: 'Mot de passe oublié?', enterEmail: 'Entrez votre email enregistré',
    sendOtp: 'Envoyer le code', enterOtp: 'Entrer le code OTP',
    // Card & Profile
    viewProfile: 'Voir profil', hire: 'Embaucher', message: 'Message',
    about: 'À propos', reviews: 'Avis', noReviews: 'Aucun avis',
    markCompleteBtn: 'Marquer terminé', rate: 'Noter',
    // Hire Form
    hireTitle: 'Embaucher', describeJob: 'Décrivez le travail',
    jobPlaceholder: "Ex. J'ai besoin de câblage électrique réparé dans mon salon...",
    scheduledDate: 'Date prévue', scheduledTime: 'Heure prévue',
    yourLocation: 'Votre position', sendHireRequest: 'Envoyer la demande',
    sending: 'Envoi...', locationRequired: 'Position requise. Veuillez autoriser la localisation',
    describeRequired: 'Veuillez décrire le travail',
    requestSent: 'Demande envoyée!', failed: 'Échec',
    // Registration
    congratulations: 'Félicitations', accountCreated: 'Votre compte a été créé avec succès',
    continueBtn: 'Continuer', oopsSorry: 'Oups, Désolé',
    errorOccurred: 'Une erreur est survenue, veuillez réessayer',
    // Profile Setup
    completeProfile: 'Complétez votre profil', tapToUpload: 'Appuyez pour uploader une photo',
    name: 'Nom', emailAddress: 'Adresse email', phoneCode: 'Indicatif',
    phoneNumber: 'Numéro de téléphone', age: 'Âge', skills: 'Compétences',
    uploadCv: 'Télécharger votre CV (PDF)', saveAndContinue: 'Enregistrer & Continuer',
    bioPlaceholder: 'Uploadez votre CV ci-dessus pour générer automatiquement, ou écrivez manuellement...',
    // Time
    justNow: "À l'instant", yesterday: 'Hier', ago: 'il y a',
    minsAgo: 'min', hoursAgo: 'h', daysAgo: 'j',
    minLong: 'il y a 1 min', minsLong: 'min',
    hourLong: 'il y a 1h', hoursLong: 'h',
    dayLong: 'il y a 1 jour', daysLong: 'j',
    // Regions
    adamaoua: 'Adamaoua', centre: 'Centre', east: 'Est', farNorth: 'Extrême-Nord',
    littoral: 'Littoral', north: 'Nord', northWest: 'Nord-Ouest',
    south: 'Sud', southWest: 'Sud-Ouest',
    // Carousel skills
    painters: 'Peintres', electrician: 'Électricien', mechanic: 'Mécanicien',
    plumber: 'Plombier', carpenter: 'Menuisier', tiler: 'Carreleur',
    // Notification messages
    notif_hire_request: '{name} veut vous embaucher le {date} à {time}',
    notif_request_accepted: '{name} a accepté votre demande',
    notif_request_refused: '{name} a refusé votre demande',
    notif_job_completed: 'Travail marqué comme terminé',
    notif_unknown: 'Nouvelle notification',
    // Subscription
    subscription: 'Abonnement',
    subscribeToHireon: 'Abonnez-vous à Hireon',
    renewYourPlan: 'Renouveler votre abonnement',
    subscriptionActive: 'Abonnement actif',
    subscriptionActiveSub: 'Plan {label} · Expire le {date} · {days} jours restants',
    subscribeHeroSub: 'Soyez découvert par les clients et recevez des demandes. Payez via MTN MoMo ou Orange Money.',
    allPlansInclude: 'Tous les plans incluent',
    benefit1: 'Apparaître dans les résultats de recherche',
    benefit2: 'Recevoir des demandes de clients',
    benefit3: "Apparaître dans la section Recommandé",
    benefit4: 'Accès à la messagerie intégrée',
    benefit5: 'Profil visible par tous les clients',
    choosePlan: 'Choisissez votre plan',
    bestValue: 'MEILLEUR PRIX',
    perMonth: 'XAF/mois',
    subscribe: "S'abonner",
    payWithMomo: 'Payer avec MoMo',
    waitingPayment: 'En attente du paiement...',
    approveOnPhone: 'Veuillez approuver la demande MoMo sur votre téléphone.',
    momoNote: 'Vous recevrez une notification sur votre téléphone pour confirmer le paiement.',
    enterMomoNumber: 'Entrez votre numéro MTN ou Orange MoMo pour payer',
    paymentSuccess: '✅ Paiement réussi!',
    paymentSuccessMsg: 'Votre abonnement {label} est maintenant actif.',
    paymentFailed: '❌ Paiement échoué',
    paymentFailedMsg: "Le paiement n'a pas été approuvé. Veuillez réessayer.",
    paymentTimeout: '⏱ Délai dépassé',
    paymentTimeoutMsg: 'Paiement non confirmé. Vérifiez plus tard dans votre profil.',
    enterMomoError: 'Veuillez entrer votre numéro MoMo',
    subscriptionRequired: '⚠️ Abonnement requis',
    subRequiredHire: "Vous avez besoin d'un abonnement actif pour envoyer des demandes.",
    subRequiredAccept: "Vous avez besoin d'un abonnement actif pour accepter des demandes.",
    subRequiredMessage: "Vous avez besoin d'un abonnement actif pour envoyer des messages.",
    subscribeBtn: '📋 S\'abonner',
  },
} as const;

export type Lang = keyof typeof TRANSLATIONS;
export type TranslationKey = keyof typeof TRANSLATIONS['en'];

interface LangCtx { lang: Lang; t: (key: TranslationKey) => string; setLang: (l: Lang) => void; }
const LanguageContext = createContext<LangCtx>({ lang: 'en', t: (k) => k, setLang: () => {} });

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLangState] = useState<Lang>('en');
  useEffect(() => {
    AsyncStorage.getItem('app_language').then(saved => {
      if (saved === 'en' || saved === 'fr') setLangState(saved as Lang);
    });
  }, []);
  const setLang = async (l: Lang) => { setLangState(l); await AsyncStorage.setItem('app_language', l); };
  const t = (key: TranslationKey): string => (TRANSLATIONS[lang] as any)[key] ?? key;
  return <LanguageContext.Provider value={{ lang, t, setLang }}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);