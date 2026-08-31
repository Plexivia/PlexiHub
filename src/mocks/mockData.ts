import {
  User,
  TenantConfig,
  Project,
  Issue,
  SupportRequest,
  Activity,
  Deployment,
  Container,
  ServerMetrics,
  AuditLogEntry,
} from '../types';

export const MOCK_USERS: User[] = [
  {
    id: 'usr_owner_1',
    name: 'Elena Vance',
    email: 'elena.vance@apexops.io',
    role: 'Owner',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    department: 'Executive / Business Owner',
    isActive: true,
  },
  {
    id: 'usr_admin_1',
    name: 'Marcus Thorne',
    email: 'marcus.t@apexops.io',
    role: 'Admin',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    department: 'Operations & Systems',
    isActive: true,
  },
  {
    id: 'usr_mgr_1',
    name: 'Sofia Lin',
    email: 'sofia.lin@apexops.io',
    role: 'Manager',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    department: 'Store & Catalog Operations',
    isActive: true,
  },
  {
    id: 'usr_mgr_2',
    name: 'David Kim',
    email: 'david.k@apexops.io',
    role: 'Manager',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    department: 'Customer Fulfillment & Orders',
    isActive: true,
  },
  {
    id: 'usr_admin_2',
    name: 'Liam Gallagher',
    email: 'liam.g@apexops.io',
    role: 'Admin',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    department: 'Technical Store Administration',
    isActive: true,
  },
];

export const MOCK_TENANTS: TenantConfig[] = [
  {
    id: 'tenant_apex',
    name: 'Apex Commerce Cloud',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    primaryColor: '#0284c7', // Sky blue 600
    secondaryColor: '#0f172a', // Slate 900
    favicon: '/favicon.ico',
    domain: 'ops.apexcommerce.cloud',
    supportEmail: 'ops-support@apexcommerce.cloud',
  },
  {
    id: 'tenant_nova',
    name: 'Nova Retail Operations',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    primaryColor: '#6366f1', // Indigo 500
    secondaryColor: '#1e1b4b', // Indigo 950
    favicon: '/favicon.ico',
    domain: 'console.novaretail.io',
    supportEmail: 'care@novaretail.io',
  },
];

const mockContainersDH: Container[] = [
  {
    id: 'cnt_dh_1',
    name: 'dh-api-gateway',
    status: 'Running',
    cpu: '14.2%',
    memory: '512 MB / 2 GB',
    uptime: '18d 4h 12m',
    restartCount: 0,
    image: 'commerceops/gateway:v2.8.14',
  },
  {
    id: 'cnt_dh_2',
    name: 'dh-checkout-engine',
    status: 'Running',
    cpu: '28.6%',
    memory: '1.2 GB / 4 GB',
    uptime: '18d 4h 10m',
    restartCount: 1,
    image: 'commerceops/checkout:v2.8.14',
  },
  {
    id: 'cnt_dh_3',
    name: 'dh-catalog-indexer',
    status: 'Running',
    cpu: '8.1%',
    memory: '840 MB / 2 GB',
    uptime: '9d 12h 05m',
    restartCount: 0,
    image: 'commerceops/indexer:v1.9.0',
  },
  {
    id: 'cnt_dh_4',
    name: 'dh-redis-sessions',
    status: 'Running',
    cpu: '4.5%',
    memory: '380 MB / 1 GB',
    uptime: '42d 1h 33m',
    restartCount: 0,
    image: 'redis:7.2-alpine',
  },
  {
    id: 'cnt_dh_5',
    name: 'dh-webhook-broker',
    status: 'Degraded',
    cpu: '71.0%',
    memory: '1.8 GB / 2 GB',
    uptime: '2d 18h 45m',
    restartCount: 3,
    image: 'commerceops/webhook-broker:v2.8.14',
  },
];

