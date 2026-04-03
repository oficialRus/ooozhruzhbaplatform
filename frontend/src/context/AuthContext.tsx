import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { User } from '@/types';
import { MODULES } from '@/config/modules';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  canAccessModule: (moduleKey: string) => boolean;
  canEditModule: (moduleKey: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const pathToModuleKey = new Map(MODULES.map((m) => [m.path, m.key]));

function buildPermissions(accessRights?: Record<string, 'none' | 'read' | 'edit'>) {
  const allowedModules = new Set<string>(['dashboard']);
  const editableModules = new Set<string>();

  Object.entries(accessRights ?? {}).forEach(([path, level]) => {
    const moduleKey = pathToModuleKey.get(path);
    if (!moduleKey) return;
    // "read" и "edit" дают доступ к просмотру раздела.
    if (level === 'read' || level === 'edit') {
      allowedModules.add(moduleKey);
    }
    // Редактирование доступно только при уровне "edit".
    if (level === 'edit') {
      editableModules.add(moduleKey);
    }
  });

  return {
    allowedModules: Array.from(allowedModules) as User['allowedModules'],
    editableModules: Array.from(editableModules) as User['allowedModules'],
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('erp_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as User;
        const normalized = buildPermissions(parsed.accessRights);
        return {
          ...parsed,
          allowedModules: normalized.allowedModules,
          editableModules: normalized.editableModules,
        };
      } catch {
        return null;
      }
    }
    return null;
  });

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: email.trim(), password }),
      });
      if (res.ok) {
        const employee = (await res.json()) as {
          id: string;
          fullName: string;
          login: string;
          position: string;
          personnelNumber?: string;
          accessRights?: Record<string, 'none' | 'read' | 'edit'>;
        };
        const normalized = buildPermissions(employee.accessRights);

        const backendUser: User = {
          id: employee.id,
          fullName: employee.fullName,
          email: employee.login,
          role: 'admin',
          position: employee.position,
          allowedModules: normalized.allowedModules,
          editableModules: normalized.editableModules,
          accessRights: employee.accessRights ?? {},
          personnelNumber: employee.personnelNumber,
        };
        setUser(backendUser);
        localStorage.setItem('erp_user', JSON.stringify(backendUser));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('erp_user');
  }, []);

  const canAccessModule = useCallback((moduleKey: string) => {
    if (!user) return false;
    return user.allowedModules.includes(moduleKey as never);
  }, [user]);

  const canEditModule = useCallback((moduleKey: string) => {
    if (!user) return false;
    if (!user.editableModules) return false;
    return user.editableModules.includes(moduleKey as never);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, canAccessModule, canEditModule }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
