import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Finding, Brand, Scan, FindingStatus } from '../types';
import { INITIAL_BRANDS, INITIAL_FINDINGS, INITIAL_SCANS } from '../data/mockData';
import {
  apiClient,
  BackendDashboardStatsResponse,
  BackendBrandResponse,
} from '../api/client';
import {
  backendBrandToFrontend,
  backendFindingToFrontend,
  backendScanToFrontend,
} from '../api/adapters';

interface AegisContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  brands: Brand[];
  findings: Finding[];
  scans: Scan[];
  selectedFinding: Finding | null;
  setSelectedFinding: (f: Finding | null) => void;
  isScanWizardOpen: boolean;
  setIsScanWizardOpen: (open: boolean) => void;
  runNewScan: (brandId: string, targets: string[], scanType: string) => Promise<void>;
  updateFindingStatus: (id: string, status: FindingStatus, comment?: string) => Promise<void>;
  addBrand: (brand: Partial<Brand>) => Promise<void>;
  retryScan: (scanId: string) => Promise<void>;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  // Live Backend Telemetry & Actions
  dashboardStats: BackendDashboardStatsResponse | null;
  backendStatus: 'connected' | 'connecting' | 'disconnected';
  isLoading: boolean;
  refreshData: () => Promise<void>;
  explainFinding: (id: string, forceRefresh?: boolean) => Promise<any>;
  seedDemoData: () => Promise<void>;
  resetDatabase: () => Promise<void>;
}

const AegisContext = createContext<AegisContextType | undefined>(undefined);

