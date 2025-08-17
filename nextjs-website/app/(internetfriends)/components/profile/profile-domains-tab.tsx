import { Badge } from "@/components/ui/badge";
import { GlassBadge } from "@/components/ui/glass-badge";
import { cardCss } from "./profile-card";

const ProfileDomainsTab = () => {
  const mockDomains = [
    {
      id: 1,
      domain: "crypto-ai.com",
      tld: ".com",
      type: "domain",
      purchaseDate: "2025-01-15",
      purchasePrice: 480,
      status: "active",
      autoRenew: true,
      expirationDate: "2026-01-15",
      category: "AI & Technology"
    },
    {
      id: 2,
      domain: "my-nft-store.xyz",
      tld: ".xyz",
      type: "domain",
      purchaseDate: "2025-01-10",
      purchasePrice: 320,
      status: "active",
      autoRenew: false,
      expirationDate: "2026-01-10",
      category: "E-commerce"
    },
    {
      id: 3,
      domain: "web3-startup.dev",
      tld: ".dev",
      type: "domain",
      purchaseDate: "2024-12-20",
      purchasePrice: 240,
      status: "active",
      autoRenew: true,
      expirationDate: "2025-12-20",
      category: "Development"
    }
  ];

  const mockUsernames = [
    {
      id: 4,
      username: "crypto_trader",
      fullHandle: "crypto_trader.grutiks.com",
      type: "username",
      tier: "premium",
      subscriptionDate: "2025-01-12",
      monthlyPrice: 400,
      status: "active",
      nextBilling: "2025-02-12",
      features: ["verified_badge", "priority_support"]
    },
    {
      id: 5,
      username: "nft_artist",
      fullHandle: "nft_artist.grutiks.com", 
      type: "username",
      tier: "basic",
      subscriptionDate: "2025-01-08",
      monthlyPrice: 200,
      status: "active",
      nextBilling: "2025-02-08",
      features: ["custom_profile", "analytics"]
    }
  ];

  const allAssets = [...mockDomains, ...mockUsernames];
  const totalDomainsValue = mockDomains.reduce((sum, domain) => sum + domain.purchasePrice, 0);
  const totalUsernamesValue = mockUsernames.reduce((sum, username) => sum + username.monthlyPrice, 0);
  const activeDomains = mockDomains.filter(d => d.status === 'active').length;
  const activeUsernames = mockUsernames.filter(u => u.status === 'active').length;

  return (
    <div className="flex flex-col gap-4">
      {/* Portfolio Summary */}
      <div className={cardCss}>
        <div className="flex flex-row flex-wrap justify-between items-center mb-4">
          <p className="font-medium text-lg">🌐 Digital Identity Portfolio</p>
          <a 
            href="/domain" 
            className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
          >
            Browse Identity Marketplace
          </a>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="font-bold text-2xl text-green-600">{activeDomains}</div>
            <div className="text-sm text-gray-600">Active Domains</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-2xl text-purple-600">{activeUsernames}</div>
            <div className="text-sm text-gray-600">Username Subs</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-2xl text-blue-600">{totalDomainsValue}</div>
            <div className="text-sm text-gray-600">G&apos;s in Domains</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-2xl text-orange-600">{totalUsernamesValue}</div>
            <div className="text-sm text-gray-600">G&apos;s/month</div>
          </div>
        </div>
      </div>

      {/* Asset List */}
      <div className={cardCss}>
        <p className="font-medium mb-4">My Digital Assets</p>
        <div className="space-y-3">
          {allAssets.map((asset) => (
            <div key={asset.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              {'domain' in asset ? (
                // Domain Asset
                <div className="flex flex-row flex-wrap justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-lg font-semibold text-blue-600">{asset.domain}</h4>
                      <GlassBadge variant="default">{asset.tld}</GlassBadge>
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        DOMAIN
                      </Badge>
                      <Badge className={`text-xs ${asset.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {asset.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Category: <span className="font-medium">{asset.category}</span></div>
                      <div>Purchased: <span className="font-medium">{asset.purchaseDate}</span> for <span className="font-medium text-green-600">{asset.purchasePrice} G&apos;s</span></div>
                      <div>Expires: <span className="font-medium">{asset.expirationDate}</span></div>
                      <div>Auto-renew: <span className={`font-medium ${asset.autoRenew ? 'text-green-600' : 'text-orange-600'}`}>
                        {asset.autoRenew ? 'Enabled' : 'Disabled'}
                      </span></div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 mt-2 md:mt-0">
                    <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors">
                      Manage DNS
                    </button>
                    <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors">
                      Transfer
                    </button>
                  </div>
                </div>
              ) : (
                // Username Asset
                <div className="flex flex-row flex-wrap justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-lg font-semibold text-purple-600">@{asset.username}</h4>
                      <GlassBadge variant="default">.grutiks.com</GlassBadge>
                      <Badge className="bg-purple-100 text-purple-800 text-xs">
                        USERNAME
                      </Badge>
                      <Badge className={`text-xs ${
                        asset.tier === 'verified' ? 'bg-blue-100 text-blue-800' :
                        asset.tier === 'premium' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {asset.tier === 'verified' && '🔵 '}
                        {asset.tier === 'premium' && '👑 '}
                        {asset.tier.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Handle: <span className="font-medium">{asset.fullHandle}</span></div>
                      <div>Subscribed: <span className="font-medium">{asset.subscriptionDate}</span> at <span className="font-medium text-purple-600">{asset.monthlyPrice} G&apos;s/month</span></div>
                      <div>Next billing: <span className="font-medium">{asset.nextBilling}</span></div>
                      <div>Features: <span className="font-medium">{asset.features.join(', ')}</span></div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 mt-2 md:mt-0">
                    <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors">
                      Edit Profile
                    </button>
                    <button className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200 transition-colors">
                      Billing
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Domain Categories */}
      <div className={cardCss}>
        <p className="font-medium mb-4">Domain Categories</p>
        <div className="flex flex-wrap gap-2">
          {Array.from(new Set(mockDomains.map(d => d.category))).map((category) => (
            <GlassBadge key={category} variant="default">
              {category} ({mockDomains.filter(d => d.category === category).length})
            </GlassBadge>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className={cardCss}>
        <p className="font-medium mb-4">Quick Actions</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <a 
            href="/domain" 
            className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center hover:bg-blue-100 transition-colors"
          >
            <div className="text-blue-600 font-medium">🔍 Search Domains</div>
            <div className="text-xs text-gray-600">Find new domains</div>
          </a>
          <button className="p-3 bg-green-50 border border-green-200 rounded-lg text-center hover:bg-green-100 transition-colors">
            <div className="text-green-600 font-medium">🔄 Bulk Renew</div>
            <div className="text-xs text-gray-600">Renew multiple</div>
          </button>
          <button className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-center hover:bg-purple-100 transition-colors">
            <div className="text-purple-600 font-medium">📊 Analytics</div>
            <div className="text-xs text-gray-600">Domain performance</div>
          </button>
          <button className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-center hover:bg-orange-100 transition-colors">
            <div className="text-orange-600 font-medium">⚙️ Settings</div>
            <div className="text-xs text-gray-600">Manage preferences</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export { ProfileDomainsTab };

export default ProfileDomainsTab;