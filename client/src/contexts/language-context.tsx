import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'el';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionaries
const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.profile': 'Profile',
    'nav.logout': 'Logout',
    
    // Landing page
    'landing.signIn': 'Sign In',
    'landing.heroTitle': 'Stay Safe, Stay Informed',
    'landing.heroDescription': 'Cyprus Emergency Alert System provides real-time emergency notifications, interactive mapping, and community-based safety features for all villages across Cyprus.',
    'landing.getStarted': 'Get Started - Sign In Now',
    'landing.feature1Title': 'Interactive Mapping',
    'landing.feature1Description': 'Report emergencies and view incidents on an interactive map of Cyprus with village boundaries.',
    'landing.feature2Title': 'Real-Time Alerts',
    'landing.feature2Description': 'Receive instant notifications about emergencies in your area via SMS and browser notifications.',
    'landing.feature3Title': 'Village Network',
    'landing.feature3Description': 'Connect with your local community and village administrators for coordinated emergency response.',
    'landing.feature4Title': 'Emergency Services',
    'landing.feature4Description': 'Quick access to Cyprus emergency contacts including police, fire department, and medical services.',
    'landing.callToActionTitle': 'Join Your Village Community Today',
    'landing.callToActionDescription': 'Sign in to access village-specific emergency alerts, report incidents in your area, and connect with your local emergency response network.',
    'landing.signInToContinue': 'Sign In to Continue',
    
    // Dashboard
    'dashboard.title': 'Emergency Dashboard',
    'dashboard.welcome': 'Welcome back',
    'dashboard.subtitle': 'Monitor and respond to emergencies in your area.',
    'dashboard.lastUpdated': 'Last updated',
    'dashboard.activeEmergencies': 'Active Emergencies',
    'dashboard.activeWarnings': 'Active Warnings',
    'dashboard.villagesCovered': 'Villages Covered',
    'dashboard.systemStatus': 'System Status',
    'dashboard.online': 'Online',
    'dashboard.allSystemsOperational': 'All systems operational',
    'dashboard.acrossCyprus': 'Across Cyprus',
    'dashboard.requiresAttention': 'Requires immediate attention',
    'dashboard.noActiveEmergencies': 'No active emergencies',
    'dashboard.monitorSituation': 'Monitor situation',
    'dashboard.noActiveWarnings': 'No active warnings',
    'dashboard.recentActivity': 'Recent Activity',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.noRecentAlerts': 'No recent alerts',
    'dashboard.allQuiet': 'All quiet in your area',
    'dashboard.reportEmergency': 'Report Emergency',
    'dashboard.openReportingPage': 'Open emergency reporting page',
    'dashboard.emergencyServices': 'Emergency Services',
    'dashboard.contactEmergencyServices': 'Contact emergency services directly',
    'dashboard.evacuationPlanning': 'Evacuation Planning',
    'dashboard.manageEvacuationRoutes': 'Manage evacuation routes and zones',
    'dashboard.smsAlerts': 'SMS Alerts',
    'dashboard.sendEmergencySms': 'Send emergency SMS notifications',
    'dashboard.villages': 'villages',
    'dashboard.village': 'village',
    'dashboard.recentAlerts': 'Recent Alerts',
    'dashboard.viewAllAlerts': 'View All Alerts',
    'dashboard.viewAlert': 'View Alert',
    'dashboard.alertLevel': 'Alert Level',
    'dashboard.villageAdminPanel': 'Village Admin Panel',
    'dashboard.manageVillageSettings': 'Manage village settings and residents',
    'dashboard.accessAdminPanel': 'Access Admin Panel',
    'dashboard.emergencyMap': 'Emergency Map',
    'dashboard.viewMapDesc': 'View emergency incidents and reports on interactive map',
    'dashboard.openMap': 'Open Map',
    'dashboard.ago': 'ago',
    'dashboard.just': 'just',
    'dashboard.now': 'now',
    
    // Emergency types
    'emergencyType.fire': 'Fire',
    'emergencyType.smoke': 'Smoke',
    'emergencyType.flood': 'Flood',
    'emergencyType.accident': 'Accident',
    'emergencyType.medical': 'Medical',
    'emergencyType.weather': 'Weather',
    'emergencyType.security': 'Security',
    'emergencyType.other': 'Other',
    
    // Emergency Services
    'emergencyServices.title': 'Emergency Services',
    'emergencyServices.subtitle': 'Direct contact with official Cyprus emergency services. Tap to call immediately.',
    'emergencyServices.backToDashboard': 'Back to Dashboard',
    'emergencyServices.callNow': 'Call Now',
    'emergencyServices.police': 'Police',
    'emergencyServices.policeDesc': 'General emergency police services',
    'emergencyServices.fire': 'Fire Department',
    'emergencyServices.fireDesc': 'Fire emergencies and rescue services',
    'emergencyServices.ambulance': 'Ambulance',
    'emergencyServices.ambulanceDesc': 'Medical emergencies and ambulance',
    'emergencyServices.coastGuard': 'Coast Guard',
    'emergencyServices.coastGuardDesc': 'Marine emergencies and sea rescue',
    'emergencyServices.traffic': 'Traffic Police',
    'emergencyServices.trafficDesc': 'Traffic accidents and road incidents',
    'emergencyServices.forestry': 'Forestry Department',
    'emergencyServices.forestryDesc': 'Forest fires and wildlife emergencies',
    'emergencyServices.civil': 'Civil Defense',
    'emergencyServices.civilDesc': 'Civil protection and disaster response',
    'emergencyServices.poison': 'Poison Control',
    'emergencyServices.poisonDesc': 'Poisoning and toxic substance emergencies',
    'emergencyServices.searchRescue': 'Search & Rescue',
    'emergencyServices.searchRescueDesc': 'Mountain and wilderness rescue operations',
    'emergencyServices.emergency': 'Emergency',
    'emergencyServices.specialist': 'Specialist',
    'emergencyServices.support': 'Support',
    
    // SMS Alerts
    'smsAlerts.title': 'SMS Emergency Alerts',
    'smsAlerts.subtitle': 'Send emergency SMS notifications to residents.',
    'smsAlerts.villageAdminNote': 'As a village admin, you can send to your village residents only.',
    'smsAlerts.superAdminNote': 'As a super admin, you can send to all villages.',
    'smsAlerts.sendAlert': 'Send SMS Alert',
    'smsAlerts.composeSms': 'Compose SMS',
    'smsAlerts.sendEmergencySms': 'Send Emergency SMS Alert',
    'smsAlerts.alertType': 'Alert Type',
    'smsAlerts.priority': 'Priority',
    'smsAlerts.message': 'Message',
    'smsAlerts.messagePlaceholder': 'Enter your emergency message here...',
    'smsAlerts.charactersLimit': 'characters',
    'smsAlerts.smsDelivery': 'SMS Delivery',
    'smsAlerts.productionNote': 'In a production environment, this would integrate with an SMS service provider like Twilio. The message will be sent to all residents\' registered phone numbers in the target villages.',
    'smsAlerts.cancel': 'Cancel',
    'smsAlerts.sendSmsAlert': 'Send SMS Alert',
    'smsAlerts.sending': 'Sending...',
    'smsAlerts.instantDelivery': 'Instant Delivery',
    'smsAlerts.instantDeliveryDesc': 'SMS sent immediately to all residents',
    'smsAlerts.villageCoverage': 'Village Coverage',
    'smsAlerts.villageCoverageDesc': 'Reaches all registered residents',
    'smsAlerts.deliveryTracking': 'Delivery Tracking',
    'smsAlerts.deliveryTrackingDesc': 'Monitor message delivery status',
    'smsAlerts.history': 'SMS Alert History',
    'smsAlerts.noAlerts': 'No SMS alerts sent yet',
    'smsAlerts.useButton': 'Use the button above to send your first SMS alert',
    'smsAlerts.recipients': 'recipients',
    'smsAlerts.emergency': 'emergency',
    'smsAlerts.warning': 'warning',
    'smsAlerts.info': 'info',
    'smsAlerts.urgent': 'urgent',
    'smsAlerts.normal': 'normal',
    'smsAlerts.low': 'low',
    'smsAlerts.sent': 'sent',
    'smsAlerts.pending': 'pending',
    'smsAlerts.failed': 'failed',
    
    // Common
    'common.emergency': '🚨 Emergency',
    'common.warning': '⚠️ Warning',
    'common.info': 'ℹ️ Information',
    'common.urgent': '🔴 Urgent',
    'common.normal': '🟢 Normal',
    'common.low': '⚪ Low',
    'common.unauthorized': 'Unauthorized',
    'common.adminRequired': 'You need administrator privileges to access this functionality.',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.validationError': 'Validation Error',
    'common.pleaseEnterMessage': 'Please enter a message to send.',
    'common.alertSent': 'SMS Alert Sent',
    'common.alertSentDesc': 'Your emergency SMS notification has been sent successfully.',
    'common.failedToSend': 'Failed to send SMS alert. Please try again.',
  },
  el: {
    // Navigation
    'nav.dashboard': 'Πίνακας Ελέγχου',
    'nav.profile': 'Προφίλ',
    'nav.logout': 'Αποσύνδεση',
    
    // Landing page
    'landing.signIn': 'Σύνδεση',
    'landing.heroTitle': 'Μείνετε Ασφαλείς, Μείνετε Ενημερωμένοι',
    'landing.heroDescription': 'Το Σύστημα Ειδοποιήσεων Έκτακτης Ανάγκης της Κύπρου παρέχει ειδοποιήσεις έκτακτης ανάγκης σε πραγματικό χρόνο, διαδραστική χαρτογράφηση και λειτουργίες ασφάλειας βασισμένες στην κοινότητα για όλα τα χωριά σε όλη την Κύπρο.',
    'landing.getStarted': 'Ξεκινήστε - Συνδεθείτε Τώρα',
    'landing.feature1Title': 'Διαδραστική Χαρτογράφηση',
    'landing.feature1Description': 'Αναφέρετε έκτακτες ανάγκες και δείτε περιστατικά σε διαδραστικό χάρτη της Κύπρου με όρια χωριών.',
    'landing.feature2Title': 'Ειδοποιήσεις Πραγματικού Χρόνου',
    'landing.feature2Description': 'Λαμβάνετε άμεσες ειδοποιήσεις για έκτακτες ανάγκες στην περιοχή σας μέσω SMS και ειδοποιήσεων περιηγητή.',
    'landing.feature3Title': 'Δίκτυο Χωριού',
    'landing.feature3Description': 'Συνδεθείτε με την τοπική σας κοινότητα και τους διαχειριστές χωριού για συντονισμένη αντίδραση έκτακτης ανάγκης.',
    'landing.feature4Title': 'Υπηρεσίες Έκτακτης Ανάγκης',
    'landing.feature4Description': 'Γρήγορη πρόσβαση σε επαφές έκτακτης ανάγκης της Κύπρου συμπεριλαμβανομένης αστυνομίας, πυροσβεστικής και ιατρικών υπηρεσιών.',
    'landing.callToActionTitle': 'Εγγραφείτε στην Κοινότητα του Χωριού σας Σήμερα',
    'landing.callToActionDescription': 'Συνδεθείτε για πρόσβαση σε ειδοποιήσεις έκτακτης ανάγκης του χωριού σας, αναφορά περιστατικών στην περιοχή σας και σύνδεση με το τοπικό δίκτυο αντίδρασης έκτακτης ανάγκης.',
    'landing.signInToContinue': 'Συνδεθείτε για Συνέχεια',
    
    // Dashboard
    'dashboard.title': 'Πίνακας Ελέγχου Έκτακτων Αναγκών',
    'dashboard.welcome': 'Καλώς ήρθατε πίσω',
    'dashboard.subtitle': 'Παρακολουθήστε και αντιδράστε σε έκτακτες ανάγκες στην περιοχή σας.',
    'dashboard.lastUpdated': 'Τελευταία ενημέρωση',
    'dashboard.activeEmergencies': 'Ενεργές Έκτακτες Ανάγκες',
    'dashboard.activeWarnings': 'Ενεργές Προειδοποιήσεις',
    'dashboard.villagesCovered': 'Κάλυψη Χωριών',
    'dashboard.systemStatus': 'Κατάσταση Συστήματος',
    'dashboard.online': 'Σε Λειτουργία',
    'dashboard.allSystemsOperational': 'Όλα τα συστήματα λειτουργούν',
    'dashboard.acrossCyprus': 'Σε όλη την Κύπρο',
    'dashboard.requiresAttention': 'Απαιτεί άμεση προσοχή',
    'dashboard.noActiveEmergencies': 'Δεν υπάρχουν ενεργές έκτακτες ανάγκες',
    'dashboard.monitorSituation': 'Παρακολούθηση κατάστασης',
    'dashboard.noActiveWarnings': 'Δεν υπάρχουν ενεργές προειδοποιήσεις',
    'dashboard.recentActivity': 'Πρόσφατη Δραστηριότητα',
    'dashboard.quickActions': 'Γρήγορες Ενέργειες',
    'dashboard.noRecentAlerts': 'Δεν υπάρχουν πρόσφατες ειδοποιήσεις',
    'dashboard.allQuiet': 'Όλα ήσυχα στην περιοχή σας',
    'dashboard.reportEmergency': 'Αναφορά Έκτακτης Ανάγκης',
    'dashboard.openReportingPage': 'Άνοιγμα σελίδας αναφοράς έκτακτης ανάγκης',
    'dashboard.emergencyServices': 'Υπηρεσίες Έκτακτης Ανάγκης',
    'dashboard.contactEmergencyServices': 'Επικοινωνία με υπηρεσίες έκτακτης ανάγκης',
    'dashboard.evacuationPlanning': 'Σχεδιασμός Εκκένωσης',
    'dashboard.manageEvacuationRoutes': 'Διαχείριση διαδρομών και ζωνών εκκένωσης',
    'dashboard.smsAlerts': 'Ειδοποιήσεις SMS',
    'dashboard.sendEmergencySms': 'Αποστολή ειδοποιήσεων SMS έκτακτης ανάγκης',
    'dashboard.villages': 'χωριά',
    'dashboard.village': 'χωριό',
    'dashboard.recentAlerts': 'Πρόσφατες Ειδοποιήσεις',
    'dashboard.viewAllAlerts': 'Προβολή Όλων των Ειδοποιήσεων',
    'dashboard.viewAlert': 'Προβολή Ειδοποίησης',
    'dashboard.alertLevel': 'Επίπεδο Ειδοποίησης',
    'dashboard.villageAdminPanel': 'Πίνακας Διαχείρισης Χωριού',
    'dashboard.manageVillageSettings': 'Διαχείριση ρυθμίσεων χωριού και κατοίκων',
    'dashboard.accessAdminPanel': 'Πρόσβαση στον Πίνακα Διαχείρισης',
    'dashboard.emergencyMap': 'Χάρτης Έκτακτης Ανάγκης',
    'dashboard.viewMapDesc': 'Προβολή περιστατικών έκτακτης ανάγκης και αναφορών σε διαδραστικό χάρτη',
    'dashboard.openMap': 'Άνοιγμα Χάρτη',
    'dashboard.ago': 'πριν',
    'dashboard.just': 'μόλις',
    'dashboard.now': 'τώρα',
    
    // Emergency types
    'emergencyType.fire': 'Πυρκαγιά',
    'emergencyType.smoke': 'Καπνός',
    'emergencyType.flood': 'Πλημμύρα',
    'emergencyType.accident': 'Ατύχημα',
    'emergencyType.medical': 'Ιατρική',
    'emergencyType.weather': 'Καιρός',
    'emergencyType.security': 'Ασφάλεια',
    'emergencyType.other': 'Άλλο',
    
    // Emergency Services
    'emergencyServices.title': 'Υπηρεσίες Έκτακτης Ανάγκης',
    'emergencyServices.subtitle': 'Άμεση επικοινωνία με επίσημες υπηρεσίες έκτακτης ανάγκης Κύπρου. Πατήστε για άμεση κλήση.',
    'emergencyServices.backToDashboard': 'Επιστροφή στον Πίνακα Ελέγχου',
    'emergencyServices.callNow': 'Κλήση Τώρα',
    'emergencyServices.police': 'Αστυνομία',
    'emergencyServices.policeDesc': 'Γενικές υπηρεσίες έκτακτης ανάγκης αστυνομίας',
    'emergencyServices.fire': 'Πυροσβεστική',
    'emergencyServices.fireDesc': 'Πυρκαγιές και υπηρεσίες διάσωσης',
    'emergencyServices.ambulance': 'Ασθενοφόρο',
    'emergencyServices.ambulanceDesc': 'Ιατρικές έκτακτες ανάγκες και ασθενοφόρο',
    'emergencyServices.coastGuard': 'Λιμενικό',
    'emergencyServices.coastGuardDesc': 'Θαλάσσιες έκτακτες ανάγκες και διάσωση',
    'emergencyServices.traffic': 'Τροχαία Αστυνομία',
    'emergencyServices.trafficDesc': 'Τροχαία ατυχήματα και οδικά περιστατικά',
    'emergencyServices.forestry': 'Δασική Υπηρεσία',
    'emergencyServices.forestryDesc': 'Δασικές πυρκαγιές και έκτακτες ανάγκες άγριας ζωής',
    'emergencyServices.civil': 'Πολιτική Άμυνα',
    'emergencyServices.civilDesc': 'Πολιτική προστασία και αντιμετώπιση καταστροφών',
    'emergencyServices.poison': 'Κέντρο Δηλητηριάσεων',
    'emergencyServices.poisonDesc': 'Δηλητηριάσεις και έκτακτες ανάγκες τοξικών ουσιών',
    'emergencyServices.searchRescue': 'Έρευνα & Διάσωση',
    'emergencyServices.searchRescueDesc': 'Ορεινές και αγροτικές επιχειρήσεις διάσωσης',
    'emergencyServices.emergency': 'Έκτακτη Ανάγκη',
    'emergencyServices.specialist': 'Εξειδικευμένη',
    'emergencyServices.support': 'Υποστήριξη',
    
    // SMS Alerts
    'smsAlerts.title': 'Ειδοποιήσεις SMS Έκτακτης Ανάγκης',
    'smsAlerts.subtitle': 'Αποστολή ειδοποιήσεων SMS έκτακτης ανάγκης σε κατοίκους.',
    'smsAlerts.villageAdminNote': 'Ως διαχειριστής χωριού, μπορείτε να στείλετε μόνο στους κατοίκους του χωριού σας.',
    'smsAlerts.superAdminNote': 'Ως κύριος διαχειριστής, μπορείτε να στείλετε σε όλα τα χωριά.',
    'smsAlerts.sendAlert': 'Αποστολή Ειδοποίησης SMS',
    'smsAlerts.composeSms': 'Σύνθεση SMS',
    'smsAlerts.sendEmergencySms': 'Αποστολή Ειδοποίησης SMS Έκτακτης Ανάγκης',
    'smsAlerts.alertType': 'Τύπος Ειδοποίησης',
    'smsAlerts.priority': 'Προτεραιότητα',
    'smsAlerts.message': 'Μήνυμα',
    'smsAlerts.messagePlaceholder': 'Εισάγετε το μήνυμα έκτακτης ανάγκης εδώ...',
    'smsAlerts.charactersLimit': 'χαρακτήρες',
    'smsAlerts.smsDelivery': 'Παράδοση SMS',
    'smsAlerts.productionNote': 'Σε παραγωγικό περιβάλλον, αυτό θα ενσωματωθεί με πάροχο υπηρεσιών SMS όπως το Twilio. Το μήνυμα θα σταλεί σε όλους τους εγγεγραμμένους αριθμούς τηλεφώνου κατοίκων στα χωριά προορισμού.',
    'smsAlerts.cancel': 'Ακύρωση',
    'smsAlerts.sendSmsAlert': 'Αποστολή Ειδοποίησης SMS',
    'smsAlerts.sending': 'Αποστολή...',
    'smsAlerts.instantDelivery': 'Άμεση Παράδοση',
    'smsAlerts.instantDeliveryDesc': 'SMS στάλθηκε άμεσα σε όλους τους κατοίκους',
    'smsAlerts.villageCoverage': 'Κάλυψη Χωριού',
    'smsAlerts.villageCoverageDesc': 'Φτάνει σε όλους τους εγγεγραμμένους κατοίκους',
    'smsAlerts.deliveryTracking': 'Παρακολούθηση Παράδοσης',
    'smsAlerts.deliveryTrackingDesc': 'Παρακολούθηση κατάστασης παράδοσης μηνύματος',
    'smsAlerts.history': 'Ιστορικό Ειδοποιήσεων SMS',
    'smsAlerts.noAlerts': 'Δεν έχουν σταλεί ειδοποιήσεις SMS ακόμα',
    'smsAlerts.useButton': 'Χρησιμοποιήστε το κουμπί παραπάνω για να στείλετε την πρώτη σας ειδοποίηση SMS',
    'smsAlerts.recipients': 'παραλήπτες',
    'smsAlerts.emergency': 'έκτακτη ανάγκη',
    'smsAlerts.warning': 'προειδοποίηση',
    'smsAlerts.info': 'πληροφορία',
    'smsAlerts.urgent': 'επείγον',
    'smsAlerts.normal': 'κανονικό',
    'smsAlerts.low': 'χαμηλό',
    'smsAlerts.sent': 'στάλθηκε',
    'smsAlerts.pending': 'εκκρεμεί',
    'smsAlerts.failed': 'απέτυχε',
    
    // Common
    'common.emergency': '🚨 Έκτακτη Ανάγκη',
    'common.warning': '⚠️ Προειδοποίηση',
    'common.info': 'ℹ️ Πληροφορία',
    'common.urgent': '🔴 Επείγον',
    'common.normal': '🟢 Κανονικό',
    'common.low': '⚪ Χαμηλό',
    'common.unauthorized': 'Μη Εξουσιοδοτημένος',
    'common.adminRequired': 'Χρειάζεστε δικαιώματα διαχειριστή για πρόσβαση σε αυτή τη λειτουργία.',
    'common.error': 'Σφάλμα',
    'common.success': 'Επιτυχία',
    'common.validationError': 'Σφάλμα Επικύρωσης',
    'common.pleaseEnterMessage': 'Παρακαλώ εισάγετε ένα μήνυμα για αποστολή.',
    'common.alertSent': 'Ειδοποίηση SMS Στάλθηκε',
    'common.alertSentDesc': 'Η ειδοποίηση SMS έκτακτης ανάγκης στάλθηκε επιτυχώς.',
    'common.failedToSend': 'Αποτυχία αποστολής ειδοποίησης SMS. Παρακαλώ δοκιμάστε ξανά.',
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('emergency-app-language');
    return (saved === 'el' || saved === 'en') ? saved : 'en';
  });

  useEffect(() => {
    localStorage.setItem('emergency-app-language', language);
  }, [language]);

  const t = (key: string): string => {
    return (translations[language] as Record<string, string>)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}