import React, { createContext, useContext, useState, ReactNode } from "react";
import { User, UserRole } from "@/types";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USERS: Record<string, User> = {
  admin: { id: "u1", name: "Admin User", email: "admin@edu.ac.in", role: "admin" },
  faculty: { id: "f1", name: "Dr. Priya Sharma", email: "priya@edu.ac.in", role: "faculty", department: "Computer Science" },
  student: { id: "s1", name: "Rahul Gupta", email: "rahul@edu.ac.in", role: "student", department: "Computer Science", semester: 3 },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("tt_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email: string, _password: string, role: UserRole) => {
    await new Promise((r) => setTimeout(r, 800));
    const mockUser = MOCK_USERS[role];
    if (!mockUser) throw new Error("Invalid credentials");
    const u = { ...mockUser, email };
    setUser(u);
    localStorage.setItem("tt_user", JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("tt_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
