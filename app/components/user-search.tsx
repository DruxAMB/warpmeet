"use client";

import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { FarcasterUser } from "@/lib/types";
import { farcasterApi } from "@/lib/api";
import UserCard from "./user-card";
import { Search } from "lucide-react";

interface UserSearchProps {
  currentUserFid?: number;
}

export default function UserSearch({ currentUserFid }: UserSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<FarcasterUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Load trending users on initial render
  useEffect(() => {
    if (isInitialLoad) {
      fetchTrendingUsers();
      setIsInitialLoad(false);
    }
  }, [isInitialLoad]);

  const fetchTrendingUsers = async () => {
    setIsLoading(true);
    try {
      const trendingUsers = await farcasterApi.getTrendingUsers(8);
      setUsers(trendingUsers);
    } catch (error) {
      console.error("Error fetching trending users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const searchResults = await farcasterApi.searchUsers(searchQuery);
      setUsers(searchResults);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <Input
          placeholder="Search Farcaster users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading}>
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </form>

      {isLoading ? (
        <div className="text-center py-8">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-8">
          {searchQuery ? "No users found. Try a different search term." : "No trending users available."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <UserCard 
              key={user.fid} 
              user={user} 
              currentUserFid={currentUserFid} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
