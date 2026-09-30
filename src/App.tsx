import React, { useState, useEffect } from 'react';
import { 
  Job, 
  Transporter, 
  EscrowTransaction, 
  Dispute, 
  UserRole, 
  Currency, 
  Language, 
  Vehicle,
  ICD
} from './types';
import { 
  INITIAL_JOBS, 
  INITIAL_TRANSPORTERS, 
  INITIAL_ESCROWS, 
  INITIAL_DISPUTES 
} from './data/mockData';
import { t } from './services/i18n';
import { formatMoney } from './services/currency';
import { getStoredICDs, saveStoredICDs } from './services/icdService';
import { Navbar } from './components/Navbar';
import { Logo } from './components/Logo';
import { LiveTransportMap } from './components/Map/LiveTransportMap';
import { ClientDashboard } from './components/Client/ClientDashboard';
import { TransporterDashboard } from './components/Transporter/TransporterDashboard';
import { SuperAdminDashboard } from './components/Admin/SuperAdminDashboard';
import { ServicesMarketplace } from './components/Services/ServicesMarketplace';
import { ICDsAndWarehousesPage } from './components/ICD/ICDsAndWarehousesPage';
import { ManageICDsModal } from './components/Admin/ManageICDsModal';
import { NegotiationChatModal } from './components/Modals/NegotiationChatModal';
import { EscrowPaymentModal } from './components/Modals/EscrowPaymentModal';
import { ProofOfDeliveryModal } from './components/Modals/ProofOfDeliveryModal';
import { InvoiceModal } from './components/Modals/InvoiceModal';
import { DisputeModal } from './components/Modals/DisputeModal';
import { KYCModal } from './components/Modals/KYCModal';
import { LegalDisclaimerModal } from './components/Modals/LegalDisclaimerModal';
import { PostJobModal } from './components/Client/PostJobModal';
import { FuelEfficientRouteModal } from './components/Modals/FuelEfficientRouteModal';
import { DualHeroCards } from './components/Home/DualHeroCards';
import { ClientPostCargoModal } from './components/Modals/ClientPostCargoModal';
import { TransporterRegisterModal } from './components/Modals/TransporterRegisterModal';
import { PricingGuidePage } from './components/Pricing/PricingGuidePage';
import { SecureAdminPortal } from './components/Admin/SecureAdminPortal';
import { AdminAccessModal } from './components/Modals/AdminAccessModal';
import { TutorialTooltip, TutorialTooltipData } from './components/Common/TutorialTooltip';
import { 
  ShieldCheck, 
  WifiOff, 
  Truck, 
  Award, 
  CheckCircle2, 
  Navigation,
  FileText
} from 'lucide-react';

