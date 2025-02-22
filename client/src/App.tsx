import React from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/layout";
import Students from "@/pages/students";
import Sections from "@/pages/sections";
import Attendance from "@/pages/attendance";
import Reports from "@/pages/reports";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/sections" component={Sections} />
        <Route path="/students" component={Students} />
        <Route path="/attendance" component={Attendance} />
        <Route path="/reports" component={Reports} />
        <Route path="/" component={Reports} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

export default function App() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <Router />
        <Toaster />
      </QueryClientProvider>
    </React.StrictMode>
  );
}