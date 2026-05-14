'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserCircle, Mail, Phone, MapPin, Building2, Globe, Briefcase, Save, Loader2, Camera, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { profileUpdateSchema, type ProfileUpdateInput } from '@/lib/validations';

interface ProfileData {
  id: string;
  fullName: string;
  email: string;
  roleName: string;
  isVerified: boolean;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  profileData: {
    id: string;
    profileImage: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    zipCode: string | null;
    bio: string | null;
    companyName: string | null;
    website: string | null;
    department: string | null;
    brokerage: string | null;
  } | null;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
      bio: '',
      companyName: '',
      website: '',
      department: '',
      brokerage: '',
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          setProfile(data.profile);

          // Populate form
          form.reset({
            fullName: data.profile.fullName,
            phone: data.profile.profileData?.phone || '',
            address: data.profile.profileData?.address || '',
            city: data.profile.profileData?.city || '',
            state: data.profile.profileData?.state || '',
            country: data.profile.profileData?.country || '',
            zipCode: data.profile.profileData?.zipCode || '',
            bio: data.profile.profileData?.bio || '',
            companyName: data.profile.profileData?.companyName || '',
            website: data.profile.profileData?.website || '',
            department: data.profile.profileData?.department || '',
            brokerage: data.profile.profileData?.brokerage || '',
          });
        }
      } catch {
        // Use empty defaults
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [form]);

  const onSubmit = async (data: ProfileUpdateInput) => {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully' });
        // Refresh profile data
        const profileRes = await fetch('/api/profile');
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData.profile);
        }
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to update profile' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP' });
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File too large. Maximum size: 2MB' });
      return;
    }

    setUploadingImage(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/profile/image', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (result.success) {
        setMessage({ type: 'success', text: 'Profile image updated' });
        // Refresh profile data
        const profileRes = await fetch('/api/profile');
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData.profile);
        }
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to upload image' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setUploadingImage(false);
      // Reset file input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = async () => {
    setUploadingImage(true);
    setMessage(null);

    try {
      const res = await fetch('/api/profile/image', { method: 'DELETE' });
      const result = await res.json();

      if (result.success) {
        setMessage({ type: 'success', text: 'Profile image removed' });
        // Refresh profile data
        const profileRes = await fetch('/api/profile');
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData.profile);
        }
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to remove image' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64 lg:col-span-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div {...fadeInUp} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your personal information and preferences</p>
      </motion.div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-500/10 text-green-500 border-green-500/20'
              : 'bg-red-500/10 text-red-500 border-red-500/20'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Summary Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative group">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center overflow-hidden">
                    {profile?.profileData?.profileImage ? (
                      <img
                        src={profile.profileData.profileImage}
                        alt={profile.fullName}
                        className="h-20 w-20 rounded-full object-cover"
                      />
                    ) : (
                      <UserCircle className="h-10 w-10 text-primary" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Change profile image"
                  >
                    <Camera className="h-5 w-5 text-white" />
                  </button>
                  {profile?.profileData?.profileImage && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={uploadingImage}
                      className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-md hover:bg-destructive/90 transition-colors"
                      title="Remove profile image"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </div>
                {uploadingImage && (
                  <p className="text-xs text-muted-foreground">Uploading image...</p>
                )}
                <div>
                  <h3 className="text-lg font-semibold">{profile?.fullName}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {profile?.email}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="secondary">{profile?.roleName}</Badge>
                  {profile?.isVerified && (
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Verified</Badge>
                  )}
                  {profile?.isActive && (
                    <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Active</Badge>
                  )}
                </div>
                {profile?.lastLogin && (
                  <p className="text-xs text-muted-foreground">
                    Last login: {new Date(profile.lastLogin).toLocaleDateString()}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Edit Profile Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>Update your personal details and contact information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <div className="relative">
                        <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="fullName"
                          {...form.register('fullName')}
                          className="pl-9"
                          placeholder="Your full name"
                        />
                      </div>
                      {form.formState.errors.fullName && (
                        <p className="text-xs text-destructive">{form.formState.errors.fullName.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          {...form.register('phone')}
                          className="pl-9"
                          placeholder="Phone number"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                      id="bio"
                      {...form.register('bio')}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Tell us about yourself..."
                      maxLength={500}
                    />
                    {form.formState.errors.bio && (
                      <p className="text-xs text-destructive">{form.formState.errors.bio.message}</p>
                    )}
                  </div>
                </div>

                {/* Address Info */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Address
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Street Address</Label>
                      <Input id="address" {...form.register('address')} placeholder="Street address" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" {...form.register('city')} placeholder="City" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province</Label>
                      <Input id="state" {...form.register('state')} placeholder="State or province" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" {...form.register('country')} placeholder="Country" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">Zip/Postal Code</Label>
                      <Input id="zipCode" {...form.register('zipCode')} placeholder="Zip or postal code" />
                    </div>
                  </div>
                </div>

                {/* Professional Info */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Professional
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="companyName" {...form.register('companyName')} className="pl-9" placeholder="Company name" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="website" {...form.register('website')} className="pl-9" placeholder="https://example.com" />
                      </div>
                      {form.formState.errors.website && (
                        <p className="text-xs text-destructive">{form.formState.errors.website.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input id="department" {...form.register('department')} placeholder="Department" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brokerage">Brokerage</Label>
                      <Input id="brokerage" {...form.register('brokerage')} placeholder="Brokerage firm" />
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}