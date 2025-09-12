'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import OidTree from '@/components/OidTree';
import {
  Network as TreeIcon,
  Plus,
  Settings,
  Download,
  Upload,
  Filter,
  BarChart3,
  Shield,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
  Network,
  Brain,
  Zap,
  Eye,
  Edit3,
  Trash2,
  Save,
  X
} from 'lucide-react';

interface OidNode {
  id: string;
  name: string;
  description: string;
  type: 'root' | 'category' | 'provider' | 'device_category' | 'device' | 'person' | 'system' | 'ai_services' | 'claims';
  status?: 'active' | 'inactive' | 'pending';
  metadata?: {
    performance?: number;
    uptime?: number;
    connections?: number;
    lastSync?: number;
  };
}

export default function OidManagementPage() {
  const [selectedNode, setSelectedNode] = useState<OidNode | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'analytics' | 'history'>('details');
  
  const [newNodeData, setNewNodeData] = useState({
    name: '',
    description: '',
    type: 'system' as const,
    parentId: ''
  });

  const handleNodeSelect = useCallback((node: OidNode) => {
    setSelectedNode(node);
    setIsEditMode(false);
  }, []);

  const handleNodeUpdate = useCallback((node: OidNode) => {
    setSelectedNode(node);
    setIsEditMode(true);
  }, []);

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="text-green-400" size={16} />;
      case 'inactive': return <AlertCircle className="text-red-400" size={16} />;
      case 'pending': return <Clock className="text-yellow-400" size={16} />;
      default: return <AlertCircle className="text-gray-400" size={16} />;
    }
  };

  const getPerformanceColor = (performance?: number): string => {
    if (!performance) return 'text-gray-400';
    if (performance >= 95) return 'text-green-400';
    if (performance >= 80) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <TreeIcon className="text-blue-400" size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">OID Management</h1>
                  <p className="text-sm text-gray-400">
                    Healthcare System Identity Registry
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAddDialog(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <Plus size={16} />
                <span>Add OID</span>
              </button>
              
              <button className="p-2 bg-gray-700/50 hover:bg-gray-600 text-gray-400 hover:text-white rounded-lg transition-colors">
                <Upload size={16} />
              </button>
              
              <button className="p-2 bg-gray-700/50 hover:bg-gray-600 text-gray-400 hover:text-white rounded-lg transition-colors">
                <Download size={16} />
              </button>
              
              <button className="p-2 bg-gray-700/50 hover:bg-gray-600 text-gray-400 hover:text-white rounded-lg transition-colors">
                <Settings size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Main OID Tree */}
        <div className={`
          transition-all duration-300 border-r border-gray-700
          ${sidebarCollapsed ? 'w-full' : 'w-2/3'}
        `}>
          <div className="h-full p-6">
            <div className="h-full">
              <OidTree
                onNodeSelect={handleNodeSelect}
                onNodeUpdate={handleNodeUpdate}
                className="h-full"
              />
            </div>
          </div>
        </div>

        {/* Details Sidebar */}
        <div className={`
          transition-all duration-300 bg-gray-800/30
          ${sidebarCollapsed ? 'w-0 overflow-hidden' : 'w-1/3'}
        `}>
          <div className="h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                {selectedNode ? 'Node Details' : 'Select a Node'}
              </h2>
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
              >
                {sidebarCollapsed ? <Eye size={16} /> : <X size={16} />}
              </button>
            </div>

            {selectedNode ? (
              <>
                {/* Tab Navigation */}
                <div className="flex border-b border-gray-700">
                  {(['details', 'analytics', 'history'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`
                        flex-1 px-4 py-3 text-sm font-medium capitalize transition-colors
                        ${activeTab === tab
                          ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                        }
                      `}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-auto p-4">
                  {activeTab === 'details' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      {/* Node Header */}
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                              <TreeIcon className="text-blue-400" size={20} />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-white">
                                {selectedNode.name}
                              </h3>
                              <p className="text-sm text-gray-400 font-mono">
                                {selectedNode.id}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(selectedNode.status)}
                            <button
                              onClick={() => setIsEditMode(!isEditMode)}
                              className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                            >
                              <Edit3 size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                            {selectedNode.type}
                          </span>
                          {selectedNode.status && (
                            <span className={`
                              px-2 py-1 text-xs rounded-full border
                              ${selectedNode.status === 'active' 
                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                : selectedNode.status === 'inactive'
                                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                              }
                            `}>
                              {selectedNode.status}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Details Form */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Name
                          </label>
                          {isEditMode ? (
                            <input
                              type="text"
                              value={selectedNode.name}
                              className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <p className="text-white bg-gray-700/30 px-3 py-2 rounded-lg">
                              {selectedNode.name}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Description
                          </label>
                          {isEditMode ? (
                            <textarea
                              value={selectedNode.description}
                              rows={3}
                              className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <p className="text-gray-300 bg-gray-700/30 px-3 py-2 rounded-lg">
                              {selectedNode.description}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            OID
                          </label>
                          <p className="text-white bg-gray-700/30 px-3 py-2 rounded-lg font-mono text-sm">
                            {selectedNode.id}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {isEditMode && (
                        <div className="flex items-center space-x-3 pt-4 border-t border-gray-700">
                          <button
                            onClick={() => setIsEditMode(false)}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                          >
                            <Save size={16} />
                            <span>Save</span>
                          </button>
                          <button
                            onClick={() => setIsEditMode(false)}
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                          >
                            <X size={16} />
                            <span>Cancel</span>
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'analytics' && selectedNode.metadata && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                        <BarChart3 size={20} className="text-blue-400" />
                        <span>Performance Analytics</span>
                      </h3>

                      {/* Metrics Cards */}
                      <div className="grid grid-cols-1 gap-4">
                        <div className="bg-gray-700/30 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Performance</span>
                            <Activity size={16} className={getPerformanceColor(selectedNode.metadata.performance)} />
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-2xl font-bold ${getPerformanceColor(selectedNode.metadata.performance)}`}>
                              {Math.round(selectedNode.metadata.performance || 0)}%
                            </span>
                            <div className="flex-1 bg-gray-600 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  (selectedNode.metadata.performance || 0) >= 95 ? 'bg-green-400' :
                                  (selectedNode.metadata.performance || 0) >= 80 ? 'bg-yellow-400' : 'bg-red-400'
                                }`}
                                style={{ width: `${selectedNode.metadata.performance || 0}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-700/30 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Uptime</span>
                            <Shield size={16} className="text-blue-400" />
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold text-blue-400">
                              {(selectedNode.metadata.uptime || 0).toFixed(1)}%
                            </span>
                            <div className="flex-1 bg-gray-600 rounded-full h-2">
                              <div 
                                className="h-2 bg-blue-400 rounded-full transition-all duration-300"
                                style={{ width: `${selectedNode.metadata.uptime || 0}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-700/30 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Connections</span>
                            <Network size={16} className="text-purple-400" />
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold text-purple-400">
                              {selectedNode.metadata.connections || 0}
                            </span>
                            <span className="text-sm text-gray-400">active</span>
                          </div>
                        </div>

                        <div className="bg-gray-700/30 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Last Sync</span>
                            <Zap size={16} className="text-green-400" />
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-green-400">
                              {selectedNode.metadata.lastSync ? 
                                new Date(selectedNode.metadata.lastSync).toLocaleTimeString() : 
                                'Never'
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'history' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                        <Clock size={20} className="text-blue-400" />
                        <span>Change History</span>
                      </h3>

                      <div className="space-y-3">
                        {[
                          { action: 'Created', user: 'System', time: '2 hours ago', type: 'create' },
                          { action: 'Updated metadata', user: 'Dr. Ahmed', time: '1 hour ago', type: 'update' },
                          { action: 'Status changed to active', user: 'Admin', time: '30 min ago', type: 'status' }
                        ].map((entry, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                            <div className={`
                              p-1 rounded-full
                              ${entry.type === 'create' ? 'bg-green-500/20 text-green-400' :
                                entry.type === 'update' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-yellow-500/20 text-yellow-400'}
                            `}>
                              {entry.type === 'create' ? <Plus size={12} /> :
                               entry.type === 'update' ? <Edit3 size={12} /> :
                               <Activity size={12} />}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-white">{entry.action}</p>
                              <p className="text-xs text-gray-400">by {entry.user} • {entry.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                  <TreeIcon size={48} className="text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-400 mb-2">
                    No Node Selected
                  </h3>
                  <p className="text-sm text-gray-500">
                    Select a node from the tree to view its details and analytics
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Node Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Add New OID</h3>
              <button
                onClick={() => setShowAddDialog(false)}
                className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={newNodeData.name}
                  onChange={(e) => setNewNodeData({ ...newNodeData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter OID name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newNodeData.description}
                  onChange={(e) => setNewNodeData({ ...newNodeData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={newNodeData.type}
                  onChange={(e) => setNewNodeData({ ...newNodeData, type: e.target.value as any })}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="system">System</option>
                  <option value="provider">Provider</option>
                  <option value="device">Device</option>
                  <option value="ai_services">AI Services</option>
                  <option value="claims">Claims</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-3 mt-6">
              <button
                onClick={() => {
                  // Handle create logic here
                  setShowAddDialog(false);
                  setNewNodeData({ name: '', description: '', type: 'system', parentId: '' });
                }}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <Plus size={16} />
                <span>Create OID</span>
              </button>
              <button
                onClick={() => setShowAddDialog(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}