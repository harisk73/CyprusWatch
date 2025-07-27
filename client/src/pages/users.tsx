import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import NavigationHeader from "@/components/navigation-header";
import {
  Users,
  Edit,
  Trash2,
  Plus,
  MoreHorizontal,
  Search,
  Shield,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Crown,
  ArrowLeft,
} from "lucide-react";
import { Link } from "wouter";
import type { User, Village } from "@shared/schema";

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Redirect if not system admin
  useEffect(() => {
    if (currentUser && !currentUser?.isSystemAdmin) {
      toast({
        title: "Access Denied",
        description: "System administrator access required.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    }
  }, [currentUser, toast]);

  // Fetch users
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
    retry: false,
    enabled: !!currentUser?.isSystemAdmin,
  });

  // Fetch villages for dropdown
  const { data: villages = [] } = useQuery<Village[]>({
    queryKey: ["/api/villages"],
    retry: false,
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: Partial<User>) => {
      const res = await apiRequest("POST", "/api/users", userData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "User created successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create user. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<User> }) => {
      const res = await apiRequest("PUT", `/api/users/${id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      toast({
        title: "Success",
        description: "User updated successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Bulk import mutation
  const bulkImportMutation = useMutation({
    mutationFn: async (users: Partial<User>[]) => {
      const res = await apiRequest("POST", "/api/users/bulk-import", { users });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsImportDialogOpen(false);
      toast({
        title: "Import Complete",
        description: `Successfully imported ${data.success} users. ${data.errors} errors.`,
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to import users. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest("DELETE", `/api/users/${userId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "User deleted successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Filter users based on search term
  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.firstName?.toLowerCase().includes(searchLower) ||
      user.lastName?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.phone?.toLowerCase().includes(searchLower)
    );
  });

  const getVillageName = (villageId: string | null) => {
    if (!villageId) return "No Village";
    const village = villages.find((v) => v.id === villageId);
    return village ? village.name : "Unknown Village";
  };

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString();
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      deleteUserMutation.mutate(userId);
    }
  };

  if (!currentUser?.isSystemAdmin) {
    return (
      <div className="font-inter bg-neutral-100 min-h-screen">
        <NavigationHeader />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-8">
            <div className="text-center space-y-4">
              <Shield className="h-16 w-16 mx-auto text-red-500" />
              <h2 className="text-2xl font-bold">Access Denied</h2>
              <p className="text-neutral-600">System administrator access required.</p>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="font-inter bg-neutral-100 min-h-screen">
      <NavigationHeader />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-neutral-700">User Management</h1>
            </div>
          </div>
          <p className="text-neutral-500">
            Manage system users, permissions, and access controls. Create new users, edit existing profiles, and maintain user data.
          </p>
        </div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            User Management
          </h1>
          <p className="text-neutral-600 mt-2">
            Manage all users in the Cyprus Emergency Alert System
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add User
          </Button>
          <Button variant="outline" onClick={() => setIsImportDialogOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Import CSV
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search users by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-neutral-500">
              {filteredUsers.length} of {users.length} users
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[18px] font-bold">All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-neutral-500">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-neutral-300 mb-4" />
              <p className="text-neutral-500">
                {searchTerm ? "No users found matching your search." : "No users found."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Village</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            {user.profileImageUrl ? (
                              <img
                                src={user.profileImageUrl}
                                alt="Profile"
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-medium text-primary">
                                {user.firstName?.charAt(0) || user.email?.charAt(0) || "U"}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">
                              {user.firstName || user.lastName
                                ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                                : "No Name"}
                            </div>
                            <div className="text-sm text-neutral-500">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {user.phone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" />
                              {user.phone}
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-sm text-neutral-500">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-neutral-400" />
                          <span className="text-sm">{getVillageName(user.villageId)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {user.isSystemAdmin && (
                            <Badge variant="destructive" className="text-xs">
                              <Crown className="h-3 w-3 mr-1" />
                              System Admin
                            </Badge>
                          )}
                          {user.isVillageAdmin && (
                            <Badge variant="secondary" className="text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              Village Admin
                            </Badge>
                          )}
                          {!user.isSystemAdmin && !user.isVillageAdmin && (
                            <Badge variant="outline" className="text-xs">
                              User
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            {user.phoneVerified ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-500" />
                            )}
                            <span className="text-xs">
                              Phone {user.phoneVerified ? "Verified" : "Unverified"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {user.alertsEnabled ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <XCircle className="h-3 w-3 text-neutral-400" />
                            )}
                            <span className="text-xs">
                              Alerts {user.alertsEnabled ? "Enabled" : "Disabled"}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-neutral-500">
                          <Calendar className="h-3 w-3" />
                          {formatDate(user.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <CreateUserForm
            villages={villages}
            onSave={(userData) => {
              createUserMutation.mutate(userData);
            }}
            onCancel={() => {
              setIsCreateDialogOpen(false);
            }}
            isLoading={createUserMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <EditUserForm
              user={selectedUser}
              villages={villages}
              onSave={(updates) => {
                updateUserMutation.mutate({ id: selectedUser.id, updates });
              }}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedUser(null);
              }}
              isLoading={updateUserMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Import CSV Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Import Users from CSV</DialogTitle>
          </DialogHeader>
          <ImportUsersForm
            villages={villages}
            onImport={(users) => {
              bulkImportMutation.mutate(users);
            }}
            onCancel={() => {
              setIsImportDialogOpen(false);
            }}
            isLoading={bulkImportMutation.isPending}
          />
        </DialogContent>
      </Dialog>
      </main>
    </div>
  );
}

// Create User Form Component
interface CreateUserFormProps {
  villages: Village[];
  onSave: (userData: Partial<User>) => void;
  onCancel: () => void;
  isLoading: boolean;
}

function CreateUserForm({ villages, onSave, onCancel, isLoading }: CreateUserFormProps) {
  // Filter out any villages with empty or invalid IDs to prevent SelectItem errors
  const validVillages = villages.filter(village => village.id && village.id.trim() !== '');
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    villageId: "none",
    address: "",
    isVillageAdmin: false,
    isSystemAdmin: false,
    phoneVerified: false,
    alertsEnabled: false,
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      return;
    }
    
    const userData = {
      ...formData,
      villageId: formData.villageId === 'none' ? null : formData.villageId,
    };
    
    onSave(userData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="village">Village</Label>
        <Select value={formData.villageId} onValueChange={(value) => setFormData({ ...formData, villageId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select village" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Village</SelectItem>
            {validVillages.map((village) => (
              <SelectItem key={village.id} value={village.id}>
                {village.name} ({village.district})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
          <Input
            id="emergencyContactName"
            value={formData.emergencyContactName}
            onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
          <Input
            id="emergencyContactPhone"
            value={formData.emergencyContactPhone}
            onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="emergencyContactRelationship">Relationship</Label>
          <Input
            id="emergencyContactRelationship"
            value={formData.emergencyContactRelationship}
            onChange={(e) => setFormData({ ...formData, emergencyContactRelationship: e.target.value })}
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-medium mb-3">Permissions & Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="isSystemAdmin">System Administrator</Label>
              <p className="text-sm text-neutral-500">Full system access and user management</p>
            </div>
            <Switch
              id="isSystemAdmin"
              checked={formData.isSystemAdmin}
              onCheckedChange={(checked) => setFormData({ ...formData, isSystemAdmin: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="isVillageAdmin">Village Administrator</Label>
              <p className="text-sm text-neutral-500">Admin access for assigned village</p>
            </div>
            <Switch
              id="isVillageAdmin"
              checked={formData.isVillageAdmin}
              onCheckedChange={(checked) => setFormData({ ...formData, isVillageAdmin: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="phoneVerified">Phone Verified</Label>
              <p className="text-sm text-neutral-500">Allow emergency alert posting</p>
            </div>
            <Switch
              id="phoneVerified"
              checked={formData.phoneVerified}
              onCheckedChange={(checked) => setFormData({ ...formData, phoneVerified: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="alertsEnabled">Alerts Enabled</Label>
              <p className="text-sm text-neutral-500">Can post emergency alerts</p>
            </div>
            <Switch
              id="alertsEnabled"
              checked={formData.alertsEnabled}
              onCheckedChange={(checked) => setFormData({ ...formData, alertsEnabled: checked })}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || !formData.email}>
          {isLoading ? "Creating..." : "Create User"}
        </Button>
      </div>
    </form>
  );
}

// Edit User Form Component
interface EditUserFormProps {
  user: User;
  villages: Village[];
  onSave: (updates: Partial<User>) => void;
  onCancel: () => void;
  isLoading: boolean;
}

function EditUserForm({ user, villages, onSave, onCancel, isLoading }: EditUserFormProps) {
  // Filter out any villages with empty or invalid IDs to prevent SelectItem errors
  const validVillages = villages.filter(village => village.id && village.id.trim() !== '');
  
  const [formData, setFormData] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    phone: user.phone || "",
    villageId: user.villageId || "none",
    address: user.address || "",
    isVillageAdmin: user.isVillageAdmin || false,
    isSystemAdmin: user.isSystemAdmin || false,
    phoneVerified: user.phoneVerified || false,
    alertsEnabled: user.alertsEnabled || false,
    emergencyContactName: user.emergencyContactName || "",
    emergencyContactPhone: user.emergencyContactPhone || "",
    emergencyContactRelationship: user.emergencyContactRelationship || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updates = {
      ...formData,
      villageId: formData.villageId === 'none' ? null : formData.villageId,
    };
    
    onSave(updates);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="village">Village</Label>
        <Select value={formData.villageId} onValueChange={(value) => setFormData({ ...formData, villageId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select village" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Village</SelectItem>
            {validVillages.map((village) => (
              <SelectItem key={village.id} value={village.id}>
                {village.name} ({village.district})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
          <Input
            id="emergencyContactName"
            value={formData.emergencyContactName}
            onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
          <Input
            id="emergencyContactPhone"
            value={formData.emergencyContactPhone}
            onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="emergencyContactRelationship">Relationship</Label>
          <Input
            id="emergencyContactRelationship"
            value={formData.emergencyContactRelationship}
            onChange={(e) => setFormData({ ...formData, emergencyContactRelationship: e.target.value })}
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-medium mb-3">Permissions & Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="isSystemAdmin">System Administrator</Label>
              <p className="text-sm text-neutral-500">Full system access and user management</p>
            </div>
            <Switch
              id="isSystemAdmin"
              checked={formData.isSystemAdmin}
              onCheckedChange={(checked) => setFormData({ ...formData, isSystemAdmin: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="isVillageAdmin">Village Administrator</Label>
              <p className="text-sm text-neutral-500">Admin access for assigned village</p>
            </div>
            <Switch
              id="isVillageAdmin"
              checked={formData.isVillageAdmin}
              onCheckedChange={(checked) => setFormData({ ...formData, isVillageAdmin: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="phoneVerified">Phone Verified</Label>
              <p className="text-sm text-neutral-500">Allow emergency alert posting</p>
            </div>
            <Switch
              id="phoneVerified"
              checked={formData.phoneVerified}
              onCheckedChange={(checked) => setFormData({ ...formData, phoneVerified: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="alertsEnabled">Alerts Enabled</Label>
              <p className="text-sm text-neutral-500">Can post emergency alerts</p>
            </div>
            <Switch
              id="alertsEnabled"
              checked={formData.alertsEnabled}
              onCheckedChange={(checked) => setFormData({ ...formData, alertsEnabled: checked })}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

// Import Users Form Component
interface ImportUsersFormProps {
  villages: Village[];
  onImport: (users: Partial<User>[]) => void;
  onCancel: () => void;
  isLoading: boolean;
}

function ImportUsersForm({ villages, onImport, onCancel, isLoading }: ImportUsersFormProps) {
  const [csvData, setCsvData] = useState("");
  const [parsedUsers, setParsedUsers] = useState<Partial<User>[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const parseCSV = (text: string) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) {
      return [];
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const users: Partial<User>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const user: Partial<User> = {};

      headers.forEach((header, index) => {
        const value = values[index] || '';
        
        switch (header) {
          case 'first_name':
          case 'firstname':
            user.firstName = value;
            break;
          case 'last_name':
          case 'lastname':
            user.lastName = value;
            break;
          case 'email':
            user.email = value;
            break;
          case 'phone':
          case 'phone_number':
            user.phone = value;
            break;
          case 'village':
          case 'village_name':
            const village = villages.find(v => 
              v.name.toLowerCase() === value.toLowerCase()
            );
            user.villageId = village?.id || null;
            break;
          case 'village_id':
            user.villageId = value || null;
            break;
          case 'address':
            user.address = value;
            break;
          case 'emergency_contact_name':
            user.emergencyContactName = value;
            break;
          case 'emergency_contact_phone':
            user.emergencyContactPhone = value;
            break;
          case 'emergency_contact_relationship':
            user.emergencyContactRelationship = value;
            break;
          case 'is_village_admin':
          case 'village_admin':
            user.isVillageAdmin = value.toLowerCase() === 'true' || value === '1';
            break;
          case 'is_system_admin':
          case 'system_admin':
            user.isSystemAdmin = value.toLowerCase() === 'true' || value === '1';
            break;
          case 'phone_verified':
            user.phoneVerified = value.toLowerCase() === 'true' || value === '1';
            break;
          case 'alerts_enabled':
            user.alertsEnabled = value.toLowerCase() === 'true' || value === '1';
            break;
        }
      });

      if (user.email) {
        users.push(user);
      }
    }

    return users;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setCsvData(text);
        const parsed = parseCSV(text);
        setParsedUsers(parsed);
        setShowPreview(true);
      };
      reader.readAsText(file);
    }
  };

  const handleTextImport = () => {
    const parsed = parseCSV(csvData);
    setParsedUsers(parsed);
    setShowPreview(true);
  };

  const handleImport = () => {
    onImport(parsedUsers);
  };

  const getVillageName = (villageId: string | null) => {
    if (!villageId) return "No Village";
    const village = villages.find(v => v.id === villageId);
    return village ? village.name : "Unknown Village";
  };

  return (
    <div className="space-y-4">
      {!showPreview ? (
        <>
          <div>
            <h3 className="font-medium mb-2">Import Options</h3>
            <p className="text-sm text-neutral-600 mb-4">
              Choose one of the following methods to import users:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Upload CSV File</h4>
              <p className="text-sm text-neutral-600 mb-3">
                Select a CSV file from your computer to import users.
              </p>
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="mb-2"
              />
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Paste CSV Data</h4>
              <p className="text-sm text-neutral-600 mb-3">
                Copy and paste CSV data directly into the text area.
              </p>
              <Textarea
                placeholder="Paste CSV data here..."
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                rows={6}
                className="mb-2"
              />
              <Button 
                onClick={handleTextImport}
                disabled={!csvData.trim()}
                size="sm"
              >
                Parse CSV Data
              </Button>
            </div>
          </div>

          <div className="bg-neutral-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">CSV Format Requirements</h4>
            <p className="text-sm text-neutral-600 mb-2">
              Your CSV file should include the following headers (case-insensitive):
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <strong>Required:</strong>
                <ul className="list-disc list-inside ml-2">
                  <li>email</li>
                </ul>
              </div>
              <div>
                <strong>Optional:</strong>
                <ul className="list-disc list-inside ml-2">
                  <li>first_name, last_name</li>
                  <li>phone, address</li>
                  <li>village_name or village_id</li>
                  <li>emergency_contact_name, emergency_contact_phone</li>
                  <li>is_village_admin, is_system_admin (true/false)</li>
                  <li>phone_verified, alerts_enabled (true/false)</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Preview Users ({parsedUsers.length} found)</h3>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Back to Import
            </Button>
          </div>

          <div className="max-h-64 overflow-y-auto border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Village</TableHead>
                  <TableHead>Admin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsedUsers.map((user, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {user.firstName || user.lastName 
                        ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                        : "—"
                      }
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || "—"}</TableCell>
                    <TableCell>{getVillageName(user.villageId || null)}</TableCell>
                    <TableCell>
                      {user.isSystemAdmin && <Badge variant="destructive" className="text-xs">System</Badge>}
                      {user.isVillageAdmin && <Badge variant="secondary" className="text-xs">Village</Badge>}
                      {!user.isSystemAdmin && !user.isVillageAdmin && <span className="text-neutral-500">User</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleImport}
              disabled={isLoading || parsedUsers.length === 0}
            >
              {isLoading ? "Importing..." : `Import ${parsedUsers.length} Users`}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}