export default function App() {
  // Quota banner state for Google Maps Demo Key compliance
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  // Secret Route & Server-Verified Super Admin State
  const [isAdminPortalActive, setIsAdminPortalActive] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const p = window.location.pathname;
    return p.startsWith('/maximus-admin-2026-secure') || p.startsWith('/admin') || p.startsWith('/app/admin');
  });
  const [isServerSuperAdmin, setIsServerSuperAdmin] = useState<boolean>(false);

  // Default persona for regular users is client
  const [currentUserEmail] = useState<string>('marksentongo07@gmail.com');
  const [currentRole, setCurrentRole] = useState<UserRole>('client');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currency, setCurrency] = useState<Currency>('UGX');
  const [language, setLanguage] = useState<Language>('en');
  const [isOffline, setIsOffline] = useState(false);

  // Check URL pathname and server-side authentication from httpOnly cookie
  useEffect(() => {
    const path = window.location.pathname;
    // Redirect /admin and /app/admin to /maximus-admin-2026-secure
    if (
      path === '/admin' || 
      path.startsWith('/admin/') || 
      path === '/app/admin' || 
      path.startsWith('/app/admin/')
    ) {
      window.history.replaceState({}, '', '/maximus-admin-2026-secure');
      setIsAdminPortalActive(true);
    } else if (path.startsWith('/maximus-admin-2026-secure')) {
      setIsAdminPortalActive(true);
    } else if (
      path === '/super-admin' || 
      path.startsWith('/super-admin/') || 
      path === '/dashboard' || 
      path.startsWith('/dashboard/')
    ) {
      window.history.replaceState({}, '', '/');
    } else if (path === '/services' || path.startsWith('/services')) {
      setActiveTab('services');
    }

    const handlePopState = () => {
      const currentPath = window.location.pathname;
      if (
        currentPath.startsWith('/maximus-admin-2026-secure') ||
        currentPath.startsWith('/admin') ||
        currentPath.startsWith('/app/admin')
      ) {
        setIsAdminPortalActive(true);
      } else {
        setIsAdminPortalActive(false);
      }

      if (currentPath === '/services' || currentPath.startsWith('/services')) {
        setActiveTab('services');
      } else if (currentPath === '/') {
        setActiveTab('dashboard');
      }
    };
    window.addEventListener('popstate', handlePopState);

    // Verify role server-side via /api/auth/me (never rely solely on client state)
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.role === 'super_admin') {
          setIsServerSuperAdmin(true);
        } else {
          setIsServerSuperAdmin(false);
        }
      })
      .catch(() => setIsServerSuperAdmin(false));

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Entities
  const [icds, setIcds] = useState<ICD[]>(() => getStoredICDs());
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [transporters, setTransporters] = useState<Transporter[]>(INITIAL_TRANSPORTERS);
  const [escrows, setEscrows] = useState<EscrowTransaction[]>(INITIAL_ESCROWS);
  const [disputes, setDisputes] = useState<Dispute[]>(INITIAL_DISPUTES);

  // Notifications
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'New Bid Received on Job #job-ug-102',
      desc: 'Moses Ochen submitted an offer of 1,700,000 UGX for 28T Steel Rebar.',
      time: '10m ago',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'Escrow Secured for Shipment #job-ug-101',
      desc: '1,250,000 UGX held safely in trust. Transporter Ronald Kato dispatched.',
      time: '45m ago',
      read: false,
    },
    {
      id: 'notif-3',
      title: 'Vault Secured Delivery Confirmed #job-ug-103',
      desc: 'Sarah Nakitende completed 12T Dairy run. 2,115,000 UGX escrow released.',
      time: '2h ago',
      read: true,
    }
  ]);

  // Modals state
  const [activeNegotiationJob, setActiveNegotiationJob] = useState<Job | null>(null);
  const [activeEscrowJob, setActiveEscrowJob] = useState<Job | null>(null);
  const [activePODJob, setActivePODJob] = useState<Job | null>(null);
  const [activeInvoiceJob, setActiveInvoiceJob] = useState<Job | null>(null);
  const [activeDisputeJob, setActiveDisputeJob] = useState<Job | null>(null);
  const [activeDisputeRecord, setActiveDisputeRecord] = useState<Dispute | null>(null);
  const [activeEcoRouteJob, setActiveEcoRouteJob] = useState<Job | null>(null);
  const [inspectKYCTransporter, setInspectKYCTransporter] = useState<Transporter | null>(null);
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [showClientPostCargoModal, setShowClientPostCargoModal] = useState(false);
  const [showTransporterRegisterModal, setShowTransporterRegisterModal] = useState(false);
  const [tutorialTooltip, setTutorialTooltip] = useState<TutorialTooltipData | null>(null);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [showAdminQuickModal, setShowAdminQuickModal] = useState(false);
  const [celebrationBanner, setCelebrationBanner] = useState<string | null>(null);

  // Active Job for GPS Map Tracking
  const trackingJob = jobs.find(j => j.status === 'in_transit') || jobs[0];

  // Helper: add notification
  const addNotification = (title: string, desc: string) => {
    const newN = {
      id: 'n-' + Date.now(),
      title,
      desc,
      time: 'Just now',
      read: false,
    };
    setNotifications(prev => [newN, ...prev]);
  };

  // Handler for Card 1 Client "Post Cargo - Free" submission
  const handlePostCargoSuccess = (newJob: Job) => {
    setJobs(prev => [newJob, ...prev]);
    setCurrentRole('client');
    setActiveTab('dashboard');
    setShowClientPostCargoModal(false);

    // Requirement: After registration, show tutorial tooltip:
    // For Client: "Your cargo posted! Transporters will bid in 5 mins, check bell icon 🔔"
    setTutorialTooltip({
      type: 'client',
      message: 'Your cargo posted! Transporters will bid in 5 mins, check bell icon 🔔',
      actionText: 'Check Bell Icon 🔔',
      onAction: () => {
        // Notification bell ready
      }
    });

    addNotification(
      'Your cargo posted! 🔔',
      `Transporters will bid on "${newJob.title}" in 5 mins, check bell icon 🔔.`
    );
  };

  // Handler for Card 2 Transporter "Find Loads & Bid" registration
  const handleRegisterTransporter = (tData: {
    name: string;
    phone: string;
    companyName: string;
    nin: string;
    truckType: Vehicle['type'];
    plateNumber: string;
    drivingPermitFile?: string;
    nationalIdFile?: string;
    logbookFile?: string;
    truckPhotoFile?: string;
  }) => {
    const newTransporterId = 'trans-' + Date.now().toString().slice(-4);
    const newVehId = 'veh-' + Date.now().toString().slice(-4);

    const newTransporter: Transporter = {
      id: newTransporterId,
      name: tData.name,
      companyName: tData.companyName,
      phone: tData.phone,
      maskedPhone: tData.phone.replace(/(\d{3})\d{3}(\d{3})/, '$1***$2'),
      email: tData.name.toLowerCase().replace(/\s+/g, '.') + '@freight.ug',
      avatarUrl: tData.truckPhotoFile || '/src/assets/images/transporter_profile_1790435633148.jpg',
      rating: 5.0,
      totalTrips: 0,
      loyaltyPoints: 100,
      badges: ['New Carrier', 'Bank-Grade KYC Applicant'],
      kycStatus: 'pending',
      nin: tData.nin,
      kycDocs: {
        drivingLicense: Boolean(tData.drivingPermitFile),
        vehicleLogbook: Boolean(tData.logbookFile),
        commercialInsurance: true,
        nationalId: Boolean(tData.nationalIdFile),
        truckPhoto: Boolean(tData.truckPhotoFile),
        nationalIdUrl: tData.nationalIdFile,
        drivingPermitUrl: tData.drivingPermitFile,
        logbookUrl: tData.logbookFile,
        truckPhotoUrl: tData.truckPhotoFile,
      },
      payoutDetails: {
        mobileMoneyNumber: tData.phone,
        mobileMoneyNetwork: 'MTN',
        bankName: 'Stanbic Bank Uganda',
        bankAccountNumber: '9030018472910',
        accountName: tData.name,
      },
      vehicles: [
        {
          id: newVehId,
          transporterId: newTransporterId,
          type: tData.truckType,
          name: `${tData.truckType.replace('_', ' ').toUpperCase()} Commercial Hauler`,
          plateNumber: tData.plateNumber,
          capacityTons: 10,
          availableUnits: 1,
          currentLocation: {
            name: 'Kampala Logistics Base',
            lat: 0.3476,
            lng: 32.5825,
          },
          ratePerKmUGX: 4500,
          photoUrl: tData.truckPhotoFile || '/src/assets/images/maximus_hero_truck_1790435606454.jpg',
        }
      ],
      isAvailable: true,
      status: 'active',
      currentLocation: {
        lat: 0.3476,
        lng: 32.5825,
        address: 'Kampala Central Logistics Base',
      },
    };

    setTransporters(prev => [newTransporter, ...prev]);
    setCurrentRole('transporter');
    setActiveTab('dashboard');
    setShowTransporterRegisterModal(false);

    // Requirement: After registration, show tutorial tooltip:
    // For Transporter: "Welcome! 3 loads near you - tap to bid UGX price"
    setTutorialTooltip({
      type: 'transporter',
      message: 'Welcome! 3 loads near you - tap to bid UGX price',
      actionText: 'View Loads & Tap to Bid 🚚',
      onAction: () => {
        setActiveTab('dashboard');
      }
    });

    addNotification(
      'Welcome to Maximus Freight! 🚚',
      '3 loads near you - tap to bid UGX price. Super Admin will verify your KYC documents.'
    );
  };

  // Handlers for Job Updates
  const handleUpdateJob = (updatedJob: Job) => {
    setJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));
  };

  const handleUpdateJobStatus = (jobId: string, newStatus: Job['status']) => {
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return {
          ...j,
          status: newStatus,
          currentGps: newStatus === 'in_transit' ? {
            lat: 0.4479,
            lng: 33.2026,
            lastUpdated: 'Just now (Jinja - Kampala Highway)',
            progressPercent: 25,
          } : j.currentGps,
        };
      }
      return j;
    }));
    addNotification(`Trip Status Updated`, `Shipment #${jobId} status is now ${newStatus.replace('_', ' ').toUpperCase()}`);
  };

  const handleSimulateGps = async (jobId: string) => {
    const waypoints = [
      { lat: 0.4479, lng: 33.2026, loc: 'Jinja Nile Bridge', speed: 58 },
      { lat: 0.4120, lng: 33.0500, loc: 'Mabira Forest Road', speed: 64 },
      { lat: 0.3950, lng: 32.8800, loc: 'Lugazi Highway', speed: 52 },
      { lat: 0.3544, lng: 32.7523, loc: 'Mukono Bypass', speed: 46 },
      { lat: 0.3600, lng: 32.6650, loc: 'Namanve Industrial ICD', speed: 38 },
      { lat: 0.3476, lng: 32.5825, loc: 'Nakawa Kampala Core', speed: 28 },
    ];

    let chosenWp = waypoints[0];

    setJobs(prev => prev.map(j => {
      if (j.id === jobId && j.currentGps) {
        const nextProgress = Math.min(95, j.currentGps.progressPercent + 20);
        const wpIdx = Math.min(waypoints.length - 1, Math.floor((nextProgress / 100) * waypoints.length));
        chosenWp = waypoints[wpIdx];
        return {
          ...j,
          currentGps: {
            lat: chosenWp.lat,
            lng: chosenWp.lng,
            progressPercent: nextProgress,
            lastUpdated: `Just now (${chosenWp.loc} · ${chosenWp.speed} km/h)`,
          }
        };
      }
      return j;
    }));

    try {
      await fetch('/api/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          lat: chosenWp.lat,
          lng: chosenWp.lng,
          speed: chosenWp.speed,
          status: 'delivering',
          lastSeenLocationName: chosenWp.loc,
        }),
      });
    } catch {
      // offline fallback
    }

    addNotification('GPS Route Ping', `Driver advancing along corridor (${chosenWp.loc}). Telemetry refreshed.`);
  };

  // Escrow funding success
  const handleEscrowSuccess = (transaction: EscrowTransaction) => {
    setEscrows(prev => [transaction, ...prev]);
    setJobs(prev => prev.map(j => {
      if (j.id === transaction.jobId) {
        return {
          ...j,
          status: 'booked',
          escrowStatus: 'held',
          escrowTransactionId: transaction.id,
        };
      }
      return j;
    }));
    setActiveEscrowJob(null);
    addNotification(
      'Escrow Funded Successfully',
      `${transaction.totalAmountUGX.toLocaleString()} UGX locked under reference ${transaction.referenceNumber}.`
    );
  };

  // Proof of Delivery submitted by driver -> awaits Super Admin marksentongo07@gmail.com approval
  const handleConfirmPOD = (podData: { recipientName: string; signatureDataUrl: string; confirmationNote: string }) => {
    if (!activePODJob) return;
    const targetJobId = activePODJob.id;
    const assignedTransporterId = activePODJob.assignedTransporterId || 'trans-001';

    // Update job to delivered with pending admin approval
    setJobs(prev => prev.map(j => {
      if (j.id === targetJobId) {
        return {
          ...j,
          status: 'delivered',
          payoutStatus: 'pending_admin_approval',
          proofOfDelivery: {
            recipientName: podData.recipientName,
            signatureDataUrl: podData.signatureDataUrl,
            confirmationNote: podData.confirmationNote,
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
            confirmedByAdmin: false,
          }
        };
      }
      return j;
    }));

    // Award transporter loyalty points (+150 pts)
    setTransporters(prev => prev.map(t => {
      if (t.id === assignedTransporterId) {
        return {
          ...t,
          loyaltyPoints: t.loyaltyPoints + 150,
          totalTrips: t.totalTrips + 1,
        };
      }
      return t;
    }));

    setActivePODJob(null);
    setCelebrationBanner('Cargo delivered! POD signature captured. Awaiting confirmation by marksentongo07@gmail.com.');
    setTimeout(() => setCelebrationBanner(null), 6000);

    addNotification('POD Submitted by Driver', `Trip #${targetJobId} POD submitted. Awaiting Super Admin marksentongo07@gmail.com approval.`);
  };

  // Admin marksentongo07@gmail.com confirms POD
  const handleConfirmPODByAdmin = (jobId: string) => {
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return {
          ...j,
          proofOfDelivery: {
            recipientName: j.proofOfDelivery?.recipientName || 'Verified Consignee',
            timestamp: j.proofOfDelivery?.timestamp || new Date().toISOString().replace('T', ' ').slice(0, 16),
            confirmationNote: j.proofOfDelivery?.confirmationNote || 'Delivery certified and confirmed by Super Admin.',
            photoUrl: j.proofOfDelivery?.photoUrl,
            signatureDataUrl: j.proofOfDelivery?.signatureDataUrl,
            confirmedByAdmin: true,
            confirmedByAdminEmail: 'marksentongo07@gmail.com',
            confirmedAt: new Date().toISOString(),
          },
          payoutStatus: 'ready_for_payout',
        };
      }
      return j;
    }));
    addNotification('POD Approved by marksentongo07@gmail.com', `Trip #${jobId} POD confirmed. Driver payout button unlocked.`);
  };

  // Super Admin executes driver payout (Mobile Money or Bank Transfer) with payment proof
  const handleExecuteDriverPayout = (jobId: string, payoutData: any) => {
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return {
          ...j,
          payoutStatus: 'paid',
          escrowStatus: 'released',
          payoutTransaction: {
            method: payoutData.method,
            amountUGX: payoutData.amountUGX,
            recipientName: payoutData.recipientName,
            recipientPhoneOrAccount: payoutData.recipientPhoneOrAccount,
            networkOrBank: payoutData.networkOrBank,
            proofUrl: payoutData.proofUrl,
            proofReference: payoutData.proofReference,
            approvedBy: currentUserEmail,
            paidAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            notes: payoutData.notes,
          }
        };
      }
      return j;
    }));

    // Release escrow ledger entry
    setEscrows(prev => prev.map(e => {
      if (e.jobId === jobId) {
        return {
          ...e,
          status: 'released',
          releasedAt: new Date().toISOString(),
        };
      }
      return e;
    }));

    addNotification(
      `Driver Payout Disbursed (${formatMoney(payoutData.amountUGX, currency)})`,
      `Settlement transferred to ${payoutData.recipientName} via ${payoutData.method === 'MOBILE_MONEY' ? 'Mobile Money' : 'Bank Transfer'}. Ref: ${payoutData.proofReference}`
    );
  };

  // Driver updates payout & banking details
  const handleUpdateTransporterPayoutDetails = (updatedDetails: Transporter['payoutDetails']) => {
    setTransporters(prev => prev.map((t, idx) => {
      if (idx === 0 || t.id === 'trans-001') {
        return {
          ...t,
          payoutDetails: updatedDetails,
        };
      }
      return t;
    }));
    addNotification('Payout Details Saved', 'Driver mobile money & bank account details updated for escrow settlements.');
  };

  // New Job Posted
  const handlePostJob = (newJob: Job) => {
    setJobs(prev => [newJob, ...prev]);
    setShowPostJobModal(false);
    addNotification('New Cargo Broadcasted', `"${newJob.title}" is live for quotes across Uganda.`);
  };

  // Dispute created
  const handleCreateDispute = (newDispute: Dispute) => {
    setDisputes(prev => [newDispute, ...prev]);
    setJobs(prev => prev.map(j => {
      if (j.id === newDispute.jobId) {
        return { ...j, status: 'disputed' };
      }
      return j;
    }));
    setActiveDisputeJob(null);
    addNotification('Dispute Opened', `Case #${newDispute.id} submitted for Super Admin arbitration.`);
  };

  // Dispute resolved by Super Admin
  const handleResolveDispute = (disputeId: string, resolution: 'refund_client' | 'pay_transporter', notes: string) => {
    setDisputes(prev => prev.map(d => {
      if (d.id === disputeId) {
        return {
          ...d,
          status: resolution === 'refund_client' ? 'resolved_refund_client' : 'resolved_pay_transporter',
          resolutionNotes: notes,
          resolvedAt: new Date().toISOString(),
        };
      }
      return d;
    }));
    setActiveDisputeRecord(null);
    addNotification('Dispute Arbitrated', `Maximus Admin ruled: ${resolution.replace('_', ' ').toUpperCase()}`);
  };

  // Rate transporter
  const handleRateTransporter = (jobId: string, rating: number, comment: string) => {
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return {
          ...j,
          review: { rating, comment, createdAt: new Date().toISOString() }
        };
      }
      return j;
    }));
    addNotification('Rating Recorded', `Thank you for rating carrier with ⭐${rating} stars.`);
  };

  // Transporter adds vehicle
  const handleAddVehicle = (newVeh: Vehicle) => {
    setTransporters(prev => prev.map(t => {
      if (t.id === newVeh.transporterId) {
        return {
          ...t,
          vehicles: [...t.vehicles, newVeh],
        };
      }
      return t;
    }));
    addNotification('Fleet Vehicle Added', `${newVeh.name} (${newVeh.plateNumber}) listed on live map.`);
  };

  // Toggle Transporter status (Active / Suspended)
  const handleToggleTransporterStatus = (tId: string) => {
    setTransporters(prev => prev.map(t => {
      if (t.id === tId) {
        const nextStatus = t.status === 'active' ? 'suspended' : 'active';
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  // Update KYC status
  const handleUpdateKYCStatus = (tId: string, newStatus: 'verified' | 'pending' | 'rejected') => {
    setTransporters(prev => prev.map(t => {
      if (t.id === tId) {
        return { ...t, kycStatus: newStatus };
      }
      return t;
    }));
  };

  const primaryTransporter = transporters[0];

  const [showManageICDsModal, setShowManageICDsModal] = useState(false);
  const [preselectedICD, setPreselectedICD] = useState<ICD | null>(null);

  const handleSaveICDs = (updated: ICD[]) => {
    setIcds(updated);
    saveStoredICDs(updated);
    addNotification('ICD Registry Updated', `Updated storage rates and GPS parameters for ${updated.length} ICDs.`);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'services') {
      window.history.pushState({}, '', '/services');
    } else if (tab === 'dashboard' || tab === 'my_jobs' || tab === 'available_loads') {
      window.history.pushState({}, '', '/');
    }
  };

  // If on the secret admin route /maximus-admin-2026-secure, render the Secure Admin Lockdown Portal
  if (isAdminPortalActive) {
    return (
      <SecureAdminPortal
        jobs={jobs}
        transporters={transporters}
        escrows={escrows}
        disputes={disputes}
        currency={currency}
        language={language}
        onCurrencyChange={setCurrency}
        onInspectTransporter={(t) => setInspectKYCTransporter(t)}
        onExitPortal={() => {
          setIsAdminPortalActive(false);
          window.history.replaceState({}, '', '/');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#070F1A] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Client-Side Quota Defense Top Banner */}
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Offline Mode Banner (if active) */}
      {isOffline && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-300 px-4 py-2 text-xs text-center flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4 text-amber-400" />
          <span>
            <strong>Offline Mode Enabled:</strong> Waypoint caches and delivery manifests available without cellular data.
          </span>
        </div>
      )}

      {/* Celebration Notification Toast */}
      {celebrationBanner && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-500 text-slate-950 px-5 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-slate-950" />
          <span>{celebrationBanner}</span>
        </div>
      )}

      {/* Tutorial Tooltip for Shippers / Drivers */}
      <TutorialTooltip
        data={tutorialTooltip}
        onClose={() => setTutorialTooltip(null)}
      />

      {/* Main Top Navigation conforming to Top Bar Contract */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        currency={currency}
        onCurrencyChange={setCurrency}
        language={language}
        onLanguageChange={setLanguage}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isOffline={isOffline}
        onToggleOffline={() => setIsOffline(!isOffline)}
        onOpenLegal={() => setShowLegalModal(true)}
        onOpenPostJob={() => {
          setShowClientPostCargoModal(true);
        }}
        notifications={notifications}
        onMarkNotificationsRead={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
        userEmail={currentUserEmail}
        onOpenAdminAccess={() => setShowAdminQuickModal(true)}
        onOpenAdminSecure={() => {
          setIsAdminPortalActive(true);
          window.history.pushState({}, '', '/maximus-admin-2026-secure');
        }}
      />

      {/* Main Viewport Content */}
      <main className="relative z-[1] flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* TABS: STRICTLY CONTROLLED PER PERSONA (Client sees GPS Radar, My Jobs, Post Cargo, Disputes; Transporter sees Available Loads, My Bids, GPS Tracking, Disputes) */}

        {/* 1. DASHBOARD / JOBS VIEW */}
        {(activeTab === 'dashboard' || activeTab === 'my_jobs' || activeTab === 'available_loads' || activeTab === 'my_bids') && (
          <div className="space-y-6">
            
            {/* 2 Big Cards Side-by-Side: Card 1 (I NEED A TRUCK) + Card 2 (I HAVE A TRUCK) */}
            <DualHeroCards
              currency={currency}
              onPostCargoClick={() => setShowClientPostCargoModal(true)}
              onFindLoadsClick={() => setShowTransporterRegisterModal(true)}
            />

            {currentRole === 'client' && (
              <ClientDashboard
                jobs={jobs}
                currency={currency}
                language={language}
                onOpenPostJob={() => setShowClientPostCargoModal(true)}
                onOpenNegotiation={(j) => setActiveNegotiationJob(j)}
                onOpenEscrow={(j) => setActiveEscrowJob(j)}
                onOpenPOD={(j) => setActivePODJob(j)}
                onOpenInvoice={(j) => setActiveInvoiceJob(j)}
                onOpenDispute={(j) => {
                  setActiveDisputeJob(j);
                  setActiveDisputeRecord(null);
                }}
                onRateTransporter={handleRateTransporter}
              />
            )}

            {currentRole === 'transporter' && (
              <TransporterDashboard
                transporter={primaryTransporter}
                allJobs={jobs}
                currency={currency}
                language={language}
                icds={icds}
                userEmail="fleet@maximus.ug"
                onUpdateJobStatus={handleUpdateJobStatus}
                onSimulateGpsProgress={handleSimulateGps}
                onOpenNegotiation={(j) => setActiveNegotiationJob(j)}
                onOpenPOD={(j) => setActivePODJob(j)}
                onOpenInvoice={(j) => setActiveInvoiceJob(j)}
                onOpenEcoRoute={(j) => setActiveEcoRouteJob(j)}
                onAddVehicle={handleAddVehicle}
                onOpenKYC={() => setInspectKYCTransporter(primaryTransporter)}
                onUpdatePayoutDetails={handleUpdateTransporterPayoutDetails}
                onConfirmPODByAdmin={handleConfirmPODByAdmin}
                onExecuteDriverPayout={handleExecuteDriverPayout}
                onSwitchToAdminVerify={() => {}}
                onApproveDriverKYC={(tId) => handleUpdateKYCStatus(tId, 'verified')}
              />
            )}
          </div>
        )}

        {/* 2. GPS RADAR (CLIENT: HIS TRUCK ONLY) OR GPS TRACKING (TRANSPORTER) */}
        {(activeTab === 'gps_radar' || activeTab === 'gps_tracking' || activeTab === 'map') && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-[18px] font-bold text-white tracking-tight">
                  {currentRole === 'client' ? 'GPS Radar — Consignment Telemetry' : 'Transporter Corridor GPS Tracking'}
                </h2>
                <p className="text-[14px] text-white/60 leading-6">
                  {currentRole === 'client' 
                    ? 'Dedicated live satellite tracking for your active shipment only.' 
                    : 'Real-time navigation and breadcrumb updates along East African transit corridors.'}
                </p>
              </div>
              <div className="text-xs text-white font-medium bg-slate-700 px-3.5 py-1.5 rounded-full border border-white/10">
                {currentRole === 'client' ? 'Authorized Consignment Tracking' : 'Fleet Telemetry Active'}
              </div>
            </div>

            <LiveTransportMap
              transporters={transporters}
              activeJob={currentRole === 'client' ? trackingJob : null}
              language={language}
              onSelectTransporter={(t) => setInspectKYCTransporter(t)}
              onDirectBook={() => {
                setShowClientPostCargoModal(true);
              }}
            />
          </div>
        )}

        {/* 3. DISPUTE ARBITRATION CENTER */}
        {activeTab === 'disputes' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-[18px] font-bold text-white tracking-tight">Maximus Dispute Arbitration Center</h2>
                <p className="text-[14px] text-white/60 leading-6">
                  Neutral mediation for transit delays, damage claims, and escrow release adjudications
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {disputes.map((disp) => (
                <div key={disp.id} className="bg-[#1a2a3f] border border-white/10 rounded-2xl p-5 shadow-xl backdrop-blur space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono font-bold text-rose-400">Case #{disp.id}</span>
                        <span className="text-white/60">· Claimant: {disp.openerName}</span>
                      </div>
                      <h4 className="text-[18px] font-bold text-white mt-1">{disp.jobTitle}</h4>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-slate-700 text-white border border-white/10">
                      {disp.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-4 rounded-xl border border-white/5 text-[14px] leading-6 text-white/80">
                    <strong className="text-rose-300 block mb-1">Issue: {disp.reason}</strong>
                    {disp.description}
                  </div>

                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="text-white font-semibold">
                      Escrow At Stake: <span className="text-orange-400 font-bold">{disp.amountAtStakeUGX.toLocaleString()} UGX</span>
                    </span>
                    <button
                      onClick={() => {
                        setActiveDisputeRecord(disp);
                        setActiveDisputeJob(null);
                      }}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl border border-white/10 transition-colors"
                    >
                      View Case Evidence
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. SERVICES DIRECTORY & REAL CONTACTS DATABASE (/services) */}
        {activeTab === 'services' && (
          <ServicesMarketplace
            currency={currency}
            language={language}
            onSelectHaulageCore={() => handleTabChange('dashboard')}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#0B192C] text-slate-400 text-xs py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo size={24} className="w-6 h-6 shadow-sm" />
            <span className="font-bold text-white">MAXIMUS</span>
            <span className="text-slate-500">·</span>
            <span className="text-[11px] text-slate-400">
              ©{' '}
              <button 
                onClick={() => setShowAdminQuickModal(true)} 
                className="hover:text-amber-400 font-mono underline decoration-slate-600 hover:decoration-amber-400 cursor-pointer"
                title="Admin Access (Owner Login)"
              >
                2026
              </button>{' '}
              MAXIMUS Global Transport Link · {t('footerPlatformDesc', language)}
            </span>
          </div>

          <div className="flex items-center gap-5 text-slate-400 flex-wrap">
            <button onClick={() => handleTabChange('services')} className="hover:text-[#C9A86A] transition-colors font-medium">
              Services Directory
            </button>
            <button onClick={() => setShowLegalModal(true)} className="hover:text-amber-400 transition-colors">
              {t('limitationLiability', language)}
            </button>
            <button onClick={() => handleTabChange('disputes')} className="hover:text-amber-400 transition-colors">
              {t('disputeCenter', language)}
            </button>
          </div>
        </div>
      </footer>

      {/* MODALS */}

      {/* 1. Post a Job Modal */}
      {showPostJobModal && (
        <PostJobModal
          currency={currency}
          icds={icds}
          initialICD={preselectedICD}
          onClose={() => {
            setShowPostJobModal(false);
            setPreselectedICD(null);
          }}
          onSubmitJob={handlePostJob}
        />
      )}

      {/* 1b. Manage ICDs & Storage Fees Modal */}
      {showManageICDsModal && (
        <ManageICDsModal
          icds={icds}
          currency={currency}
          onClose={() => setShowManageICDsModal(false)}
          onSaveICDs={handleSaveICDs}
        />
      )}

      {/* 2. Negotiation Chat Modal */}
      {activeNegotiationJob && (
        <NegotiationChatModal
          job={activeNegotiationJob}
          currentRole={currentRole}
          currency={currency}
          language={language}
          historicalJobs={jobs}
          onClose={() => setActiveNegotiationJob(null)}
          onUpdateJob={handleUpdateJob}
          onOpenEscrow={(jobToFund) => {
            setActiveNegotiationJob(null);
            setActiveEscrowJob(jobToFund);
          }}
        />
      )}

      {/* 3. Escrow Payment Checkout Modal */}
      {activeEscrowJob && (
        <EscrowPaymentModal
          job={activeEscrowJob}
          currency={currency}
          onClose={() => setActiveEscrowJob(null)}
          onPaymentSuccess={handleEscrowSuccess}
        />
      )}

      {/* 4. Proof of Delivery & Digital Signature Modal */}
      {activePODJob && (
        <ProofOfDeliveryModal
          job={activePODJob}
          currency={currency}
          onClose={() => setActivePODJob(null)}
          onConfirmDelivery={handleConfirmPOD}
        />
      )}

      {/* 5. Printable Invoice Modal */}
      {activeInvoiceJob && (
        <InvoiceModal
          job={activeInvoiceJob}
          currency={currency}
          onClose={() => setActiveInvoiceJob(null)}
        />
      )}

      {/* 6. Dispute Modal */}
      {(activeDisputeJob || activeDisputeRecord) && (
        <DisputeModal
          job={activeDisputeJob}
          dispute={activeDisputeRecord}
          currentRole={currentRole}
          currency={currency}
          onClose={() => {
            setActiveDisputeJob(null);
            setActiveDisputeRecord(null);
          }}
          onCreateDispute={handleCreateDispute}
          onResolveDispute={handleResolveDispute}
        />
      )}

      {/* 7. KYC Verification Modal */}
      {inspectKYCTransporter && (
        <KYCModal
          transporter={inspectKYCTransporter}
          isAdmin={currentRole === 'admin'}
          onClose={() => setInspectKYCTransporter(null)}
          onUpdateStatus={handleUpdateKYCStatus}
        />
      )}

      {/* 8. Legal Disclaimer Modal */}
      {showLegalModal && (
        <LegalDisclaimerModal
          onClose={() => setShowLegalModal(false)}
        />
      )}

      {/* 9. Google Maps Fuel-Efficient Route Modal */}
      {activeEcoRouteJob && (
        <FuelEfficientRouteModal
          job={activeEcoRouteJob}
          currency={currency}
          language={language}
          onClose={() => setActiveEcoRouteJob(null)}
          onApplyEcoRoute={(jobId) => {
            addNotification('Eco Route Applied', `Optimized fuel-efficient waypoints loaded into active driver GPS navigation.`);
          }}
        />
      )}

      {/* 10. Card 1 - Client Post Cargo Free Modal */}
      {showClientPostCargoModal && (
        <ClientPostCargoModal
          currency={currency}
          icds={icds}
          onClose={() => setShowClientPostCargoModal(false)}
          onSubmitJob={handlePostCargoSuccess}
        />
      )}

      {/* 11. Card 2 - Transporter Registration & Bank-Grade KYC Modal */}
      {showTransporterRegisterModal && (
        <TransporterRegisterModal
          onClose={() => setShowTransporterRegisterModal(false)}
          onRegisterTransporter={handleRegisterTransporter}
        />
      )}

      {/* 12. Owner Admin Access Quick Modal (triggered by 2026 click or logo 5x/long-press) */}
      {showAdminQuickModal && (
        <AdminAccessModal
          onClose={() => setShowAdminQuickModal(false)}
          onSuccess={() => {
            setShowAdminQuickModal(false);
            setIsServerSuperAdmin(true);
            setIsAdminPortalActive(true);
            window.history.pushState({}, '', '/maximus-admin-2026-secure');
          }}
        />
      )}

    </div>
  );
}
