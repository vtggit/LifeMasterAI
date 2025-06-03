import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  ShoppingCart, 
  MoreHorizontal, 
  Check, 
  X, 
  AlertCircle,
  RefreshCw,
  Settings2
} from "lucide-react";
import { storesApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Store, StoreType, STORE_CHAINS } from "@/types/stores";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface EditStoreConfigProps {
  store: Store;
  onClose: () => void;
  onSave: (config: Partial<Store>) => void;
  onTest?: () => Promise<boolean>;
}

function EditStoreConfig({ store, onClose, onSave, onTest }: EditStoreConfigProps) {
  const [config, setConfig] = useState({
    type: store.type || 'other' as StoreType,
    url: store.url || '',
    apiKey: store.config?.apiKey || '',
    zipCode: store.config?.defaultLocation?.zipCode || '',
    storeId: store.config?.defaultLocation?.storeId || ''
  });

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const storeChain = STORE_CHAINS[config.type];
  const requiresApi = storeChain.requiresApi;
  const requiresLocation = storeChain.requiresLocation;

  const handleSave = () => {
    onSave({
      ...store,
      type: config.type,
      url: config.url || undefined,
      config: {
        apiKey: config.apiKey || undefined,
        defaultLocation: requiresLocation ? {
          zipCode: config.zipCode,
          storeId: config.storeId || undefined
        } : undefined
      }
    });
    onClose();
  };

  const handleTest = async () => {
    if (!onTest) return;
    
    setTesting(true);
    setTestResult(null);
    
    try {
      const success = await onTest();
      setTestResult(success ? 'success' : 'error');
    } catch {
      setTestResult('error');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[600px] max-w-[90vw]">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-medium">Store Configuration - {store.name}</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-4">
          <div className="space-y-4">
            <div>
              <Label>Store Chain</Label>
              <Select 
                value={config.type} 
                onValueChange={(value: StoreType) => setConfig({ ...config, type: value })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select store chain" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STORE_CHAINS).map(([type, chain]) => (
                    <SelectItem key={type} value={type}>
                      {chain.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {config.type !== 'other' && (
              <div className="rounded-md bg-blue-50 p-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      {storeChain.name} Configuration
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <ul className="list-disc space-y-1 pl-5">
                        {requiresApi && (
                          <li>Requires API key for deal fetching</li>
                        )}
                        {requiresLocation && (
                          <li>Requires store location for accurate deals</li>
                        )}
                        {storeChain.affiliates?.length && (
                          <li>Part of {STORE_CHAINS[storeChain.affiliates[0]].name} family of stores</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {requiresApi && (
              <div>
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  placeholder="Enter store API key"
                  className="mt-1.5"
                  type="password"
                />
                <p className="text-sm text-gray-500 mt-1.5">
                  Required for fetching deals from {storeChain.name}
                </p>
              </div>
            )}

            {requiresLocation && (
              <>
                <div>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={config.zipCode}
                    onChange={(e) => setConfig({ ...config, zipCode: e.target.value })}
                    placeholder="Enter ZIP code"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="storeId">Store ID (Optional)</Label>
                  <Input
                    id="storeId"
                    value={config.storeId}
                    onChange={(e) => setConfig({ ...config, storeId: e.target.value })}
                    placeholder="Enter specific store ID"
                    className="mt-1.5"
                  />
                  <p className="text-sm text-gray-500 mt-1.5">
                    If not provided, we'll use the nearest store
                  </p>
                </div>
              </>
            )}

            {config.type === 'other' && (
              <div>
                <Label htmlFor="storeUrl">Store Website URL</Label>
                <Input
                  id="storeUrl"
                  value={config.url}
                  onChange={(e) => setConfig({ ...config, url: e.target.value })}
                  placeholder="Enter store website URL"
                  className="mt-1.5"
                />
                <p className="text-sm text-gray-500 mt-1.5">
                  Enter the URL of the store's website or weekly ad page
                </p>
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              {onTest && (
                <Button 
                  variant="outline" 
                  onClick={handleTest}
                  disabled={testing}
                >
                  {testing ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : testResult === 'success' ? (
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                  ) : testResult === 'error' ? (
                    <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                  ) : null}
                  Test Connection
                </Button>
              )}
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface GroceryStoresProps {
  userId: number;
}

export default function GroceryStores({ userId }: GroceryStoresProps) {
  const { toast } = useToast();
  // Store state with enhanced type information
  const [storeList, setStoreList] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load stores on component mount
  useEffect(() => {
    loadStores();
  }, [userId]);

  async function loadStores() {
    try {
      setLoading(true);
      setError(null);
      const stores = await storesApi.getStores(userId);
      setStoreList(stores);
    } catch (err) {
      console.error('Error loading stores:', err);
      setError('Failed to load stores');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load stores"
      });
    } finally {
      setLoading(false);
    }
  }
  
  // Add store form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [storeType, setStoreType] = useState<StoreType>('other');
  
  // Edit config modal state
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  
  // Store management functions
  async function addStore() {
    if (storeName.trim()) {
      try {
        const newStore = await storesApi.addStore(userId, {
          userId,
          name: storeName.trim(),
          type: storeType,
          isDefault: storeList.length === 0,
          status: 'active',
          config: {
            defaultLocation: {
              zipCode: '',
              storeId: ''
            }
          }
        });
        
        setStoreList([...storeList, newStore]);
        setStoreName("");
        setStoreType('other');
        setShowAddForm(false);
        
        toast({
          title: "Store Added",
          description: `${newStore.name} has been added successfully`
        });
      } catch (err) {
        console.error('Error adding store:', err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to add store"
        });
      }
    }
  }
  
  async function setDefaultStore(id: number) {
    try {
      await storesApi.updateStore(userId, id, { isDefault: true });
      setStoreList(storeList.map(store => ({
        ...store,
        isDefault: store.id === id
      })));
      
      const store = storeList.find(s => s.id === id);
      toast({
        title: "Default Store Updated",
        description: `${store?.name} is now your default store`
      });
    } catch (err) {
      console.error('Error setting default store:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to set default store"
      });
    }
  }
  
  async function deleteStore(id: number) {
    try {
      const store = storeList.find(s => s.id === id);
      await storesApi.deleteStore(userId, id);
      setStoreList(storeList.filter(store => store.id !== id));
      
      toast({
        title: "Store Deleted",
        description: `${store?.name} has been deleted`
      });
    } catch (err) {
      console.error('Error deleting store:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete store"
      });
    }
  }

  async function updateStore(storeId: number, updates: Partial<Store>) {
    try {
      const updatedStore = await storesApi.updateStore(userId, storeId, updates);
      setStoreList(storeList.map(store => 
        store.id === storeId ? updatedStore : store
      ));
      
      toast({
        title: "Store Updated",
        description: `${updatedStore.name} has been updated`
      });
    } catch (err) {
      console.error('Error updating store:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update store"
      });
    }
  }

  async function testStoreConnection(store: Store): Promise<boolean> {
    try {
      const success = await storesApi.testConnection(userId, store.id);
      
      toast({
        variant: success ? "default" : "destructive",
        title: success ? "Connection Successful" : "Connection Failed",
        description: success 
          ? `Successfully connected to ${store.name}`
          : `Failed to connect to ${store.name}`
      });
      
      return success;
    } catch (err) {
      console.error('Error testing store connection:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to test connection to ${store.name}`
      });
      return false;
    }
  }

  async function syncDeals(storeId: number) {
    try {
      const store = storeList.find(s => s.id === storeId);
      const result = await storesApi.syncDeals(userId, storeId);
      
      if (result.success) {
        // Refresh store list to get updated sync status
        await loadStores();
        
        toast({
          title: "Deals Synced",
          description: `Successfully synced ${result.dealsCount} deals from ${store?.name}`
        });
      }
    } catch (err) {
      console.error('Error syncing deals:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sync deals"
      });
    }
  }

  return (
    <Card className="bg-white rounded-lg border border-gray-100 overflow-hidden">
      <CardHeader className="px-4 py-3 border-b border-gray-100">
        <h3 className="font-medium">Grocery Stores</h3>
      </CardHeader>
      <CardContent className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
            <p className="text-gray-600">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => loadStores()}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {storeList.map((store) => (
            <div 
              key={store.id}
              className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="text-red-600" size={20} />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium">{store.name}</h4>
                    {store.isDefault && (
                      <Badge variant="outline" className="text-xs">Default</Badge>
                    )}
                    {store.status === 'error' && (
                      <Tooltip>
                        <TooltipTrigger>
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{store.errorMessage || 'Connection error'}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {STORE_CHAINS[store.type].name}
                    </Badge>
                    {store.lastSync && (
                      <span className="text-xs text-gray-500">
                        Last synced: {new Date(store.lastSync).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => syncDeals(store.id)}
                >
                  <RefreshCw size={16} />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Store Options</DropdownMenuLabel>
                    {!store.isDefault && (
                      <DropdownMenuItem onClick={() => setDefaultStore(store.id)}>
                        <Check className="h-4 w-4 mr-2" />
                        Set as default
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => setSelectedStore(store)}>
                      <Settings2 className="h-4 w-4 mr-2" />
                      Configure Store
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => deleteStore(store.id)}
                      className="text-red-600"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
          
          {/* Add Store Form */}
          {showAddForm ? (
            <div className="mt-4 border border-gray-200 rounded-md p-4">
              <h4 className="text-sm font-medium mb-3">Add New Store</h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input 
                    id="storeName"
                    placeholder="Store name" 
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label>Store Chain</Label>
                  <Select 
                    value={storeType} 
                    onValueChange={(value: StoreType) => setStoreType(value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select store chain" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STORE_CHAINS).map(([type, chain]) => (
                        <SelectItem key={type} value={type}>
                          {chain.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end space-x-2 mt-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowAddForm(false);
                      setStoreName("");
                      setStoreType('other');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={addStore} 
                    disabled={!storeName.trim()}
                  >
                    Add Store
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Button 
              variant="ghost" 
              className="flex items-center space-x-2 text-primary text-sm font-medium mt-4 p-0 h-auto"
              onClick={() => setShowAddForm(true)}
            >
              <Plus size={14} />
              <span>Add store</span>
            </Button>
          )}
          </div>
        )}
      </CardContent>

      {/* Edit Store Config Modal */}
      {selectedStore && (
        <EditStoreConfig
          store={selectedStore}
          onClose={() => setSelectedStore(null)}
          onSave={(updates) => {
            updateStore(selectedStore.id, updates);
            setSelectedStore(null);
          }}
          onTest={() => testStoreConnection(selectedStore)}
        />
      )}
    </Card>
  );
}