const mockContainersFS: Container[] = [
  {
    id: 'cnt_fs_1',
    name: 'fs-core-monolith',
    status: 'Running',
    cpu: '22.4%',
    memory: '2.4 GB / 8 GB',
    uptime: '31d 08h 12m',
    restartCount: 0,
    image: 'commerceops/fs-monolith:v3.1.2',
  },
  {
    id: 'cnt_fs_2',
    name: 'fs-inventory-sync',
    status: 'Running',
    cpu: '11.0%',
    memory: '640 MB / 2 GB',
    uptime: '14d 02h 45m',
    restartCount: 0,
    image: 'commerceops/fs-sync:v3.1.2',
  },
  {
    id: 'cnt_fs_3',
    name: 'fs-payment-orchestrator',
    status: 'Running',
    cpu: '15.8%',
    memory: '1.1 GB / 4 GB',
    uptime: '31d 08h 10m',
    restartCount: 0,
    image: 'commerceops/fs-payment:v3.1.2',
  },
];

const mockContainersNL: Container[] = [
  {
    id: 'cnt_nl_1',
    name: 'nl-storefront-ssr',
    status: 'Running',
    cpu: '19.5%',
    memory: '1.5 GB / 4 GB',
    uptime: '12d 14h 22m',
    restartCount: 0,
    image: 'commerceops/nl-ssr:v2.9.0',
  },
  {
    id: 'cnt_nl_2',
    name: 'nl-search-cluster',
    status: 'Running',
    cpu: '34.2%',
    memory: '3.1 GB / 6 GB',
    uptime: '12d 14h 20m',
    restartCount: 0,
    image: 'opensearch:2.11.0',
  },
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj_dh',
    name: 'Dynamic Home',
    code: 'DH',
    clientName: 'Dynamic Home Living Ltd.',
    clientDomain: 'store.dynamichome.io',
    backendVersion: '2.8.14', // B2.8.14
    dashboardVersion: '4.12.2', // D-4.12.2
    description: 'High-volume smart furniture & modern home decor eCommerce platform.',
    createdAt: '2025-01-15T08:00:00.000Z',
    deploymentInfo: {
      id: 'dep_dh_latest',
      status: 'Success',
      backendVersion: '2.8.14',
      dashboardVersion: '4.12.2',
      environment: 'Production',
      deployedAt: '2026-08-28T14:32:00.000Z',
      gitCommitHash: '8f3a92b',
      triggeredBy: 'Marcus Thorne',
      branch: 'main',
    },
    serverMetrics: {
      storageTotalGb: 500,
      storageUsedGb: 342,
      storageAvailableGb: 158,
      storageUsagePercent: 68.4,
      health: 'Healthy',
      cpuPercent: 32.5,
      memoryPercent: 54.8,
      uptimeString: '99.98% (42 days)',
      incomingNetworkMb: 142.8,
      outgoingNetworkMb: 894.2,
      networkHistory: [
        { time: '00:00', inMb: 45, outMb: 210 },
        { time: '04:00', inMb: 28, outMb: 140 },
        { time: '08:00', inMb: 95, outMb: 520 },
        { time: '12:00', inMb: 160, outMb: 940 },
        { time: '16:00', inMb: 185, outMb: 1120 },
        { time: '20:00', inMb: 130, outMb: 780 },
        { time: '23:59', inMb: 85, outMb: 490 },
      ],
    },
    containers: mockContainersDH,
  },
  {
    id: 'proj_fs',
    name: 'Fashion Store',
    code: 'FS',
    clientName: 'Velvet & Silk Apparel Co.',
    clientDomain: 'shop.fashionstore.global',
    backendVersion: '3.1.2', // B3.1.2
    dashboardVersion: '5.0.1', // D-5.0.1
    description: 'Omnichannel luxury apparel brand operating across EU and North America.',
    createdAt: '2025-03-20T10:00:00.000Z',
    deploymentInfo: {
      id: 'dep_fs_latest',
      status: 'Success',
      backendVersion: '3.1.2',
      dashboardVersion: '5.0.1',
      environment: 'Production',
      deployedAt: '2026-08-30T09:15:00.000Z',
      gitCommitHash: '4e1c77a',
      triggeredBy: 'David Kim',
      branch: 'release/v3.1',
    },
    serverMetrics: {
      storageTotalGb: 1000,
      storageUsedGb: 820,
      storageAvailableGb: 180,
      storageUsagePercent: 82.0,
      health: 'Warning',
      cpuPercent: 68.2,
      memoryPercent: 78.4,
      uptimeString: '99.91% (31 days)',
      incomingNetworkMb: 280.4,
      outgoingNetworkMb: 1480.0,
      networkHistory: [
        { time: '00:00', inMb: 90, outMb: 510 },
        { time: '04:00', inMb: 60, outMb: 320 },
        { time: '08:00', inMb: 180, outMb: 980 },
        { time: '12:00', inMb: 310, outMb: 1650 },
        { time: '16:00', inMb: 350, outMb: 1890 },
        { time: '20:00', inMb: 240, outMb: 1250 },
        { time: '23:59', inMb: 150, outMb: 760 },
      ],
    },
    containers: mockContainersFS,
  },
  {
    id: 'proj_nl',
    name: 'Nordic Lifestyle',
    code: 'NL',
    clientName: 'Nordic Minimalist Goods AB',
    clientDomain: 'nordiclifestyle.se',
    backendVersion: '2.9.0', // B2.9.0
    dashboardVersion: '4.15.0', // D-4.15.0
    description: 'Scandinavian minimalist lifestyle and sustainable goods marketplace.',
    createdAt: '2025-06-11T12:00:00.000Z',
    deploymentInfo: {
      id: 'dep_nl_latest',
      status: 'Success',
      backendVersion: '2.9.0',
      dashboardVersion: '4.15.0',
      environment: 'Production',
      deployedAt: '2026-08-25T17:40:00.000Z',
      gitCommitHash: '1a90cc5',
      triggeredBy: 'Elena Vance',
      branch: 'main',
    },
    serverMetrics: {
      storageTotalGb: 300,
      storageUsedGb: 110,
      storageAvailableGb: 190,
      storageUsagePercent: 36.6,
      health: 'Healthy',
      cpuPercent: 18.0,
      memoryPercent: 38.2,
      uptimeString: '99.99% (65 days)',
      incomingNetworkMb: 65.2,
      outgoingNetworkMb: 340.5,
      networkHistory: [
        { time: '00:00', inMb: 15, outMb: 90 },
        { time: '04:00', inMb: 10, outMb: 60 },
        { time: '08:00', inMb: 45, outMb: 280 },
        { time: '12:00', inMb: 85, outMb: 420 },
        { time: '16:00', inMb: 90, outMb: 480 },
        { time: '20:00', inMb: 60, outMb: 310 },
        { time: '23:59', inMb: 30, outMb: 140 },
      ],
    },
    containers: mockContainersNL,
  },
];

