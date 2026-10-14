import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
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

export const isDemoUser = (user: { email?: string } | null | undefined): boolean => {
  if (!user || !user.email) return false;
  const email = user.email.toLowerCase().trim();
  return email === 'alex@aegis.security';
};

const readStoredScans = (...keys: string[]): Scan[] | null => {
  for (const key of keys) {
    const saved = localStorage.getItem(key);
    if (!saved) continue;
    try {
      const parsed: unknown = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // Older frontend releases created timestamp-only local placeholders when the API rejected a scan.
        // Drop those orphaned entries so they cannot remain "running" after an upgrade.
        return (parsed as Scan[]).filter(scan =>
          !(scan.status === 'running' && /^scan-\d{13}$/.test(scan.id))
        );
      }
    } catch {
      // Ignore malformed local scan cache and try the next key.
    }
  }
  return null;
};

export const AegisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(() => {
    const saved = localStorage.getItem('aegis-current-user');
    return saved ? JSON.parse(saved) : null;
  });

  const isAuthenticated = Boolean(currentUser);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('aegis-theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  const [brands, setBrands] = useState<Brand[]>(() => {
    const userSaved = localStorage.getItem('aegis-current-user');
    const user = userSaved ? JSON.parse(userSaved) : null;
    if (user && isDemoUser(user)) {
      const saved = localStorage.getItem('aegis-brands-demo');
      return saved ? JSON.parse(saved) : INITIAL_BRANDS;
    }
    if (user && !isDemoUser(user)) {
      const saved = localStorage.getItem(`aegis-brands-${user.email.toLowerCase().trim()}`);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const brandsRef = useRef(brands);

  useEffect(() => {
    brandsRef.current = brands;
  }, [brands]);

  const [findings, setFindings] = useState<Finding[]>(() => {
    const userSaved = localStorage.getItem('aegis-current-user');
    const user = userSaved ? JSON.parse(userSaved) : null;
    if (user && isDemoUser(user)) {
      const saved = localStorage.getItem('aegis-findings-demo');
      return saved ? JSON.parse(saved) : INITIAL_FINDINGS;
    }
    if (user && !isDemoUser(user)) {
      const saved = localStorage.getItem(`aegis-findings-${user.email.toLowerCase().trim()}`);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [scans, setScans] = useState<Scan[]>(() => {
    const userSaved = localStorage.getItem('aegis-current-user');
    const user = userSaved ? JSON.parse(userSaved) : null;
    if (user && isDemoUser(user)) {
      return readStoredScans('aegis-scans-demo') ?? INITIAL_SCANS;
    }
    if (user && !isDemoUser(user)) {
      return readStoredScans(`aegis-scans-${user.email.toLowerCase().trim()}`) ?? [];
    }
    return [];
  });

  const handleSetCurrentUser = (user: { name: string; email: string } | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('aegis-current-user', JSON.stringify(user));
      localStorage.setItem('aegis-authenticated', 'true');
      localStorage.removeItem('aegis-brands');
      localStorage.removeItem('aegis-findings');
      localStorage.removeItem('aegis-scans');
      if (isDemoUser(user)) {
        const savedBrands = localStorage.getItem('aegis-brands-demo');
        const savedFindings = localStorage.getItem('aegis-findings-demo');
        const savedScans = readStoredScans('aegis-scans-demo');
        setBrands(savedBrands ? JSON.parse(savedBrands) : INITIAL_BRANDS);
        setFindings(savedFindings ? JSON.parse(savedFindings) : INITIAL_FINDINGS);
        setScans(savedScans ?? INITIAL_SCANS);
      } else {
        // New user profile: no mock data present!
        const userKey = user.email.toLowerCase().trim();
        const savedBrands = localStorage.getItem(`aegis-brands-${userKey}`);
        const savedFindings = localStorage.getItem(`aegis-findings-${userKey}`);
        const savedScans = readStoredScans(`aegis-scans-${userKey}`);
        setBrands(savedBrands ? JSON.parse(savedBrands) : []);
        setFindings(savedFindings ? JSON.parse(savedFindings) : []);
        setScans(savedScans ?? []);
      }
    } else {
      localStorage.removeItem('aegis-current-user');
      localStorage.removeItem('aegis-authenticated');
      localStorage.removeItem('aegis-auth-token');
      setBrands([]);
      setFindings([]);
      setScans([]);
    }
  };

  const logout = () => {
    api.auth.logout().catch(() => {});
    handleSetCurrentUser(null);
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('aegis-current-user');
    if (!savedUser) return;
    if (!localStorage.getItem('aegis-auth-token')) {
      handleSetCurrentUser(null);
      return;
    }
    api.auth.getCurrentUser().then(result => {
      if (result.data) handleSetCurrentUser(result.data);
      else handleSetCurrentUser(null);
    });
  }, []);

  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [isScanWizardOpen, setIsScanWizardOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Reusable function to synchronize with real FastAPI backend
  const refreshData = useCallback(async () => {
    if (!currentUser) return;
    const isPersonalUser = !isDemoUser(currentUser);
    try {
      const bRes = await api.brands.getAll();
      const brandMap: Record<string, any> = {};
      if (bRes.data && Array.isArray(bRes.data)) {
        // The backend returns only records owned by the authenticated account.
        const visibleBrands = bRes.data;
        if (isPersonalUser) setBrands(bRes.data);
        else if (bRes.data.length > 0) setBrands(prev => [...bRes.data!, ...prev.filter(local => !bRes.data!.some(remote => remote.id === local.id))]);
        visibleBrands.forEach((b: any) => {
          brandMap[b.id] = {
            id: b.id,
            name: b.name,
            primary_website: b.domain,
            is_active: b.status === 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        });
      }

      const [fRes, sRes] = await Promise.all([
        api.findings.getAll(brandMap),
        api.scans.getAll(brandMap)
      ]);
      if (fRes.data && Array.isArray(fRes.data)) {
        if (isPersonalUser) setFindings(fRes.data);
        else if (fRes.data.length > 0) setFindings(prev => [...fRes.data!, ...prev.filter(local => !fRes.data!.some(remote => remote.id === local.id))]);
      }
      if (sRes.data && Array.isArray(sRes.data)) {
        if (isPersonalUser) setScans(sRes.data);
        else if (sRes.data.length > 0) setScans(prev => [...sRes.data!, ...prev.filter(local => !sRes.data!.some(remote => remote.id === local.id))]);
      }
    } catch (err) {
      console.warn('Backend sync warning:', err);
    }
  }, [currentUser]);

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
    if (!currentUser) return;
    if (isDemoUser(currentUser)) {
      localStorage.setItem('aegis-brands-demo', JSON.stringify(brands));
    } else {
      localStorage.setItem(`aegis-brands-${currentUser.email.toLowerCase().trim()}`, JSON.stringify(brands));
    }
  }, [brands, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    if (isDemoUser(currentUser)) {
      localStorage.setItem('aegis-findings-demo', JSON.stringify(findings));
    } else {
      localStorage.setItem(`aegis-findings-${currentUser.email.toLowerCase().trim()}`, JSON.stringify(findings));
    }
  }, [findings, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    if (isDemoUser(currentUser)) {
      localStorage.setItem('aegis-scans-demo', JSON.stringify(scans));
    } else {
      localStorage.setItem(`aegis-scans-${currentUser.email.toLowerCase().trim()}`, JSON.stringify(scans));
    }
  }, [scans, currentUser]);

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
    const res = await api.brands.create(newB);
    if (res.error || !res.data) {
      throw new Error(res.error?.message || 'The backend did not save this brand. Check the backend service and try again.');
    }
    setBrands(prev => [res.data!, ...prev.filter(brand => brand.id !== res.data!.id)]);
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
    const brand = brands.find(b => b.id === brandId);
    if (!brand) {
      throw new Error('The selected brand is not available. Refresh your brand list and try again.');
    }

    const res = await api.scans.run(brandId, targets, scanType);
    if (res.error || !res.data?.id) {
      throw new Error(res.error?.message || 'The backend did not create a scan. Check the backend service and try again.');
    }

    const scanId = res.data.id;

    const newScan: Scan = {
      id: scanId,
      brandName: brand.name,
      brandId: brand.id,
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
    {
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
                    status: s.status === 'failed'
                      ? 'failed'
                      : (s.status === 'partially_completed' ? 'partially_completed' : (s.status === 'completed' ? 'completed' : 'running')),
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
            setScans(prev => prev.map(item => item.id === scanId
              ? { ...item, status: 'failed', errorMessage: statusRes.error?.message || 'Could not retrieve scan status from the backend.' }
              : item));
            clearInterval(pollInterval);
            await refreshData();
          }
        } catch {
          if (attempts >= maxAttempts) {
            setScans(prev => prev.map(item => item.id === scanId
              ? { ...item, status: 'failed', errorMessage: 'Could not retrieve scan status from the backend.' }
              : item));
            clearInterval(pollInterval);
            await refreshData();
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
