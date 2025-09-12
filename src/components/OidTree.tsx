'use client';

import { 
  useState, 
  useEffect, 
  useRef, 
  useCallback, 
  useMemo 
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Network as TreeIcon,
  Plus,
  FileText,
  Building,
  Trash2,
  Edit,
  ChevronDown,
  ChevronRight,
  Info,
  Hospital,
  User,
  RefreshCw as Refresh,
  Shield,
  Eye,
  Box as BoxIcon,
  TrendingUp,
  Network,
  Brain,
  Activity,
  Zap,
  AlertTriangle,
  Settings,
  Search,
  Filter,
  MoreVertical
} from 'lucide-react';

// Types
interface OidNode {
  id: string;
  name: string;
  description: string;
  type: 'root' | 'category' | 'provider' | 'device_category' | 'device' | 'person' | 'system' | 'ai_services' | 'claims';
  status?: 'active' | 'inactive' | 'pending';
  children?: OidNode[];
  metadata?: {
    performance?: number;
    uptime?: number;
    connections?: number;
    lastSync?: number;
  };
}

interface OidTreeProps {
  className?: string;
  onNodeSelect?: (node: OidNode) => void;
  onNodeUpdate?: (node: OidNode) => void;
  readOnly?: boolean;
}

// Custom hook for OID data
const useOidData = () => {
  const [oidTree, setOidTree] = useState<OidNode>({
    id: '1.2.840.114494.100.1',
    name: 'Saudi Healthcare System',
    description: 'Root of Saudi Healthcare System',
    type: 'root',
    children: [
      {
        id: '1.2.840.114494.100.1.1',
        name: 'Healthcare Providers',
        description: 'All healthcare providers',
        type: 'category',
        children: [
          {
            id: '1.2.840.114494.100.1.1.1',
            name: 'King Faisal Specialist Hospital',
            description: 'Leading specialized hospital',
            type: 'provider',
            status: 'active',
            metadata: {
              performance: 95,
              uptime: 99.8,
              connections: 1250,
              lastSync: Date.now() - 30000
            },
            children: []
          },
          {
            id: '1.2.840.114494.100.1.1.2',
            name: 'King Abdullah Medical Complex',
            description: 'Comprehensive medical complex',
            type: 'provider',
            status: 'active',
            metadata: {
              performance: 92,
              uptime: 98.5,
              connections: 890,
              lastSync: Date.now() - 45000
            },
            children: []
          }
        ]
      },
      {
        id: '1.2.840.114494.100.1.2',
        name: 'Medical Devices',
        description: 'All certified medical devices',
        type: 'category',
        children: [
          {
            id: '1.2.840.114494.100.1.2.1',
            name: 'Medical Imaging Devices',
            description: 'Radiology and imaging equipment',
            type: 'device_category',
            metadata: {
              performance: 88,
              uptime: 97.2,
              connections: 456,
              lastSync: Date.now() - 120000
            },
            children: []
          }
        ]
      },
      {
        id: '1.2.840.114494.100.1.3',
        name: 'NPHIES Integration',
        description: 'Integration with NPHIES system',
        type: 'system',
        status: 'active',
        metadata: {
          performance: 98,
          uptime: 99.9,
          connections: 2100,
          lastSync: Date.now() - 15000
        },
        children: [
          {
            id: '1.2.840.114494.100.1.3.1',
            name: 'Insurance Claims',
            description: 'Insurance claim identifiers',
            type: 'claims',
            metadata: {
              performance: 93,
              uptime: 98.8,
              connections: 750,
              lastSync: Date.now() - 60000
            },
            children: []
          }
        ]
      },
      {
        id: '1.2.840.114494.100.1.4',
        name: 'Medical AI Services',
        description: 'Medical artificial intelligence services',
        type: 'ai_services',
        status: 'active',
        metadata: {
          performance: 96,
          uptime: 99.5,
          connections: 320,
          lastSync: Date.now() - 25000
        },
        children: []
      }
    ]
  });

  const [nodeMetrics, setNodeMetrics] = useState<Map<string, any>>(new Map());

  // Generate real-time metrics
  useEffect(() => {
    const generateMetrics = (node: OidNode) => {
      if (!node.metadata) {
        node.metadata = {
          performance: 85 + Math.random() * 15,
          uptime: 95 + Math.random() * 5,
          connections: Math.floor(Math.random() * 1000),
          lastSync: Date.now() - Math.random() * 300000
        };
      }
      setNodeMetrics(prev => new Map(prev.set(node.id, node.metadata)));
      
      if (node.children) {
        node.children.forEach(generateMetrics);
      }
    };

    generateMetrics(oidTree);
  }, [oidTree]);

  return { oidTree, setOidTree, nodeMetrics };
};