export const MOCK_ISSUES: Issue[] = [
  {
    id: 'DH-024',
    projectId: 'proj_dh',
    title: 'Checkout button not working on mobile Safari during Apple Pay flow',
    description: `### Issue Summary
When shoppers attempt to complete a purchase on iOS Mobile Safari using the integrated Apple Pay sheet, the primary "Complete Order" trigger fails to dispatch the tokenized payload to the payment gateway.

### Steps to Reproduce
1. Open \`https://store.dynamichome.io/cart\` on an iPhone 14/15 running iOS 17+.
2. Add any item valued over $50 to cart.
3. Tap **Express Apple Pay**.
4. Pass FaceID authentication on device.
5. Notice the order confirmation spinner hangs at \`99%\` and the token resolution promise rejects with timeout.

### Root Cause Analysis
The payload serialization in \`ApplePayBridge.ts\` expects synchronous response token within 1500ms, while the v2.8.14 backend webhook requires 2200ms to verify inventory lock.

\`\`\`typescript
// Current problematic timeout
const tokenExchangeTimeout = setTimeout(() => {
  reject(new Error("GATEWAY_PAYLOAD_TIMEOUT"));
}, 1500);
\`\`\`

### Expected Behavior
The checkout handshake should maintain a 5000ms grace window with proactive polling status before emitting fallback payment instructions.`,
    status: 'In Progress',
    priority: 'Critical',
    createdBy: MOCK_USERS[3], // Sofia Lin
    assignee: MOCK_USERS[1], // Marcus Thorne
    createdAt: '2026-08-30T10:14:00.000Z',
    updatedAt: '2026-08-31T06:45:00.000Z',
    labels: ['checkout', 'mobile-safari', 'apple-pay', 'payments-v2'],
    attachments: [
      {
        id: 'att_1',
        name: 'safari_console_error_log.txt',
        size: 14520,
        type: 'text/plain',
        url: '#',
        uploadedBy: MOCK_USERS[3],
        uploadedAt: '2026-08-30T10:18:00.000Z',
      },
      {
        id: 'att_2',
        name: 'apple_pay_hanging_state.png',
        size: 482900,
        type: 'image/png',
        url: 'https://images.unsplash.com/photo-1556742049-0a67e5577ff0?w=600&auto=format&fit=crop&q=80',
        uploadedBy: MOCK_USERS[3],
        uploadedAt: '2026-08-30T10:19:00.000Z',
      },
    ],
    comments: [
      {
        id: 'comm_1',
        issueId: 'DH-024',
        author: MOCK_USERS[1], // Marcus Thorne
        content:
          'Reproduced locally on iOS simulator with WebKit debug proxy. I have drafted a hotfix PR that expands the promise timeout to 5000ms and adds idempotency keys to the backend handshake.',
        createdAt: '2026-08-30T14:22:00.000Z',
      },
      {
        id: 'comm_2',
        issueId: 'DH-024',
        author: MOCK_USERS[0], // Elena Vance
        content:
          'Approved for priority cherry-pick. Ensure we stage on Canary and verify with real Apple Sandbox credentials before promoting to Production.',
        createdAt: '2026-08-30T16:05:00.000Z',
      },
    ],
  },
  {
    id: 'DH-023',
    projectId: 'proj_dh',
    title: 'Webhook retry backoff storm on Stripe invoice failure',
    description: `### Summary
During transient Stripe 500 errors, our \`dh-webhook-broker\` received 400+ retries per minute without exponential jitter, which degraded container memory usage to 85%.

### Proposed Remediation
- Implement Redis-backed token bucket rate limiter.
- Enforce strict exponential backoff (initial delay 5s, max delay 3600s).`,
    status: 'Open',
    priority: 'High',
    createdBy: MOCK_USERS[2], // David Kim
    assignee: MOCK_USERS[1], // Marcus Thorne
    createdAt: '2026-08-29T11:20:00.000Z',
    updatedAt: '2026-08-30T08:15:00.000Z',
    labels: ['stripe', 'webhooks', 'infrastructure', 'reliability'],
    attachments: [
      {
        id: 'att_3',
        name: 'broker_memory_spike_metric.csv',
        size: 56200,
        type: 'text/csv',
        url: '#',
        uploadedBy: MOCK_USERS[2],
        uploadedAt: '2026-08-29T11:25:00.000Z',
      },
    ],
    comments: [
      {
        id: 'comm_3',
        issueId: 'DH-023',
        author: MOCK_USERS[1],
        content: 'I have added the Redis-backed jitter implementation to our staging branch.',
        createdAt: '2026-08-29T17:40:00.000Z',
      },
    ],
  },
  {
    id: 'DH-022',
    projectId: 'proj_dh',
    title: 'Cart inventory decrement race condition during flash sale events',
    description: `### Overview
Concurrent inventory locks for items with less than 5 units in stock caused double-allocations when multiple users checked out in the same millisecond bucket.

### Resolution Plan
Migrate inventory reservation to Lua script execution inside Redis cluster with atomic decrement and TTL lease.`,
    status: 'Resolved',
    priority: 'High',
    createdBy: MOCK_USERS[3], // Sofia Lin
    assignee: MOCK_USERS[2], // David Kim
    createdAt: '2026-08-27T09:00:00.000Z',
    updatedAt: '2026-08-29T16:30:00.000Z',
    labels: ['inventory', 'redis-lua', 'flash-sale', 'concurrency'],
    attachments: [],
    comments: [
      {
        id: 'comm_4',
        issueId: 'DH-022',
        author: MOCK_USERS[2],
        content: 'Deployed Lua atomicity script. Benchmarked with 10k concurrent simulated checkout requests with 0 overselling.',
        createdAt: '2026-08-29T16:28:00.000Z',
      },
    ],
  },
  {
    id: 'DH-021',
    projectId: 'proj_dh',
    title: 'Customer tax calculation mismatch for Canadian GST/PST provinces',
    description: 'Avalara tax plugin returns 0% tax rate for British Columbia postal codes starting with V6B. Need to re-map regional tax code lookup table.',
    status: 'Waiting for Client',
    priority: 'Medium',
    createdBy: MOCK_USERS[4], // Liam Gallagher
    assignee: MOCK_USERS[3], // Sofia Lin
    createdAt: '2026-08-26T14:45:00.000Z',
    updatedAt: '2026-08-28T11:10:00.000Z',
    labels: ['taxes', 'avalara', 'canada-regions', 'finance'],
    attachments: [],
    comments: [
      {
        id: 'comm_5',
        issueId: 'DH-021',
        author: MOCK_USERS[3],
        content: 'Awaiting confirmation from client accounting team on specific nexus registration numbers.',
        createdAt: '2026-08-28T11:05:00.000Z',
      },
    ],
  },
  {
    id: 'DH-020',
    projectId: 'proj_dh',
    title: 'Automated abandoned cart email sequence triggering twice for guest users',
    description: 'Klaviyo synchronization webhook emits two distinct events for guest checkouts: one on email blur and one on shipping form submit.',
    status: 'Closed',
    priority: 'Low',
    createdBy: MOCK_USERS[3],
    assignee: MOCK_USERS[2],
    createdAt: '2026-08-22T08:30:00.000Z',
    updatedAt: '2026-08-24T15:00:00.000Z',
    labels: ['marketing', 'klaviyo', 'guest-checkout', 'email'],
    attachments: [],
    comments: [],
  },
  {
    id: 'FS-018',
    projectId: 'proj_fs',
    title: 'Multi-currency EUR conversion rounding error on variant price matrix',
    description: 'When switching from USD base price to EUR on high-end cashmere apparel, pennies round down inconsistently creating a 0.01 discrepancy with tax invoices.',
    status: 'In Progress',
    priority: 'High',
    createdBy: MOCK_USERS[0],
    assignee: MOCK_USERS[2],
    createdAt: '2026-08-30T11:00:00.000Z',
    updatedAt: '2026-08-31T05:20:00.000Z',
    labels: ['currency', 'fx-rates', 'pricing-engine', 'luxury-store'],
    attachments: [],
    comments: [],
  },
  {
    id: 'FS-017',
    projectId: 'proj_fs',
    title: 'High storage utilization warning on product catalog CDN cache layer',
    description: 'Image cache exceeded 800GB on primary node. Need to run automated purge script for discontinued seasonal collection assets.',
    status: 'Open',
    priority: 'Critical',
    createdBy: MOCK_USERS[1],
    assignee: MOCK_USERS[1],
    createdAt: '2026-08-29T16:15:00.000Z',
    updatedAt: '2026-08-30T07:45:00.000Z',
    labels: ['storage', 'cdn', 'images', 'cleanup-cron'],
    attachments: [],
    comments: [],
  },
  {
    id: 'NL-009',
    projectId: 'proj_nl',
    title: 'Nordic BankID integration authentication timeout for Swish payments',
    description: 'Swedish customers using BankID app report handshake timing out when switching apps on Android 14.',
    status: 'Open',
    priority: 'High',
    createdBy: MOCK_USERS[3],
    assignee: MOCK_USERS[1],
    createdAt: '2026-08-28T13:20:00.000Z',
    updatedAt: '2026-08-29T10:00:00.000Z',
    labels: ['bankid', 'sweden', 'payments', 'mobile-app'],
    attachments: [],
    comments: [],
  },
];

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 'act_1',
    issueId: 'DH-024',
    projectId: 'proj_dh',
    user: MOCK_USERS[1], // Marcus Thorne
    action: 'Status changed to In Progress',
    timestamp: '2026-08-31T06:45:00.000Z',
    type: 'status_change',
    details: 'Changed from Open to In Progress',
  },
  {
    id: 'act_2',
    issueId: 'DH-024',
    projectId: 'proj_dh',
    user: MOCK_USERS[0], // Elena Vance
    action: 'Comment added',
    timestamp: '2026-08-30T16:05:00.000Z',
    type: 'comment',
    details: 'Approved for priority cherry-pick on Canary environment.',
  },
  {
    id: 'act_3',
    issueId: 'DH-024',
    projectId: 'proj_dh',
    user: MOCK_USERS[1], // Marcus Thorne
    action: 'Assigned to developer',
    timestamp: '2026-08-30T12:30:00.000Z',
    type: 'assigned',
    details: 'Assigned to Marcus Thorne',
  },
  {
    id: 'act_4',
    issueId: 'DH-024',
    projectId: 'proj_dh',
    user: MOCK_USERS[3], // Sofia Lin
    action: 'Attachment uploaded',
    timestamp: '2026-08-30T10:19:00.000Z',
    type: 'attachment',
    details: 'Uploaded apple_pay_hanging_state.png',
  },
  {
    id: 'act_5',
    issueId: 'DH-024',
    projectId: 'proj_dh',
    user: MOCK_USERS[3], // Sofia Lin
    action: 'Issue created',
    timestamp: '2026-08-30T10:14:00.000Z',
    type: 'created',
    details: 'Created issue DH-024 with Critical priority',
  },
  {
    id: 'act_6',
    projectId: 'proj_dh',
    user: MOCK_USERS[1],
    action: 'Deployment triggered',
    timestamp: '2026-08-28T14:32:00.000Z',
    type: 'deploy',
    details: 'Triggered Production deployment B2.8.14 / D-4.12.2',
  },
  {
    id: 'act_7',
    projectId: 'proj_fs',
    user: MOCK_USERS[2],
    action: 'Version updated',
    timestamp: '2026-08-30T09:15:00.000Z',
    type: 'version_update',
    details: 'Updated backend version to B3.1.2',
  },
];

