import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Finding, Brand, Scan, FindingStatus } from '../types';
import { INITIAL_BRANDS, INITIAL_FINDINGS, INITIAL_SCANS } from '../data/mockData';
import { api } from '../services/apiService';

interface AegisContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  isAuthenticated: boolean;
  currentUser: { name: string; email: string } | null;
  setCurrentUser: (user: { name: string; email: string } | null) => void;
  logout: () => void;
  brands: Brand[];
  findings: Finding[];
  scans: Scan[];
  selectedFinding: Finding | null;
  setSelectedFinding: (f: Finding | null) => void;
  isScanWizardOpen: boolean;
  setIsScanWizardOpen: (open: boolean) => void;
  runNewScan: (brandId: string, targets: string[], scanType: string) => Promise<void>;
  updateFindingStatus: (id: string, status: FindingStatus, comment?: string) => Promise<void>;
  addFindingNote: (id: string, note: string) => Promise<void>;
  refreshData: () => Promise<void>;
  addBrand: (brand: Partial<Brand>) => Promise<void>;
  deleteBrand: (id: string) => Promise<void>;
  updateBrand: (id: string, updates: Partial<Brand>) => Promise<void>;
  retryScan: (scanId: string) => Promise<void>;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const AegisContext = createContext<AegisContextType | undefined>(undefined);

