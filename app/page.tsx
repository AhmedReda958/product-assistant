import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SidebarApp } from "@/components/sidebar-app";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShoppingBag, MessageCircle, Search, Filter } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <SidebarProvider>
      <SidebarApp />
      <SidebarInset>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto p-6">
            {/* Hero Section */}
            <div className="text-center py-16">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome to Product Assistant
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Discover amazing products with AI-powered search and get
                personalized recommendations through our intelligent chat
                assistant.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="flex items-center gap-2">
                  <Link href="/products">
                    <ShoppingBag className="h-5 w-5" />
                    Browse Products
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-2"
                >
                  <Link href="/chat">
                    <MessageCircle className="h-5 w-5" />
                    Chat Assistant
                  </Link>
                </Button>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Search className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle>Smart Search</CardTitle>
                  <CardDescription>
                    Find products quickly with our intelligent search that
                    understands what you&apos;re looking for.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Filter className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle>Advanced Filters</CardTitle>
                  <CardDescription>
                    Filter by category, price range, and more to find exactly
                    what you need.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <MessageCircle className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle>AI Assistant</CardTitle>
                  <CardDescription>
                    Get personalized recommendations and help finding products
                    through our chat assistant.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* CTA Section */}
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Can&apos;t find what you&apos;re looking for?
              </h2>
              <p className="text-gray-600 mb-6">
                Our AI assistant can help you find the perfect product or answer
                any questions you have.
              </p>
              <Button asChild size="lg" className="flex items-center gap-2">
                <Link href="/chat">
                  <MessageCircle className="h-5 w-5" />
                  Ask Our Assistant
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
