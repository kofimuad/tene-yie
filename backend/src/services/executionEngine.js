// src/services/executionEngine.js
// Core workflow execution engine
// Handles the actual execution of workflow nodes in order

import supabase from '../utils/supabaseClient.js';
import { v4 as uuidv4 } from 'uuid';

// ========== MAIN EXECUTION FUNCTION ==========
export const executeWorkflow = async (workflowId) => {
  const executionId = uuidv4();
  const startTime = new Date();
  
  try {
    console.log(`🚀 Starting execution of workflow: ${workflowId}`);

    // Fetch workflow
    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', workflowId)
      .single();

    if (workflowError || !workflow) {
      throw new Error('Workflow not found');
    }

    if (!workflow.enabled) {
      throw new Error('Workflow is disabled');
    }

    // Fetch nodes and edges
    const { data: nodes } = await supabase
      .from('nodes')
      .select('*')
      .eq('workflow_id', workflowId);

    const { data: edges } = await supabase
      .from('edges')
      .select('*')
      .eq('workflow_id', workflowId);

    if (!nodes || nodes.length === 0) {
      throw new Error('Workflow has no nodes');
    }

    // Find trigger node (must be the starting point)
    const triggerNode = nodes.find(n => n.node_type === 'trigger');
    if (!triggerNode) {
      throw new Error('No trigger node found. Workflow must start with a trigger');
    }

    // Build graph structure
    const adjacencyMap = buildAdjacencyMap(nodes, edges);
    const executionData = {};
    
    // Start execution from trigger node
    await executeNode(triggerNode, adjacencyMap, nodes, executionData);

    // Log successful execution
    await logExecution(workflowId, executionId, 'completed', null, executionData, startTime);

    console.log(`✅ Workflow execution completed: ${workflowId}`);
    return {
      success: true,
      executionId,
      executionData
    };

  } catch (error) {
    console.error(`❌ Workflow execution failed: ${error.message}`);
    await logExecution(workflowId, executionId, 'failed', error.message, null, startTime);

    return {
      success: false,
      executionId,
      error: error.message
    };
  }
};

// ========== BUILD ADJACENCY MAP ==========
// Creates a graph structure showing which nodes connect to which
function buildAdjacencyMap(nodes, edges) {
  const map = {};

  // Initialize empty arrays for each node
  nodes.forEach(node => {
    map[node.id] = [];
  });

  // Add connections from edges
  edges.forEach(edge => {
    map[edge.source_node_id].push(edge.target_node_id);
  });

  return map;
}

// ========== RECURSIVE NODE EXECUTION ==========
// Executes a node and then recursively executes all connected nodes
async function executeNode(node, adjacencyMap, nodes, executionData) {
  console.log(`▶️ Executing node: ${node.label} (${node.node_type})`);

  try {
    let result = null;

    // Execute based on node type
    switch (node.node_type) {
      case 'trigger':
        result = executeTrigger(node);
        break;
      case 'data':
        result = await executeDataNode(node, executionData);
        break;
      case 'transform':
        result = executeTransform(node, executionData);
        break;
      case 'action':
        result = executeAction(node, executionData);
        break;
      default:
        throw new Error(`Unknown node type: ${node.node_type}`);
    }

    // Store result
    executionData[node.id] = result;

    // Get next nodes to execute
    const connectedNodeIds = adjacencyMap[node.id];
    
    if (connectedNodeIds && connectedNodeIds.length > 0) {
      for (const nextNodeId of connectedNodeIds) {
        const nextNode = nodes.find(n => n.id === nextNodeId);
        if (nextNode) {
          await executeNode(nextNode, adjacencyMap, nodes, executionData);
        }
      }
    }

  } catch (error) {
    console.error(`Error executing node ${node.id}: ${error.message}`);
    throw error;
  }
}

// ========== NODE TYPE EXECUTION FUNCTIONS ==========

function executeTrigger(node) {
  console.log(`  📌 Trigger: ${node.config.type || 'scheduled'}`);
  return {
    type: 'trigger',
    triggeredAt: new Date(),
    config: node.config
  };
}

async function executeDataNode(node, executionData) {
  console.log(`  📊 Fetching data: ${node.config.source || 'unknown'}`);
  
  const source = node.config.source;
  let data = {};

  switch (source) {
    case 'weather':
      data = await fetchWeatherData(node.config);
      break;
    case 'calendar':
      data = await fetchCalendarData(node.config);
      break;
    case 'github':
      data = await fetchGithubData(node.config);
      break;
    default:
      data = { message: 'Data source not configured' };
  }

  return {
    type: 'data',
    source,
    data,
    fetchedAt: new Date()
  };
}

function executeTransform(node, executionData) {
  console.log(`  🔄 Transforming data: ${node.config.type || 'unknown'}`);
  
  const transformType = node.config.type;
  let result = {};

  switch (transformType) {
    case 'summarize':
      result = summarizeData(executionData, node.config);
      break;
    case 'filter':
      result = filterData(executionData, node.config);
      break;
    case 'combine':
      result = combineData(executionData, node.config);
      break;
    default:
      result = { transformed: executionData };
  }

  return {
    type: 'transform',
    transformType,
    result,
    transformedAt: new Date()
  };
}

function executeAction(node, executionData) {
  console.log(`  ✉️ Action: ${node.config.type || 'unknown'}`);
  
  const actionType = node.config.type;
  let result = {};

  switch (actionType) {
    case 'email':
      result = sendEmail(node.config, executionData);
      break;
    case 'sms':
      result = sendSMS(node.config, executionData);
      break;
    case 'post':
      result = postToSocial(node.config, executionData);
      break;
    default:
      result = { message: 'Action not configured' };
  }

  return {
    type: 'action',
    actionType,
    result,
    actionTime: new Date()
  };
}

// ========== DATA SOURCE HANDLERS ==========
// These are placeholder functions - replace with real API calls

async function fetchWeatherData(config) {
  // TODO: Replace with actual weather API call
  return { temp: 72, condition: 'Sunny' };
}

async function fetchCalendarData(config) {
  // TODO: Replace with actual calendar API call
  return { events: [] };
}

async function fetchGithubData(config) {
  // TODO: Replace with actual GitHub API call
  return { commits: [], prs: [] };
}

// ========== TRANSFORM HANDLERS ==========

function summarizeData(executionData, config) {
  return { summary: JSON.stringify(executionData) };
}

function filterData(executionData, config) {
  return { filtered: executionData };
}

function combineData(executionData, config) {
  return { combined: executionData };
}

// ========== ACTION HANDLERS ==========
// These are placeholder functions - replace with real service calls

function sendEmail(config, executionData) {
  // TODO: Replace with actual SendGrid/email service call
  console.log(`📧 Sending email to: ${config.to}`);
  return { sent: true, to: config.to };
}

function sendSMS(config, executionData) {
  // TODO: Replace with actual Twilio/SMS service call
  console.log(`📱 Sending SMS to: ${config.phone}`);
  return { sent: true, phone: config.phone };
}

function postToSocial(config, executionData) {
  // TODO: Replace with actual social media API calls
  console.log(`📢 Posting to: ${config.platform}`);
  return { posted: true, platform: config.platform };
}

// ========== LOGGING ==========

async function logExecution(workflowId, executionId, status, errorMessage, executionData, startTime) {
  const endTime = new Date();
  
  const { error } = await supabase
    .from('executions')
    .insert([{
      id: executionId,
      workflow_id: workflowId,
      status,
      error_message: errorMessage,
      execution_data: executionData,
      started_at: startTime,
      ended_at: endTime
    }]);

  if (error) {
    console.error('Failed to log execution:', error.message);
  }
}