// Utility functions
const getTypeIcon = (type: OidNode['type']) => {
  const iconProps = { size: 18 };
  switch (type) {
    case 'root': return <TreeIcon {...iconProps} />;
    case 'provider': return <Hospital {...iconProps} />;
    case 'category': return <Building {...iconProps} />;
    case 'device_category':
    case 'device': return <BoxIcon {...iconProps} />;
    case 'person': return <User {...iconProps} />;
    case 'system': return <Shield {...iconProps} />;
    case 'ai_services': return <Brain {...iconProps} />;
    case 'claims': return <FileText {...iconProps} />;
    default: return <FileText {...iconProps} />;
  }
};

const getTypeColor = (type: OidNode['type']): string => {
  switch (type) {
    case 'root': return 'text-blue-400';
    case 'provider': return 'text-purple-400';
    case 'category': return 'text-cyan-400';
    case 'device_category':
    case 'device': return 'text-amber-400';
    case 'person': return 'text-green-400';
    case 'system': return 'text-red-400';
    case 'ai_services': return 'text-violet-400';
    case 'claims': return 'text-pink-400';
    default: return 'text-gray-400';
  }
};

const getStatusColor = (status?: string): string => {
  switch (status) {
    case 'active': return 'text-green-400 bg-green-400/20';
    case 'inactive': return 'text-gray-400 bg-gray-400/20';
    case 'pending': return 'text-yellow-400 bg-yellow-400/20';
    default: return 'text-gray-400 bg-gray-400/20';
  }
};

// Node component
interface OidNodeComponentProps {
  node: OidNode;
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  onToggle: (nodeId: string) => void;
  onSelect: (node: OidNode) => void;
  onEdit?: (node: OidNode) => void;
  onDelete?: (node: OidNode) => void;
  viewMode: '2d' | '3d' | 'neural';
  searchQuery: string;
}

