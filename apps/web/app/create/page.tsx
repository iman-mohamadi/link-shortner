'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Calendar, Lock, Sparkles, QrCode } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { GradientButton } from '@/components/ui/gradient-button';
import { GradientInput } from '@/components/ui/gradient-input';
import { linksApi } from '@/lib/api';

const steps = [
  { id: 1, title: 'URL', icon: Sparkles },
  { id: 2, title: 'Customize', icon: Sparkles },
  { id: 3, title: 'Options', icon: Lock },
  { id: 4, title: 'Preview', icon: QrCode },
];

export default function CreateLinkPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [createdLink, setCreatedLink] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    original_url: '',
    custom_alias: '',
    expires_at: '',
    password: '',
  });

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      const payload: any = {
        original_url: formData.original_url,
      };
      
      if (formData.custom_alias) payload.custom_alias = formData.custom_alias;
      if (formData.expires_at) payload.expires_at = formData.expires_at;
      if (formData.password) payload.password = formData.password;

      const response = await linksApi.createLink(payload);
      setCreatedLink(response);
      setCurrentStep(4);
    } catch (error: any) {
      alert(error.message || 'Failed to create link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (createdLink?.shortUrl) {
      await navigator.clipboard.writeText(createdLink.shortUrl);
    }
  };

  return (
    <main className="min-h-screen bg-[#0f0f1a]">
      <div className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <GradientButton
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="w-5 h-5" />
          </GradientButton>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Create Link</h1>
            <p className="text-white/60">Step-by-step link creation</p>
          </div>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-12"
          >
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <motion.div
                  className="flex flex-col items-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      currentStep >= step.id
                        ? 'bg-gradient-to-br from-violet-500 to-indigo-500 text-white'
                        : 'bg-white/10 text-white/40'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-6 h-6" />
                    )}
                  </div>
                  <span
                    className={`mt-2 text-sm font-medium ${
                      currentStep >= step.id ? 'text-white' : 'text-white/40'
                    }`}
                  >
                    {step.title}
                  </span>
                </motion.div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 transition-all duration-300 ${
                      currentStep > step.id ? 'bg-violet-500' : 'bg-white/10'
                    }`}
                  />
                )}
              </div>
            ))}
          </motion.div>

          <GlassCard variant="gradient">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Enter Your URL</h2>
                    <p className="text-white/60">Paste the long URL you want to shorten</p>
                  </div>

                  <GradientInput
                    type="url"
                    placeholder="https://example.com/very-long-url"
                    value={formData.original_url}
                    onChange={(e) => setFormData({ ...formData, original_url: e.target.value })}
                    label="Original URL"
                  />

                  <div className="flex justify-end">
                    <GradientButton
                      onClick={handleNext}
                      disabled={!formData.original_url}
                      size="lg"
                    >
                      Next
                      <ArrowRight className="w-5 h-5" />
                    </GradientButton>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Customize Your Link</h2>
                    <p className="text-white/60">Add a custom alias (optional)</p>
                  </div>

                  <GradientInput
                    placeholder="my-custom-link"
                    value={formData.custom_alias}
                    onChange={(e) => setFormData({ ...formData, custom_alias: e.target.value })}
                    label="Custom Alias (Pro feature)"
                  />

                  <div className="flex justify-between">
                    <GradientButton variant="outline" onClick={handleBack} size="lg">
                      <ArrowLeft className="w-5 h-5" />
                      Back
                    </GradientButton>
                    <GradientButton onClick={handleNext} size="lg">
                      Next
                      <ArrowRight className="w-5 h-5" />
                    </GradientButton>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Advanced Options</h2>
                    <p className="text-white/60">Add password or expiration (optional)</p>
                  </div>

                  <GradientInput
                    type="datetime-local"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                    label="Expiration Date"
                    icon={<Calendar className="w-5 h-5" />}
                  />

                  <GradientInput
                    type="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    label="Password Protection"
                    icon={<Lock className="w-5 h-5" />}
                  />

                  <div className="flex justify-between">
                    <GradientButton variant="outline" onClick={handleBack} size="lg">
                      <ArrowLeft className="w-5 h-5" />
                      Back
                    </GradientButton>
                    <GradientButton onClick={handleCreate} isLoading={loading} size="lg">
                      Create Link
                      <Sparkles className="w-5 h-5" />
                    </GradientButton>
                  </div>
                </motion.div>
              )}

              {currentStep === 4 && createdLink && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.2 }}
                      className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4"
                    >
                      <Check className="w-10 h-10 text-white" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-white mb-2">Link Created!</h2>
                    <p className="text-white/60">Your short link is ready to share</p>
                  </div>

                  <GlassCard variant="dark" className="p-6">
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold text-white mb-2">
                        {createdLink.shortUrl}
                      </div>
                      <GradientButton onClick={handleCopy} size="md">
                        Copy Link
                      </GradientButton>
                    </div>

                    {createdLink.qrCode && (
                      <div className="mt-6 flex justify-center">
                        <img
                          src={`data:image/png;base64,${createdLink.qrCode}`}
                          alt="QR Code"
                          className="w-48 h-48 rounded-lg"
                        />
                      </div>
                    )}
                  </GlassCard>

                  <div className="flex justify-between">
                    <GradientButton
                      variant="outline"
                      onClick={() => router.push('/dashboard')}
                      size="lg"
                    >
                      Go to Dashboard
                    </GradientButton>
                    <GradientButton
                      onClick={() => {
                        setFormData({
                          original_url: '',
                          custom_alias: '',
                          expires_at: '',
                          password: '',
                        });
                        setCreatedLink(null);
                        setCurrentStep(1);
                      }}
                      size="lg"
                    >
                      Create Another
                      <Sparkles className="w-5 h-5" />
                    </GradientButton>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </div>
      </div>
    </main>
  );
}