export const AegisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  const [dashboardStats, setDashboardStats] = useState<BackendDashboardStatsResponse | null>(null);
  const [backendStatus, setBackendStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [isScanWizardOpen, setIsScanWizardOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Synchronize Theme
  useEffect(() => {
    localStorage.setItem('aegis-theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  // Persist fallback cache
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
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  /**
   * Fetch full state from FastAPI backend
   */
  const refreshData = useCallback(async () => {
    try {
      // 1. Health check
      await apiClient.getHealth();
      setBackendStatus('connected');

      // 2. Fetch brands
      const rawBrands = await apiClient.getBrands(false);
      const brandMap: Record<string, BackendBrandResponse> = {};
      rawBrands.forEach((b) => {
        brandMap[b.id] = b;
      });

      // If database is completely empty on fresh install, auto-seed Acme demo
      if (rawBrands.length === 0) {
        try {
          await apiClient.seedDemoData();
          const seededBrands = await apiClient.getBrands(false);
          seededBrands.forEach((b) => {
            brandMap[b.id] = b;
          });
        } catch (seedErr) {
          console.warn('Initial seed skipped:', seedErr);
        }
      }

      const activeBrands = rawBrands.length > 0 ? rawBrands : Object.values(brandMap);
      if (activeBrands.length > 0) {
        const mappedBrands = activeBrands.map(backendBrandToFrontend);
        setBrands(mappedBrands);
      }

      // 3. Fetch findings
      const findingsRes = await apiClient.getFindings({ page: 1, page_size: 100 });
      if (findingsRes && findingsRes.items && findingsRes.items.length > 0) {
        const mappedFindings = findingsRes.items.map((f) =>
          backendFindingToFrontend(f, brandMap)
        );
        setFindings(mappedFindings);
      }

      // 4. Fetch scans
      const scansRes = await apiClient.getScans(50);
      if (scansRes && scansRes.length > 0) {
        const mappedScans = scansRes.map((s) => backendScanToFrontend(s, brandMap));
        setScans(mappedScans);
      }

      // 5. Fetch dashboard stats
      const stats = await apiClient.getDashboardStats();
      setDashboardStats(stats);
    } catch (err) {
      console.warn('Backend connection unavailable, using local cache/fixtures:', err);
      setBackendStatus('disconnected');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Run on mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  /**
   * Update Finding Status through Analyst Review Endpoint
   */
  const updateFindingStatus = async (
    id: string,
    status: FindingStatus,
    comment?: string
  ) => {
    // 1. Optimistic UI update
    setFindings((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status } : f))
    );
    if (selectedFinding && selectedFinding.id === id) {
      setSelectedFinding((prev) => (prev ? { ...prev, status } : null));
    }

    // 2. Persist to backend if online
    try {
      const backendStatusMap: Record<FindingStatus, string> = {
        new: 'new',
        under_review: 'under_review',
        resolved: 'resolved',
        escalated: 'confirmed_threat',
      };

      await apiClient.reviewFinding(id, {
        new_status: backendStatusMap[status] || status,
        reviewer: 'Alex Carter',
        comment: comment || `Status updated to ${status} via analyst triage drawer.`,
      });
      // Refresh to pull updated review timestamps
      const updated = await apiClient.getFinding(id);
      if (updated) {
        const mapped = backendFindingToFrontend(updated);
        setFindings((prev) => prev.map((f) => (f.id === id ? mapped : f)));
        if (selectedFinding?.id === id) {
          setSelectedFinding(mapped);
        }
      }
    } catch (err) {
      console.warn('Backend review persistence fallback to local:', err);
    }
  };

  /**
   * Register a new Brand
   */
  const addBrand = async (newB: Partial<Brand>) => {
    const brandName = newB.name || 'New Monitored Brand';
    const brandDomain = (newB.domain || 'example.com').replace(/^https?:\/\//, '');

    // 1. Attempt to persist to backend
    try {
      const created = await apiClient.createBrand({
        name: brandName,
        description: newB.description || 'Newly registered organization under active surveillance.',
        industry: 'Technology & Financial Infrastructure',
        primary_website: `https://${brandDomain}`,
        is_active: true,
      });

      // Add asset for primary domain
      await apiClient.createBrandAsset(created.id, {
        asset_type: 'official_domain',
        platform: 'web',
        display_value: brandDomain,
        url: `https://${brandDomain}`,
        verification_status: 'verified',
      });

      await refreshData();
      return;
    } catch (err) {
      console.warn('Backend createBrand failed, falling back to local state:', err);
    }

    // Fallback local
    const brand: Brand = {
      id: `brand-${Date.now()}`,
      name: brandName,
      domain: brandDomain,
      logo: brandName.charAt(0).toUpperCase(),
      status: 'active',
      monitoredAssets: 8,
      riskScore: 25,
      lastScanTime: 'Just now',
      activeFindingsCount: 0,
      description: newB.description || 'Newly registered organization under active surveillance.',
      socialHandles: newB.socialHandles || [],
      protectedKeywords: newB.protectedKeywords || [brandName.toLowerCase()],
    };
    setBrands((prev) => [brand, ...prev]);
  };

  /**
   * Run a New Scan
   */
  const runNewScan = async (brandId: string, targets: string[], scanType: string) => {
    const targetBrand = brands.find((b) => b.id === brandId) || brands[0];
    const brandIdToUse = targetBrand?.id || 'brand-acme';

    const reqSourceTypes: string[] = [];
    if (targets.includes('social')) reqSourceTypes.push('social');
    if (targets.includes('mobile')) reqSourceTypes.push('app_store');
    if (reqSourceTypes.length === 0) reqSourceTypes.push('social', 'app_store');

    // 1. Optimistic running scan in UI
    const tempScanId = `scan-${Date.now()}`;
    const optimisticScan: Scan = {
      id: tempScanId,
      brandName: targetBrand.name,
      brandId: targetBrand.id,
      status: 'running',
      progress: 25,
      findingsCount: 0,
      highPriorityCount: 0,
      timeAgo: 'Just now',
      timestamp: Date.now(),
      targetCount: targets.length * 12 + 18,
      scanType: (scanType as any) || 'comprehensive',
    };
    setScans((prev) => [optimisticScan, ...prev]);

    // 2. Call backend trigger scan
    try {
      const scanRes = await apiClient.triggerScan({
        brand_id: brandIdToUse,
        requested_source_types: reqSourceTypes,
      });

      if (scanRes) {
        // Scan completed synchronously on backend!
        await refreshData();
        return;
      }
    } catch (err) {
      console.warn('Backend scan failed, running local simulator:', err);
    }

    // 3. Simulator fallback if backend offline
    setTimeout(() => {
      setScans((prev) =>
        prev.map((s) => (s.id === tempScanId ? { ...s, progress: 65, findingsCount: 3 } : s))
      );
    }, 1200);

    setTimeout(() => {
      const simulatedFinding: Finding = {
        id: `find-${Date.now()}`,
        type: targets.includes('social') ? 'social' : 'domain',
        title: targets.includes('social')
          ? `@${targetBrand.name.toLowerCase().replace(/[^a-z0-9]/g, '')}_rewards_official`
          : `${targetBrand.name.toLowerCase().replace(/[^a-z0-9]/g, '')}-verify-login.online`,
        targetUrl: targets.includes('social')
          ? `https://instagram.com/${targetBrand.name.toLowerCase().replace(/[^a-z0-9]/g, '')}_rewards_official`
          : `https://${targetBrand.name.toLowerCase().replace(/[^a-z0-9]/g, '')}-verify-login.online`,
        associatedBrand: targetBrand.name,
        brandId: targetBrand.id,
        risk: 'high',
        similarity: 92,
        status: 'new',
        detectedTime: 'Just now',
        detectedTimestamp: Date.now(),
        platform: targets.includes('social') ? 'instagram' : 'web',
        dnsHost: 'gateway-protection.threat-shield.net',
        ipAddress: '104.21.72.19',
        registrar: 'Dynadot LLC',
        asn: 'AS13335 Cloudflare',
        assignedAnalyst: 'Alex Carter',
        notes: [
          `Autonomous discovery from ${scanType} probe.`,
          'Typosquatting permutation detected with high keyword overlap.',
        ],
      };

      setFindings((prev) => [simulatedFinding, ...prev]);
      setScans((prev) =>
        prev.map((s) =>
          s.id === tempScanId
            ? {
                ...s,
                status: 'completed',
                progress: 100,
                findingsCount: 5,
                highPriorityCount: 2,
              }
            : s
        )
      );
    }, 2800);
  };

  /**
   * Retry a scan
   */
  const retryScan = async (scanId: string) => {
    setScans((prev) =>
      prev.map((s) =>
        s.id === scanId
          ? { ...s, status: 'running', progress: 30, errorMessage: undefined, timeAgo: 'Retrying...' }
          : s
      )
    );

    const scan = scans.find((s) => s.id === scanId);
    if (scan && scan.brandId) {
      try {
        await apiClient.triggerScan({
          brand_id: scan.brandId,
          requested_source_types: ['social', 'app_store'],
        });
        await refreshData();
        return;
      } catch (err) {
        console.warn('Backend retry failed, falling back:', err);
      }
    }

    setTimeout(() => {
      setScans((prev) =>
        prev.map((s) =>
          s.id === scanId
            ? { ...s, status: 'completed', progress: 100, findingsCount: 6, timeAgo: 'Just now' }
            : s
        )
      );
    }, 1800);
  };

  /**
   * Apinex DeepSeek AI Explanation
   */
  const explainFinding = async (id: string, forceRefresh = false) => {
    try {
      const res = await apiClient.explainFinding(id, forceRefresh);
      if (res && res.ai_explanation) {
        // Update local finding
        setFindings((prev) =>
          prev.map((f) => {
            if (f.id === id) {
              return {
                ...f,
                notes: [
                  ...(f.notes || []),
                  `[Apinex AI (${res.model})]: ${
                    res.ai_explanation.summary || 'Threat analysis complete.'
                  }`,
                ],
                raw: f.raw
                  ? {
                      ...f.raw,
                      ai_explanation: res.ai_explanation,
                      ai_explanation_model: res.model,
                      ai_explanation_status: res.provider_status,
                    }
                  : undefined,
              };
            }
            return f;
          })
        );
      }
      return res;
    } catch (err) {
      console.warn('explainFinding error:', err);
      throw err;
    }
  };

  /**
   * Seed demo data (Acme Finance Group & baseline scan)
   */
  const seedDemoData = async () => {
    try {
      await apiClient.seedDemoData();
      await refreshData();
    } catch (err) {
      console.error('Seed demo data error:', err);
      throw err;
    }
  };

  /**
   * Reset database
   */
  const resetDatabase = async () => {
    try {
      await apiClient.resetDemoData();
      await refreshData();
    } catch (err) {
      console.error('Reset database error:', err);
      throw err;
    }
  };

  return (
    <AegisContext.Provider
      value={{
        theme,
        toggleTheme,
        brands,
        findings,
        scans,
        selectedFinding,
        setSelectedFinding,
        isScanWizardOpen,
        setIsScanWizardOpen,
        runNewScan,
        updateFindingStatus,
        addBrand,
        retryScan,
        searchQuery,
        setSearchQuery,
        dashboardStats,
        backendStatus,
        isLoading,
        refreshData,
        explainFinding,
        seedDemoData,
        resetDatabase,
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
