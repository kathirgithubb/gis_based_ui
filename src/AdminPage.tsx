import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type AdminTab = 'configuration' | 'application';
type ConfigSection = 'applications' | 'roles' | 'users' | 'upload' | 'picklists' | 'notification' | 'datasources' | 'settings';

type Role = { id: string; name: string; description: string };
type User = { id: string; username: string; email: string; role: string };

export default function AdminPage() {
  const navigate = useNavigate();
  const [adminTab, setAdminTab] = useState<AdminTab>('configuration');
  const [configSection, setConfigSection] = useState<ConfigSection>('applications');
  const [isMobile, setIsMobile] = useState(false);
  const [showDesktop, setShowDesktop] = useState(false);

  // Application state
  const [adminMapEnabled, setAdminMapEnabled] = useState(true);
  const [userMapEnabled, setUserMapEnabled] = useState(true);

  // Roles state
  const [roles, setRoles] = useState<Role[]>([
    { id: '1', name: 'Administrator', description: 'Configure application, create users, load data...' },
    { id: '2', name: 'Data Administrator', description: 'NA' },
    { id: '3', name: 'Data Editor', description: 'Edit data, create bookmarks...' },
    { id: '4', name: 'Data Viewer', description: 'View data' },
    { id: '5', name: 'Designer', description: 'Network Manager designer role' },
  ]);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [roleName, setRoleName] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);

  // Users state
  const [users, setUsers] = useState<User[]>([
    { id: '1', username: 'admin', email: 'admin@redplanet.com', role: 'Administrator' },
    { id: '2', username: 'assigner', email: 'assigner@redplanet.com', role: 'Data Administrator' },
    { id: '3', username: 'user', email: 'user@redplanet.com', role: 'Data Editor' },
  ]);
  const [showUserForm, setShowUserForm] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      setShowDesktop(!mobile);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleLogout = () => {
    navigate('/');
  };

  const saveRole = () => {
    if (!roleName.trim()) return;
    setRoles((prev) => [...prev, { id: (prev.length + 1).toString(), name: roleName, description: roleDesc }]);
    setRoleName('');
    setRoleDesc('');
    setRolePermissions([]);
    setShowRoleForm(false);
  };

  const saveUser = () => {
    if (!newUsername.trim() || !newPassword.trim()) return;
    const role = selectedRoles.length > 0 ? selectedRoles[0] : 'Data Viewer';
    setUsers((prev) => [...prev, { id: (prev.length + 1).toString(), username: newUsername, email: newEmail, role }]);
    setNewUsername('');
    setNewEmail('');
    setNewPassword('');
    setSelectedRoles([]);
    setShowUserForm(false);
  };

  // Style constants
  const ib = 'flex items-center justify-center border border-[#c8c8c8] bg-[#e8e8e8] text-[#111] shadow-sm transition-all hover:bg-[#d4d4d4] active:bg-[#c0c0c0]';
  const pb = 'border border-[#111] bg-[#111] text-white hover:bg-[#333] transition-all';
  const gb = 'border border-[#c8c8c8] bg-[#e8e8e8] text-[#111] hover:bg-[#d4d4d4] transition-all';

  const configMenuItems: { key: ConfigSection; label: string }[] = [
    { key: 'applications', label: 'Applications' },
    { key: 'roles', label: 'Roles' },
    { key: 'users', label: 'Users' },
    { key: 'upload', label: 'Upload' },
    { key: 'picklists', label: 'Pick Lists' },
    { key: 'notification', label: 'Notification' },
    { key: 'datasources', label: 'Data Sources' },
    { key: 'settings', label: 'Settings' },
  ];

  const renderConfigContent = () => {
    switch (configSection) {
      case 'applications':
        return (
          <div className="h-full overflow-auto p-4">
            <div className="rounded-lg border border-[#c8c8c8] bg-white p-4 shadow-sm">
              <h3 className="text-[13px] font-bold text-[#111] mb-4">Available Applications</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adminMapEnabled}
                    onChange={(e) => setAdminMapEnabled(e.target.checked)}
                    className="accent-[#111] w-4 h-4"
                  />
                  <span className="text-[12px] text-[#555]">Admin Map</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={userMapEnabled}
                    onChange={(e) => setUserMapEnabled(e.target.checked)}
                    className="accent-[#111] w-4 h-4"
                  />
                  <span className="text-[12px] text-[#555]">User Map</span>
                </label>
              </div>
              <div className="flex gap-2 pt-4 justify-end border-t border-[#e0e0e0] mt-4">
                <button className={`${pb} rounded-lg px-4 py-2 text-[11px] font-semibold`}>Save</button>
              </div>
            </div>
          </div>
        );

      case 'roles':
        return (
          <div className="h-full overflow-auto p-4">
            <div className="rounded-lg border border-[#c8c8c8] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[13px] font-bold text-[#111]">Roles Management</h3>
                <button
                  onClick={() => setShowRoleForm(!showRoleForm)}
                  className={`${pb} rounded-lg px-3 py-1.5 text-[11px] font-semibold`}
                >
                  + New
                </button>
              </div>

              {showRoleForm && (
                <div className="rounded-lg border border-[#d4d4d4] bg-[#f8f8f8] p-3 mb-4 space-y-2">
                  <div>
                    <label className="block text-[10px] font-bold text-[#555] mb-1">Name <span className="text-red-600">*</span></label>
                    <input
                      type="text"
                      value={roleName}
                      onChange={(e) => setRoleName(e.target.value)}
                      placeholder="Enter role name"
                      className="w-full rounded-lg border border-[#c8c8c8] bg-white px-2 py-1.5 text-[11px] text-[#111] outline-none focus:border-[#999]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#555] mb-1">Description</label>
                    <textarea
                      value={roleDesc}
                      onChange={(e) => setRoleDesc(e.target.value)}
                      placeholder="Enter description"
                      rows={2}
                      className="w-full rounded-lg border border-[#c8c8c8] bg-white px-2 py-1.5 text-[11px] text-[#111] outline-none resize-none focus:border-[#999]"
                    />
                  </div>
                  <div className="border-t border-[#d4d4d4] pt-2 mt-2">
                    <label className="block text-[10px] font-bold text-[#555] mb-2">Permissions</label>
                    <div className="space-y-1">
                      {['config', 'development'].map((permission) => (
                        <label key={permission} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rolePermissions.includes(permission)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setRolePermissions([...rolePermissions, permission]);
                              } else {
                                setRolePermissions(rolePermissions.filter((p) => p !== permission));
                              }
                            }}
                            className="accent-[#111] w-3 h-3"
                          />
                          <span className="text-[11px] text-[#555] capitalize">{permission}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-2 border-t border-[#d4d4d4]">
                    <button
                      onClick={() => {
                        setShowRoleForm(false);
                        setRoleName('');
                        setRoleDesc('');
                      }}
                      className={`${gb} rounded-lg px-3 py-1.5 text-[11px] font-medium`}
                    >
                      Cancel
                    </button>
                    <button onClick={saveRole} className={`${pb} rounded-lg px-3 py-1.5 text-[11px] font-semibold`}>
                      Save
                    </button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="min-w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-[#d4d4d4] bg-[#f0f0f0]">
                      <th className="px-3 py-2 text-left font-bold text-[#111]">Name</th>
                      <th className="px-3 py-2 text-left font-bold text-[#111]">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles.map((role, idx) => (
                      <tr
                        key={role.id}
                        className={`border-b border-[#e0e0e0] ${idx % 2 === 0 ? 'bg-[#f8f8f8]' : 'bg-white'}`}
                      >
                        <td className="px-3 py-2 text-[#111] font-medium">{role.name}</td>
                        <td className="px-3 py-2 text-[#555]">{role.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="h-full overflow-auto p-4">
            <div className="rounded-lg border border-[#c8c8c8] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[13px] font-bold text-[#111]">Users Management</h3>
                <button
                  onClick={() => setShowUserForm(!showUserForm)}
                  className={`${pb} rounded-lg px-3 py-1.5 text-[11px] font-semibold`}
                >
                  + New
                </button>
              </div>

              {showUserForm && (
                <div className="rounded-lg border border-[#d4d4d4] bg-[#f8f8f8] p-3 mb-4 space-y-2">
                  <div>
                    <label className="block text-[10px] font-bold text-[#555] mb-1">Username <span className="text-red-600">*</span></label>
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="Enter username"
                      className="w-full rounded-lg border border-[#c8c8c8] bg-white px-2 py-1.5 text-[11px] text-[#111] outline-none focus:border-[#999]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#555] mb-1">Email</label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Enter email"
                      className="w-full rounded-lg border border-[#c8c8c8] bg-white px-2 py-1.5 text-[11px] text-[#111] outline-none focus:border-[#999]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#555] mb-1">Password <span className="text-red-600">*</span></label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full rounded-lg border border-[#c8c8c8] bg-white px-2 py-1.5 text-[11px] text-[#111] outline-none focus:border-[#999]"
                    />
                  </div>
                  <div className="border-t border-[#d4d4d4] pt-2 mt-2">
                    <label className="block text-[10px] font-bold text-[#555] mb-2">Roles</label>
                    <div className="space-y-1">
                      {['Administrator', 'Data Editor', 'Data Viewer', 'Designer', 'Data Administrator'].map((role) => (
                        <label key={role} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedRoles.includes(role)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRoles([...selectedRoles, role]);
                              } else {
                                setSelectedRoles(selectedRoles.filter((r) => r !== role));
                              }
                            }}
                            className="accent-[#111] w-3 h-3"
                          />
                          <span className="text-[11px] text-[#555]">{role}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-2 border-t border-[#d4d4d4]">
                    <button
                      onClick={() => {
                        setShowUserForm(false);
                        setNewUsername('');
                        setNewEmail('');
                        setNewPassword('');
                        setSelectedRoles([]);
                      }}
                      className={`${gb} rounded-lg px-3 py-1.5 text-[11px] font-medium`}
                    >
                      Cancel
                    </button>
                    <button onClick={saveUser} className={`${pb} rounded-lg px-3 py-1.5 text-[11px] font-semibold`}>
                      Save
                    </button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="min-w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-[#d4d4d4] bg-[#f0f0f0]">
                      <th className="px-3 py-2 text-left font-bold text-[#111]">Username</th>
                      <th className="px-3 py-2 text-left font-bold text-[#111]">Email</th>
                      <th className="px-3 py-2 text-left font-bold text-[#111]">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, idx) => (
                      <tr
                        key={user.id}
                        className={`border-b border-[#e0e0e0] ${idx % 2 === 0 ? 'bg-[#f8f8f8]' : 'bg-white'}`}
                      >
                        <td className="px-3 py-2 text-[#111] font-medium">{user.username}</td>
                        <td className="px-3 py-2 text-[#555]">{user.email}</td>
                        <td className="px-3 py-2 text-[#555]">{user.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="h-full overflow-auto p-4">
            <div className="rounded-lg border border-[#c8c8c8] bg-white p-4 shadow-sm">
              <h3 className="text-[13px] font-bold text-[#111] mb-3">
                {configSection.charAt(0).toUpperCase() + configSection.slice(1)}
              </h3>
              <p className="text-[12px] text-[#888]">Content for {configSection} will be displayed here.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#f2f2f2] font-sans text-[#111]">
      {/* TOP BAR */}
      <div className="absolute top-0 left-0 right-0 z-30 h-12 bg-[#dedede] border-b border-[#c8c8c8] flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-3">
          <a href="https://redplanetgrp.com" target="_blank" rel="noreferrer" className="block">
            <img src="https://redplanetgrp.com/wp-content/uploads/2025/04/Redplanet-Solutions.webp" alt="RedPlanet" className="h-7 w-auto object-contain" />
          </a>
          <span className="text-[13px] font-semibold text-[#111]">Admin Control Panel</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#555]">👤 Admin</span>
          <button
            onClick={handleLogout}
            className={`${gb} rounded-lg px-3 py-1.5 text-[11px] font-medium`}
          >
            Logout
          </button>
        </div>
      </div>

      {/* LEFT PANEL */}
      <div
        className={`absolute inset-y-0 left-0 z-30 border-r border-[#c8c8c8] bg-[#e8e8e8]/98 shadow-xl transition-transform duration-300 ${
          showDesktop ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ top: '48px', width: isMobile ? 'min(50vw,180px)' : '280px' }}
      >
        <div className="flex flex-col h-full overflow-y-auto p-2">
          {adminTab === 'configuration' && (
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-[#555] px-2 py-1">CONFIGURATION</div>
              {configMenuItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    setConfigSection(item.key);
                    if (isMobile) setShowDesktop(false);
                  }}
                  className={`w-full px-2 py-1.5 text-[11px] text-left rounded-lg transition-all font-medium
                    ${configSection === item.key ? 'bg-[#111] text-white' : 'text-[#555] hover:bg-[#d4d4d4]'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {adminTab === 'application' && (
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-[#555] px-2 py-1">APPLICATION</div>
              <button className={`w-full px-2 py-1.5 text-[11px] text-left rounded-lg transition-all font-medium text-[#555] hover:bg-[#d4d4d4]`}>
                Admin Map
              </button>
              <button className={`w-full px-2 py-1.5 text-[11px] text-left rounded-lg transition-all font-medium text-[#555] hover:bg-[#d4d4d4]`}>
                User Map
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE BACKDROP */}
      {isMobile && showDesktop && (
        <div className="absolute inset-0 z-[28] bg-black/20" onClick={() => setShowDesktop(false)} />
      )}

      {/* MAIN CONTENT AREA */}
      <div
        className="absolute inset-0 z-0 flex flex-col transition-all duration-300"
        style={{
          top: '48px',
          paddingLeft: showDesktop && !isMobile ? '280px' : '0',
        }}
      >
        {/* TAB BUTTONS */}
        <div className="flex border-b border-[#c8c8c8] bg-[#dedede]">
          {[
            { key: 'configuration' as AdminTab, label: 'Configuration' },
            { key: 'application' as AdminTab, label: 'Application' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setAdminTab(tab.key);
                if (tab.key === 'configuration') setConfigSection('applications');
              }}
              className={`px-4 py-2 text-[12px] font-medium transition-all border-b-2 ${
                adminTab === tab.key
                  ? 'border-b-[#111] bg-[#e8e8e8] text-[#111] font-bold'
                  : 'border-b-transparent text-[#555] hover:bg-[#d4d4d4]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-auto">
          {adminTab === 'configuration' ? renderConfigContent() : renderConfigContent()}
        </div>
      </div>

      {/* MOBILE MENU BUTTON */}
      {isMobile && (
        <button
          onClick={() => setShowDesktop(true)}
          className={`${ib} absolute top-2 left-2 z-30 h-9 w-9 rounded-lg`}
        >
          <div className="flex flex-col gap-[3px]">
            <span className="block h-[2px] w-[16px] rounded bg-current" />
            <span className="block h-[2px] w-[16px] rounded bg-current" />
            <span className="block h-[2px] w-[16px] rounded bg-current" />
          </div>
        </button>
      )}
    </div>
  );
}