export const MOCK_SUPPORT_REQUESTS: SupportRequest[] = [
  {
    id: 'SUP-104',
    subject: 'Urgent custom domain SSL certificate renewal for Black Friday campaign subdomains',
    description: `We have provisioned three campaign subdomains (\`flash.dynamichome.io\`, \`vip.dynamichome.io\`, \`preview.dynamichome.io\`).
    
Let's Encrypt auto-renewal failed due to CAA record restriction at Cloudflare DNS. Please review our DNS verification tokens and force validation.`,
    category: 'Domain',
    priority: 'Critical',
    status: 'In Progress',
    requestedBy: MOCK_USERS[3], // Sofia Lin
    createdAt: '2026-08-30T15:30:00.000Z',
    updatedAt: '2026-08-31T07:10:00.000Z',
    attachments: [
      {
        id: 'att_sup_1',
        name: 'dns_caa_record_export.json',
        size: 3410,
        type: 'application/json',
        url: '#',
        uploadedBy: MOCK_USERS[3],
        uploadedAt: '2026-08-30T15:35:00.000Z',
      },
    ],
    comments: [
      {
        id: 'comm_sup_1',
        issueId: 'SUP-104',
        author: MOCK_USERS[0],
        content: 'Cloudflare CAA record updated to allow letsencrypt.org. Re-running SSL handshake verification.',
        createdAt: '2026-08-31T07:05:00.000Z',
      },
    ],
    activities: [
      {
        id: 'act_sup_1',
        supportRequestId: 'SUP-104',
        user: MOCK_USERS[0],
        action: 'Status changed to In Progress',
        timestamp: '2026-08-31T07:10:00.000Z',
        type: 'status_change',
      },
      {
        id: 'act_sup_2',
        supportRequestId: 'SUP-104',
        user: MOCK_USERS[3],
        action: 'Request created',
        timestamp: '2026-08-30T15:30:00.000Z',
        type: 'created',
      },
    ],
  },
  {
    id: 'SUP-103',
    subject: 'Requesting staging database dump anonymization for external QA penetration test',
    description: 'External security auditors require sanitized database replica with PII masked for compliance audit commencing next Monday.',
    category: 'Technical',
    priority: 'High',
    status: 'Open',
    requestedBy: MOCK_USERS[4], // Liam Gallagher
    createdAt: '2026-08-29T14:00:00.000Z',
    updatedAt: '2026-08-29T14:00:00.000Z',
    attachments: [],
    activities: [
      {
        id: 'act_sup_3',
        supportRequestId: 'SUP-103',
        user: MOCK_USERS[4],
        action: 'Request created',
        timestamp: '2026-08-29T14:00:00.000Z',
        type: 'created',
      },
    ],
  },
  {
    id: 'SUP-102',
    subject: 'Monthly server resource tier upgrade from 8 vCPU to 16 vCPU for Fashion Store peak',
    description: 'Anticipated traffic surge during upcoming Fashion Week. Client approved infrastructure invoice addendum.',
    category: 'Server',
    priority: 'Medium',
    status: 'Resolved',
    requestedBy: MOCK_USERS[3],
    createdAt: '2026-08-25T10:00:00.000Z',
    updatedAt: '2026-08-26T16:00:00.000Z',
    attachments: [],
    activities: [
      {
        id: 'act_sup_4',
        supportRequestId: 'SUP-102',
        user: MOCK_USERS[0],
        action: 'Status changed to Resolved',
        timestamp: '2026-08-26T16:00:00.000Z',
        type: 'status_change',
      },
    ],
  },
  {
    id: 'SUP-101',
    subject: 'Invoice tax breakdown dispute for July cloud infrastructure compute charges',
    description: 'Client finance inquiries regarding outbound bandwidth breakdown for auxiliary CDN media storage.',
    category: 'Billing',
    priority: 'Low',
    status: 'Closed',
    requestedBy: MOCK_USERS[4],
    createdAt: '2026-08-15T09:30:00.000Z',
    updatedAt: '2026-08-18T11:45:00.000Z',
    attachments: [],
    activities: [],
  },
];

export const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log_1',
    timestamp: '2026-08-31T06:14:00.000Z',
    user: MOCK_USERS[0],
    action: 'SECURITY_2FA_ENFORCED',
    details: 'Global two-factor authentication mandate verified for all active personnel',
    ipAddress: '194.207.82.14',
  },
  {
    id: 'log_2',
    timestamp: '2026-08-30T14:22:10.000Z',
    user: MOCK_USERS[1],
    action: 'DEPLOYMENT_TRIGGERED',
    details: 'Production release B2.8.14 / D-4.12.2 deployed successfully to proj_1',
    ipAddress: '194.207.82.14',
  },
  {
    id: 'log_3',
    timestamp: '2026-08-29T11:05:45.000Z',
    user: MOCK_USERS[0],
    action: 'ROLE_PERMISSION_UPDATED',
    details: 'Updated Marcus Thorne access rights to Operations Admin suite',
    ipAddress: '194.207.82.14',
  },
  {
    id: 'log_4',
    timestamp: '2026-08-28T09:40:00.000Z',
    user: MOCK_USERS[2],
    action: 'CONTAINER_RESTARTED',
    details: 'Restarted pod commerce-payment-adapter-7b6c5 due to memory threshold',
    ipAddress: '84.203.11.90',
  },
];