export const AegisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(() => {
    const saved = localStorage.getItem('aegis-current-user');
    return saved ? JSON.parse(saved) : null;
  });

  const isAuthenticated = Boolean(currentUser);

  const handleSetCurrentUser = (user: { name: string; email: string } | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('aegis-current-user', JSON.stringify(user));
      localStorage.setItem('aegis-authenticated', 'true');
    } else {
      localStorage.removeItem('aegis-current-user');
      localStorage.removeItem('aegis-authenticated');
      localStorage.removeItem('aegis-auth-token');
    }
  };

  const logout = () => {
    api.auth.logout().catch(() => {});
    handleSetCurrentUser(null);
  };

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('aegis-theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  const [brands, setBrands] = useState<Brand[]>(() => {
    const saved = localStorage.getItem('aegis-brands');
    return saved ? JSON.parse(saved) : INITIAL_BRANDS;
  });

  const [findings, setFindings] = useState<Finding[]>(() => {
    const saved = localStorage.getItem('aegis-findings');
    return saved ? JSON.parse(saved) : INITIAL_FINDINGS;
  });

  const [scans, setScans] = useState<Scan[]>(() => {
    const saved = localStorage.getItem('aegis-scans');
    return saved ? JSON.parse(saved) : INITIAL_SCANS;
  });

  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [isScanWizardOpen, setIsScanWizardOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Reusable function to synchronize with real FastAPI backend
  const refreshData = useCallback(async () => {
    try {
      const [bRes, fRes, sRes] = await Promise.all([
        api.brands.getAll(),
        api.findings.getAll(),
        api.scans.getAll()
      ]);
      if (bRes.data && Array.isArray(bRes.data) && bRes.data.length > 0) {
        setBrands(bRes.data);
      }
      if (fRes.data && Array.isArray(fRes.data) && fRes.data.length > 0) {
        setFindings(fRes.data);
      }
      if (sRes.data && Array.isArray(sRes.data) && sRes.data.length > 0) {
        setScans(sRes.data);
      }
    } catch (err) {
      console.warn('Backend sync warning:', err);
    }
  }, []);

  // Automatic Backend Synchronization on initial mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    localStorage.setItem('aegis-theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('aegis-brands', JSON.stringify(brands));
  }, [brands]);

  useEffect(() => {
    localStorage.setItem('aegis-findings', JSON.stringify(findings));
  }, [findings]);

  useEffect(() => {
    localStorage.setItem('aegis-scans', JSON.stringify(scans));
  }, [scans]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const updateFindingStatus = async (id: string, status: FindingStatus, comment?: string) => {
    try {
      const res = await api.findings.updateStatus(id, status, comment);
      if (res.data) {
        const updated = res.data;
        setFindings(prev => prev.map(f => (f.id === id ? updated : f)));
        if (selectedFinding && selectedFinding.id === id) {
          setSelectedFinding(updated);
        }
        return;
      }
    } catch (err) {
      console.warn('Failed to update status on backend:', err);
    }

    // Optimistic fallback
    setFindings(prev =>
      prev.map(f => (f.id === id ? { ...f, status } : f))
    );
    if (selectedFinding && selectedFinding.id === id) {
      setSelectedFinding(prev => (prev ? { ...prev, status } : null));
    }
  };

  const addFindingNote = async (id: string, note: string) => {
    try {
      const res = await api.findings.addNote(id, note);
      if (res.data) {
        const updated = res.data;
        setFindings(prev => prev.map(f => (f.id === id ? updated : f)));
        if (selectedFinding && selectedFinding.id === id) {
          setSelectedFinding(updated);
        }
        return;
      }
    } catch (err) {
      console.warn('Failed to add note on backend:', err);
    }

    const noteEntry = `[${new Date().toLocaleTimeString()}] ${note}`;
    setFindings(prev =>
      prev.map(f => {
        if (f.id === id) {
          const notes = f.notes || [];
          return { ...f, notes: [...notes, noteEntry] };
        }
        return f;
      })
    );
    if (selectedFinding && selectedFinding.id === id) {
      setSelectedFinding(prev => {
        if (!prev) return null;
        const notes = prev.notes || [];
        return { ...prev, notes: [...notes, noteEntry] };
      });
    }
  };

  const addBrand = async (newB: Partial<Brand>) => {
    try {
      const res = await api.brands.create(newB);
      if (res.data) {
        setBrands(prev => [res.data!, ...prev]);
        return;
      }
    } catch (err) {
      console.warn('Failed to create brand on backend:', err);
    }

    const brand: Brand = {
      id: `brand-${Date.now()}`,
      name: newB.name || 'New Monitored Brand',
      domain: newB.domain || 'example.com',
      logo: (newB.name || 'B').charAt(0).toUpperCase(),
      status: 'active',
      monitoredAssets: 12,
      riskScore: 35,
      lastScanTime: 'Just now',
      activeFindingsCount: 1,
      description: newB.description || 'Newly monitored organizational brand asset.',
      socialHandles: newB.socialHandles || [],
      protectedKeywords: newB.protectedKeywords || [newB.name?.toLowerCase() || 'asset']
    };
    setBrands(prev => [brand, ...prev]);
  };

  const deleteBrand = async (id: string) => {
    try {
      await api.brands.delete(id);
    } catch (err) {
      console.warn('Failed to delete brand on backend:', err);
    }
    setBrands(prev => prev.filter(b => b.id !== id));
  };

  const updateBrand = async (id: string, updates: Partial<Brand>) => {
    try {
      const res = await api.brands.update(id, updates);
      if (res.data) {
        setBrands(prev => prev.map(b => (b.id === id ? res.data! : b)));
        return;
      }
    } catch (err) {
      console.warn('Failed to update brand on backend:', err);
    }
    setBrands(prev => prev.map(b => (b.id === id ? { ...b, ...updates } : b)));
  };

  const runNewScan = async (brandId: string, targets: string[], scanType: string) => {
    const brand = brands.find(b => b.id === brandId) || brands[0];
    const brandName = brand ? brand.name : 'Acme Finance Group';

    const res = await api.scans.run(brandId, targets, scanType);
    const scanId = res.data?.id || `scan-${Date.now()}`;

    const newScan: Scan = {
      id: scanId,
      brandName,
      brandId: brand ? brand.id : brandId,
      status: 'running',
      progress: 25,
      findingsCount: 0,
      highPriorityCount: 0,
      timeAgo: 'Just now',
      timestamp: Date.now(),
      targetCount: (targets.length || 2) * 20,
      scanType: (scanType as any) || 'comprehensive'
    };

    setScans(prev => [newScan, ...prev.filter(s => s.id !== scanId)]);

    // Poll real backend scan status
    if (res.data?.id) {
      let attempts = 0;
      const maxAttempts = 30;
      const pollInterval = setInterval(async () => {
        attempts++;
        try {
          const statusRes = await api.scans.getStatus(scanId);
          if (statusRes.data) {
            const s = statusRes.data;
            const isDone = s.is_terminal || s.status === 'completed' || s.status === 'partially_completed' || s.status === 'failed';

            setScans(prev =>
              prev.map(item => {
                if (item.id === scanId) {
                  return {
                    ...item,
                    status: s.status === 'failed' ? 'failed' : (s.status === 'completed' ? 'completed' : 'running'),
                    progress: isDone ? 100 : Math.min(25 + attempts * 15, 90),
                    findingsCount: s.total_findings_flagged || item.findingsCount,
                    highPriorityCount: Math.round((s.total_findings_flagged || 0) * 0.4),
                    errorMessage: s.failure_details || undefined
                  };
                }
                return item;
              })
            );

            if (isDone || attempts >= maxAttempts) {
              clearInterval(pollInterval);
              await refreshData();
            }
          } else if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
          }
        } catch {
          if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
          }
        }
      }, 1200);
    }
  };

  const retryScan = async (scanId: string) => {
    setScans(prev =>
      prev.map(s =>
        s.id === scanId
          ? { ...s, status: 'running', progress: 20, errorMessage: undefined, timeAgo: 'Retrying...' }
          : s
      )
    );

    const res = await api.scans.retry(scanId);
    if (res.data?.id) {
      const newScanId = res.data.id;
      let attempts = 0;
      const pollInterval = setInterval(async () => {
        attempts++;
        try {
          const statusRes = await api.scans.getStatus(newScanId);
          if (statusRes.data) {
            const s = statusRes.data;
            const isDone = s.is_terminal || s.status === 'completed' || s.status === 'partially_completed' || s.status === 'failed';

            setScans(prev =>
              prev.map(item => {
                if (item.id === scanId || item.id === newScanId) {
                  return {
                    ...item,
                    status: s.status === 'failed' ? 'failed' : (s.status === 'completed' ? 'completed' : 'running'),
                    progress: isDone ? 100 : Math.min(20 + attempts * 20, 90),
                    findingsCount: s.total_findings_flagged || item.findingsCount,
                    errorMessage: s.failure_details || undefined
                  };
                }
                return item;
              })
            );

            if (isDone || attempts >= 25) {
              clearInterval(pollInterval);
              await refreshData();
            }
          }
        } catch {
          if (attempts >= 25) clearInterval(pollInterval);
        }
      }, 1200);
    }
  };

  return (
    <AegisContext.Provider
      value={{
        theme,
        toggleTheme,
        isAuthenticated,
        currentUser,
        setCurrentUser: handleSetCurrentUser,
        logout,
        brands,
        findings,
        scans,
        selectedFinding,
        setSelectedFinding,
        isScanWizardOpen,
        setIsScanWizardOpen,
        runNewScan,
        updateFindingStatus,
        addFindingNote,
        refreshData,
        addBrand,
        deleteBrand,
        updateBrand,
        retryScan,
        searchQuery,
        setSearchQuery
      }}
    >
      {children}
    </AegisContext.Provider>
  );
};

export const useAegis = () => {
  const context = useContext(AegisContext);
  if (!context) {
    throw new Error('useAegis must be used within an AegisProvider');
  }
  return context;
};
