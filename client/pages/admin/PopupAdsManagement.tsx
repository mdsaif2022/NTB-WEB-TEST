import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Megaphone,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { Helmet } from 'react-helmet-async';

interface PopupAd {
  id: number;
  title: string;
  description: string;
  image?: string;
  buttonText: string;
  buttonLink: string;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  position: 'center' | 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size: 'small' | 'medium' | 'large';
  showDelay: number;
  autoClose: boolean;
  autoCloseDelay: number;
  maxShows: number;
  isActive: boolean;
  targetAudience: 'all' | 'new' | 'returning' | 'verified';
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

const initialPopupAds: PopupAd[] = [
  {
    id: 1,
    title: "🎉 Special Tour Offer!",
    description: "Discover the beauty of Bangladesh with our amazing tour packages. Book now and get special discounts!",
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop",
    buttonText: "Explore Tours",
    buttonLink: "/tours",
    backgroundColor: "#10b981",
    textColor: "#ffffff",
    buttonColor: "#ffffff",
    buttonTextColor: "#10b981",
    position: "center",
    size: "medium",
    showDelay: 2,
    autoClose: true,
    autoCloseDelay: 8,
    maxShows: 1,
    isActive: true,
    targetAudience: "all",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    title: "📱 Download Our App",
    description: "Get exclusive deals and easier booking with our mobile app!",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop",
    buttonText: "Download",
    buttonLink: "/app-download",
    backgroundColor: "#3b82f6",
    textColor: "#ffffff",
    buttonColor: "#ffffff",
    buttonTextColor: "#3b82f6",
    position: "bottom-right",
    size: "small",
    showDelay: 5,
    autoClose: false,
    autoCloseDelay: 0,
    maxShows: 1,
    isActive: true,
    targetAudience: "verified",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

export default function PopupAdsManagement() {
  const { isAdmin } = useUser();
  const navigate = useNavigate();
  const [popupAds, setPopupAds] = useState<PopupAd[]>(initialPopupAds);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAd, setEditingAd] = useState<PopupAd | null>(null);
  const [formData, setFormData] = useState<Partial<PopupAd>>({
    title: '',
    description: '',
    buttonText: 'Learn More',
    buttonLink: '/',
    backgroundColor: '#10b981',
    textColor: '#ffffff',
    buttonColor: '#ffffff',
    buttonTextColor: '#10b981',
    position: 'center',
    size: 'medium',
    showDelay: 2,
    autoClose: true,
    autoCloseDelay: 8,
    maxShows: 1,
    isActive: true,
    targetAudience: 'all',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate('/auth');
    }
  }, [isAdmin, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (editingAd) {
      // Update existing ad
      const updatedAds = popupAds.map(ad => 
        ad.id === editingAd.id 
          ? { ...ad, ...formData, updatedAt: new Date().toISOString() }
          : ad
      );
      setPopupAds(updatedAds);
      setEditingAd(null);
    } else {
      // Add new ad
      const newAd: PopupAd = {
        id: Math.max(...popupAds.map(ad => ad.id)) + 1,
        ...formData as PopupAd,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setPopupAds([...popupAds, newAd]);
    }

    setFormData({
      title: '',
      description: '',
      buttonText: 'Learn More',
      buttonLink: '/',
      backgroundColor: '#10b981',
      textColor: '#ffffff',
      buttonColor: '#ffffff',
      buttonTextColor: '#10b981',
      position: 'center',
      size: 'medium',
      showDelay: 2,
      autoClose: true,
      autoCloseDelay: 8,
      maxShows: 1,
      isActive: true,
      targetAudience: 'all',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    setShowAddForm(false);
    setLoading(false);
  };

  const handleEdit = (ad: PopupAd) => {
    setEditingAd(ad);
    setFormData(ad);
    setShowAddForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this popup ad?')) {
      setPopupAds(popupAds.filter(ad => ad.id !== id));
    }
  };

  const toggleActive = (id: number) => {
    setPopupAds(popupAds.map(ad => 
      ad.id === id 
        ? { ...ad, isActive: !ad.isActive, updatedAt: new Date().toISOString() }
        : ad
    ));
  };

  const getStatusBadge = (ad: PopupAd) => {
    const now = new Date();
    const startDate = new Date(ad.startDate);
    const endDate = new Date(ad.endDate);

    if (!ad.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }

    if (now < startDate) {
      return <Badge variant="outline">Scheduled</Badge>;
    }

    if (now > endDate) {
      return <Badge variant="destructive">Expired</Badge>;
    }

    return <Badge variant="default">Active</Badge>;
  };

  return (
    <>
      <Helmet>
        <title>Popup Ads Management - Admin Panel</title>
      </Helmet>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Popup Ads Management</h1>
          <p className="text-gray-600 mt-2">
            Manage popup advertisements displayed to users
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Megaphone className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Ads</p>
                  <p className="text-2xl font-bold text-gray-900">{popupAds.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Ads</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {popupAds.filter(ad => ad.isActive).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Scheduled Ads</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {popupAds.filter(ad => {
                      const now = new Date();
                      const startDate = new Date(ad.startDate);
                      return ad.isActive && now < startDate;
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingAd ? 'Edit Popup Ad' : 'Add New Popup Ad'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter ad title"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="buttonText">Button Text</Label>
                    <Input
                      id="buttonText"
                      value={formData.buttonText}
                      onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                      placeholder="Learn More"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter ad description"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="buttonLink">Button Link</Label>
                    <Input
                      id="buttonLink"
                      value={formData.buttonLink}
                      onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                      placeholder="/tours"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="image">Image URL (Optional)</Label>
                    <Input
                      id="image"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="position">Position</Label>
                    <Select
                      value={formData.position}
                      onValueChange={(value) => setFormData({ ...formData, position: value as PopupAd['position'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="top">Top</SelectItem>
                        <SelectItem value="bottom">Bottom</SelectItem>
                        <SelectItem value="top-left">Top Left</SelectItem>
                        <SelectItem value="top-right">Top Right</SelectItem>
                        <SelectItem value="bottom-left">Bottom Left</SelectItem>
                        <SelectItem value="bottom-right">Bottom Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="size">Size</Label>
                    <Select
                      value={formData.size}
                      onValueChange={(value) => setFormData({ ...formData, size: value as PopupAd['size'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="targetAudience">Target Audience</Label>
                    <Select
                      value={formData.targetAudience}
                      onValueChange={(value) => setFormData({ ...formData, targetAudience: value as PopupAd['targetAudience'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="new">New Users</SelectItem>
                        <SelectItem value="returning">Returning Users</SelectItem>
                        <SelectItem value="verified">Verified Users</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="showDelay">Show Delay (seconds)</Label>
                    <Input
                      id="showDelay"
                      type="number"
                      value={formData.showDelay}
                      onChange={(e) => setFormData({ ...formData, showDelay: parseInt(e.target.value) })}
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxShows">Max Shows per User</Label>
                    <Input
                      id="maxShows"
                      type="number"
                      value={formData.maxShows}
                      onChange={(e) => setFormData({ ...formData, maxShows: parseInt(e.target.value) })}
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="autoClose"
                      checked={formData.autoClose}
                      onCheckedChange={(checked) => setFormData({ ...formData, autoClose: checked })}
                    />
                    <Label htmlFor="autoClose">Auto Close</Label>
                  </div>
                </div>

                {formData.autoClose && (
                  <div>
                    <Label htmlFor="autoCloseDelay">Auto Close Delay (seconds)</Label>
                    <Input
                      id="autoCloseDelay"
                      type="number"
                      value={formData.autoCloseDelay}
                      onChange={(e) => setFormData({ ...formData, autoCloseDelay: parseInt(e.target.value) })}
                      min="1"
                      required
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingAd(null);
                      setFormData({
                        title: '',
                        description: '',
                        buttonText: 'Learn More',
                        buttonLink: '/',
                        backgroundColor: '#10b981',
                        textColor: '#ffffff',
                        buttonColor: '#ffffff',
                        buttonTextColor: '#10b981',
                        position: 'center',
                        size: 'medium',
                        showDelay: 2,
                        autoClose: true,
                        autoCloseDelay: 8,
                        maxShows: 1,
                        isActive: true,
                        targetAudience: 'all',
                        startDate: new Date().toISOString().split('T')[0],
                        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : editingAd ? 'Update Ad' : 'Add Ad'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="mb-6">
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Popup Ad
          </Button>
        </div>

        {/* Popup Ads List */}
        <div className="space-y-6">
          {popupAds.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Popup Ads</h3>
                <p className="text-gray-600 mb-4">Get started by creating your first popup ad.</p>
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Popup Ad
                </Button>
              </CardContent>
            </Card>
          ) : (
            popupAds.map((ad) => (
              <Card key={ad.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{ad.title}</h3>
                        {getStatusBadge(ad)}
                      </div>
                      <p className="text-gray-600 mb-4">{ad.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                        <div>
                          <span className="font-medium">Position:</span> {ad.position}
                        </div>
                        <div>
                          <span className="font-medium">Size:</span> {ad.size}
                        </div>
                        <div>
                          <span className="font-medium">Delay:</span> {ad.showDelay}s
                        </div>
                        <div>
                          <span className="font-medium">Max Shows:</span> {ad.maxShows}
                        </div>
                        <div>
                          <span className="font-medium">Target:</span> {ad.targetAudience}
                        </div>
                        <div>
                          <span className="font-medium">Auto Close:</span> {ad.autoClose ? 'Yes' : 'No'}
                        </div>
                        <div>
                          <span className="font-medium">Start:</span> {new Date(ad.startDate).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">End:</span> {new Date(ad.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleActive(ad.id)}
                      >
                        {ad.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(ad)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(ad.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </>
  );
}
