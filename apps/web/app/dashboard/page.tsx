'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Plus, MoreVertical, Copy, Trash2, BarChart2, LogOut, Search } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { GradientButton } from '@/components/ui/gradient-button';
import { GradientInput } from '@/components/ui/gradient-input';
import { linksApi, authApi, Link } from '@/lib/api';
import { format } from 'date-fns';

export default function DashboardPage() {
  const router = useRouter();
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const data = await linksApi.getMyLinks();
      setLinks(data);
    } catch (error) {
      console.error('Failed to fetch links:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (shortUrl: string, id: string) => {
    await navigator.clipboard.writeText(shortUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return;
    
    try {
      await linksApi.deleteLink(id);
      setLinks(links.filter(link => link.id !== id));
    } catch (error) {
      console.error('Failed to delete link:', error);
    }
  };

  const handleLogout = () => {
    authApi.logout();
    router.push('/');
  };

  const filteredLinks = links.filter(link =>
    link.originalUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
    link.shortCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#0f0f1a]">
      <div className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-white/60">Manage your links and track performance</p>
          </div>
          
          <div className="flex gap-3">
            <GradientButton onClick={() => router.push('/create')} size="md">
              <Plus className="w-5 h-5" />
              Create Link
            </GradientButton>
            <GradientButton
              onClick={handleLogout}
              variant="outline"
              size="md"
            >
              <LogOut className="w-5 h-5" />
            </GradientButton>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <GradientInput
            placeholder="Search links..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-5 h-5" />}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard variant="dark" className="overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-white/60">Loading...</div>
              </div>
            ) : filteredLinks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <Plus className="w-8 h-8 text-white/40" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No links yet</h3>
                <p className="text-white/60 mb-6">Create your first short link to get started</p>
                <GradientButton onClick={() => router.push('/create')}>
                  <Plus className="w-5 h-5" />
                  Create Link
                </GradientButton>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-4 px-6 text-white/60 font-medium">Short Link</th>
                      <th className="text-left py-4 px-6 text-white/60 font-medium">Original URL</th>
                      <th className="text-left py-4 px-6 text-white/60 font-medium">Clicks</th>
                      <th className="text-left py-4 px-6 text-white/60 font-medium">Created</th>
                      <th className="text-right py-4 px-6 text-white/60 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filteredLinks.map((link, index) => (
                        <motion.tr
                          key={link.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-medium">
                                {link.shortCode}
                              </span>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleCopy(`http://localhost:5000/${link.shortCode}`, link.id)}
                                className="text-white/40 hover:text-white transition-colors"
                              >
                                {copiedId === link.id ? (
                                  <Copy className="w-4 h-4 text-green-400" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </motion.button>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="max-w-xs truncate text-white/60">
                              {link.originalUrl}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-semibold">
                                {link._count?.analytics || 0}
                              </span>
                              <GradientButton
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/analytics/${link.id}`)}
                              >
                                <BarChart2 className="w-4 h-4" />
                              </GradientButton>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-white/60">
                            {format(new Date(link.createdAt), 'MMM d, yyyy')}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex justify-end gap-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDelete(link.id)}
                                className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </main>
  );
}
