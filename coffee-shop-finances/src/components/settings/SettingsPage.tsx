import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfilesTab from "@/components/settings/ProfilesTab";
import UsersTab from "@/components/settings/UsersTab";
import { useAuthz } from "@/contexts/AuthzContext";
import { fetchManagedUsers, fetchRolePermissions, type ManagedUser, type RolePermissionRow } from "@/lib/settingsAccess";

const SettingsPage = () => {
  const { can } = useAuthz();
  const [rolePermissions, setRolePermissions] = useState<RolePermissionRow[]>([]);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);

  const canManageProfiles = can("profiles.manage");
  const canManageUsers = can("users.manage");

  const loadData = async () => {
    setLoading(true);
    const [nextRolePermissions, nextUsers] = await Promise.all([
      fetchRolePermissions(),
      fetchManagedUsers(),
    ]);
    setRolePermissions(nextRolePermissions);
    setUsers(nextUsers);
    setLoading(false);
  };

  useEffect(() => {
    void loadData();
  }, []);

  if (loading) {
    return <div className="text-sm text-muted-foreground">Carregando configurações...</div>;
  }

  return (
    <Tabs defaultValue="profiles" className="w-full space-y-4">
      <TabsList>
        <TabsTrigger value="profiles">Perfis</TabsTrigger>
        <TabsTrigger value="users">Usuários</TabsTrigger>
      </TabsList>

      <TabsContent value="profiles">
        <ProfilesTab rows={rolePermissions} canManageProfiles={canManageProfiles} onChanged={loadData} />
      </TabsContent>
      <TabsContent value="users">
        <UsersTab users={users} canManageUsers={canManageUsers} onChanged={loadData} />
      </TabsContent>
    </Tabs>
  );
};

export default SettingsPage;
