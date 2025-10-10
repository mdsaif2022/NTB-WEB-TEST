import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePopupAds, PopupAd } from '@/contexts/PopupAdsContext';
import {
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Users,
  Target,
  Palette,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function PopupAdsManagement() {
  const { popupAds, addPopupAd, updatePopupAd, deletePopupAd, getPopupShowCount, loading } = usePopupAds();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<PopupAd | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    buttonText: '',
    buttonLink: '',
    backgroundColor: '#10b981',
    textColor: '#ffffff',
    buttonColor: '#ffffff',
    buttonTextColor: '#10b981',
    position: 'center' as const,
    size: 'medium' as const,
    showDelay: 3,
    autoClose: true,
    autoCloseDelay: 10,
    maxShows: 3,
    isActive: true,
    targetAudience: 'all' as const,
    startDate: '',
    endDate: '',
  });

  const handleAddAd = async () => {
    if (!formData.title || !formData.description || !formData.buttonText || !formData.buttonLink) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addPopupAd(formData);
      toast({
        title: "Success",
        description: "Popup ad created successfully!",
      });
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create popup ad.",
        variant: "destructive",
      });
    }
  };

  const handleEditAd = async () => {
    if (!editingAd) return;

    if (!formData.title || !formData.description || !formData.buttonText || !formData.buttonLink) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updatePopupAd(editingAd.id, formData);
      toast({
        title: "Success",
        description: "Popup ad updated successfully!",
      });
      setIsEditDialogOpen(false);
      setEditingAd(null);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update popup ad.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAd = async (id: number) => {
    if (confirm('Are you sure you want to delete this popup ad?')) {
      try {
        await deletePopupAd(id);
        toast({
          title: "Success",
          description: "Popup ad deleted successfully!",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete popup ad.",
          variant: "destructive",
        });
      }
    }
  };

  const handleToggleActive = async (ad: PopupAd) => {
    try {
      await updatePopupAd(ad.id, { isActive: !ad.isActive });
      toast({
        title: "Success",
        description: `Popup ad ${ad.isActive ? 'deactivated' : 'activated'} successfully!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update popup ad status.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image: '',
      buttonText: '',
      buttonLink: '',
      backgroundColor: '#10b981',
      textColor: '#ffffff',
      buttonColor: '#ffffff',
      buttonTextColor: '#10b981',
      position: 'center',
      size: 'medium',
      showDelay: 3,
      autoClose: true,
      autoCloseDelay: 10,
      maxShows: 3,
      isActive: true,
      targetAudience: 'all',
      startDate: '',
      endDate: '',
    });
  };

  const openEditDialog = (ad: PopupAd) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      description: ad.description,
      image: ad.image || '',
      buttonText: ad.buttonText,
      buttonLink: ad.buttonLink,
      backgroundColor: ad.backgroundColor,
      textColor: ad.textColor,
      buttonColor: ad.buttonColor,
      buttonTextColor: ad.buttonTextColor,
      position: ad.position,
      size: ad.size,
      showDelay: ad.showDelay,
      autoClose: ad.autoClose,
      autoCloseDelay: ad.autoCloseDelay,
      maxShows: ad.maxShows,
      isActive: ad.isActive,
      targetAudience: ad.targetAudience,
      startDate: ad.startDate,
      endDate: ad.endDate,
    });
    setIsEditDialogOpen(true);
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

  const getTargetAudienceIcon = (audience: string) => {
    switch (audience) {
      case 'new':
        return <Users className="w-4 h-4" />;
      case 'returning':
        return <Users className="w-4 h-4" />;
      case 'verified':
        return <Target className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  return (
    <>
      <Helmet>
        <title>Popup Ads Management - Admin Dashboard</title>
        <meta name="description" content="Manage popup advertisements and promotional campaigns" />
      </Helmet>
      
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Popup Ads Management</h1>
              <p className="text-gray-600 mt-2">
                Create and manage promotional popup advertisements to grow your website
              </p>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Popup Ad
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Popup Ad</DialogTitle>
                  <DialogDescription>
                    Create a new promotional popup advertisement for your website.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="Enter popup title"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="buttonText">Button Text *</Label>
                        <Input
                          id="buttonText"
                          value={formData.buttonText}
                          onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                          placeholder="e.g., Book Now, Learn More"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter popup description"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="buttonLink">Button Link *</Label>
                      <Input
                        id="buttonLink"
                        value={formData.buttonLink}
                        onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                        placeholder="e.g., /booking, https://example.com"
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

                  {/* Appearance */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Appearance</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="position">Position</Label>
                        <Select
                          value={formData.position}
                          onValueChange={(value: any) => setFormData({ ...formData, position: value })}
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
                          onValueChange={(value: any) => setFormData({ ...formData, size: value })}
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
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="backgroundColor">Background Color</Label>
                        <Input
                          id="backgroundColor"
                          type="color"
                          value={formData.backgroundColor}
                          onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="textColor">Text Color</Label>
                        <Input
                          id="textColor"
                          type="color"
                          value={formData.textColor}
                          onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="buttonColor">Button Color</Label>
                        <Input
                          id="buttonColor"
                          type="color"
                          value={formData.buttonColor}
                          onChange={(e) => setFormData({ ...formData, buttonColor: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="buttonTextColor">Button Text Color</Label>
                        <Input
                          id="buttonTextColor"
                          type="color"
                          value={formData.buttonTextColor}
                          onChange={(e) => setFormData({ ...formData, buttonTextColor: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Behavior */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Behavior</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="showDelay">Show Delay (seconds)</Label>
                        <Input
                          id="showDelay"
                          type="number"
                          min="0"
                          value={formData.showDelay}
                          onChange={(e) => setFormData({ ...formData, showDelay: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="maxShows">Max Shows per User</Label>
                        <Input
                          id="maxShows"
                          type="number"
                          min="1"
                          value={formData.maxShows}
                          onChange={(e) => setFormData({ ...formData, maxShows: parseInt(e.target.value) || 1 })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="autoCloseDelay">Auto-close Delay (seconds)</Label>
                        <Input
                          id="autoCloseDelay"
                          type="number"
                          min="0"
                          value={formData.autoCloseDelay}
                          onChange={(e) => setFormData({ ...formData, autoCloseDelay: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="autoClose"
                          checked={formData.autoClose}
                          onChange={(e) => setFormData({ ...formData, autoClose: e.target.checked })}
                          className="rounded"
                        />
                        <Label htmlFor="autoClose">Auto-close popup</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isActive"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                          className="rounded"
                        />
                        <Label htmlFor="isActive">Active</Label>
                      </div>
                    </div>
                  </div>

                  {/* Targeting */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Targeting</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="targetAudience">Target Audience</Label>
                        <Select
                          value={formData.targetAudience}
                          onValueChange={(value: any) => setFormData({ ...formData, targetAudience: value })}
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
                      
                      <div>
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-6">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddAd}>
                    Create Popup Ad
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Palette className="w-6 h-6 text-emerald-600" />
                  </div>
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
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
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
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Scheduled</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {popupAds.filter(ad => new Date(ad.startDate) > new Date()).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Views</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {popupAds.reduce((total, ad) => total + getPopupShowCount(ad.id), 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Popup Ads List */}
          <div className="space-y-6">
            {loading ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading popup ads...</p>
                </CardContent>
              </Card>
            ) : popupAds.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Palette className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Popup Ads</h3>
                  <p className="text-gray-600 mb-6">
                    Create your first popup advertisement to start promoting your tours and campaigns.
                  </p>
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Popup Ad
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
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            {getTargetAudienceIcon(ad.targetAudience)}
                            <span className="capitalize">{ad.targetAudience} users</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{getPopupShowCount(ad.id)} views</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(ad.startDate).toLocaleDateString()} - {new Date(ad.endDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(ad)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleActive(ad)}>
                            {ad.isActive ? (
                              <>
                                <EyeOff className="w-4 h-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteAd(ad.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Popup Ad</DialogTitle>
            <DialogDescription>
              Update the popup advertisement settings.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Same form fields as add dialog */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-title">Title *</Label>
                  <Input
                    id="edit-title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter popup title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-buttonText">Button Text *</Label>
                  <Input
                    id="edit-buttonText"
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    placeholder="e.g., Book Now, Learn More"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-description">Description *</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter popup description"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-buttonLink">Button Link *</Label>
                <Input
                  id="edit-buttonLink"
                  value={formData.buttonLink}
                  onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                  placeholder="e.g., /booking, https://example.com"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-image">Image URL (Optional)</Label>
                <Input
                  id="edit-image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            {/* Appearance */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Appearance</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-position">Position</Label>
                  <Select
                    value={formData.position}
                    onValueChange={(value: any) => setFormData({ ...formData, position: value })}
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
                  <Label htmlFor="edit-size">Size</Label>
                  <Select
                    value={formData.size}
                    onValueChange={(value: any) => setFormData({ ...formData, size: value })}
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
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="edit-backgroundColor">Background Color</Label>
                  <Input
                    id="edit-backgroundColor"
                    type="color"
                    value={formData.backgroundColor}
                    onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-textColor">Text Color</Label>
                  <Input
                    id="edit-textColor"
                    type="color"
                    value={formData.textColor}
                    onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-buttonColor">Button Color</Label>
                  <Input
                    id="edit-buttonColor"
                    type="color"
                    value={formData.buttonColor}
                    onChange={(e) => setFormData({ ...formData, buttonColor: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-buttonTextColor">Button Text Color</Label>
                  <Input
                    id="edit-buttonTextColor"
                    type="color"
                    value={formData.buttonTextColor}
                    onChange={(e) => setFormData({ ...formData, buttonTextColor: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Behavior */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Behavior</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-showDelay">Show Delay (seconds)</Label>
                  <Input
                    id="edit-showDelay"
                    type="number"
                    min="0"
                    value={formData.showDelay}
                    onChange={(e) => setFormData({ ...formData, showDelay: parseInt(e.target.value) || 0 })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-maxShows">Max Shows per User</Label>
                  <Input
                    id="edit-maxShows"
                    type="number"
                    min="1"
                    value={formData.maxShows}
                    onChange={(e) => setFormData({ ...formData, maxShows: parseInt(e.target.value) || 1 })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-autoCloseDelay">Auto-close Delay (seconds)</Label>
                  <Input
                    id="edit-autoCloseDelay"
                    type="number"
                    min="0"
                    value={formData.autoCloseDelay}
                    onChange={(e) => setFormData({ ...formData, autoCloseDelay: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-autoClose"
                    checked={formData.autoClose}
                    onChange={(e) => setFormData({ ...formData, autoClose: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="edit-autoClose">Auto-close popup</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="edit-isActive">Active</Label>
                </div>
              </div>
            </div>

            {/* Targeting */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Targeting</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-targetAudience">Target Audience</Label>
                  <Select
                    value={formData.targetAudience}
                    onValueChange={(value: any) => setFormData({ ...formData, targetAudience: value })}
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
                
                <div>
                  <Label htmlFor="edit-startDate">Start Date</Label>
                  <Input
                    id="edit-startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-endDate">End Date</Label>
                  <Input
                    id="edit-endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-6">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditAd}>
              Update Popup Ad
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