const OidNodeComponent: React.FC<OidNodeComponentProps> = ({
  node,
  level,
  isExpanded,
  isSelected,
  onToggle,
  onSelect,
  onEdit,
  onDelete,
  viewMode,
  searchQuery
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const [isHovered, setIsHovered] = useState(false);
  
  const isHighlighted = searchQuery && 
    (node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     node.id.toLowerCase().includes(searchQuery.toLowerCase()));

  const getPerformanceColor = (performance?: number): string => {
    if (!performance) return 'text-gray-400';
    if (performance >= 95) return 'text-green-400';
    if (performance >= 80) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: level * 0.1 }}
      className="relative"
      style={{ 
        paddingLeft: `${level * 24}px`,
        transform: viewMode === '3d' ? `perspective(1000px) rotateX(${level * 2}deg)` : undefined
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Connection line for neural mode */}
      {level > 0 && viewMode === 'neural' && (
        <div className="absolute top-4 -left-6 w-6 h-0.5 bg-gradient-to-r from-blue-500/50 to-purple-500/50">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse" />
        </div>
      )}

      <motion.div
        className={`
          group relative mb-2 rounded-lg border transition-all duration-300 cursor-pointer
          ${isSelected 
            ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20' 
            : 'border-gray-700 hover:border-gray-600'
          }
          ${isHighlighted ? 'ring-2 ring-yellow-400/50' : ''}
          ${viewMode === 'neural' ? 'backdrop-blur-sm bg-gray-800/30' : 'bg-gray-800/50'}
        `}
        whileHover={{ 
          scale: viewMode === '3d' ? 1.02 : 1.01,
          rotateY: viewMode === '3d' ? 5 : 0,
          z: viewMode === '3d' ? 10 : 0
        }}
        onClick={() => onSelect(node)}
      >
        <div className="flex items-center p-3 space-x-3">
          {/* Expand/Collapse button */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle(node.id);
              }}
              className="p-1 rounded hover:bg-gray-700/50 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown size={16} className="text-gray-400" />
              ) : (
                <ChevronRight size={16} className="text-gray-400" />
              )}
            </button>
          )}

          {/* Node icon */}
          <div className={`
            flex items-center justify-center w-8 h-8 rounded-lg
            ${getTypeColor(node.type)} bg-current/20
            ${viewMode === 'neural' ? 'animate-pulse' : ''}
          `}>
            {getTypeIcon(node.type)}
          </div>

          {/* Node content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium text-white truncate">
                {node.name}
              </h3>
              {node.status && (
                <span className={`
                  px-2 py-0.5 text-xs rounded-full border
                  ${getStatusColor(node.status)}
                `}>
                  {node.status}
                </span>
              )}
            </div>
            
            <p className="text-xs text-gray-400 font-mono">
              {node.id}
            </p>
            
            {node.metadata && viewMode === 'neural' && (
              <div className="flex items-center space-x-4 mt-1">
                <div className="flex items-center space-x-1">
                  <Activity size={12} className={getPerformanceColor(node.metadata.performance)} />
                  <span className="text-xs text-gray-400">
                    {Math.round(node.metadata.performance || 0)}%
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Network size={12} className="text-blue-400" />
                  <span className="text-xs text-gray-400">
                    {node.metadata.connections || 0}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className={`
            flex items-center space-x-1 transition-opacity duration-200
            ${isHovered ? 'opacity-100' : 'opacity-0'}
          `}>
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(node);
                }}
                className="p-1 rounded hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
              >
                <Edit size={14} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(node);
                }}
                className="p-1 rounded hover:bg-gray-700/50 text-gray-400 hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            )}
            <button
              onClick={(e) => e.stopPropagation()}
              className="p-1 rounded hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
            >
              <MoreVertical size={14} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Children */}
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className={viewMode === 'neural' ? 'relative' : ''}
          >
            {viewMode === 'neural' && (
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/50 to-transparent" />
            )}
            {node.children!.map((child) => (
              <OidNodeComponent
                key={child.id}
                node={child}
                level={level + 1}
                isExpanded={isExpanded}
                isSelected={isSelected}
                onToggle={onToggle}
                onSelect={onSelect}
                onEdit={onEdit}
                onDelete={onDelete}
                viewMode={viewMode}
                searchQuery={searchQuery}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Main OID Tree component
const OidTree: React.FC<OidTreeProps> = ({
  className = '',
  onNodeSelect,
  onNodeUpdate,
  readOnly = false
}) => {
  const { oidTree, nodeMetrics } = useOidData();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['1.2.840.114494.100.1']));
  const [selectedNode, setSelectedNode] = useState<OidNode | null>(null);
  const [viewMode, setViewMode] = useState<'2d' | '3d' | 'neural'>('neural');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const toggleExpand = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  const handleNodeSelect = useCallback((node: OidNode) => {
    setSelectedNode(node);
    onNodeSelect?.(node);
  }, [onNodeSelect]);

  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const filteredTree = useMemo(() => {
    if (!searchQuery) return oidTree;
    // Implement search filtering logic here
    return oidTree;
  }, [oidTree, searchQuery]);

  return (
    <div className={`
      relative h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 
      rounded-xl border border-gray-700 overflow-hidden ${className}
    `}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <TreeIcon size={24} className="text-blue-400" />
              <span>Healthcare OID Tree</span>
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Saudi Healthcare System Identity Management
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {/* View mode controls */}
            <div className="flex items-center space-x-1 bg-gray-700/50 rounded-lg p-1">
              {(['2d', '3d', 'neural'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`
                    px-3 py-1 rounded text-xs font-medium transition-all
                    ${viewMode === mode 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-600'
                    }
                  `}
                >
                  {mode.toUpperCase()}
                </button>
              ))}
            </div>

            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <Refresh size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex items-center space-x-2 mt-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search OIDs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`
              p-2 rounded-lg border transition-colors
              ${showFilters 
                ? 'bg-blue-500 border-blue-500 text-white' 
                : 'bg-gray-700/50 border-gray-600 text-gray-400 hover:text-white'
              }
            `}
          >
            <Filter size={16} />
          </button>
        </div>
      </div>

      {/* Tree content */}
      <div className="flex-1 overflow-auto p-4">
        <div className={`
          ${viewMode === '3d' ? 'perspective-1000' : ''}
          ${viewMode === 'neural' ? 'relative' : ''}
        `}>
          {viewMode === 'neural' && (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent pointer-events-none" />
          )}
          
          <OidNodeComponent
            node={filteredTree}
            level={0}
            isExpanded={expandedNodes.has(filteredTree.id)}
            isSelected={selectedNode?.id === filteredTree.id}
            onToggle={toggleExpand}
            onSelect={handleNodeSelect}
            onEdit={!readOnly ? onNodeUpdate : undefined}
            viewMode={viewMode}
            searchQuery={searchQuery}
          />
        </div>
      </div>

      {/* Status bar */}
      <div className="sticky bottom-0 bg-gray-800/80 backdrop-blur-sm border-t border-gray-700 p-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-4">
            <span className="text-gray-400">
              Nodes: {nodeMetrics.size}
            </span>
            <span className="text-gray-400">
              Selected: {selectedNode?.name || 'None'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400">Live</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OidTree;