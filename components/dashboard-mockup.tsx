"use client"

import type React from "react"
import { motion } from "framer-motion"
import {
  Layout,
  Palette,
  Code2,
  Rocket,
  ChevronDown,
  ChevronRight,
  Search,
  Plus,
  MoreHorizontal,
  FolderOpen,
  FileText,
  Globe,
  Smartphone,
  PenTool,
  Layers,
  Settings,
  HelpCircle,
  MessageSquare,
  Clock,
  CheckCircle2,
} from "lucide-react"
import { NorthlineIcon } from "./northline-logo"

export function DashboardMockup() {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.5,
      },
    },
  }

  const panelVariants = {
    hidden: {
      opacity: 0,
      x: 100,
      y: -80,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 1.2,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  return (
    <motion.div
      className="w-full h-full bg-zinc-950 flex overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Sidebar */}
      <motion.div
        className="w-[220px] h-full bg-zinc-900/80 border-r border-zinc-800/50 flex flex-col shrink-0"
        variants={panelVariants}
      >
        {/* Logo */}
        <div className="p-3 border-b border-zinc-800/50">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <NorthlineIcon size={24} />
            <span className="text-white font-semibold text-sm">Northline</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500 ml-auto" />
          </div>
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="flex items-center gap-2 px-2.5 py-1.5 bg-zinc-800/50 rounded-md text-zinc-500 text-xs">
            <Search className="w-3.5 h-3.5" />
            <span>Search projects...</span>
            <span className="ml-auto text-[10px] bg-zinc-700/50 px-1.5 py-0.5 rounded">⌘K</span>
          </div>
        </div>

        {/* Main nav */}
        <div className="px-3 space-y-0.5">
          <NavItem icon={Layout} label="Dashboard" active />
          <NavItem icon={FolderOpen} label="Projects" badge={5} />
          <NavItem icon={MessageSquare} label="Messages" badge={2} />
        </div>

        {/* Project Phases */}
        <div className="mt-5 px-3">
          <div className="px-2 py-1 text-[10px] text-zinc-500 font-medium uppercase tracking-wider flex items-center gap-1">
            Project Phases
          </div>
          <div className="space-y-0.5 mt-1">
            <NavItem icon={PenTool} label="Discovery" hasSubmenu />
            <NavItem icon={Palette} label="Design" hasSubmenu />
            <NavItem icon={Code2} label="Development" hasSubmenu />
            <NavItem icon={Rocket} label="Launch" hasSubmenu />
          </div>
        </div>

        {/* Active Builds */}
        <div className="mt-5 px-3">
          <div className="px-2 py-1 text-[10px] text-zinc-500 font-medium uppercase tracking-wider flex items-center gap-1">
            Active Builds
          </div>
          <div className="space-y-0.5 mt-1">
            <NavItem icon={FileText} label="Local Gym Site" color="text-blue-400" />
            <NavItem icon={FileText} label="Auto Detail Page" color="text-emerald-400" />
            <NavItem icon={FileText} label="Contractor Site" color="text-amber-400" />
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-auto p-3 border-t border-zinc-800/50">
          <NavItem icon={Settings} label="Settings" />
          <NavItem icon={HelpCircle} label="Help" />
        </div>
      </motion.div>

      {/* Projects List */}
      <motion.div
        className="w-[320px] h-full bg-zinc-900/40 border-r border-zinc-800/50 flex flex-col shrink-0"
        variants={panelVariants}
      >
        <div className="px-4 py-3 border-b border-zinc-800/50 flex items-center justify-between">
          <h3 className="text-white font-semibold text-sm">Active Projects</h3>
          <div className="flex items-center gap-2">
            <button className="text-zinc-500 hover:text-white transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto scrollbar-hide">
          <ProjectItem
            client="Peak Fitness"
            title="Local Gym Website"
            phase="Development"
            progress={75}
            status="in-progress"
            active
          />
          <ProjectItem
            client="Precision Auto"
            title="Detailing Service Page"
            phase="Design Review"
            progress={45}
            status="review"
          />
          <ProjectItem
            client="BuildRight Co."
            title="Contractor Portfolio"
            phase="Discovery"
            progress={20}
            status="planning"
          />
          <ProjectItem
            client="Fresh Bites"
            title="Food Truck Landing"
            phase="Delivery"
            progress={95}
            status="complete"
          />
          <ProjectItem
            client="Clean Sweep"
            title="Cleaning Service Site"
            phase="Content"
            progress={30}
            status="in-progress"
          />
        </div>
      </motion.div>

      {/* Detail Panel */}
      <motion.div className="flex-1 h-full bg-zinc-950 flex flex-col overflow-hidden" variants={panelVariants}>
        {/* Header breadcrumb */}
        <div className="px-5 py-3 border-b border-zinc-800/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-zinc-500">Projects</span>
            <span className="text-zinc-600">›</span>
            <span className="text-blue-400">Peak Fitness</span>
            <span className="text-zinc-600">›</span>
            <span className="text-zinc-300">Local Gym Website</span>
          </div>
          <MoreHorizontal className="w-4 h-4 text-zinc-500" />
        </div>

        {/* Content */}
        <div className="flex-1 p-5 overflow-auto scrollbar-hide">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-white text-xl font-semibold mb-1">Local Gym Website</h2>
              <p className="text-zinc-500 text-sm">Peak Fitness • Started 2 weeks ago</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">In Progress</span>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="bg-zinc-900/80 rounded-lg p-4 mb-5 border border-zinc-800/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-zinc-400 text-sm">Build Progress</span>
              <span className="text-white text-sm font-medium">75%</span>
            </div>
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: "75%" }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 1 }}
              />
            </div>
          </div>

          {/* Build Checklist */}
          <div className="space-y-3 mb-5">
            <h3 className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Launch Checklist</h3>
            <MilestoneItem icon={FileText} title="Page structure defined" status="complete" />
            <MilestoneItem icon={Smartphone} title="Mobile layout complete" status="complete" />
            <MilestoneItem icon={Globe} title="Contact form ready" status="complete" />
            <MilestoneItem icon={Layers} title="SEO basics configured" status="in-progress" />
            <MilestoneItem icon={Rocket} title="Deploy to production" status="pending" />
          </div>

          {/* Recent Activity */}
          <div className="pt-4 border-t border-zinc-800/50">
            <div className="text-xs text-zinc-500 font-medium mb-3 uppercase tracking-wider">Recent Activity</div>
            <div className="space-y-3">
              <ActivityItem
                name="Northline"
                action="completed"
                item="membership pricing section"
                time="2 hours ago"
              />
              <ActivityItem
                name="Client"
                action="approved"
                item="homepage hero design"
                time="Yesterday"
              />
              <ActivityItem
                name="Northline"
                action="started"
                item="class schedule integration"
                time="2 days ago"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function NavItem({
  icon: Icon,
  label,
  badge,
  active,
  hasSubmenu,
  color,
}: {
  icon: React.ElementType
  label: string
  badge?: number
  active?: boolean
  hasSubmenu?: boolean
  color?: string
}) {
  return (
    <div
      className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
        active ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-300"
      }`}
    >
      <Icon className={`w-4 h-4 ${color || ""}`} />
      <span className="flex-1 text-xs">{label}</span>
      {badge && (
        <span className="bg-zinc-700 text-zinc-300 text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-medium px-1">
          {badge}
        </span>
      )}
      {hasSubmenu && <ChevronRight className="w-3 h-3 text-zinc-600" />}
    </div>
  )
}

function ProjectItem({
  client,
  title,
  phase,
  progress,
  status,
  active,
}: {
  client: string
  title: string
  phase: string
  progress: number
  status: string
  active?: boolean
}) {
  const statusColors: Record<string, string> = {
    "in-progress": "bg-blue-500",
    "review": "bg-amber-500",
    "planning": "bg-zinc-500",
    "complete": "bg-emerald-500",
  }

  return (
    <div
      className={`px-4 py-3 border-b border-zinc-800/30 cursor-pointer transition-colors ${
        active ? "bg-zinc-800/50" : "hover:bg-zinc-800/30"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-2 h-2 rounded-full mt-1.5 ${statusColors[status] || "bg-zinc-500"}`} />
        <div className="flex-1 min-w-0">
          <p className="text-zinc-500 text-[10px] mb-0.5">{client}</p>
          <p className="text-white text-xs truncate leading-tight mb-1">{title}</p>
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-zinc-600" />
            <span className="text-zinc-500 text-[10px]">{phase}</span>
            <span className="text-zinc-600 text-[10px] ml-auto">{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function MilestoneItem({
  icon: Icon,
  title,
  status,
}: {
  icon: React.ElementType
  title: string
  status: "complete" | "in-progress" | "pending"
}) {
  const statusStyles = {
    complete: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    "in-progress": "text-blue-400 bg-blue-500/10 border-blue-500/20",
    pending: "text-zinc-500 bg-zinc-800/50 border-zinc-700/30",
  }

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${statusStyles[status]}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${status === 'complete' ? 'bg-emerald-500/20' : status === 'in-progress' ? 'bg-blue-500/20' : 'bg-zinc-800'}`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-zinc-300 text-sm flex-1">{title}</span>
      {status === "complete" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
      {status === "in-progress" && (
        <span className="text-[10px] text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded">Active</span>
      )}
    </div>
  )
}

function ActivityItem({
  name,
  action,
  item,
  time,
}: {
  name: string
  action: string
  item: string
  time: string
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center mt-0.5">
        <span className="text-[10px] text-zinc-400">{name.charAt(0)}</span>
      </div>
      <div className="flex-1">
        <p className="text-zinc-400 text-xs">
          <span className="text-white">{name}</span>
          <span className="text-zinc-500"> {action} </span>
          <span className="text-zinc-300">{item}</span>
        </p>
        <p className="text-zinc-600 text-[10px] mt-0.5">{time}</p>
      </div>
    </div>
  )
}
