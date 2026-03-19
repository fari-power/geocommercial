/**
 * Service d'envoi de SMS (Mockmé pour le développement)
 * Pour passer en production, remplacez la logique par un appel API vers
 * un fournisseur comme Twilio, Infobip, ou un fournisseur local Marocain.
 */
export const sendSms = async (phone: string, message: string) => {
    console.log(`-----------------------------------------`);
    console.log(`📱 ENVOI SMS À : ${phone}`);
    console.log(`💬 MESSAGE : ${message}`);
    console.log(`-----------------------------------------`);

    // Simuler un délai réseau
    return new Promise((resolve) => setTimeout(resolve, 1000));
};
