export const sendSMS = async (phone, code) => {
    // In a real scenario, you'd call your provider's API here.
    // For now, we simulate the "Premium" feel by logging it clearly.
    console.log('---------------------------');
    console.log(`💬 SMS SENT TO: ${phone}`);
    console.log(`🔑 YOUR CODE IS: ${code}`);
    console.log('---------------------------');
    return true;
};
//# sourceMappingURL=sms.service.js.map