"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { setApiKey } from "@/lib/api";
import UserSearch from "./components/user-search";
import Dashboard from "./components/dashboard";
import Notifications from "./components/notifications";
import { Button } from "./components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Name, Identity } from "@coinbase/onchainkit/identity";

// Farcaster Schema UID
const SCHEMA_UID =
  "0x7889a09fb295b0a0c63a3d7903c4f00f7896cca4fa64d2c1313f8547390b7d39";

export default function App() {
  const { address, isConnected } = useAccount();
  const [currentUserFid, setCurrentUserFid] = useState<number | undefined>();
  const [apiKeySet, setApiKeySet] = useState(false);

  // Set API key from environment variables
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_FARCASTER_API_KEY;
    if (apiKey) {
      setApiKey(apiKey);
      setApiKeySet(true);
    }
  }, []);

  // Mock function to get FID from connected wallet
  // In a real app, you would use the Farcaster SDK to get the user's FID
  useEffect(() => {
    if (isConnected && address) {
      // This is a mock implementation - in a real app, you would fetch the user's FID
      // For demo purposes, we'll set a mock FID
      setCurrentUserFid(12345);
    } else {
      setCurrentUserFid(undefined);
    }
  }, [isConnected, address]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">WarpMeet</h1>
          
          <div className="flex items-center gap-4">
            <Notifications currentUserFid={currentUserFid} />
            
            <div>
              {address ? (
                <Identity
                  address={address}
                  schemaId={SCHEMA_UID}
                  className="!bg-inherit p-0 [&>div]:space-x-2"
                >
                  <Name className="text-inherit" />
                </Identity>
              ) : (
                <Button>Connect Wallet</Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="search">Find Users</TabsTrigger>
            <TabsTrigger value="dashboard">My Dashboard</TabsTrigger>
          </TabsList>
          
          <TabsContent value="search" className="mt-6">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Find Farcaster Users to Meet</h2>
              <UserSearch currentUserFid={currentUserFid} />
            </div>
          </TabsContent>
          
          <TabsContent value="dashboard" className="mt-6">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Your Meeting Dashboard</h2>
              <Dashboard currentUserFid={currentUserFid} />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
          <p>WarpMeet - Schedule meetings with Farcaster users</p>
        </div>
      </footer>
    </div>
  );
}
